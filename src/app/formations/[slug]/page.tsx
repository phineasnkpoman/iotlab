import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronRight, Circle, Clock, User, ListChecks, BookOpen } from "lucide-react";
import { getCourse, listLessons } from "@/services/catalog";
import { getUser } from "@/services/auth";
import { createClient } from "@/lib/supabase/server";
import { LevelBadge, ProgressBar } from "@/components/ui/Badge";
import { EnrollButton } from "@/components/courses/LessonActions";
import { LinkButton } from "@/components/ui/Button";
import { formatDuration } from "@/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";

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
    <>
      <PageHeader back={{ href: "/formations", label: "Toutes les formations" }} title={course.title} description={course.description}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted">
          <LevelBadge level={course.level} />
          {course.categories?.name && <span>{course.categories.name}</span>}
          <span className="tabular inline-flex items-center gap-1.5"><Clock size={15} aria-hidden="true" />{formatDuration(course.duration_minutes)}</span>
          <span className="tabular inline-flex items-center gap-1.5"><BookOpen size={15} aria-hidden="true" />{lessons.length} leçon{lessons.length > 1 ? "s" : ""}</span>
        </div>
      </PageHeader>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.015em]">Programme</h2>
          <div className="mt-5 space-y-7">
            {[...modules.entries()].sort(([a], [b]) => a - b).map(([pos, m]) => (
              <section key={pos}>
                <h3 className="flex items-baseline gap-2 text-sm font-medium">
                  <span className="tabular font-mono text-xs text-copper">Module {pos}</span>
                  <span>{m.title}</span>
                </h3>
                <ul className="mt-3 glass divide-y divide-tint/[0.07] overflow-hidden rounded-[24px]">
                  {m.items.map((l) => (
                    <li key={l.id}>
                      <Link href={`/formations/${course.slug}/lecons/${l.slug}`} className="group flex items-center gap-3 px-4 py-3.5 transition-colors duration-200 hover:bg-tint/[0.05]">
                        {doneIds.has(l.id) ? <CheckCircle2 size={18} className="shrink-0 text-ok" aria-label="Terminée" /> : <Circle size={18} className="shrink-0 text-line-strong" aria-hidden="true" />}
                        <span className="flex-1 text-sm">{l.title}</span>
                        <span className="tabular text-xs text-muted">{l.duration_minutes} min</span>
                        <ChevronRight size={16} className="text-muted transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          {lessons.length === 0 && <p className="mt-4 text-sm text-muted">Les leçons de cette formation seront bientôt disponibles.</p>}
        </div>

        <aside className="bezel h-fit lg:sticky lg:top-24">
          <div className="bezel-core glass space-y-6 p-5">
            <p className="flex items-center gap-2 text-sm text-muted"><User size={16} aria-hidden="true" />{course.instructor?.full_name || "Équipe IoT LAB"}</p>
            {user && enrolled && (<div className="space-y-2"><ProgressBar percent={percent} label="Progression dans la formation" /><p className="tabular text-xs text-muted">{doneIds.size} / {lessons.length} leçons terminées ({percent} %)</p></div>)}
            {user ? (
              <div className="space-y-3">
                {nextLesson && <LinkButton href={`/formations/${course.slug}/lecons/${nextLesson.slug}`} className="w-full py-3">{doneIds.size > 0 ? "Reprendre" : "Commencer"}</LinkButton>}
                <EnrollButton courseId={course.id} courseSlug={course.slug} enrolled={enrolled} />
              </div>
            ) : (
              <div className="space-y-2">
                <LinkButton href={`/inscription`} className="w-full py-3">Créer un compte pour suivre</LinkButton>
                <LinkButton href={`/connexion?redirection=/formations/${course.slug}`} variant="secondary" className="w-full">Se connecter</LinkButton>
              </div>
            )}
            <div className="border-t border-tint/[0.08] pt-5">
              <p className="flex items-center gap-2 text-sm font-medium"><ListChecks size={16} className="text-copper" aria-hidden="true" />Compétences visées</p>
              <ul className="mt-3 space-y-2 text-sm text-muted">{course.skills.map((s) => <li key={s} className="flex gap-2.5"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-copper" aria-hidden="true" />{s}</li>)}</ul>
            </div>
            {course.prerequisites && <div className="border-t border-tint/[0.08] pt-5"><p className="text-sm font-medium">Prérequis</p><p className="mt-1.5 text-sm text-muted">{course.prerequisites}</p></div>}
          </div>
        </aside>
      </div>
    </>
  );
}
