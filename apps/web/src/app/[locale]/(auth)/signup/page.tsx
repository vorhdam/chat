import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, redirect } from "@/i18n/navigation";
import { getUser } from "@/lib/auth/dal";
import { getTranslations } from "next-intl/server";
import { SignupForm } from "./form";

export default async function SignupPage() {
  const user = await getUser();
  if (user) return await redirect("/account");
  const t = await getTranslations("SignupPage");

  return (
    <Card className="max-w-160 w-full text-center gap-6 max-md:bg-transparent max-md:ring-0">
      <CardHeader className="pt-4">
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
      <CardFooter className="flex flex-col gap-6 py-6 max-md:bg-transparent max-md:px-0 max-md:m-4">
        <Label>
          {t("loginLabel")}
          <Link href={"/login"} className="underline text-foreground">
            {t("loginAction")}
          </Link>
        </Label>
      </CardFooter>
    </Card>
  );
}
