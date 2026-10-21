import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MigrateEmailPayload } from "@/lib/auth/definitions";
import { decodeJwt } from "jose";
import { ArrowDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { MigrateEmailClaimForm } from "./form";

export default async function MigrateEmailClaimPage({
  params,
}: Readonly<{
  params: Promise<{ code: string }>;
}>) {
  try {
    const { code } = await params;
    const payload: MigrateEmailPayload | null = decodeJwt(
      code,
    ) as MigrateEmailPayload | null;

    if (!payload) return notFound();

    const t = await getTranslations("MigrateEmailPage");

    return (
      <Card className="max-w-160 w-full text-center gap-6 max-md:bg-transparent max-md:ring-0">
        <CardHeader className="pt-4">
          <CardTitle>{t("claimTitle")}</CardTitle>
          <CardDescription>{t("claimDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="bg-muted/50 w-full p-1 border border-border rounded-md">
              {payload.oldEmail}
            </div>
            <ArrowDown className="size-5" />
            <div className="bg-muted/50 w-full p-1 border border-border rounded-md">
              {payload.newEmail}
            </div>
          </div>
          <MigrateEmailClaimForm code={code} />
        </CardContent>
      </Card>
    );
  } catch {
    return notFound();
  }
}
