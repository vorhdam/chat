"use client";

import config, { Installer } from "@repo/config";
import cookies from "js-cookie";
import { createContext, ReactNode, useState } from "react";

type InstallerContextType = {
  installer: Installer;
  setInstaller: (installer: Installer) => void;
  loading: boolean;
};

export const InstallerContext = createContext<InstallerContextType>({
  installer: config.installer.defaultInstaller,
  setInstaller: () => {},
  loading: true,
});

export default function InstallerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { cookieName, installers, defaultInstaller } = config.installer;

  const [current, setCurrent] = useState<Installer>(() => {
    let initialInstaller = cookies.get(cookieName) as Installer;
    if (!installers.includes(initialInstaller))
      initialInstaller = defaultInstaller;
    return initialInstaller;
  });

  const setInstaller = (newInstaller: Installer) => {
    setCurrent(newInstaller);
    cookies.set(cookieName, newInstaller);
  };

  return (
    <InstallerContext.Provider
      value={{ installer: current, setInstaller, loading: false }}
    >
      {children}
    </InstallerContext.Provider>
  );
}
