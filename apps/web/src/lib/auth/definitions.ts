import { type User } from "@repo/database/types";
import parsePhoneNumberFromString from "libphonenumber-js";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import * as z from "zod";

const Name = z.string().check(
  z.minLength(5, { error: "nameShort" }),
  z.maxLength(100, { error: "nameLong" }),
  z.regex(/([\p{Lu}][\p{Ll}]+(?:\s[\p{Lu}][\p{Ll}]+)+)/u, {
    error: "nameInvalid",
  }),
  z.trim(),
);

const Email = z.string().check(z.email({ error: "emailInvalid" }), z.trim());

const Phone = z.string().check(
  z.refine(
    (phone) => {
      try {
        const parsed = parsePhoneNumberFromString(phone);
        return parsed?.isValid() ?? false;
      } catch {
        return false;
      }
    },
    { message: "phoneInvalid" },
  ),
);

const Username = z.string().check(
  z.minLength(3, { error: "usernameShort" }),
  z.maxLength(30, { error: "usernameLong" }),
  z.regex(/^[a-z\d_]+$/, {
    error: "usernameInvalid",
  }),
  z.trim(),
);

const Password = z
  .string()
  .check(
    z.minLength(8, { error: "passwordShort" }),
    z.maxLength(50, { error: "passwordLong" }),
    z.regex(/[a-zA-Z]/, { error: "passwordLetter" }),
    z.regex(/[0-9]/, { error: "passwordDigit" }),
    z.trim(),
  );

const LoginSchema = z.object({
  email: Email,
  password: Password,
});

const OnboardingSchema = z.object({
  name: Name,
  email: Email,
  username: Username,
  phone: Phone,
  password: Password,
});

const OnboardingNameSchema = OnboardingSchema.pick({
  name: true,
  username: true,
});

const OnboardingContactSchema = OnboardingSchema.pick({
  email: true,
}).extend({ phone: Phone });

const OnboardingPasswordSchema = OnboardingSchema.pick({
  password: true,
})
  .extend({ confirmPassword: z.string().check(z.trim()) })
  .check(
    z.refine((data) => data.password === data.confirmPassword, {
      error: "passwordMismatch",
      path: ["confirmPassword"],
    }),
  );

type AuthState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        phone?: string[];
        username?: string[];
        password?: string[];
        confirmPassword?: string[];
      };
      message?: string;
    }
  | undefined;

type SessionPayload = {
  token: string;
  userId: string;
  expiresAt: Date;
};

type CookiePayload = Pick<
  ResponseCookie,
  "httpOnly" | "secure" | "sameSite" | "path" | "expires"
>;

type Profile = Pick<User, "id" | "name" | "username">;

const onboardingSteps = ["name", "contact", "password", "finalize"] as const;
type OnboardingStep = (typeof onboardingSteps)[number];

export {
  LoginSchema,
  OnboardingContactSchema,
  OnboardingNameSchema,
  OnboardingPasswordSchema,
  OnboardingSchema,
  onboardingSteps,
  type AuthState,
  type CookiePayload,
  type OnboardingStep,
  type Profile,
  type SessionPayload,
  type User,
};
