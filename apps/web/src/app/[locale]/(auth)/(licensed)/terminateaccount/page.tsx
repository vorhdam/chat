import { getLicense } from "@/auth/dal";
import { redirect } from "@/i18n/navigation";

export default async function TerminateAccountPage() {
  const license = await getLicense();
  if (license?.scope !== "terminateaccount" || license.signed !== true)
    return redirect("/verify?scope=terminateaccount");

  return <div>TerminateAccountPage</div>;
}
