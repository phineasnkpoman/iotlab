import { createClient } from "@/lib/supabase/server";

/*
 * Lecture des soumissions côté formateurs et administrateurs.
 *
 * Correctif important : la table « submissions » a DEUX clés étrangères vers « profiles »
 * (user_id = l'auteur, reviewed_by = le correcteur). Une jointure « profiles(full_name) »
 * est donc ambiguë : Supabase la refuse (erreur PGRST201) et l'ancienne page recevait
 * une liste vide sans le signaler. On nomme ici explicitement la relation de l'auteur.
 * Les règles RLS limitent toujours le résultat : l'admin voit tout, un formateur ne voit
 * que les soumissions de ses formations et de ses challenges.
 */

export type ReviewFilter = "a-corriger" | "corrigees" | "toutes";

export const REVIEW_FILTERS: { value: ReviewFilter; label: string }[] = [
  { value: "a-corriger", label: "À corriger" },
  { value: "corrigees", label: "Corrigées" },
  { value: "toutes", label: "Toutes" },
];

export const parseReviewFilter = (v: string | string[] | undefined): ReviewFilter =>
  v === "corrigees" || v === "toutes" ? v : "a-corriger";

const SELECT = [
  "id, content, link_url, file_path, status, score, feedback, created_at, reviewed_at",
  "author:profiles!submissions_user_id_fkey(full_name)",
  "exercises(title, courses(slug, title))",
  "challenges(title, slug)",
].join(", ");

interface Raw {
  id: string; content: string | null; link_url: string | null; file_path: string | null;
  status: "submitted" | "reviewed"; score: number | null; feedback: string | null;
  created_at: string; reviewed_at: string | null;
  author: { full_name: string | null } | null;
  exercises: { title: string; courses: { slug: string; title: string } | null } | null;
  challenges: { title: string; slug: string } | null;
}

export interface StaffSubmission extends Raw {
  /** Lien de téléchargement temporaire (1 h) vers le fichier joint. */
  fileUrl: string | null;
  fileName: string | null;
}

/** Nom lisible d'un fichier stocké sous <uid>/<horodatage>-<nom>. */
export const displayFileName = (path: string) => path.split("/").pop()?.replace(/^[a-z0-9]+-/, "") ?? path;

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/** Liens de téléchargement temporaires (1 h) ; les règles du bucket décident qui peut les obtenir. */
export async function signFiles(supabase: SupabaseServer, paths: (string | null)[]) {
  const list = paths.filter((p): p is string => Boolean(p));
  const urls = new Map<string, string>();
  if (!list.length) return urls;
  const { data } = await supabase.storage.from("submissions").createSignedUrls(list, 3600, { download: true });
  for (const s of data ?? []) if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl);
  return urls;
}

/** Une soumission telle que l'apprenant la voit : ses pièces jointes et le retour du formateur. */
export interface LearnerSubmission {
  id: string; status: "submitted" | "reviewed"; score: number | null; feedback: string | null;
  created_at: string; reviewed_at: string | null; link_url: string | null;
  fileName: string | null; fileUrl: string | null;
}

const LEARNER_SELECT = "id, exercise_id, challenge_id, status, score, feedback, created_at, reviewed_at, link_url, file_path";

/** Soumissions de l'apprenant connecté pour un challenge ou une liste d'exercices. */
export async function listMySubmissions(userId: string, target: { challengeId: string } | { exerciseIds: string[] }) {
  const supabase = await createClient();
  let q = supabase.from("submissions").select(LEARNER_SELECT).eq("user_id", userId).order("created_at", { ascending: false });
  if ("challengeId" in target) q = q.eq("challenge_id", target.challengeId);
  else if (target.exerciseIds.length) q = q.in("exercise_id", target.exerciseIds);
  else return [];
  const { data } = await q;
  const rows = (data ?? []) as (Omit<LearnerSubmission, "fileName" | "fileUrl"> & { exercise_id: string | null; file_path: string | null })[];
  const urls = await signFiles(supabase, rows.map((r) => r.file_path));
  return rows.map(({ file_path, ...r }) => ({
    ...r,
    fileName: file_path ? displayFileName(file_path) : null,
    fileUrl: file_path ? urls.get(file_path) ?? null : null,
  }));
}

export async function listSubmissionsForReview(filter: ReviewFilter, limit = 60) {
  const supabase = await createClient();
  let query = supabase.from("submissions").select(SELECT).order("created_at", { ascending: false }).limit(limit);
  if (filter === "a-corriger") query = query.eq("status", "submitted");
  if (filter === "corrigees") query = query.eq("status", "reviewed");

  const [{ data, error }, { count }] = await Promise.all([
    query,
    supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "submitted"),
  ]);

  if (error) {
    console.error("[soumissions] lecture impossible :", error.code, error.message);
    return { rows: [] as StaffSubmission[], pending: count ?? 0, error: `${error.message}${error.code ? ` (${error.code})` : ""}` };
  }

  const rows = (data ?? []) as unknown as Raw[];
  const urls = await signFiles(supabase, rows.map((r) => r.file_path));

  return {
    rows: rows.map((r) => ({
      ...r,
      fileUrl: r.file_path ? urls.get(r.file_path) ?? null : null,
      fileName: r.file_path ? displayFileName(r.file_path) : null,
    })),
    pending: count ?? 0,
    error: null,
  };
}
