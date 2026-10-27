import config from "@repo/config";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex items-center justify-center w-dwv p-4 text-muted-foreground h-14 text-sm text-center">
      <span>
        Built by <Link href={config.ui.github.author}>vorhdam</Link> at{" "}
        <Link href={config.ui.github.organization}>{config.name}.</Link> The
        source code is available on{" "}
        <Link href={config.ui.github.repository}>Github</Link>
      </span>
    </footer>
  );
}
