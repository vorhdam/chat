"use client";

import { onboarding } from "@/auth/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Password } from "@/components/ui/password";
import { Phone } from "@/components/ui/phone";
import { Warning, WarningDescription } from "@/components/ui/warning";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ChangeEvent, useActionState, useState } from "react";

export function SignupForm() {
  const t = useTranslations("SignupPage");
  const [agreed, setAgreed] = useState<boolean>(false);

  const [state, action, pending] = useActionState(
    onboarding.bind(null, "finalize"),
    undefined,
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
  });

  const handleTerms = () => setAgreed(!agreed);
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
            <FieldLabel htmlFor="name">{t("nameLabel")}</FieldLabel>
            <Input
              id="name"
              name="name"
              type="name"
              placeholder={t("namePlaceholder")}
              value={formData.name}
              onChange={handleChange}
            />
            {state?.errors?.name && (
              <Warning variant="destructive">
                <WarningDescription>{state.errors.name[0]}</WarningDescription>
              </Warning>
            )}
          </Field>
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
            <FieldLabel htmlFor="username">{t("usernameLabel")}</FieldLabel>
            <Input
              id="username"
              name="username"
              placeholder={t("usernamePlaceholder")}
              value={formData.username}
              onChange={handleChange}
            />
            {state?.errors?.username && (
              <Warning variant="destructive">
                <WarningDescription>
                  {state.errors.username[0]}
                </WarningDescription>
              </Warning>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">{t("phoneLabel")}</FieldLabel>
            <Phone
              id="phone"
              name="phone"
              placeholder={t("phonePlaceholder")}
              searchPlaceholder={t("phoneSearchPlaceholder")}
              emptyPlaceholder={t("phoneEmptyPlaceholder")}
              value={formData.phone}
              onChange={handleChange}
            />
            {state?.errors?.phone && (
              <Warning variant="destructive">
                <WarningDescription>{state.errors.phone[0]}</WarningDescription>
              </Warning>
            )}
          </Field>
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
          <Field orientation="horizontal">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={handleTerms}
            />
            <FieldLabel htmlFor="terms">
              {t("termsLabel")}
              <Link href={"/terms"} className="underline text-foreground">
                {t("termsAction")}
              </Link>
            </FieldLabel>
          </Field>
          {state?.message && (
            <Warning variant={"destructive"}>
              <WarningDescription>{state.message}</WarningDescription>
            </Warning>
          )}
          <Button
            aria-disabled={pending && agreed}
            type="submit"
            className="w-full"
            size={"lg"}
            disabled={!agreed}
          >
            {pending ? t("submitting") : t("submit")}
          </Button>
        </FieldSet>
      </FieldGroup>
    </form>
  );
}
