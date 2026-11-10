"use client";

import { useActionState } from "react";
import { reviewSubmission } from "@/app/actions/staff";
import type { FormState } from "@/app/actions/auth";
import { Field, TextArea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormMessage } from "@/components/ui/FormMessage";

export function ReviewForm({ id, score, feedback }: { id: string; score: number | null; feedback: string | null }) {
  const [state, action] = useActionState(reviewSubmission.bind(null, id), {} as FormState);
  return (
    <form action={action} className="mt-3 space-y-3">
      <Field id={`score-${id}`} name="score" type="number" min={0} max={100} step="0.5" label="Note (sur 100)" defaultValue={score ?? ""} />
      <TextArea id={`fb-${id}`} name="feedback" rows={3} label="Commentaire" defaultValue={feedback ?? ""} />
      <FormMessage error={state.error} message={state.message} />
      <SubmitButton pendingText="Enregistrement…">Enregistrer la correction</SubmitButton>
    </form>
  );
}
