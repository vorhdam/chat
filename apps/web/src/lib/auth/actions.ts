"use server";

import { redirect } from "@/i18n/navigation";
import config from "@repo/config";
import prisma from "@repo/database";
import { sendEmail, SendEmailOptions } from "@repo/email";
import { VerifyEmail } from "@repo/email/verify";
import { compare, hash } from "bcryptjs";
import { randomInt } from "crypto";
import { getTranslations } from "next-intl/server";
import { treeifyError } from "zod/v4/core";
import { getLicense } from "./dal";
import {
  EmailSchema,
  LicensedRoute,
  LicensedRoutes,
  LoginSchema,
  OnboardingContactSchema,
  OnboardingNameSchema,
  OnboardingPasswordSchema,
  OnboardingSchema,
  onboardingSteps,
  OtpSchema,
  VerifyMailParams,
  VerifyStep,
  verifySteps,
  type AuthState,
  type OnboardingStep,
} from "./definitions";
import { createLicense, deleteLicense, signLicense } from "./licenses";
import { createSession, deleteSession } from "./sessions";

/**
 * ### Translate
 * Translates an error object's values or string to the user's preferred language.
 * @param properties the translateable string or object
 * @returns A translated string or object
 */
async function t(
  properties:
    Record<string, { errors: readonly string[] } | undefined> | string,
): Promise<AuthState> {
  const translate = await getTranslations("Auth");
  if (typeof properties === "string") return { message: translate(properties) };
  const errors: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value?.errors.length) {
      errors[key] = await Promise.all(
        value.errors.map((message) => translate(message)),
      );
    }
  }
  return { errors };
}

/**
 * ## Generate OTP
 * Creates a new one time password that is the current configs length.
 * @returns The generated OTP string
 */
function generateOtp(): string {
  const seed = randomInt(Math.pow(10, config.auth.otpLength));
  return seed.toString().padStart(config.auth.otpLength, "0");
}

/**
 * ## Get Mail Options
 * Constructs a verify mail object with an OTP attached.
 * @returns The generated mail options.
 */
async function getMailOptions({
  name,
  email,
  otp,
  route,
}: VerifyMailParams): Promise<SendEmailOptions> {
  const e = await getTranslations("Emails");
  return {
    from: `${config.name} <${config.mail.defaultEmail}>`,
    to: email,
    subject: e(`${LicensedRoutes[route].name}Subject`),
    html: VerifyEmail({
      header: e(`${LicensedRoutes[route].name}Header`, { name }),
      main: e(`${LicensedRoutes[route].name}Main`),
      otp,
      footer: e(`${LicensedRoutes[route].name}Footer`),
    }),
  };
}

/**
 * ### Login
 * Logs a user in.
 * *Requires React's useActionState() hook.*
 * @returns The new state of the server action (errors or a message).
 */
export async function login(
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const validFields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validFields.success)
    return t(treeifyError(validFields.error).properties!);
  const { email, password } = validFields.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      twoFactorAuth: true,
    },
  });

  if (!user?.id || !user?.password) return t("passwordInvalid");
  const passwordMatch = await compare(password, user.password);
  if (!passwordMatch || !user?.id || !user?.password)
    return t("passwordInvalid");

  if (user.twoFactorAuth) {
    const otp = generateOtp();
    const mailOptions = await getMailOptions({
      name: user.name,
      email,
      otp,
      route: "twofactorauth",
    });

    await Promise.all([
      prisma.user.update({
        where: { id: user.id },
        data: { otp: await hash(otp, 12) },
      }),
      sendEmail(mailOptions),
      createLicense({
        scope: "twofactorauth",
        email: user.email,
        redirectUrl: "/verify?scope=twofactorauth",
      }),
    ]);
  } else await createSession({ userId: user.id, redirectUrl: "/account" });
}

/**
 * ### Onboarding / Signup
 * Signs a user up.
 * *Requires React's useActionState() hook.*
 * @param step The state the user is currently at.
 * @returns The new state of the server action (errors or a message)
 */
