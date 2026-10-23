"use client";

import { CardDescription, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useVerify } from "./context";

export function VerifyHeader() {
  const t = useTranslations("VerifyPage");
  const { step } = useVerify();

  return (
    <>
      <CardTitle>{t(`${step}.title`)}</CardTitle>
      <CardDescription>{t(`${step}.description`)}</CardDescription>
    </>
  );
}
