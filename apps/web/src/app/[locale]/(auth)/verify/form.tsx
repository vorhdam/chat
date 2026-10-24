"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Warning, WarningDescription } from "@/components/ui/warning";
import { verify } from "@/lib/auth/actions";
import {
  LicensedRoute,
  LicensedRoutes,
  VerifySteps,
} from "@/lib/auth/definitions";
import config from "@repo/config";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { useVerify } from "./context";

export function VerifyForm() {
  const t = useTranslations("VerifyPage");
  const { step, setStep } = useVerify();
  const submitted = React.useRef<boolean>(false);
  const searchParams = useSearchParams();
  const scope: LicensedRoute = searchParams.get("scope") as LicensedRoute;

  const [state, action, pending] = React.useActionState(
    verify.bind(null, step).bind(null, scope),
    undefined,
  );

  const [formData, setFormData] = React.useState({
    email: "",
    otp: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const isOtp = typeof e === "string";
    setFormData((prev) => ({
      ...prev,
      [isOtp ? "otp" : e.target.name]: isOtp ? e : e.target.value,
    }));
  };

  const goNext = React.useCallback(() => {
    const nextStep = VerifySteps[VerifySteps.indexOf(step) + 1];
    if (nextStep) setStep(nextStep);
  }, [step, setStep]);

  const onSubmit = () => (submitted.current = true);

  React.useEffect(() => {
    if (LicensedRoutes[scope].hidden) goNext();
    if (submitted.current && !pending && state === undefined) {
      goNext();
      submitted.current = false;
    }
  }, [pending, state, goNext, scope]);

  return (
    <form action={action} onSubmit={onSubmit}>
      <FieldGroup>
        <React.Activity mode={step === "email" ? "visible" : "hidden"}>
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
          </FieldSet>
        </React.Activity>
        <React.Activity mode={step === "otp" ? "visible" : "hidden"}>
          <FieldSet>
            <Field>
              <InputOTP
                maxLength={config.auth.otpLength}
                value={formData.otp}
                onChange={handleChange}
                name="otp"
                id="otp"
              >
                <InputOTPGroup className="flex w-full justify-center">
                  {[...Array(config.auth.otpLength)].map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="size-14"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {state?.errors?.otp && (
                <Warning variant="destructive">
                  <WarningDescription>{state.errors.otp[0]}</WarningDescription>
                </Warning>
              )}
            </Field>
          </FieldSet>
        </React.Activity>
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
          {pending ? t(`${step}.submitting`) : t(`${step}.submit`)}
        </Button>
      </FieldGroup>
    </form>
  );
}
