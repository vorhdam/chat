import { Separator } from "@/components/ui/separator";
import { LimitedBy } from "@repo/ratelimit";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function RateLimited() {
  const param = (await headers()).get("x-limited-by");

  const limitedBy: LimitedBy | null =
    param === "user" || param === "global" ? param : null;

  if (!limitedBy) return notFound();

  return (
    <div
      className={`typeset typeset-docs antialiased text-foreground bg-background min-h-dvh overflow-hidden flex flex-row items-center justify-center text-center gap-4`}
    >
      <h1>429</h1>
      <Separator orientation="vertical" className="h-10 my-auto" />
      <span>
        {limitedBy === "user"
          ? "You have been trying to access our service way too often. Try again later."
          : "We are expriencing an unexpected amount of traffic. We will be back shortly."}
      </span>
    </div>
  );
}
