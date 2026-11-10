"use client";

import { useActionState } from "react";
import { updateProfile, type FormState } from "@/app/actions/auth";
import type { Profile } from "@/types/db";
import { Field, TextArea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormMessage } from "@/components/ui/FormMessage";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(updateProfile, {} as FormState);
  return (
    <form action={action} className="space-y-4">
      <Field id="full_name" name="full_name" label="Nom complet" defaultValue={profile.full_name ?? ""} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="filiere" name="filiere" label="Filière" defaultValue={profile.filiere ?? ""} placeholder="ex. Réseaux et Télécommunications" />
        <Field id="promotion" name="promotion" label="Promotion" defaultValue={profile.promotion ?? ""} placeholder="ex. L3" />
      </div>
      <TextArea id="bio" name="bio" rows={4} label="Présentation" defaultValue={profile.bio ?? ""} maxLength={400} />
      <FormMessage error={state.error} message={state.message} />
      <SubmitButton pendingText="Enregistrement…">Enregistrer</SubmitButton>
    </form>
  );
}
