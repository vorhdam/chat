import { Separator } from "@/components/ui/separator";

export default function NotFound() {
  return (
    <div className="typeset antialiased text-foreground bg-background min-h-dvh overflow-hidden flex flex-row items-center justify-center text-center gap-4">
      <h1 className="text-foreground">404</h1>
      <Separator orientation="vertical" className="h-10 my-auto" />
      <span>Sorry, we couldn't find what you are looking for.</span>
    </div>
  );
}
