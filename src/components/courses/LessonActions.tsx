"use client";

import { useActionState, useTransition, useState } from "react";
import { Check, Undo2 } from "lucide-react";
import { enrollInCourse, setLessonDone, submitExercise, submitQuiz, type QuizState } from "@/app/actions/learning";
import type { FormState } from "@/app/actions/auth";
import type { QuizQuestion } from "@/types/db";
import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field, TextArea } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";

export function EnrollButton({ courseId, courseSlug, enrolled }: { courseId: string; courseSlug: string; enrolled: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<FormState>({});
  if (enrolled) return <p className="text-sm text-[#9fe0c2]">Vous suivez cette formation.</p>;
  return (
    <div className="space-y-2">
      <Button disabled={pending} onClick={() => start(async () => setMsg(await enrollInCourse(courseId, courseSlug)))}>
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
  const [state, action] = useActionState(submitExercise.bind(null, exerciseId, courseSlug), {} as FormState);
  return (
    <form action={action} className="space-y-3">
      <Field id={`link-${exerciseId}`} name="link_url" type="url" label="Lien de votre simulation (Wokwi, dépôt…)" placeholder="https://wokwi.com/projects/…" />
      <TextArea id={`txt-${exerciseId}`} name="content" rows={4} label="Explications ou code" maxLength={5000} />
      <FormMessage error={state.error} message={state.message} />
      <SubmitButton>Soumettre mon travail</SubmitButton>
    </form>
  );
}

export function QuizForm({ exerciseId, courseSlug, questions }: { exerciseId: string; courseSlug: string; questions: QuizQuestion[] }) {
  const [state, action] = useActionState(submitQuiz.bind(null, exerciseId, courseSlug), {} as QuizState);
  return (
    <form action={action} className="space-y-6">
      {questions.map((q, n) => (
        <fieldset key={q.id} className="space-y-2">
          <legend className="font-medium">{n + 1}. {q.question}</legend>
          {q.options.map((o, i) => (
            <label key={i} className="flex cursor-pointer items-start gap-2.5 rounded-md border border-line px-3 py-2 text-sm hover:bg-panel2">
              <input type="radio" name={q.id} value={i} required className="mt-0.5 accent-[#e5383b]" />
              <span>{o}</span>
            </label>
          ))}
        </fieldset>
      ))}
      <FormMessage error={state.error} />
      {state.score !== undefined && (
        <p role="status" className="rounded-md border border-copper/50 bg-panel2 px-3 py-2 text-sm">
          Résultat : {state.correct} bonne{(state.correct ?? 0) > 1 ? "s" : ""} réponse{(state.correct ?? 0) > 1 ? "s" : ""} sur {state.total} ({state.score} %).
        </p>
      )}
      <SubmitButton pendingText="Correction…">Valider mes réponses</SubmitButton>
    </form>
  );
}