export async function onboarding(
  step: OnboardingStep,
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!onboardingSteps.includes(step)) return t("unexpectedError");

  if (step === "name") {
    const validFields = OnboardingNameSchema.safeParse({
      name: formData.get("name"),
      username: formData.get("username"),
    });

    if (!validFields.success)
      return t(treeifyError(validFields.error).properties!);
    const { username } = validFields.data;

    const existingUsername = await prisma.user.count({ where: { username } });
    if (existingUsername > 0) return t("usernameTaken");
  }

  if (step === "contact") {
    const validFields = OnboardingContactSchema.safeParse({
      email: formData.get("email"),
      phone: formData.get("phone"),
    });

    if (!validFields.success)
      return t(treeifyError(validFields.error).properties!);
    const { email, phone } = validFields.data;

    const [existingEmail, existingPhone] = await Promise.all([
      prisma.user.count({ where: { email } }),
      prisma.user.count({ where: { phone } }),
    ]);

    if (existingEmail > 0) return t("emailTaken");
    if (existingPhone > 0) return t("phoneTaken");
  }

  if (step === "password") {
    const validFields = OnboardingPasswordSchema.safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!validFields.success)
      return t(treeifyError(validFields.error).properties!);
  }

  if (step === "finalize") {
    const validFields = OnboardingSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      username: formData.get("username"),
      phone: formData.get("phone"),
      password: formData.get("password"),
    });

    if (!validFields.success)
      return t(treeifyError(validFields.error).properties!);
    const { name, email, username, phone, password } = validFields.data;

    const [existingEmail, existingUsername, existingPhone] = await Promise.all([
      prisma.user.count({ where: { email } }),
      prisma.user.count({ where: { username } }),
      prisma.user.count({ where: { phone } }),
    ]);

    if (existingEmail > 0) return t("emailTaken");
    if (existingUsername > 0) return t("usernameTaken");
    if (existingPhone > 0) return t("phoneTaken");

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        username,
        phone,
        password: await hash(password, 12),
      },
    });

    if (!newUser.id) return t("unexpectedError");
    await createSession({ userId: newUser.id, redirectUrl: "/account" });
  }
}

/**
 * ### Logout
 * Logs a user out.
 * *Doesn't require React's useActionState() hook.*
 */
export async function logout() {
  await deleteSession();
  await deleteLicense();
}

/**
 * ## Verify Action
 * Verifies whether a user has permission to perform a certain action.
 * *Requires React's useActionState() hook.*
 * @param step The state the user is currently at.
 * @param scope The process the user wants to start (e.g.: resetPassword).
 * @returns The new state of the server action (errors or a message).
 */
export async function verify(
  step: VerifyStep,
  scope: LicensedRoute,
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!verifySteps.includes(step)) return t("unexpectedError");

  if (step === "email") {
    if (!LicensedRoutes[scope]) return await redirect("/login");
    const validFields = EmailSchema.safeParse({
      email: formData.get("email"),
    });

    if (!validFields.success)
      return t(treeifyError(validFields.error).properties!);
    const { email } = validFields.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (user?.id && user?.name) {
      const otp = generateOtp();
      const mailOptions = await getMailOptions({
        name: user.name,
        email,
        otp,
        route: scope,
      });

      await Promise.all([
        prisma.user.update({
          where: { id: user.id },
          data: { otp: await hash(otp, 12) },
        }),
        sendEmail(mailOptions),
      ]);
    }

    await createLicense({ scope, email });
  }

  if (step === "otp") {
    const license = await getLicense();
    if (!license?.scope || !LicensedRoutes[license.scope])
      return t("licenseInvalid");
    const validFields = OtpSchema.safeParse({
      otp: formData.get("otp"),
    });

    if (!validFields.success)
      return t(treeifyError(validFields.error).properties!);
    const { otp } = validFields.data;

    const user = await prisma.user.findUnique({
      where: { email: license.email },
      select: { id: true, otp: true },
    });

    if (!user?.id || !user?.otp) return t("otpInvalid");
    const otpMatch = await compare(otp, user.otp);
    if (!otpMatch) return t("otpInvalid");

    const newLicense = await signLicense();
    if (newLicense?.signed !== true) return t("licenseInvalid");
    await createSession({
      userId: user.id,
      redirectUrl: LicensedRoutes[license.scope].href,
    });
  }
}
