"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { OnboardingData } from "./schema";

type OnboardingContextType = {
  formData: Partial<OnboardingData>;
  setFormData: (formData: Partial<OnboardingData>) => void;
};

const OnboardingContext = createContext<OnboardingContextType>({
  formData: {},
  setFormData: () => {},
});

export function useOnboarding() {
  return useContext(OnboardingContext);
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const value = useMemo<OnboardingContextType>(
    () => ({
      formData: data,
      setFormData: (d) => {
        setData({ ...d, ...data });
      },
    }),
    [data, setData],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
