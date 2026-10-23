import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, redirect } from "@/i18n/navigation";
import { getUser } from "@/lib/auth/dal";
import { getTranslations } from "next-intl/server";
import { OnboardingProvider } from "./context";
import { OnboardingForm } from "./form";
import { OnboardingHeader } from "./header";

export default async function OnboardingPage() {
  const user = await getUser();
  if (user) return await redirect("/account");
  const t = await getTranslations("OnboardingPage");

  return (
    <OnboardingProvider>
      <Card className="max-w-160 w-full text-center gap-6 max-md:bg-transparent max-md:ring-0">
        <CardHeader className="pt-4">
          <OnboardingHeader />
        </CardHeader>
        <CardContent>
          <OnboardingForm />
        </CardContent>
        <CardFooter className="flex flex-col gap-6 py-6 max-md:bg-transparent max-md:px-0 max-md:m-4">
          <div className="flex flex-col gap-2.5 items-center">
            <Label>
              {t("loginLabel")}
              <Link href={"/login"} className="underline text-foreground">
                {t("loginAction")}
              </Link>
            </Label>
            <Label>
              {t("signupLabel")}
              <Link href={"/signup"} className="underline text-foreground">
                {t("signupAction")}
              </Link>
            </Label>
          </div>
        </CardFooter>
      </Card>
    </OnboardingProvider>
  );
}
