"use client";

import { cn } from "cn";
import { ComponentProps } from "react";
import GoogleLogo from "../icons/google";
import { Button } from "../ui/button";

export default function GoogleButton({
  children,
  className,
  ...props
}: ComponentProps<"button">) {
  return (
    <Button
      name="loginWithGoogle"
      variant={"secondary"}
      size={"lg"}
      className={cn(
        "flex items-center justify-center gap-4 p-2 transition-none text-muted-foreground w-full flex-1",
        className,
      )}
      {...props}
    >
      <GoogleLogo variant={"icon"} className="size-4.5" />
      {children}
    </Button>
  );
}
