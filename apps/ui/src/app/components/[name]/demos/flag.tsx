// START
import { Flag, FlagProvider } from "@/components/ui/flag";

export default function FlagDemo() {
  return (
    <div className="mx-auto flex flex-row gap-4">
      <FlagProvider src="https://cdn.jsdelivr.net/npm/@nordaun/flags@latest/flags/{code}.svg">
        <Flag code="HU" className="size-16" />
        <Flag code="GB" className="size-16" />
        <Flag code="DE" className="size-16" />
        <Flag code="NO" className="size-16" />
      </FlagProvider>
    </div>
  );
}
// END

export const keywords = [
  "shadcn",
  "base ui",
  "react",
  "component",
  "flag",
  "svg",
  "icon",
];
