import type { Metadata } from "next";
import { requireProfile } from "@/services/auth";
import { getMyCourseProgress, getMySubmissions } from "@/services/learning";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { formatDate } from "@/utils/format";

export const metadata: Metadata = { title: "Mon profil" };
const ROLE: Record<string, string> = { student: "Étudiant", trainer: "Formateur", admin: "Administrateur" };

export default async function ProfilePage() {
  const profile = await requireProfile(undefined, "/profil");
  const [progress, subs] = await Promise.all([getMyCourseProgress(profile.id), getMySubmissions(profile.id, 50)]);
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Mon profil</h1>
      <p className="mt-2 text-sm text-muted">Rôle : {ROLE[profile.role]} (attribué par un administrateur).</p>
      <div className="mt-6 rounded-lg border border-line bg-panel p-6"><ProfileForm profile={profile} /></div>

      <h2 className="mt-10 text-xl font-semibold">Mes résultats</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {subs.map((s) => (
          <li key={s.id} className="rounded-md border border-line bg-panel px-4 py-3">
            <span className="font-medium">{s.exercises?.title ?? s.challenges?.title}</span>
            <span className="text-muted"> · {formatDate(s.created_at)} · {s.status === "reviewed" ? (s.score !== null ? `note ${s.score}` : "corrigée") : "en attente"}</span>
          </li>
        ))}
        {subs.length === 0 && <li className="text-muted">Aucun résultat pour l&apos;instant.</li>}
      </ul>
      <h2 className="mt-10 text-xl font-semibold">Historique de progression</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {progress.map((p) => <li key={p.course.id} className="rounded-md border border-line bg-panel px-4 py-3">{p.course.title} : {p.done} / {p.total} leçons ({p.percent} %)</li>)}
        {progress.length === 0 && <li className="text-muted">Aucune formation suivie.</li>}
      </ul>
    </div>
  );
}
