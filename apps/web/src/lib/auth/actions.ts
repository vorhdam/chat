import prisma from "@repo/database";
import { compare, hash } from "bcryptjs";
import { getTranslations } from "next-intl/server";
import { treeifyError } from "zod/v4/core";
import { LoginSchema, SignupSchema, type AuthState } from "./definitions";
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
 * ### Signup
 * Signs a user up.
 * *Requires React's useActionState() hook.*
 * @returns The new state of the server action (errors or a message)
 */
export async function signup(
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const validFields = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validFields.success)
    return t(treeifyError(validFields.error).properties!);
  const { name, email, username, password } = validFields.data;

  const [existingEmail, existingUsername] = await Promise.all([
    prisma.user.count({ where: { email } }),
    prisma.user.count({ where: { username } }),
  ]);
  if (existingEmail > 0) return t("emailTaken");
  if (existingUsername > 0) return t("usernameTaken");

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      username,
      password: await hash(password, 12),
    },
  });

  if (!newUser.id) return t("unexpectedError");
  await createSession({ userId: newUser.id, redirectUrl: "/account" });
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
 * ### Logout
 * Logs a user out.
 * *Doesn't require React's useActionState() hook.*
 */
export async function logout() {
  await deleteSession();
}
