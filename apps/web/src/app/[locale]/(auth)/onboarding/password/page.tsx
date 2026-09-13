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
import OnboardingPasswordForm from "./form";

export default async function LoginPage() {
  const user = await getUser();
  if (user) return await redirect("/account");

  return (
    <Card className="max-w-160 w-full text-center gap-6 max-md:bg-transparent max-md:ring-0">
      <CardHeader className="pt-4">
        <CardTitle>Onboarding Password</CardTitle>
        <CardDescription>Enter your password twice</CardDescription>
      </CardHeader>
      <CardContent>
        <OnboardingPasswordForm />
      </CardContent>
      <CardFooter className="flex flex-col gap-6 py-6 max-md:bg-transparent max-md:px-0 max-md:m-4">
        <Label>
          Ain't got the time for this?
          <Link href={"/signup"} className="underline text-foreground">
            Signup
          </Link>
        </Label>
      </CardFooter>
    </Card>
  );
}
