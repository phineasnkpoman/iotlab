"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { safeNext } from "@/utils/format";

export interface FormState { error?: string; message?: string }

const NOT_CONFIGURED = "Supabase n'est pas configuré : renseignez .env.local (voir README).";
const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const passwordSchema = z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères.");

export async function signUp(_: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
  const parsed = z.object({
    full_name: z.string().trim().min(2, "Indiquez votre nom complet."),
    email: z.string().trim().email("Adresse email invalide."),
    password: passwordSchema,
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${siteUrl()}/auth/callback?next=/dashboard`,
    },
  });
  if (error) return { error: "Inscription impossible : " + error.message };
  return { message: "Compte créé. Ouvrez l'email de confirmation que nous venons de vous envoyer, puis connectez-vous." };
}

export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
  const parsed = z.object({
    email: z.string().trim().email("Adresse email invalide."),
    password: z.string().min(1, "Saisissez votre mot de passe."),
    next: z.string().optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) {
    return { error: error.message.toLowerCase().includes("confirm")
      ? "Adresse email non confirmée : ouvrez le message de confirmation."
      : "Email ou mot de passe incorrect." };
  }
  revalidatePath("/", "layout");
  // Redirection selon le rôle lu en base.
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const fallback = profile?.role === "admin" ? "/admin" : profile?.role === "trainer" ? "/formateur" : "/dashboard";
  redirect(parsed.data.next ? safeNext(parsed.data.next, fallback) : fallback);
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function forgotPassword(_: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
  const parsed = z.string().trim().email("Adresse email invalide.").safeParse(formData.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${siteUrl()}/auth/callback?next=/reinitialiser-mot-de-passe`,
  });
  // Même réponse que l'adresse existe ou non (évite de révéler les comptes).
  return { message: "Si cette adresse correspond à un compte, un lien de réinitialisation vient d'être envoyé." };
}

export async function resetPassword(_: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
  const pw = passwordSchema.safeParse(formData.get("password"));
  if (!pw.success) return { error: pw.error.issues[0].message };
  if (pw.data !== formData.get("confirm")) return { error: "Les deux mots de passe ne correspondent pas." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: pw.data });
  if (error) return { error: "Lien expiré ou invalide : redemandez une réinitialisation." };
  redirect("/dashboard");
}

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.object({
    full_name: z.string().trim().min(2, "Le nom est trop court.").max(80),
    filiere: z.string().trim().max(80).optional(),
    promotion: z.string().trim().max(40).optional(),
    bio: z.string().trim().max(400, "La présentation est limitée à 400 caractères.").optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Session expirée : reconnectez-vous." };

  // On n'envoie JAMAIS de rôle ici ; la base le refuserait de toute façon (trigger + RLS).
  const { error } = await supabase.from("profiles").update({
    full_name: parsed.data.full_name,
    filiere: parsed.data.filiere || null,
    promotion: parsed.data.promotion || null,
    bio: parsed.data.bio || null,
  }).eq("id", user.id);
  if (error) return { error: "Enregistrement impossible. Réessayez." };
  revalidatePath("/profil");
  revalidatePath("/dashboard");
  return { message: "Profil enregistré." };
}
