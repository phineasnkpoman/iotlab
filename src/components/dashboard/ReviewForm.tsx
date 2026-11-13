"use client";

import { useActionState } from "react";
import { reviewSubmission } from "@/app/actions/staff";
import type { FormState } from "@/app/actions/auth";
import { Field, TextArea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormMessage } from "@/components/ui/FormMessage";

export function ReviewForm({ id, score, feedback, reviewed = false }: { id: string; score: number | null; feedback: string | null; reviewed?: boolean }) {
  const [state, action] = useActionState(reviewSubmission.bind(null, id), {} as FormState);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[9rem_1fr] sm:items-start">
      <Field id={`score-${id}`} name="score" type="number" inputMode="decimal" min={0} max={100} step="0.5"
             label="Note sur 100" hint="Facultative" defaultValue={score ?? ""} />
      <TextArea id={`fb-${id}`} name="feedback" rows={3} maxLength={2000} label="Commentaire pour l'apprenant"
                placeholder="Ce qui fonctionne, ce qu'il faut corriger, une piste pour aller plus loin…" defaultValue={feedback ?? ""} />
      <div className="space-y-3 sm:col-span-2">
        <FormMessage error={state.error} message={state.message} />
        <SubmitButton pendingText="Enregistrement…">{reviewed ? "Mettre à jour la correction" : "Envoyer la correction"}</SubmitButton>
      </div>
    </form>
  );
}
