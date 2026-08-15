import { Separator } from "@/components/ui/separator";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("Errors");

  return (
    <div className="typeset typeset-docs antialiased text-foreground bg-background min-h-dvh overflow-hidden flex flex-row items-center justify-center text-center gap-4">
      <h1 className="text-foreground">404</h1>
      <Separator orientation="vertical" className="h-10 my-auto" />
      <span>{t("notFound")}</span>
    </div>
  );
}
