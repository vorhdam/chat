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
  const [success, setSuccess] = React.useState<boolean>(false);
  const submitted = React.useRef<boolean>(false);

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

  const onSubmit = () => (submitted.current = true);

  React.useEffect(() => {
    if (submitted.current && !pending && state === undefined) {
      setSuccess(true);
      submitted.current = false;
    }
  }, [pending, state]);

  return (
    <>
      <React.Activity mode={success ? "hidden" : "visible"}>
        <form action={action} onSubmit={onSubmit}>
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
                    <WarningDescription>
                      {state.errors.email[0]}
                    </WarningDescription>
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
                {pending ? t("grant.submitting") : t("grant.submit")}
              </Button>
            </FieldSet>
          </FieldGroup>
        </form>
      </React.Activity>
      <React.Activity mode={success ? "visible" : "hidden"}>
        <div className="font-bold mb-4">{t("emailSent")}</div>
      </React.Activity>
    </>
  );
}
