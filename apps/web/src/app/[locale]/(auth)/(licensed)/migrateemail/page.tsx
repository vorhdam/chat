import { getLicense } from "@/auth/dal";
import { redirect } from "@/i18n/navigation";

export default async function MigrateEmailPage() {
  const license = await getLicense();
  if (license?.scope !== "migrateemail" || license.signed !== true)
    return redirect("/verify?scope=migrateemail");

  return <div>MigrateEmailPage</div>;
}
