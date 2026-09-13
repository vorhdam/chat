import { ReactNode } from "react";
import { OnboardingProvider } from "./context";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}
