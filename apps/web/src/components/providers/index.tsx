import { ColorProvider } from "@/components/providers/color";
import { I18nProvider } from "@/components/providers/i18n";
import { ThemeProvider } from "@/components/providers/theme";
import config from "@repo/config";

export default async function Providers({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  return (
    <I18nProvider>
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
    </I18nProvider>
  );
}
