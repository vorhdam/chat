"use client";

import type { VerifyStep } from "@/lib/auth/definitions";
import * as React from "react";

type VerifyContextType = {
  step: VerifyStep;
  setStep: React.Dispatch<React.SetStateAction<VerifyStep>>;
};

const VerifyContext = React.createContext<VerifyContextType | null>(null);

export function useVerify() {
  const context = React.useContext(VerifyContext);
  if (!context)
    throw new Error("useVerify() must be used within a VerifyProvider.");
  return context;
}

export function VerifyProvider({
  children,
  initialStep = "email",
}: {
  children: React.ReactNode;
  initialStep?: VerifyStep;
}) {
  const [step, setStep] = React.useState<VerifyStep>(initialStep);
  const value = React.useMemo(() => ({ step, setStep }), [step]);
  return <VerifyContext value={value}>{children}</VerifyContext>;
}
