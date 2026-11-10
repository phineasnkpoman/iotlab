import type { CourseLevel } from "@/types/db";

export const LEVEL_LABEL: Record<CourseLevel, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(iso));
}

/** Autorise uniquement les adresses http(s) pour les liens saisis par les utilisateurs. */
export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Redirection interne uniquement (évite les "open redirect"). */
export function safeNext(value: string | null | undefined, fallback = "/dashboard"): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

/** Position d'un challenge par rapport à ses dates (calculée hors du rendu React). */
export function challengeWindow(startsAt: string | null, endsAt: string | null) {
  const now = Date.now();
  return {
    notStarted: Boolean(startsAt && new Date(startsAt).getTime() > now),
    ended: Boolean(endsAt && new Date(endsAt).getTime() < now),
  };
}
