import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "cn";

const warningVariants = cva(
  "grid gap-0.5 rounded-lg text-left text-sm has-data-[slot=warning-action]:relative has-data-[slot=warning-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 w-full relative group/warning",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive *:data-[slot=warning-description]:text-destructive/90 *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Warning({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof warningVariants>) {
  return (
    <div
      data-slot="warning"
      role="warning"
      className={cn(warningVariants({ variant }), className)}
      {...props}
    />
  );
}

function WarningTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="warning-title"
      className={cn(
        "font-medium group-has-[>svg]/warning:col-start-2 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        className,
      )}
      {...props}
    />
  );
}

function WarningDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="warning-description"
      className={cn(
        "text-muted-foreground text-sm text-balance md:text-pretty [&_p:not(:last-child)]:mb-1 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        className,
      )}
      {...props}
    />
  );
}

function WarningAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="warning-action"
      className={cn("absolute top-2.5 right-3", className)}
      {...props}
    />
  );
}

export { Warning, WarningAction, WarningDescription, WarningTitle };
