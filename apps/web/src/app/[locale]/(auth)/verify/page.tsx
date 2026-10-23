import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LicensedRoute, LicensedRoutes } from "@/lib/auth/definitions";
import { notFound } from "next/navigation";
import { VerifyProvider } from "./context";
import { VerifyForm } from "./form";
import { VerifyHeader } from "./header";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ scope: LicensedRoute }>;
}) {
  const scope: LicensedRoute = (await searchParams).scope as LicensedRoute;
  if (!LicensedRoutes[scope]) return notFound();

  return (
    <VerifyProvider
      initialStep={LicensedRoutes[scope].hidden ? "otp" : "email"}
    >
      <Card className="max-w-160 w-full text-center gap-6 max-md:bg-transparent max-md:ring-0">
        <CardHeader className="pt-4">
          <VerifyHeader />
        </CardHeader>
        <CardContent>
          <VerifyForm />
        </CardContent>
      </Card>
    </VerifyProvider>
  );
}
