"use server";

import { compare, hash } from "bcryptjs";
import { randomInt } from "crypto";
import { type JWTPayload, jwtVerify, SignJWT } from "jose";
import { getTranslations } from "next-intl/server";
import { treeifyError } from "zod/v4/core";

import { getLocale } from "@/i18n/locale";
import { redirect } from "@/i18n/navigation";
import config from "@repo/config";
import prisma from "@repo/database";
import { sendEmail, type SendEmailOptions } from "@repo/email";
import { ClaimEmail } from "@repo/email/claim";
import { VerifyEmail } from "@repo/email/verify";

import { getLicense } from "./dal";
import {
  type AuthState,
  type ClaimMailParams,
  EmailSchema,
  type LicensedRoute,
  LicensedRoutes,
  LoginSchema,
  MigrateEmailPayload,
  MigrateEmailSchema,
  MigrateEmailStep,
  MigrateEmailSteps,
  OnboardingContactSchema,
  OnboardingNameSchema,
  OnboardingPasswordSchema,
  OnboardingSchema,
  type OnboardingStep,
  OnboardingSteps,
  OtpSchema,
  ResetPasswordSchema,
  type VerifyMailParams,
  type VerifyStep,
  VerifySteps,
} from "./definitions";
import { createLicense, deleteLicense, signLicense } from "./licenses";
import { createSession, deleteSession, updateSession } from "./sessions";

/**
 * ## Translate
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
 * Creates a new one time password that is the current config's length.
 * @returns The generated OTP string
 */
function generateOtp(): string {
  const seed = randomInt(Math.pow(10, config.auth.otpLength));
  return seed.toString().padStart(config.auth.otpLength, "0");
}

export async function encrypt(
  payload: Record<string, unknown>,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + config.session.duration))
    .sign(new TextEncoder().encode(process.env.JWT_SECRET!));
}

export async function decrypt(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!),
      { algorithms: ["HS256"] },
    );
    return payload;
  } catch {
    return null;
  }
}

/**
 * ## Get Verify Mail Options
 * Constructs a verify mail object with an OTP attached.
 * @returns The generated mail options.
 */
