"use client";

import { migrateEmail } from "@/auth/actions";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { Warning, WarningDescription } from "@/components/ui/warning";
import { useTranslations } from "next-intl";
import * as React from "react";

export function MigrateEmailClaimForm({ code }: { code: string }) {
  const t = useTranslations("MigrateEmailPage");

  const [state, action, pending] = React.useActionState(
    migrateEmail.bind(null, "claim"),
    undefined,
  );

  return (
    <form action={action}>
      <FieldGroup>
        <FieldSet>
          <input hidden readOnly name="code" value={code} />
          {state?.message && (
            <Warning variant={"destructive"}>
              <WarningDescription>{state.message}</WarningDescription>
            </Warning>
          )}
          <Button
            aria-disabled={pending}
            type="submit"
            className="w-full"
            size={"lg"}
          >
            {pending ? t("claim.submitting") : t("claim.submit")}
          </Button>
        </FieldSet>
      </FieldGroup>
    </form>
  );
}
