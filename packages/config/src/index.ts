const colors = [
  "red",
  "orange",
  "yellow",
  "green",
  "emerald",
  "aqua",
  "blue",
  "purple",
  "pink",
  "white",
] as const;
const locales = ["en", "hu"] as const;

export type Color = (typeof colors)[number];
export type Locale = (typeof locales)[number];

type Config = Readonly<{
  /** The branding name of the main application*/
  name: string;
  color: {
    /** The name of the color cookie. */
    cookieName: string;
    /** An array of all available colors in the application.*/
    colors: readonly Color[];
    /** The default color of the application.*/
    defaultColor: Color;
  };
  theme: {
    /** The name of the theme cookie. */
    cookieName: string;
  };
  i18n: {
    /** An array of all available locales in the application.*/
    locales: readonly Locale[];
    /** The default locale of the application.*/
    defaultLocale: Locale;
  };
  session: {
    /** The name of the session cookie. */
    cookieName: string;
    /** The name of the session header. */
    headerName: string;
    /** The duration the session is alive in seconds.*/
    duration: number;
  };
  cache: {
    /** The time the cache lives by default in seconds.*/
    duration: number;
    /** The amount of time that the cache lock is released in milliseconds.*/
    lockTimeout: number;
    /** During a cache lock the second lookup polls this frequent in milliseconds.*/
    pollInterval: number;
  };
  ratelimit: {
    /** The time window in which the requests are checked in seconds for a user.*/
    clientDuration: number;
    /** The maximum amount of request that are allowed in that window above for a user.*/
    clientLimit: number;
    /** The time window in which the requests are checked in seconds globally.*/
    globalDuration: number;
    /** The maximum amount of request that are allowed in that window above globally.*/
    globalLimit: number;
  };
}>;

const config: Config = {
  name: "Nordaun",
  color: {
    cookieName: "color",
    colors,
    defaultColor: "white",
  },
  theme: {
    cookieName: "theme",
  },
  i18n: {
    locales,
    defaultLocale: "en",
  },
  session: {
    cookieName: "session",
    headerName: "Session",
    duration: 1000 * 60 * 60 * 24 * 30,
  },
  cache: {
    duration: 600,
    lockTimeout: 3000,
    pollInterval: 100,
  },
  ratelimit: {
    clientDuration: 60,
    clientLimit: 300,
    globalDuration: 10,
    globalLimit: 2,
  },
};

export default config;
