"use server";

import { decrypt } from "@/lib/auth/actions";
import { MigrateEmailPayload } from "@/lib/auth/definitions";

export default async function MigrateEmailClaimPage({
  params,
}: Readonly<{
  params: Promise<{ code: string }>;
}>) {
  const { code } = await params;
  const payload: MigrateEmailPayload = (await decrypt(
    code,
  )) as MigrateEmailPayload;

  return (
    <div className="flex flex-col">
      <span>old email: {payload.oldEmail}</span>
      <span>new email: {payload.newEmail}</span>
    </div>
  );
}
