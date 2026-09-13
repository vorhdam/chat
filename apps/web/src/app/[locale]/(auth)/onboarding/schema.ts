import { SignupSchema } from "@/lib/auth/definitions";
import parsePhoneNumberFromString from "libphonenumber-js";
import z from "zod";

const Phone = z.string().check(
  z.refine(
    (phone) => {
      try {
        const parsed = parsePhoneNumberFromString(phone);
        console.log(phone);
        return parsed?.isValid() ?? false;
      } catch {
        return false;
      }
    },
    { message: "phoneInvalid" },
  ),
);

export const OnboardingSchema = SignupSchema;

export const OnboardingNameSchema = OnboardingSchema.pick({
  name: true,
  username: true,
});

export const OnboardingContactSchema = OnboardingSchema.pick({
  email: true,
}).extend({ phone: Phone });

export const OnboardingPasswordSchema = OnboardingSchema.pick({
  password: true,
})
  .extend({ confirmPassword: z.string().check(z.trim()) })
  .check(
    z.refine((data) => data.password === data.confirmPassword, {
      error: "passwordMismatch",
      path: ["confirmPassword"],
    }),
  );

export type OnboardingData = z.infer<typeof OnboardingSchema>;
export type NameData = z.infer<typeof OnboardingNameSchema>;
export type ContactData = z.infer<typeof OnboardingContactSchema>;
export type PasswordData = z.infer<typeof OnboardingPasswordSchema>;
