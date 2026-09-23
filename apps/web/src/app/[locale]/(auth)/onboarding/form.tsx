"use client";

import { onboarding } from "@/auth/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Password } from "@/components/ui/password";
import { Phone } from "@/components/ui/phone";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Warning, WarningDescription } from "@/components/ui/warning";
import { Link } from "@/i18n/navigation";
import { OnboardingStep, onboardingSteps } from "@/lib/auth/definitions";
import { useTranslations } from "next-intl";
import {
  Activity,
  ChangeEvent,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export function OnboardingForm() {
  const t = useTranslations("OnboardingPage");
  const [step, setStep] = useState<OnboardingStep>("name");
  const [datasAccepted, setDatasAccepted] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const submitted = useRef<boolean>(false);

  const [state, action, pending] = useActionState(
    onboarding.bind(null, step),
    undefined,
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleDatas = () => setDatasAccepted(!datasAccepted);
  const handleTerms = () => setTermsAccepted(!termsAccepted);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const goBack = () => {
    const previousStep = onboardingSteps[onboardingSteps.indexOf(step) - 1];
    if (previousStep) setStep(previousStep);
  };

  const goNext = useCallback(() => {
    const nextStep = onboardingSteps[onboardingSteps.indexOf(step) + 1];
    if (nextStep) setStep(nextStep);
  }, [step]);

  const onSubmit = () => (submitted.current = true);

  const progress: number = useMemo(() => {
    const current = onboardingSteps.indexOf(step) + 1;
    const unit = Math.floor(100 / onboardingSteps.length);
    return unit * current;
  }, [step]);

  useEffect(() => {
    if (submitted.current && !pending && state === undefined) {
      goNext();
      submitted.current = false;
    }
  }, [pending, state, goNext]);

  return (
    <form action={action} onSubmit={onSubmit}>
      <FieldGroup className="py-6">
        <Progress value={progress}>
          <ProgressLabel className={"text-muted-foreground"}>
            {t("progress")}
          </ProgressLabel>
          <ProgressValue />
        </Progress>
      </FieldGroup>
      <FieldGroup>
        <Activity mode={step === "name" ? "visible" : "hidden"}>
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
                  <WarningDescription>
                    {state.errors.name[0]}
                  </WarningDescription>
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
          </FieldSet>
        </Activity>
        <Activity mode={step === "contact" ? "visible" : "hidden"}>
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
                  <WarningDescription>
                    {state.errors.phone[0]}
                  </WarningDescription>
                </Warning>
              )}
            </Field>
          </FieldSet>
        </Activity>
        <Activity mode={step === "password" ? "visible" : "hidden"}>
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
                    {state.errors.confirmPassword[0]}
                  </WarningDescription>
                </Warning>
              )}
            </Field>
          </FieldSet>
        </Activity>
        <Activity mode={step === "finalize" ? "visible" : "hidden"}>
          <FieldSet>
            <Table className="rounded-lg overflow-hidden">
              <TableBody>
                {(["name", "email", "phone"] as const).map((key) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium text-start">
                      {t(`${key}Label`)}
                    </TableCell>
                    <TableCell className="text-end">{formData[key]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Field orientation="horizontal">
              <Checkbox
                id="datas"
                checked={datasAccepted}
                onCheckedChange={handleDatas}
              />
              <FieldLabel htmlFor="datas">{t("datasLabel")}</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={handleTerms}
              />
              <FieldLabel htmlFor="terms">
                {t("termsLabel")}
                <Link href={"/terms"} className="underline text-foreground">
                  {t("termsAction")}
                </Link>
              </FieldLabel>
            </Field>
          </FieldSet>
        </Activity>
        {state?.message && (
          <Warning variant={"destructive"}>
            <WarningDescription>{state.message}</WarningDescription>
          </Warning>
        )}
        <FieldSet>
          <div className="flex flex-row gap-4">
            {step !== "name" && (
              <Button
                type="button"
                variant={"secondary"}
                className="w-full flex-1"
                size={"lg"}
                onClick={goBack}
              >
                {t("back")}
              </Button>
            )}

            {step === "finalize" ? (
              <Button
                aria-disabled={pending && termsAccepted && datasAccepted}
                type="submit"
                className="w-full flex-1"
                size={"lg"}
                disabled={!termsAccepted || !datasAccepted}
              >
                {pending ? t("submitting") : t("submit")}
              </Button>
            ) : (
              <Button
                aria-disabled={pending}
                type="submit"
                className="w-full flex-1"
                size={"lg"}
              >
                {pending ? t("continuing") : t("continue")}
              </Button>
            )}
          </div>
        </FieldSet>
      </FieldGroup>
    </form>
  );
}
