"use client";

import { useActionState, useTransition, useState } from "react";
import { Check, Undo2 } from "lucide-react";
import { SubmissionForm } from "@/components/forms/SubmissionForm";
import { enrollInCourse, setLessonDone, submitExercise, submitQuiz, type QuizState } from "@/app/actions/learning";
import type { FormState } from "@/app/actions/auth";
import type { QuizQuestion } from "@/types/db";
import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormMessage } from "@/components/ui/FormMessage";

export function EnrollButton({ courseId, courseSlug, enrolled }: { courseId: string; courseSlug: string; enrolled: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<FormState>({});
  if (enrolled) return <p className="inline-flex items-center gap-2 text-sm text-ok-soft"><Check size={16} aria-hidden="true" /> Vous suivez cette formation.</p>;
  return (
    <div className="space-y-2">
      <Button variant="secondary" className="w-full" disabled={pending} onClick={() => start(async () => setMsg(await enrollInCourse(courseId, courseSlug)))}>
        {pending ? "Inscription…" : "Suivre cette formation"}
      </Button>
      <FormMessage error={msg.error} />
    </div>
  );
}

export function CompleteButton({ lessonId, courseId, courseSlug, done }: { lessonId: string; courseId: string; courseSlug: string; done: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<FormState>({});
  return (
    <div className="space-y-2">
      <Button variant={done ? "secondary" : "primary"} disabled={pending}
              onClick={() => start(async () => setMsg(await setLessonDone(lessonId, courseId, courseSlug, !done)))}>
        {done ? <><Undo2 size={16} /> Rouvrir la leçon</> : <><Check size={16} /> Marquer comme terminée</>}
      </Button>
      <FormMessage error={msg.error} />
    </div>
  );
}

export function ExerciseSubmitForm({ exerciseId, courseSlug }: { exerciseId: string; courseSlug: string }) {
  return (
    <SubmissionForm action={submitExercise.bind(null, exerciseId, courseSlug)} idPrefix={`ex-${exerciseId}`}
                    linkLabel="Lien de votre simulation (Wokwi, dépôt…)" submitLabel="Soumettre mon travail" />
  );
}

export function QuizForm({ exerciseId, courseSlug, questions }: { exerciseId: string; courseSlug: string; questions: QuizQuestion[] }) {
  const [state, action] = useActionState(submitQuiz.bind(null, exerciseId, courseSlug), {} as QuizState);
  return (
    <form action={action} className="space-y-6">
      {questions.map((q, n) => (
        <fieldset key={q.id} className="space-y-2">
          <legend className="mb-1 font-medium">{n + 1}. {q.question}</legend>
          {q.options.map((o, i) => (
            <label key={i} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-tint/10 bg-well px-4 py-3 text-sm transition-colors duration-200 hover:border-line-strong hover:bg-tint/[0.05] has-[:checked]:border-primary/60 has-[:checked]:bg-primary/10">
              <input type="radio" name={q.id} value={i} required className="mt-0.5 accent-primary" />
              <span>{o}</span>
            </label>
          ))}
        </fieldset>
      ))}
      <FormMessage error={state.error} />
      {state.score !== undefined && (
        <p role="status" className="tabular rounded-lg border border-copper/45 bg-copper/[0.08] px-3.5 py-2.5 text-sm">
          Résultat : {state.correct} bonne{(state.correct ?? 0) > 1 ? "s" : ""} réponse{(state.correct ?? 0) > 1 ? "s" : ""} sur {state.total} ({state.score} %).
        </p>
      )}
      <SubmitButton pendingText="Correction…">Valider mes réponses</SubmitButton>
    </form>
  );
}
