"use client";

import AppleLogo from "@/components/icons/apple";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import * as React from "react";

export default function AppleButton({
  children,
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <Button
      name="loginWithApple"
      variant={"secondary"}
      size={"lg"}
      className={cn(
        "flex items-center justify-center gap-4 p-2 transition-none text-muted-foreground w-full flex-1",
        className,
      )}
      {...props}
    >
      <AppleLogo variant={"icon"} className="size-4.5" />
      {children}
    </Button>
  );
}
