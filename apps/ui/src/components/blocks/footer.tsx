import config from "@repo/config";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex items-center justify-center w-dwv p-4 text-muted-foreground h-14 text-sm text-center">
      <span>
        Built by <Link href="/">vorhdam</Link> at{" "}
        <Link href="/">{config.name}.</Link> The source code is available on{" "}
        <Link href="/">Github</Link>
      </span>
    </footer>
  );
}
