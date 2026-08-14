"use client";

import cookies from "js-cookie";
import * as React from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

type ColorContextType<T extends string = string> = {
  color: T;
  colors: readonly T[];
  setColor: (color: T) => void;
  loading: boolean;
};

const ColorContext = React.createContext<ColorContextType>({
  color: "",
  colors: [],
  setColor: () => {},
  loading: true,
});

/**
 * ### useColor()
 * @example
 *  const { color, colors, setColor } = useColor()
 *
 *  console.log(color) // logs the current color
 *  console.log(colors) // logs all available colors
 *  setColor("purple") // sets purple as the new color
 */
function useColor<T extends string = string>() {
  return React.useContext(ColorContext) as unknown as ColorContextType<T>;
}

type ColorProviderProps<T extends string> = {
  cookieName?: string;
  classPrefix?: string;
  classSuffix?: string;
  colors: readonly T[];
  defaultColor: T;
  children: React.ReactNode;
};

function buildClass(color: string, prefix = "", suffix = "") {
  return `${prefix}${color}${suffix}`;
}

function applyColor(
  color: string,
  allColors: readonly string[],
  prefix = "",
  suffix = "",
) {
  document.documentElement.classList.remove(
    ...allColors.map((c) => buildClass(c, prefix, suffix)),
  );
  document.documentElement.classList.add(buildClass(color, prefix, suffix));
}

/**
 * ### ColorProvider
 * @param cookieName The name of the cookie the color should be stored.
 * @param classPrefix The className prefix that should be applied at the <html> tag.
 * @param classSuffix The className suffix that should be applied at the <html> tag.
 * @param colors The array of the colors you want to use.
 * @param defaultColor The color that should be the fallback and default.
 * @example
 *  <ColorProvider
 *     cookieName="COLOR_COOKIE"
 *     classPrefix="color-"
 *     colors={["red", "green", "blue"]}
 *     defaultColor="red"
 *  >
 *       {children}
 *  </ColorProvider>
 */
function ColorProvider<T extends string>({
  cookieName = "COLOR",
  classPrefix,
  classSuffix,
  colors,
  defaultColor,
  children,
}: ColorProviderProps<T>) {
  const [current, setCurrent] = React.useState<T>(defaultColor);
  const [loading, setLoading] = React.useState(true);

  useIsomorphicLayoutEffect(() => {
    const saved = cookies.get(cookieName);
    const initial: T =
      saved && (colors as readonly string[]).includes(saved)
        ? (saved as T)
        : defaultColor;

    setCurrent(initial);
    applyColor(initial, colors, classPrefix, classSuffix);
    cookies.set(cookieName, initial, { expires: 365, sameSite: "lax" });
    setLoading(false);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (loading) return;
    applyColor(current, colors, classPrefix, classSuffix);
    cookies.set(cookieName, current, { expires: 365, sameSite: "lax" });
  }, [current, colors, classPrefix, classSuffix, cookieName, loading]);

  const setColor = React.useCallback(
    (color: T) => {
      if (!(colors as readonly string[]).includes(color)) {
        console.warn(
          `Ignored. "${color}" is not in the colors list of ColorProvider.`,
        );
        return;
      }
      applyColor(color, colors, classPrefix, classSuffix);
      cookies.set(cookieName, color, { expires: 365, sameSite: "lax" });
      setCurrent(color);
    },
    [colors, classPrefix, classSuffix, cookieName],
  );

  const value = React.useMemo<ColorContextType<T>>(
    () => ({ color: current, colors, setColor, loading }),
    [current, colors, setColor, loading],
  );

  return (
    <ColorContext.Provider value={value as unknown as ColorContextType}>
      {children}
    </ColorContext.Provider>
  );
}

export { ColorProvider, useColor };