async function getVerifyMailOptions({
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
 * ## Get Verify Mail Options
 * Constructs a verify mail object with an OTP attached.
 * @returns The generated mail options.
 */
async function getClaimMailOptions({
  name,
  email,
  href,
  route,
}: ClaimMailParams): Promise<SendEmailOptions> {
  const e = await getTranslations("Emails");
  return {
    from: `${config.name} <${config.mail.defaultEmail}>`,
    to: email,
    subject: e(`${LicensedRoutes[route].name}Subject`),
    html: ClaimEmail({
      header: e(`${LicensedRoutes[route].name}Header`, { name }),
      main: e(`${LicensedRoutes[route].name}ClaimMain`),
      href,
      button: e(`${LicensedRoutes[route].name}ClaimButton`),
      footer: e(`${LicensedRoutes[route].name}Footer`),
    }),
  };
}

/**
 * ## Login
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
  if (!passwordMatch) return t("passwordInvalid");

  if (user.twoFactorAuth) {
    const otp = generateOtp();
    const mailOptions = await getVerifyMailOptions({
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
 * ## Onboarding / Signup
 * Signs a user up (step by step and full flow compatible).
 * *Requires React's useActionState() hook.*
 * @param step The state the user is currently at.
 * @returns The new state of the server action (errors or a message)
 */
export async function onboarding(
  step: OnboardingStep,
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!OnboardingSteps.includes(step)) return t("unexpectedError");

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

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
      select: { email: true, phone: true },
    });

    if (existingUser?.email === email) return t("emailTaken");
    if (existingUser?.phone === phone) return t("phoneTaken");
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

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }, { phone }] },
      select: { email: true, username: true, phone: true },
    });

    if (existingUser?.email === email) return t("emailTaken");
    if (existingUser?.phone === phone) return t("phoneTaken");
    if (existingUser?.username === username) return t("usernameTaken");

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
 * ## Logout
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
  if (!VerifySteps.includes(step)) return t("unexpectedError");

  if (step === "email") {
    if (!LicensedRoutes[scope]) return await redirect("/login");
    const validFields = EmailSchema.safeParse({
      email: formData.get("email"),
    });

    if (!validFields.success)
      return t(treeifyError(validFields.error).properties!);
    const { email } = validFields.data;

    const [user] = await Promise.all([
      prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true },
      }),
      createLicense({ scope, email }),
    ]);

    if (!user) return;

    const otp = generateOtp();
    const mailOptions = await getVerifyMailOptions({
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

/**
 * ## Migrate Email Action
 * Migrates a user's email to a new email.
 * *Requires React's useActionState() hook.*
 * @param step The state the user is currently at.
 * @returns The new state of the server action (errors or a message).
 */
export async function migrateEmail(
  step: MigrateEmailStep,
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!MigrateEmailSteps.includes(step)) return t("unexpectedError");
  const license = await getLicense();
  if (license?.scope !== "migrateemail") return t("licenseInvalid");

  if (step === "grant") {
    const validFields = MigrateEmailSchema.safeParse({
      email: formData.get("email"),
      confirmEmail: formData.get("confirmEmail"),
    });

    if (!validFields.success)
      return t(treeifyError(validFields.error).properties!);
    const { email } = validFields.data;

    const [user, existingEmailCount] = await Promise.all([
      prisma.user.findFirst({
        where: { email: license.email },
        select: { name: true },
      }),
      prisma.user.count({ where: { email } }),
    ]);

    if (!user?.name) return t("licenseInvalid");
    if (existingEmailCount > 0) return t("emailTaken");

    const payload: MigrateEmailPayload = {
      oldEmail: license.email,
      newEmail: email,
      expiresAt: new Date(Date.now() + config.license.duration),
    };

    const token = await encrypt(payload as unknown as Record<string, unknown>);
    const locale = await getLocale();
    const href = new URL(`/${locale}/migrateemail/${token}`, config.baseURL)
      .href;

    const mailOptions = await getClaimMailOptions({
      name: user.name,
      email,
      href,
      route: "migrateemail",
    });

    await sendEmail(mailOptions);
  }

  if (step === "claim") {
    const code = formData.get("code")?.toString();
    if (!code) return t("licenseInvalid");

    const { oldEmail, newEmail }: MigrateEmailPayload = (await decrypt(
      code,
    )) as unknown as MigrateEmailPayload;
    if (!oldEmail) return t("licenseInvalid");

    await Promise.all([
      await prisma.user.update({
        where: { email: oldEmail },
        data: { email: newEmail },
      }),
      deleteLicense(),
      updateSession(),
      redirect("/account"),
    ]);
  }
}

/**
 * ## Reset Password Action
 * Resets (changes) the password of the user.
 * *Requires React's useActionState() hook.*
 * @returns The new state of the server action (errors or a message).
 */
export async function resetPassword(
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const license = await getLicense();
  if (license?.scope !== "resetpassword") return t("licenseInvalid");

  const validFields = ResetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validFields.success)
    return t(treeifyError(validFields.error).properties!);
  const { password } = validFields.data;

  const existingUser = await prisma.user.count({
    where: { email: license.email },
  });
  if (existingUser === 0) return t("licenseInvalid");

  await Promise.all([
    prisma.user.update({
      where: { email: license.email },
      data: { password: await hash(password, 12) },
    }),
    deleteLicense(),
    updateSession(),
    redirect("/account"),
  ]);
}

/**
 * ## Terminate Account Action
 * Terminates (deletes) the account of the user (works with license).
 * *Requires React's useActionState() hook.*
 * @returns The new state of the server action (errors or a message).
 */
export async function terminateAccount(): Promise<AuthState> {
  const license = await getLicense();
  if (license?.scope !== "terminateaccount") return t("licenseInvalid");

  const existingUser = await prisma.user.count({
    where: { email: license.email },
  });
  if (existingUser === 0) return t("licenseInvalid");

  await Promise.all([
    prisma.user.delete({ where: { email: license.email } }),
    deleteSession(),
    deleteLicense(),
    redirect("/account"),
  ]);
}
