import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Profile, UserRole } from "@/types/db";

/** Utilisateur connecté (validé par Supabase) ou null. */
export async function getUser() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Profil (avec rôle lu en base, jamais envoyé par le navigateur). */
export async function getProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const columns = "id, full_name, avatar_url, bio, filiere, promotion, role";
  const read = () => supabase.from("profiles").select(columns).eq("id", user.id).maybeSingle();

  let { data, error } = await read();
  if (error) console.error("[iotlab] Lecture du profil impossible :", error.code, error.message);

  // Compte créé avant les migrations (ou trigger absent) : on crée le profil manquant.
  // La politique RLS "profiles: création de son profil" impose id = utilisateur et role = student.
  if (!data && !error) {
    const created = await supabase.from("profiles").insert({
      id: user.id,
      full_name: (user.user_metadata?.full_name as string | undefined) ?? "",
      role: "student",
    });
    if (created.error) console.error("[iotlab] Création du profil impossible :", created.error.code, created.error.message);
    else ({ data, error } = await read());
  }
  return (data as Profile | null) ?? null;
}

/** Exige une connexion (et éventuellement un rôle) : sinon redirige. */
export async function requireProfile(allowed?: UserRole[], from = "/dashboard"): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) {
    // Session valide mais profil introuvable : on l'indique au lieu de boucler sur la connexion.
    if (await getUser()) redirect("/connexion?erreur=profil");
    redirect(`/connexion?redirection=${encodeURIComponent(from)}`);
  }
  if (allowed && !allowed.includes(profile.role)) redirect("/dashboard?erreur=acces");
  return profile;
}

export function homeForRole(role: UserRole): string {
  return role === "admin" ? "/admin" : role === "trainer" ? "/formateur" : "/dashboard";
}
