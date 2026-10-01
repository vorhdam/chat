import { getLicense } from "@/auth/dal";
import { redirect } from "@/i18n/navigation";

export default async function ResetPasswordPage() {
  const license = await getLicense();
  if (license?.scope !== "resetpassword" || license.signed !== true)
    return redirect("/verify?scope=resetpassword");

  return <div>ResetPasswordPage</div>;
}
