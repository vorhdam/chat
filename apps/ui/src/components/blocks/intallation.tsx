"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useInstaller } from "@/hooks/use-installer";
import config, { Installer } from "@repo/config";
import { Copy, Terminal } from "lucide-react";

export function Installation({
  name,
  type,
}: {
  name: string;
  type: "component" | "package";
}) {
  const { installer, setInstaller } = useInstaller();
  const { installers, defaultInstaller } = config.installer;
  const { namespace } = config.ui;

  const createComponentCommand = (installer: Installer): string => {
    switch (installer) {
      case "npm":
        return `npx shadcn@latest add ${namespace}/${name}`;
      case "yarn":
        return `yarn dlx shadcn@latest add ${namespace}/${name}`;
      case "pnpm":
        return `pnpm dlx shadcn@latest add ${namespace}/${name}`;
      case "bun":
        return `bunx --bun shadcn@latest add ${namespace}/${name}`;
    }
  };

  const createPackageCommand = (installer: Installer): string => {
    switch (installer) {
      case "npm":
        return `npm install ${namespace}/${name}`;
      case "yarn":
        return `yarn add ${namespace}/${name}`;
      case "pnpm":
        return `pnpm add ${namespace}/${name}`;
      case "bun":
        return `bun add ${namespace}/${name}`;
    }
  };

  const createCommand = (installer: Installer): string => {
    if (type === "component") return createComponentCommand(installer);
    if (type === "package") return createPackageCommand(installer);
    return "";
  };

  const defaultCommand = createCommand(defaultInstaller);
  const [command, setCommand] = useState<string>(defaultCommand);

  const handleClick = (installer: Installer) => {
    setInstaller(installer);
    setCommand(createCommand(installer));
  };

  return (
    <div className="flex flex-col bg-card w-full h-24 rounded-2xl border border-border">
      <div className="flex h-full flex-1 justify-between items-center px-4">
        <div className="flex flex-row gap-4 items-center">
          <Terminal className="size-5 text-muted-foreground" />
          <div className="flex gap-2">
            {installers.map((i) => (
              <Button
                key={i}
                variant={installer === i ? "default" : "outline"}
                className="h-7"
                onClick={() => handleClick(i)}
              >
                {i}
              </Button>
            ))}
          </div>
        </div>
        <Button
          variant={"ghost"}
          className={"h-8 aspect-square p-0 text-muted-foreground"}
          onClick={() => navigator.clipboard.writeText(command)}
        >
          <Copy />
        </Button>
      </div>
      <Separator />
      <div className="flex items-center h-full flex-1 px-4 font-mono text-sm text-foreground/80">
        {command}
      </div>
    </div>
  );
}
