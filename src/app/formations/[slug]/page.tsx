import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, Clock, User, ListChecks } from "lucide-react";
import { getCourse, listLessons } from "@/services/catalog";
import { getUser } from "@/services/auth";
import { createClient } from "@/lib/supabase/server";
import { LevelBadge, ProgressBar } from "@/components/ui/Badge";
import { EnrollButton } from "@/components/courses/LessonActions";
import { LinkButton } from "@/components/ui/Button";
import { formatDuration } from "@/utils/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const course = await getCourse((await params).slug);
  return { title: course?.title ?? "Formation" };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course || course.status !== "published") notFound();

  const [lessons, user] = await Promise.all([listLessons(course.id), getUser()]);
  let doneIds = new Set<string>();
  let enrolled = false;
  if (user) {
    const supabase = await createClient();
    const [{ data: prog }, { data: enr }] = await Promise.all([
      supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).in("lesson_id", lessons.map((l) => l.id)),
      supabase.from("enrollments").select("id").eq("user_id", user.id).eq("course_id", course.id).maybeSingle(),
    ]);
    doneIds = new Set((prog ?? []).map((p) => p.lesson_id));
    enrolled = Boolean(enr);
  }
  const percent = lessons.length ? Math.round((doneIds.size / lessons.length) * 100) : 0;
  const nextLesson = lessons.find((l) => !doneIds.has(l.id)) ?? lessons[0];

  const modules = new Map<number, { title: string; items: typeof lessons }>();
  for (const l of lessons) {
    const m = modules.get(l.module_position) ?? { title: l.module_title, items: [] };
    m.items.push(l);
    modules.set(l.module_position, m);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <LevelBadge level={course.level} />
            {course.categories?.name && <span className="text-sm text-muted">{course.categories.name}</span>}
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{course.title}</h1>
          <p className="mt-3 max-w-2xl text-muted">{course.description}</p>

          <h2 className="mt-10 text-xl font-semibold">Programme</h2>
          <div className="mt-4 space-y-6">
            {[...modules.entries()].sort(([a], [b]) => a - b).map(([pos, m]) => (
              <section key={pos}>
                <h3 className="text-sm font-medium text-copper">Module {pos} : {m.title}</h3>
                <ul className="mt-2 divide-y divide-line rounded-lg border border-line bg-panel">
                  {m.items.map((l) => (
                    <li key={l.id}>
                      <Link href={`/formations/${course.slug}/lecons/${l.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-panel2">
                        {doneIds.has(l.id) ? <CheckCircle2 size={18} className="shrink-0 text-ok" /> : <Circle size={18} className="shrink-0 text-muted" />}
                        <span className="flex-1 text-sm">{l.title}</span>
                        <span className="text-xs text-muted">{l.duration_minutes} min</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          {lessons.length === 0 && <p className="mt-4 text-sm text-muted">Les leçons de cette formation seront bientôt disponibles.</p>}
        </div>

        <aside className="h-fit space-y-5 rounded-lg border border-line bg-panel p-5 lg:sticky lg:top-24">
          <div className="space-y-2 text-sm text-muted">
            <p className="flex items-center gap-2"><Clock size={16} />{formatDuration(course.duration_minutes)} · {lessons.length} leçons</p>
            <p className="flex items-center gap-2"><User size={16} />{course.instructor?.full_name || "Équipe IoT LAB"}</p>
          </div>
          {user && enrolled && (<div className="space-y-2"><ProgressBar percent={percent} label="Progression dans la formation" /><p className="text-xs text-muted">{doneIds.size} / {lessons.length} leçons terminées ({percent} %)</p></div>)}
          {user ? (
            <div className="space-y-3">
              {nextLesson && <LinkButton href={`/formations/${course.slug}/lecons/${nextLesson.slug}`} className="w-full">{doneIds.size > 0 ? "Reprendre" : "Commencer"}</LinkButton>}
              <EnrollButton courseId={course.id} courseSlug={course.slug} enrolled={enrolled} />
            </div>
          ) : (
            <div className="space-y-2">
              <LinkButton href={`/inscription`} className="w-full">Créer un compte pour suivre</LinkButton>
              <LinkButton href={`/connexion?redirection=/formations/${course.slug}`} variant="secondary" className="w-full">Se connecter</LinkButton>
            </div>
          )}
          <div>
            <p className="flex items-center gap-2 text-sm font-medium"><ListChecks size={16} />Compétences visées</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">{course.skills.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
          {course.prerequisites && <div><p className="text-sm font-medium">Prérequis</p><p className="mt-1 text-sm text-muted">{course.prerequisites}</p></div>}
        </aside>
      </div>
    </div>
  );
}
