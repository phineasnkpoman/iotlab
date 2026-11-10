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

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {sp.erreur === "acces" && <div className="mb-6"><FormMessage error="Vous n'avez pas accès à cet espace." /></div>}
      <h1 className="text-3xl font-semibold tracking-tight">Bonjour {profile.full_name?.split(" ")[0] || ""}</h1>
      <p className="mt-2 text-muted">Voici où vous en êtes.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-panel p-5 sm:col-span-1">
          <p className="text-sm text-muted">Progression générale</p>
          <p className="mt-2 text-3xl font-semibold">{percent} %</p>
          <div className="mt-3"><ProgressBar percent={percent} label="Progression générale" /></div>
          <p className="mt-2 text-xs text-muted">{doneLessons} leçon{doneLessons > 1 ? "s" : ""} terminée{doneLessons > 1 ? "s" : ""} sur {totalLessons}</p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-5"><p className="text-sm text-muted">Exercices réalisés</p><p className="mt-2 text-3xl font-semibold">{exerciseSubs.length}</p></div>
        <div className="rounded-lg border border-line bg-panel p-5"><p className="text-sm text-muted">Challenges</p><p className="mt-2 text-3xl font-semibold">{new Set(challengeSubs.map((s) => s.challenge_id)).size}</p></div>
      </div>

      <h2 className="mt-12 text-xl font-semibold">Mes formations</h2>
      <div className="mt-4 space-y-3">
        {progress.map((p) => (
          <div key={p.course.id} className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-panel p-4">
            <div className="min-w-0 flex-1">
              <Link href={`/formations/${p.course.slug}`} className="font-medium hover:text-white">{p.course.title}</Link>
              <div className="mt-2 max-w-sm"><ProgressBar percent={p.percent} label={`Progression : ${p.course.title}`} /></div>
              <p className="mt-1 text-xs text-muted">{p.done} / {p.total} leçons ({p.percent} %)</p>
            </div>
            {p.nextLessonSlug && <LinkButton href={`/formations/${p.course.slug}/lecons/${p.nextLessonSlug}`} variant="secondary">Reprendre</LinkButton>}
          </div>
        ))}
        {progress.length === 0 && <EmptyState title="Vous ne suivez encore aucune formation"><LinkButton href="/formations">Explorer les formations</LinkButton></EmptyState>}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold">Dernières activités</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {recent.map((r, i) => <li key={i} className="rounded-md border border-line bg-panel px-4 py-3">Leçon terminée : <span className="font-medium">{r.lessons?.title}</span> <span className="text-muted">· {formatDate(r.completed_at)}</span></li>)}
            {submissions.slice(0, 5).map((s) => (
              <li key={s.id} className="rounded-md border border-line bg-panel px-4 py-3">
                Soumission : <span className="font-medium">{s.exercises?.title ?? s.challenges?.title}</span>
                <span className="text-muted"> · {formatDate(s.created_at)} · {s.status === "reviewed" ? (s.score !== null ? `note ${s.score}` : "corrigée") : "en attente"}</span>
                {s.feedback && <p className="mt-1 text-muted">{s.feedback}</p>}
              </li>
            ))}
            {recent.length === 0 && submissions.length === 0 && <EmptyState title="Aucune activité pour l'instant" />}
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Formations recommandées</h2>
          <div className="mt-4 grid gap-4">{recommended.map((c) => <CourseCard key={c.id} course={c} />)}</div>
          {recommended.length === 0 && <p className="mt-4 text-sm text-muted">Vous suivez déjà toutes les formations disponibles.</p>}
        </section>
      </div>
    </div>
  );
}
