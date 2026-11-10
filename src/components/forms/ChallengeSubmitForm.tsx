"use client";

import { useActionState } from "react";
import { submitChallenge } from "@/app/actions/learning";
import type { FormState } from "@/app/actions/auth";
import { Field, TextArea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormMessage } from "@/components/ui/FormMessage";

export function ChallengeSubmitForm({ challengeId, slug }: { challengeId: string; slug: string }) {
  const [state, action] = useActionState(submitChallenge.bind(null, challengeId, slug), {} as FormState);
  return (
    <form action={action} className="space-y-3">
      <Field id="link_url" name="link_url" type="url" label="Lien de votre réalisation" placeholder="https://wokwi.com/projects/…" />
      <TextArea id="content" name="content" rows={4} label="Explications ou code" maxLength={5000} />
      <FormMessage error={state.error} message={state.message} />
      <SubmitButton>Envoyer ma participation</SubmitButton>
    </form>
  );
}
