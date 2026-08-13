const locales = ["en", "hu"] as const;

export type Locale = (typeof locales)[number];

type Config = Readonly<{
  /** The branding name of the main application*/
  name: string;
  i18n: {
    /** An array of all available locales in the application.*/
    locales: readonly Locale[];
    /** The default locale of the application.*/
    defaultLocale: Locale;
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
  i18n: {
    locales,
    defaultLocale: "en",
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
};

export default config;
