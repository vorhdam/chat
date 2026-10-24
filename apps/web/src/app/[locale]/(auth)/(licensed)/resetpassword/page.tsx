import { getLicense } from "@/auth/dal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "./form";

export default async function ResetPasswordPage() {
  const license = await getLicense();
  if (license?.scope !== "resetpassword" || license.signed !== true)
    return redirect("/verify?scope=resetpassword");

  const t = await getTranslations("ResetPasswordPage");

  return (
    <Card className="max-w-160 w-full text-center gap-6 max-md:bg-transparent max-md:ring-0">
      <CardHeader className="pt-4">
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
