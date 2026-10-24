"use client";

import { terminateAccount } from "@/auth/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Warning, WarningDescription } from "@/components/ui/warning";
import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";

export function TerminateAccountForm() {
  const t = useTranslations("TerminateAccountPage");
  const [agreed, setAgreed] = useState<boolean>(false);

  const [state, action, pending] = useActionState(terminateAccount, undefined);

  const handleChange = () => setAgreed(!agreed);

  return (
    <form action={action}>
      <FieldGroup>
        <FieldSet>
          <Field>
            <ScrollArea className="h-80 w-full rounded-md border p-6">
              <div className="text-justify text-sm">{t("legal")}</div>
            </ScrollArea>
          </Field>
          <Field orientation="horizontal">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={handleChange}
            />
            <FieldLabel htmlFor="terms">{t("terms")}</FieldLabel>
          </Field>
          {state?.message && (
            <Warning variant={"destructive"}>
              <WarningDescription>{state.message}</WarningDescription>
            </Warning>
          )}
          <Button
            aria-disabled={pending && agreed}
            type="submit"
            className="mt-2 w-full"
            size={"lg"}
            disabled={!agreed}
          >
            {pending ? t("submitting") : t("submit")}
          </Button>
        </FieldSet>
      </FieldGroup>
    </form>
  );
}
