"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Password } from "@/components/ui/password";
import { Warning, WarningDescription } from "@/components/ui/warning";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useOnboarding } from "../context";
import { OnboardingPasswordSchema, PasswordData } from "../schema";

export default function OnboardingPasswordForm() {
  const { formData, setFormData } = useOnboarding();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordData>({
    resolver: zodResolver(OnboardingPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: PasswordData) => {
    setFormData(data);
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Password
              id="password"
              placeholder={"Enter your password"}
              {...register("password")}
            />

            {errors.password && (
              <Warning variant="destructive">
                <WarningDescription>
                  {errors.password.message}
                </WarningDescription>
              </Warning>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">Password Again</FieldLabel>
            <Password
              id="confirmPassword"
              placeholder={"Enter your password"}
              {...register("confirmPassword")}
            />

            {errors.confirmPassword && (
              <Warning variant="destructive">
                <WarningDescription>
                  {errors.confirmPassword.message}
                </WarningDescription>
              </Warning>
            )}
          </Field>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Next"}
          </Button>
        </FieldSet>
      </FieldGroup>
    </form>
  );
}
