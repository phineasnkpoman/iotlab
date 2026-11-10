"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { safeUrl } from "@/utils/format";
import type { FormState } from "./auth";

async function currentUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

/** Inscription à une formation (idempotente). */
export async function enrollInCourse(courseId: string, courseSlug: string): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Connectez-vous pour suivre cette formation." };
  const { error } = await supabase.from("enrollments").upsert(
    { user_id: userId, course_id: courseId }, { onConflict: "user_id,course_id", ignoreDuplicates: true });
  if (error) return { error: "Inscription impossible. Réessayez." };
  revalidatePath(`/formations/${courseSlug}`);
  revalidatePath("/dashboard");
  return { message: "Vous suivez cette formation." };
}

/** Marque une leçon comme terminée (ou annule) et inscrit l'étudiant si besoin. */
export async function setLessonDone(lessonId: string, courseId: string, courseSlug: string, done: boolean): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Connectez-vous pour enregistrer votre progression." };

  await supabase.from("enrollments").upsert(
    { user_id: userId, course_id: courseId }, { onConflict: "user_id,course_id", ignoreDuplicates: true });

  const { error } = done
    ? await supabase.from("lesson_progress").upsert(
        { user_id: userId, lesson_id: lessonId }, { onConflict: "user_id,lesson_id", ignoreDuplicates: true })
    : await supabase.from("lesson_progress").delete().eq("user_id", userId).eq("lesson_id", lessonId);
  if (error) return { error: "Progression non enregistrée. Réessayez." };

  revalidatePath(`/formations/${courseSlug}`, "layout");
  revalidatePath("/dashboard");
  return { message: done ? "Leçon terminée." : "Leçon rouverte." };
}

const submissionSchema = z.object({
  content: z.string().trim().max(5000, "Texte limité à 5000 caractères.").optional(),
  link_url: z.string().trim().optional(),
});

function parseSubmission(formData: FormData) {
  const parsed = submissionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message } as const;
  const link = parsed.data.link_url ? safeUrl(parsed.data.link_url) : null;
  if (parsed.data.link_url && !link) return { error: "Le lien doit commencer par https://" } as const;
  if (!parsed.data.content && !link) return { error: "Ajoutez un lien ou un texte à votre soumission." } as const;
  return { content: parsed.data.content || null, link } as const;
}

export async function submitExercise(exerciseId: string, courseSlug: string, _: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Connectez-vous pour soumettre votre travail." };
  const s = parseSubmission(formData);
  if ("error" in s) return { error: s.error };
  const { error } = await supabase.from("submissions").insert({
    user_id: userId, exercise_id: exerciseId, content: s.content, link_url: s.link,
  });
  if (error) return { error: "Soumission impossible. Réessayez." };
  revalidatePath(`/formations/${courseSlug}`, "layout");
  revalidatePath("/dashboard");
  return { message: "Travail soumis. Un formateur le corrigera." };
}

export async function submitChallenge(challengeId: string, challengeSlug: string, _: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Connectez-vous pour participer." };
  const s = parseSubmission(formData);
  if ("error" in s) return { error: s.error };
  const { data: ch } = await supabase.from("challenges").select("status, starts_at, ends_at").eq("id", challengeId).maybeSingle();
  const now = Date.now();
  if (!ch || ch.status !== "published"
      || (ch.starts_at && new Date(ch.starts_at).getTime() > now)
      || (ch.ends_at && new Date(ch.ends_at).getTime() < now)) {
    return { error: "Ce challenge n'accepte pas de soumission actuellement." };
  }
  const { error } = await supabase.from("submissions").insert({
    user_id: userId, challenge_id: challengeId, content: s.content, link_url: s.link,
  });
  if (error) return { error: "Soumission impossible. Réessayez." };
  revalidatePath(`/challenges/${challengeSlug}`);
  revalidatePath("/dashboard");
  return { message: "Participation enregistrée." };
}

export interface QuizState extends FormState { score?: number; correct?: number; total?: number }

/** Correction du quiz côté base de données (les bonnes réponses ne sont jamais envoyées au navigateur). */
export async function submitQuiz(exerciseId: string, courseSlug: string, _: QuizState, formData: FormData): Promise<QuizState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Connectez-vous pour valider le quiz." };
  const choices: Record<string, number> = {};
  for (const [k, v] of formData.entries()) {
    if (k.startsWith("q") && /^\d+$/.test(String(v))) choices[k] = Number(v);
  }
  const { data, error } = await supabase.rpc("grade_quiz", { p_exercise_id: exerciseId, p_choices: choices });
  if (error || !data) return { error: "Correction impossible. Réessayez." };
  revalidatePath(`/formations/${courseSlug}`, "layout");
  revalidatePath("/dashboard");
  return { score: data.score, correct: data.correct, total: data.total, message: "Quiz corrigé." };
}
