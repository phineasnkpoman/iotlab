"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "./auth";

/** Rôle lu en base côté serveur : on ne fait jamais confiance au navigateur. */
async function staffContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, userId: user.id, role: data?.role as "student" | "trainer" | "admin" | undefined };
}

export async function setUserRole(userId: string, role: string): Promise<void> {
  const ctx = await staffContext();
  if (!ctx || ctx.role !== "admin") return;
  const parsed = z.enum(["student", "trainer", "admin"]).safeParse(role);
  if (!parsed.success) return;
  if (userId === ctx.userId && parsed.data !== "admin") return; // évite de se retirer ses propres droits
  await ctx.supabase.from("profiles").update({ role: parsed.data }).eq("id", userId);
  revalidatePath("/admin");
}

export async function setCourseStatus(courseId: string, status: string): Promise<void> {
  const ctx = await staffContext();
  if (!ctx || !ctx.role || ctx.role === "student") return;
  const parsed = z.enum(["draft", "published", "archived"]).safeParse(status);
  if (!parsed.success) return;
  // RLS limite la mise à jour aux formations dont l'utilisateur est responsable (ou à l'admin).
  await ctx.supabase.from("courses").update({ status: parsed.data }).eq("id", courseId);
  revalidatePath("/admin");
  revalidatePath("/formateur");
  revalidatePath("/formations");
}

export async function setChallengeStatus(challengeId: string, status: string): Promise<void> {
  const ctx = await staffContext();
  if (!ctx || !ctx.role || ctx.role === "student") return;
  const parsed = z.enum(["draft", "published", "closed"]).safeParse(status);
  if (!parsed.success) return;
  await ctx.supabase.from("challenges").update({ status: parsed.data }).eq("id", challengeId);
  revalidatePath("/admin");
  revalidatePath("/challenges");
}

export async function setToolPublished(toolId: string, published: boolean): Promise<void> {
  const ctx = await staffContext();
  if (!ctx || ctx.role !== "admin") return;
  await ctx.supabase.from("tools").update({ published }).eq("id", toolId);
  revalidatePath("/admin");
  revalidatePath("/outils");
}

export async function reviewSubmission(submissionId: string, _: FormState, formData: FormData): Promise<FormState> {
  const ctx = await staffContext();
  if (!ctx || !ctx.role || ctx.role === "student") return { error: "Action réservée aux formateurs." };
  const parsed = z.object({
    score: z.string().trim().optional(),
    feedback: z.string().trim().max(2000, "Commentaire limité à 2000 caractères.").optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const score = parsed.data.score ? Number(parsed.data.score) : null;
  if (score !== null && (Number.isNaN(score) || score < 0 || score > 100)) return { error: "La note doit être comprise entre 0 et 100." };

  const { data, error } = await ctx.supabase.from("submissions").update({
    score, feedback: parsed.data.feedback || null, status: "reviewed",
    reviewed_by: ctx.userId, reviewed_at: new Date().toISOString(),
  }).eq("id", submissionId).select("id");
  if (error || !data?.length) return { error: "Correction refusée : cette soumission ne relève pas de vos formations." };
  revalidatePath("/formateur");
  revalidatePath("/admin");
  return { message: "Correction enregistrée." };
}
