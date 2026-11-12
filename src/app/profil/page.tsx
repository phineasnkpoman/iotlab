import type { Metadata } from "next";
import { requireProfile } from "@/services/auth";
import { getMyCourseProgress, getMySubmissions } from "@/services/learning";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { formatDate } from "@/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProgressBar } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Mon profil" };
const ROLE: Record<string, string> = { student: "Étudiant", trainer: "Formateur", admin: "Administrateur" };

export default async function ProfilePage() {
  const profile = await requireProfile(undefined, "/profil");
  const [progress, subs] = await Promise.all([getMyCourseProgress(profile.id), getMySubmissions(profile.id, 50)]);
  const status = (s: { status: string; score: number | null }) => s.status === "reviewed" ? (s.score !== null ? `note ${s.score}` : "corrigée") : "en attente";
  return (
    <>
      <PageHeader narrow title="Mon profil" description={`Rôle : ${ROLE[profile.role]} (attribué par un administrateur).`} />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="bezel"><div className="bezel-core glass p-6 sm:p-7"><ProfileForm profile={profile} /></div></div>

        <h2 className="mt-14 text-xl font-semibold tracking-[-0.015em]">Mes résultats</h2>
        <ul className="mt-5 glass divide-y divide-tint/[0.07] overflow-hidden rounded-[24px] text-sm">
          {subs.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3.5">
              <span className="font-medium">{s.exercises?.title ?? s.challenges?.title}</span>
              <span className="tabular text-muted">{formatDate(s.created_at)} · {status(s)}</span>
            </li>
          ))}
          {subs.length === 0 && <li className="px-4 py-3.5 text-muted">Aucun résultat pour l&apos;instant.</li>}
        </ul>
        <h2 className="mt-14 text-xl font-semibold tracking-[-0.015em]">Historique de progression</h2>
        <ul className="mt-5 space-y-3 text-sm">
          {progress.map((p) => (
            <li key={p.course.id} className="glass rounded-[24px] px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2"><span className="font-medium">{p.course.title}</span><span className="tabular text-xs text-muted">{p.done} / {p.total} leçons ({p.percent} %)</span></div>
              <div className="mt-3"><ProgressBar percent={p.percent} label={`Progression : ${p.course.title}`} /></div>
            </li>
          ))}
          {progress.length === 0 && <li className="glass rounded-[24px] px-5 py-3.5 text-muted">Aucune formation suivie.</li>}
        </ul>
      </div>
    </>
  );
}
