"use client"

import * as React from "react";

// START_PROVIDER
import { ThemeProvider } from "@nordaun/theme";

export function ProviderComponent({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      cookieName="THEME"
      defaultTheme="system"
      enableSystem
      disableTransition
    >
      {children}
    </ThemeProvider>
  );
}
// END_PROVIDER

// START_HOOK
import { useTheme } from "@nordaun/theme";

const { theme, themes, setTheme } = useTheme();
console.log("Current theme:", theme);
console.log("All avialable themes:", themes);
setTheme("system");
// END_HOOK

export const keywords = [
  "nordaun",
  "react",
  "package",
  "theme",
  "provider"
];
