import { Metadata } from "next";
import { Playfair_Display, Satisfy } from "next/font/google";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import config from "@repo/config";
import { cn } from "cn";

const playfair = Playfair_Display({
  variable: "--font-playfair-serif",
  subsets: ["latin"],
});

const satisfy = Satisfy({
  variable: "--font-satisfy-sans",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: `Home | ${config.ui.name}`,
  description: "Simple components for your extraordinary creations.",
};

export default function Page() {
  return (
    <div className="flex flex-col gap-8 items-center">
      <h1
        className={cn(
          "text-5xl font-bold max-w-140 text-center bg-linear-to-b from-primary to-primary/80 inline-block text-transparent bg-clip-text select-none",
          satisfy.className,
        )}
      >
        Simple components for your extraordinary creations.
      </h1>
      <h2
        className={cn(
          "sm:text-xl text-lg font-serif max-w-180 text-center text-foreground/75",
          playfair.className,
        )}
      >
        A collection of beatifully designed components that extend the
        boundaries of shadcn while staying consistent, modular and of course
        clean.
      </h2>
      <div className="flex flex-row gap-4">
        <Link href="/components">
          <Button size={"lg"} variant={"default"} className="px-4">
            Components
          </Button>
        </Link>
        <Link href="/packages">
          <Button size={"lg"} variant={"default"} className="px-4">
            Packages
          </Button>
        </Link>
        <Link href={config.ui.github.repository}>
          <Button size={"lg"} variant={"secondary"} className="px-4">
            Github
          </Button>
        </Link>
      </div>
    </div>
  );
}
