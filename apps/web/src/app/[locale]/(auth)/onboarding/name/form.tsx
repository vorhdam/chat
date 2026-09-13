"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Warning, WarningDescription } from "@/components/ui/warning";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useOnboarding } from "../context";
import { NameData, OnboardingNameSchema } from "../schema";

export default function OnboardingNameForm() {
  const router = useRouter();
  const { setFormData } = useOnboarding();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NameData>({
    resolver: zodResolver(OnboardingNameSchema),
    defaultValues: {
      name: "",
      username: "",
    },
  });

  const onSubmit = (data: NameData) => {
    setFormData(data);
    router.push("/onboarding/contact");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              {...register("name")}
            />
            {errors.name && (
              <Warning variant="destructive">
                <WarningDescription>{errors.name.message}</WarningDescription>
              </Warning>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              {...register("username")}
            />
            {errors.username && (
              <Warning variant="destructive">
                <WarningDescription>
                  {errors.username.message}
                </WarningDescription>
              </Warning>
            )}
          </Field>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Next"}
          </Button>
        </FieldSet>
      </FieldGroup>
    </form>
  );
}
