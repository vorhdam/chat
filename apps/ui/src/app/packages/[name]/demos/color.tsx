"use client"

import * as React from "react";

// START_PROVIDER
import { ColorProvider } from "@nordaun/color";

export function ProviderComponent({ children }: { children: React.ReactNode }) {
  return (
    <ColorProvider
      cookieName="COLOR"
      classPrefix="color-"
      colors={["red", "green", "blue"]}
      defaultColor="red"
    >
      {children}
    </ColorProvider>
  );
}
// END_PROVIDER

// START_HOOK
import { useColor } from "@nordaun/color";

const { color, colors, setColor } = useColor();
console.log("Current color:", color);
console.log("All avialable colors:", colors);
setColor("red");
// END_HOOK

export const keywords = [
  "nordaun",
  "react",
  "package",
  "color",
  "provider"
];