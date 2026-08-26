import AppleButton from "@/components/buttons/apple";
import GoogleButton from "@/components/buttons/google";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link, redirect } from "@/i18n/navigation";
import { getUser } from "@/lib/auth/dal";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "./form";

export default async function LoginPage() {
  const user = await getUser();
  if (user) return await redirect("/account");
  const t = await getTranslations("LoginPage");

  return (
    <Card className="max-w-160 w-full text-center gap-6 max-md:bg-transparent max-md:ring-0">
      <CardHeader className="pt-4">
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="flex flex-col gap-6 py-6 max-md:bg-transparent max-md:px-0 max-md:m-4">
        <div className="flex w-full justify-center items-center md:flex-row flex-col gap-4 relative">
          <GoogleButton>{t("loginWithGoogle")}</GoogleButton>
          <AppleButton>{t("loginWithApple")}</AppleButton>
        </div>
        <Separator />
        <div className="flex flex-col gap-2.5 items-center">
          <Label>
            {t("signupLabel")}
            <Link href={"/signup"} className="underline text-foreground">
              {t("signupAction")}
            </Link>
          </Label>
          <Label>
            {t("forgotPasswordLabel")}
            <Link href={"/resetpassword"} className="underline text-foreground">
              {t("forgotPasswordAction")}
            </Link>
          </Label>
        </div>
      </CardFooter>
    </Card>
  );
}
