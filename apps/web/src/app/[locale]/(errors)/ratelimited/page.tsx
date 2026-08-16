import { Separator } from "@/components/ui/separator";
import { type LimitedBy } from "@repo/ratelimit";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function RateLimited() {
  const param = (await headers()).get("x-limited-by");

  const limitedBy: LimitedBy | null =
    param === "user" || param === "global" ? param : null;

  if (!limitedBy) return notFound();

  const t = await getTranslations("Errors");

  return (
    <div className="typeset antialiased text-foreground bg-background min-h-dvh overflow-hidden flex flex-row items-center justify-center text-center gap-4">
      <h1>429</h1>
      <Separator orientation="vertical" className="h-10 my-auto" />
      <span>
        {limitedBy === "user" ? t("clientRatelimit") : t("globalRatelimit")}
      </span>
    </div>
  );
}
