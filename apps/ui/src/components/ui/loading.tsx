import { cn } from "cn";

function Loading({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-xs",
        className,
      )}
      {...props}
    >
      <div className="flex gap-1">
        <span className="size-1.5 animate-pulse rounded-full bg-primary/75" />
        <span className="size-1.5 animate-pulse rounded-full bg-primary/75 [animation-delay:150ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-primary/75 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export { Loading };
