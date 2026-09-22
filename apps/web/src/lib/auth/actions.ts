"use server";

import prisma from "@repo/database";
import { compare, hash } from "bcryptjs";
import { getTranslations } from "next-intl/server";
import { treeifyError } from "zod/v4/core";
import {
  LoginSchema,
  OnboardingContactSchema,
  OnboardingNameSchema,
  OnboardingPasswordSchema,
  OnboardingSchema,
  onboardingSteps,
  type AuthState,
  type OnboardingStep,
} from "./definitions";
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
    select: { id: true, name: true, password: true, twoFactorAuth: true },
  });

  if (!user?.id || !user?.password) return t("passwordInvalid");
  const passwordMatch = await compare(password, user.password);
  if (!passwordMatch || !user?.id || !user?.password)
    return t("passwordInvalid");

  await createSession({ userId: user.id, redirectUrl: "/account" });
}

/**
 * ### Onboarding / Signup
 * Signs a user up.
 * *Requires React's useActionState() hook.*
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
}
