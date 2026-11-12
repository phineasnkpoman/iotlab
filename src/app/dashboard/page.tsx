import type { Metadata } from "next";
import Link from "next/link";
import { requireProfile } from "@/services/auth";
import { getMyCourseProgress, getMySubmissions, getRecentCompletions } from "@/services/learning";
import { listCourses } from "@/services/catalog";
import { CourseCard } from "@/components/courses/CourseCard";
import { ProgressBar } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { formatDate } from "@/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const sp = await searchParams;
  const profile = await requireProfile(undefined, "/dashboard");
  const [progress, submissions, recent, all] = await Promise.all([
    getMyCourseProgress(profile.id), getMySubmissions(profile.id), getRecentCompletions(profile.id), listCourses(),
  ]);
  const totalLessons = progress.reduce((n, p) => n + p.total, 0);
  const doneLessons = progress.reduce((n, p) => n + p.done, 0);
  const percent = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;
  const exerciseSubs = submissions.filter((s) => s.exercise_id);
  const challengeSubs = submissions.filter((s) => s.challenge_id);
  const followed = new Set(progress.map((p) => p.course.id));
  const recommended = all.filter((c) => !followed.has(c.id)).slice(0, 3);

  const stat = "glass rounded-[24px] p-5";
  return (
    <>
      <PageHeader title={`Bonjour ${profile.full_name?.split(" ")[0] || ""}`.trim()} description="Voici où vous en êtes." />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {sp.erreur === "acces" && <div className="mb-6"><FormMessage error="Vous n'avez pas accès à cet espace." /></div>}

        <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div className="glass relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,rgb(var(--primary-rgb)/0.16),rgb(255_255_255/0.02))] p-6">
            <p className="text-sm text-muted">Progression générale</p>
            <p className="tabular mt-2 text-4xl font-semibold tracking-[-0.03em]">{percent}<span className="ml-1 text-xl text-muted">%</span></p>
            <div className="mt-4"><ProgressBar percent={percent} label="Progression générale" /></div>
            <p className="tabular mt-2 text-xs text-muted">{doneLessons} leçon{doneLessons > 1 ? "s" : ""} terminée{doneLessons > 1 ? "s" : ""} sur {totalLessons}</p>
          </div>
          <div className={stat}><p className="text-sm text-muted">Exercices réalisés</p><p className="tabular mt-2 text-4xl font-semibold tracking-[-0.03em]">{exerciseSubs.length}</p></div>
          <div className={stat}><p className="text-sm text-muted">Challenges</p><p className="tabular mt-2 text-4xl font-semibold tracking-[-0.03em]">{new Set(challengeSubs.map((s) => s.challenge_id)).size}</p></div>
        </div>

        <h2 className="mt-14 text-xl font-semibold tracking-[-0.015em]">Mes formations</h2>
        <div className="mt-5 space-y-3">
          {progress.map((p) => (
            <div key={p.course.id} className="flex flex-wrap items-center gap-4 glass rounded-[24px] p-5 transition-colors duration-200 hover:border-line-strong">
              <div className="min-w-0 flex-1">
                <Link href={`/formations/${p.course.slug}`} className="font-medium transition-colors hover:text-copper">{p.course.title}</Link>
                <div className="mt-3 max-w-md"><ProgressBar percent={p.percent} label={`Progression : ${p.course.title}`} /></div>
                <p className="tabular mt-1.5 text-xs text-muted">{p.done} / {p.total} leçons ({p.percent} %)</p>
              </div>
              {p.nextLessonSlug && <LinkButton href={`/formations/${p.course.slug}/lecons/${p.nextLessonSlug}`} variant="secondary">Reprendre</LinkButton>}
            </div>
          ))}
          {progress.length === 0 && <EmptyState title="Vous ne suivez encore aucune formation"><LinkButton href="/formations">Explorer les formations</LinkButton></EmptyState>}
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="text-xl font-semibold tracking-[-0.015em]">Dernières activités</h2>
            {(recent.length > 0 || submissions.length > 0) && <ul className="mt-5 glass divide-y divide-tint/[0.07] overflow-hidden rounded-[24px] text-sm">
              {recent.map((r, i) => (
                <li key={i} className="flex gap-3 px-4 py-3.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ok" aria-hidden="true" />
                  <p>Leçon terminée : <span className="font-medium">{r.lessons?.title}</span> <span className="text-muted">· {formatDate(r.completed_at)}</span></p>
                </li>
              ))}
              {submissions.slice(0, 5).map((s) => (
                <li key={s.id} className="flex gap-3 px-4 py-3.5">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${s.status === "reviewed" ? "bg-copper" : "bg-line-strong"}`} aria-hidden="true" />
                  <div>
                    <p>Soumission : <span className="font-medium">{s.exercises?.title ?? s.challenges?.title}</span>
                      <span className="text-muted"> · {formatDate(s.created_at)} · {s.status === "reviewed" ? (s.score !== null ? `note ${s.score}` : "corrigée") : "en attente"}</span></p>
                    {s.feedback && <p className="mt-1 text-muted">{s.feedback}</p>}
                  </div>
                </li>
              ))}
            </ul>}
            {recent.length === 0 && submissions.length === 0 && <div className="mt-5"><EmptyState title="Aucune activité pour l'instant" /></div>}
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-[-0.015em]">Formations recommandées</h2>
            <div className="mt-5 grid gap-4">{recommended.map((c) => <CourseCard key={c.id} course={c} />)}</div>
            {recommended.length === 0 && <p className="mt-4 text-sm text-muted">Vous suivez déjà toutes les formations disponibles.</p>}
          </section>
        </div>
      </div>
    </>
  );
}
