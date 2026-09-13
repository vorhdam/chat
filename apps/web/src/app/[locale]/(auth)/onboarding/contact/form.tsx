"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Phone } from "@/components/ui/phone";
import { Warning, WarningDescription } from "@/components/ui/warning";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { useOnboarding } from "../context";
import { ContactData, OnboardingContactSchema } from "../schema";

export default function OnboardingContactForm() {
  const router = useRouter();
  const { setFormData } = useOnboarding();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactData>({
    resolver: zodResolver(OnboardingContactSchema),
    defaultValues: {
      email: "",
      phone: "",
    },
  });

  const onSubmit = (data: ContactData) => {
    setFormData(data);
    router.push("/onboarding/password");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="text"
              placeholder="Enter your email"
              {...register("email")}
            />
            {errors.email && (
              <Warning variant="destructive">
                <WarningDescription>{errors.email.message}</WarningDescription>
              </Warning>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">phone</FieldLabel>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Phone
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone"
                  searchPlaceholder="Search for your region..."
                  emptyPlaceholder="Couldn't find the region you are looking for"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.phone && (
              <Warning variant="destructive">
                <WarningDescription>{errors.phone.message}</WarningDescription>
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
