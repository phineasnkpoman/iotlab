"use client";

import { useTransition, useState } from "react";
import { Check, Lock, Undo2 } from "lucide-react";
import { SubmissionForm } from "@/components/forms/SubmissionForm";
import { enrollInCourse, setLessonDone, submitExercise } from "@/app/actions/learning";
import type { FormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
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

/** « Marquer comme terminée » : verrouillé tant qu'un QCM obligatoire de la leçon n'est pas réussi. */
export function CompleteButton({ lessonId, courseId, courseSlug, done, blockedBy }: {
  lessonId: string; courseId: string; courseSlug: string; done: boolean;
  blockedBy?: { id: string; title: string } | null;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<FormState>({});
  if (!done && blockedBy) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button variant="secondary" disabled aria-describedby={`verrou-${lessonId}`}><Lock size={15} aria-hidden="true" /> Marquer comme terminée</Button>
        <p id={`verrou-${lessonId}`} className="text-sm text-muted">
          Réussissez d&apos;abord le <a href={`#qcm-${blockedBy.id}`} className="text-primary-soft underline-offset-4 hover:underline">QCM de la leçon</a>.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <Button variant={done ? "secondary" : "primary"} disabled={pending}
              onClick={() => start(async () => setMsg(await setLessonDone(lessonId, courseId, courseSlug, !done)))}>
        {done ? <><Undo2 size={16} aria-hidden="true" /> Rouvrir la leçon</> : <><Check size={16} aria-hidden="true" /> Marquer comme terminée</>}
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
