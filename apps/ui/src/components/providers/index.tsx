import { ColorProvider } from "@repo/color";
import config from "@repo/config";
import { ThemeProvider } from "@repo/theme";

export default async function Providers({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  return (
    <ThemeProvider
      cookieName={config.theme.cookieName}
      defaultTheme="system"
      enableSystem
      disableTransition
    >
      <ColorProvider
        cookieName={config.color.cookieName}
        classPrefix="color-"
        colors={config.color.colors}
        defaultColor={config.color.defaultColor}
      >
        {children}
      </ColorProvider>
    </ThemeProvider>
  );
}
