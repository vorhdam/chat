"use client";

import cookies from "js-cookie";
import * as React from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const themes = ["light", "dark", "system"] as const;
const resolvable = ["light", "dark"] as const;

type Theme = (typeof themes)[number];
type Resolvable = (typeof resolvable)[number];

type ThemeContextType = {
  theme: Resolvable;
  themes: readonly Theme[];
  setTheme: (theme: Theme) => void;
  loading: boolean;
};

const ThemeContext = React.createContext<ThemeContextType>({
  theme: "light",
  themes,
  setTheme: () => {},
  loading: true,
});

/**
 * ### useTheme()
 * @example
 *  const { theme, themes, setTheme } = useTheme()
 *
 *  console.log(theme) // logs the current theme
 *  console.log(themes) // logs all available themes
 *  setTheme("dark") // sets dark as the new theme
 */
function useTheme() {
  return React.useContext(ThemeContext);
}

type ThemeProviderProps = {
  cookieName?: string;
  defaultTheme: Theme;
  disableTransition?: boolean;
  enableSystem?: boolean;
  children: React.ReactNode;
};

function getSystemTheme(): Resolvable {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function disableAnimation() {
  const css = document.createElement("style");
  css.appendChild(
    document.createTextNode(
      `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`,
    ),
  );
  document.head.appendChild(css);

  return () => {
    (() => window.getComputedStyle(document.body))();
    setTimeout(() => document.head.removeChild(css), 1);
  };
}

function applyTheme(resolved: Resolvable, disableTransition = false) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(resolved);
  if (disableTransition) disableAnimation();
}

/**
 * ### ThemeProvider
 * @param cookieName The name of the cookie the color should be stored.
 * @param defaultTheme The theme that should be the fallback and default.
 * @param disableTransition Whether transition animations should be disabled.
 * @param enableSystem Whether the component should have access to the user's prefered theme.
 * @example
 *  <ColorProvider
 *     cookieName="THEME_COOKIE"
 *     defaultColor="system"
 *     disableTransition
 *     enableSystem
 *  >
 *       {children}
 *  </ColorProvider>
 */
function ThemeProvider({
  cookieName = "THEME",
  defaultTheme,
  disableTransition,
  enableSystem,
  children,
}: ThemeProviderProps) {
  const available = enableSystem ? themes : resolvable;
  const [current, setCurrent] = React.useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = React.useState<Resolvable>("light");
  const [loading, setLoading] = React.useState(true);
  const resolved: Resolvable = current === "system" ? systemTheme : current;

  useIsomorphicLayoutEffect(() => {
    const sys = getSystemTheme();
    setSystemTheme(sys);

    const saved = cookies.get(cookieName) as Theme | undefined;
    const initial: Theme =
      saved && (available as readonly string[]).includes(saved)
        ? (saved as Theme)
        : defaultTheme;

    const resolvedInitial: Resolvable =
      initial === "system" ? sys : (initial as Resolvable);

    setCurrent(initial);
    applyTheme(resolvedInitial, disableTransition);
    cookies.set(cookieName, initial, { expires: 365, sameSite: "lax" });
    setLoading(false);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (loading) return;
    applyTheme(resolved, disableTransition);
    cookies.set(cookieName, current, { expires: 365, sameSite: "lax" });
  }, [resolved, current, cookieName, disableTransition, loading]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  const setTheme = React.useCallback(
    (theme: Theme) => {
      if (!(available as readonly string[]).includes(theme)) return;
      const resolvedTheme: Resolvable =
        theme === "system" ? getSystemTheme() : (theme as Resolvable);
      setCurrent(theme);
      applyTheme(resolvedTheme, disableTransition);
      cookies.set(cookieName, theme, { expires: 365, sameSite: "lax" });
    },
    [cookieName, available, disableTransition],
  );

  const value = React.useMemo<ThemeContextType>(
    () => ({ theme: resolved, themes: available, setTheme, loading }),
    [resolved, available, setTheme, loading],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export { ThemeProvider, useTheme, type Theme };
