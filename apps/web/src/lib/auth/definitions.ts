import parsePhoneNumberFromString from "libphonenumber-js";
import { type ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import * as z from "zod";

import config from "@repo/config";
import { type User } from "@repo/database/types";

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

const Otp = z
  .string()
  .check(z.length(config.auth.otpLength, { error: "otpLength" }));

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
  .extend({ confirmPassword: Password })
  .check(
    z.refine((data) => data.password === data.confirmPassword, {
      error: "passwordMismatch",
      path: ["confirmPassword"],
    }),
  );

const MigrateEmailSchema = z
  .object({
    email: Email,
    confirmEmail: Email,
  })
  .check(
    z.refine((data) => data.email === data.confirmEmail, {
      error: "emailMismatch",
      path: ["confirmEmail"],
    }),
  );

const EmailSchema = z.object({
  email: Email,
});

const OtpSchema = z.object({
  otp: Otp,
});

type AuthState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        confirmEmail?: string[];
        phone?: string[];
        username?: string[];
        password?: string[];
        confirmPassword?: string[];
        otp?: string[];
      };
      message?: string;
    }
  | undefined;

type LicensedRoute = keyof typeof LicensedRoutes;

type LicensedRouteType = {
  name: string;
  href: string;
  hidden: boolean;
};

const LicensedRoutes = {
  resetpassword: {
    name: "resetPassword",
    href: "/resetpassword",
    hidden: false,
  },
  terminateaccount: {
    name: "terminateAccount",
    href: "/terminateaccount",
    hidden: false,
  },
  migrateemail: {
    name: "migrateEmail",
    href: "/migrateemail",
    hidden: false,
  },
  twofactorauth: {
    name: "twoFactorAuth",
    href: "/account",
    hidden: true,
  },
} as const satisfies Record<string, LicensedRouteType>;

type SessionPayload = {
  token: string;
  userId: string;
  expiresAt: Date;
};

type LicensePayload = {
  token: string;
  email: string;
  signed: boolean;
  scope: LicensedRoute;
  expiresAt: Date;
};

type MigrateEmailPayload = {
  oldEmail: string;
  newEmail: string;
  expiresAt: Date;
};

type VerifyMailParams = {
  name: string;
  email: string;
  otp: string;
  route: LicensedRoute;
};

type CookiePayload = Pick<
  ResponseCookie,
  "httpOnly" | "secure" | "sameSite" | "path" | "expires"
>;

type Profile = Pick<User, "id" | "name" | "username">;

const OnboardingSteps = ["name", "contact", "password", "finalize"] as const;
type OnboardingStep = (typeof OnboardingSteps)[number];

const MigrateEmailSteps = ["grant", "claim"] as const;
type MigrateEmailStep = (typeof MigrateEmailSteps)[number];

const VerifySteps = ["email", "otp"] as const;
type VerifyStep = (typeof VerifySteps)[number];

export {
  EmailSchema,
  LicensedRoutes,
  LoginSchema,
  MigrateEmailSchema,
  MigrateEmailSteps,
  OnboardingContactSchema,
  OnboardingNameSchema,
  OnboardingPasswordSchema,
  OnboardingSchema,
  OnboardingSteps,
  OtpSchema,
  VerifySteps,
  type AuthState,
  type CookiePayload,
  type LicensedRoute,
  type LicensePayload,
  type MigrateEmailPayload,
  type MigrateEmailStep,
  type OnboardingStep,
  type Profile,
  type SessionPayload,
  type User,
  type VerifyMailParams,
  type VerifyStep,
};
