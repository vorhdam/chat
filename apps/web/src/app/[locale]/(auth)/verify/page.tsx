import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LicensedRoute, LicensedRoutes } from "@/lib/auth/definitions";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { VerifyForm } from "./form";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ scope: LicensedRoute }>;
}) {
  const scope: LicensedRoute = (await searchParams).scope as LicensedRoute;
  if (!LicensedRoutes[scope]) return notFound();
  const t = await getTranslations("VerifyPage");

  return (
    <Card className="max-w-160 w-full text-center gap-6 max-md:bg-transparent max-md:ring-0">
      <CardHeader className="pt-4">
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyForm />
      </CardContent>
    </Card>
  );
}
