"use client";

import { resetPassword } from "@/auth/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Password } from "@/components/ui/password";
import { Warning, WarningDescription } from "@/components/ui/warning";
import { useTranslations } from "next-intl";
import { ChangeEvent, useActionState, useState } from "react";

export function ResetPasswordForm() {
  const t = useTranslations("ResetPasswordPage");

  const [state, action, pending] = useActionState(resetPassword, undefined);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form action={action}>
      <FieldGroup>
        <FieldSet>
          <Field>
            <FieldLabel htmlFor="password">{t("passwordLabel")}</FieldLabel>
            <Password
              id="password"
              name="password"
              placeholder={t("passwordPlaceholder")}
              value={formData.password}
              onChange={handleChange}
            />
            {state?.errors?.password && (
              <Warning variant="destructive">
                <WarningDescription>
                  <p>{t("passwordCriteria")}</p>
                  <ul className="w-full text-start px-2">
                    {state.errors.password.map((error) => (
                      <li key={error}>- {error}</li>
                    ))}
                  </ul>
                </WarningDescription>
              </Warning>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">
              {t("confirmPasswordLabel")}
            </FieldLabel>
            <Password
              id="confirmPassword"
              name="confirmPassword"
              placeholder={t("passwordPlaceholder")}
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {state?.errors?.confirmPassword && (
              <Warning variant="destructive">
                <WarningDescription>
                  <p>{t("passwordCriteria")}</p>
                  <ul className="w-full text-start px-2">
                    {state.errors.confirmPassword.map((error) => (
                      <li key={error}>- {error}</li>
                    ))}
                  </ul>
                </WarningDescription>
              </Warning>
            )}
          </Field>
          {state?.message && (
            <Warning variant={"destructive"}>
              <WarningDescription>{state.message}</WarningDescription>
            </Warning>
          )}
          <Button
            aria-disabled={pending}
            type="submit"
            className="mt-2 w-full"
            size={"lg"}
          >
            {pending ? t("submitting") : t("submit")}
          </Button>
        </FieldSet>
      </FieldGroup>
    </form>
  );
}
