import { Separator } from "@/components/ui/separator";
import { cn } from "@/components/utils";
import { Geist } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function NotFound() {
  return (
    <div
      className={cn(
        "typeset typeset-docs antialiased text-foreground bg-background min-h-dvh overflow-hidden flex flex-row items-center justify-center text-center gap-4",
        geistSans.variable,
      )}
    >
      <h1>404</h1>
      <Separator orientation="vertical" className="h-10 my-auto" />
      <span>Sorry, the resource you are looking for couldn't be found.</span>
    </div>
  );
}
