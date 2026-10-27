import { InstallerContext } from "@/components/providers/installer";
import { useContext } from "react";

export function useInstaller() {
  const context = useContext(InstallerContext);
  if (!context)
    throw new Error(`useInstaller() must be used within an InstallerProvider.`);
  return context;
}
