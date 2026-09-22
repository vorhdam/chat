"use client";

import { cn } from "cn";
import { ComponentProps } from "react";
import AppleLogo from "../icons/apple";
import { Button } from "../ui/button";

export default function AppleButton({
  children,
  className,
  ...props
}: ComponentProps<"button">) {
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
