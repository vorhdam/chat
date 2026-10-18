"use client";

import { migrateEmail } from "@/auth/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Warning, WarningDescription } from "@/components/ui/warning";
import { useTranslations } from "next-intl";
import * as React from "react";

export function MigrateEmailForm() {
  const t = useTranslations("MigrateEmailPage");

  const [state, action, pending] = React.useActionState(
    migrateEmail.bind(null, "grant"),
    undefined,
  );
  const [formData, setFormData] = React.useState({
    email: "",
    confirmEmail: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            <FieldLabel htmlFor="email">{t("emailLabel")}</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={formData.email}
              onChange={handleChange}
            />
            {state?.errors?.email && (
              <Warning variant="destructive">
                <WarningDescription>{state.errors.email[0]}</WarningDescription>
              </Warning>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmEmail">
              {t("confirmEmailLabel")}
            </FieldLabel>
            <Input
              id="confirmEmail"
              name="confirmEmail"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={formData.confirmEmail}
              onChange={handleChange}
            />
            {state?.errors?.confirmEmail && (
              <Warning variant="destructive">
                <WarningDescription>
                  {state.errors.confirmEmail[0]}
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
            className="w-full"
            size={"lg"}
          >
            {pending ? t("submitting") : t("submit")}
          </Button>
        </FieldSet>
      </FieldGroup>
    </form>
  );
}
