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
const installers = ["npm", "yarn", "pnpm", "bun"] as const;

export type Color = (typeof colors)[number];
export type Locale = (typeof locales)[number];
export type Installer = (typeof installers)[number];

type Config = Readonly<{
  /** The branding name of the main application*/
  name: string;
  /** The base URL (domain) of the main application*/
  baseURL: string;
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
  installer: {
    /** The name of the installer cookie. */
    cookieName: string;
    /** An array of all available installers in the application.*/
    installers: readonly Installer[];
    /** The default installer of the application.*/
    defaultInstaller: Installer;
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
  license: {
    /** The name of the license cookie. */
    cookieName: string;
    /** The name of the license header. */
    headerName: string;
    /** The duration the license is alive in seconds.*/
    duration: number;
  };
  mail: {
    /** The URL of the application's logo*/
    headerLogo: string;
    /** The default sender email address */
    defaultEmail: string;
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
  auth: {
    /** The length of a One Time Password (OTP) */
    otpLength: number;
  };
  ui: {
    /** The name of the ui subproject*/
    name: string;
    /** The namespace of the subproject packages on NPM.*/
    namespace: string;
    /** The base URL (domain) of the ui application*/
    baseURL: `https://${string}`;
    github: {
      /** The author of the ui application*/
      author: `https://${string}`;
      /** The organization of the ui application*/
      organization: `https://${string}`;
      /** The public repository of the ui application*/
      repository: `https://${string}`;
    };
  };
}>;

/**
 * ## Config
 * @description The global configuration for the application.
 */
const config: Config = {
  name: "Nordaun",
  baseURL: "http://localhost:3000",
  color: {
    cookieName: "color",
    colors,
    defaultColor: "white",
  },
  theme: {
    cookieName: "theme",
  },
  installer: {
    cookieName: "installer",
    installers,
    defaultInstaller: "bun",
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
  license: {
    cookieName: "license",
    headerName: "License",
    duration: 1000 * 60 * 5,
  },
  mail: {
    headerLogo: "https://i.imgur.com/0bw1xdF.png",
    defaultEmail: "noreply@nordaun.com",
  },
  cache: {
    duration: 600,
    lockTimeout: 3000,
    pollInterval: 100,
  },
  ratelimit: {
    clientDuration: 60,
    clientLimit: 300,
    globalDuration: 60,
    globalLimit: 300,
  },
  auth: {
    otpLength: 6,
  },
  ui: {
    name: "nordaun/ui",
    namespace: "@nordaun",
    baseURL: "https://ui.nordaun.com",
    github: {
      author: "https://github.com/vorhdam",
      organization: "https://github.com/nordaun",
      repository: "https://github.com/nordaun/ui",
    },
  },
};

export default config;
