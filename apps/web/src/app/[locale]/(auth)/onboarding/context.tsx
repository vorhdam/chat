"use client";

import type { OnboardingStep } from "@/lib/auth/definitions";
import * as React from "react";

type OnboardingContextType = {
  step: OnboardingStep;
  setStep: React.Dispatch<React.SetStateAction<OnboardingStep>>;
};

const OnboardingContext = React.createContext<OnboardingContextType | null>(
  null,
);

export function useOnboarding() {
  const context = React.useContext(OnboardingContext);
  if (!context)
    throw new Error("useOnboarding must be used within OnboardingProvider.");
  return context;
}

export function OnboardingProvider({
  children,
  initialStep = "name",
}: {
  children: React.ReactNode;
  initialStep?: OnboardingStep;
}) {
  const [step, setStep] = React.useState<OnboardingStep>(initialStep);
  const value = React.useMemo(() => ({ step, setStep }), [step]);
  return <OnboardingContext value={value}>{children}</OnboardingContext>;
}
