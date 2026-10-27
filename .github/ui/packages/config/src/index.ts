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
const installers = ["npm", "yarn", "pnpm", "bun"] as const;

export type Color = (typeof colors)[number];
export type Installer = (typeof installers)[number];

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
  installer: {
    /** The name of the installer cookie. */
    cookieName: string;
    /** An array of all available installers in the application.*/
    installers: readonly Installer[];
    /** The default installer of the application.*/
    defaultInstaller: Installer;
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
