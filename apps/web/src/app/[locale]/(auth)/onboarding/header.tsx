"use client";

import { CardDescription, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useOnboarding } from "./context";

export function OnboardingHeader() {
  const t = useTranslations("OnboardingPage");
  const { step } = useOnboarding();

  return (
    <>
      <CardTitle>{t(`${step}.title`)}</CardTitle>
      <CardDescription>{t(`${step}.description`)}</CardDescription>
    </>
  );
}
