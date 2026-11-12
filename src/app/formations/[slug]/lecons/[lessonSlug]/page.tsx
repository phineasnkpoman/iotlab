import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, FlaskConical, CheckCircle2, Target } from "lucide-react";
import { getCourse, listLessons, listExercises } from "@/services/catalog";
import { getUser } from "@/services/auth";
import { createClient } from "@/lib/supabase/server";
import { Markdown } from "@/utils/markdown";
import { safeUrl } from "@/utils/format";
import { CompleteButton, ExerciseSubmitForm, QuizForm } from "@/components/courses/LessonActions";
import { LinkButton, buttonClass } from "@/components/ui/Button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lessonSlug: string }> }): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: "Leçon" };
  const l = (await listLessons(course.id)).find((x) => x.slug === lessonSlug);
  return { title: l ? `${l.title} · ${course.title}` : "Leçon" };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lessonSlug: string }> }) {
  const { slug, lessonSlug } = await params;
  const course = await getCourse(slug);
  if (!course || course.status !== "published") notFound();

  const [lessons, exercises, user] = await Promise.all([listLessons(course.id), listExercises(course.id), getUser()]);
  const idx = lessons.findIndex((l) => l.slug === lessonSlug);
  if (idx < 0) notFound();
  const lesson = lessons[idx];
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const lessonExercises = exercises.filter((e) => e.lesson_id === lesson.id);
  const quiz = idx === lessons.length - 1 ? exercises.find((e) => e.kind === "quiz") : undefined;

  let doneIds = new Set<string>();
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).in("lesson_id", lessons.map((l) => l.id));
    doneIds = new Set((data ?? []).map((d) => d.lesson_id));
  }
  const done = doneIds.has(lesson.id);
  const wokwi = safeUrl(lesson.wokwi_url);
  const video = safeUrl(lesson.video_url);

  const loginHref = `/connexion?redirection=/formations/${course.slug}/lecons/${lesson.slug}`;
  const doneCount = lessons.filter((l) => doneIds.has(l.id)).length;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[260px_1fr] lg:gap-14">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <Link href={`/formations/${course.slug}`} className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-text">
          <ArrowLeft size={15} className="transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden="true" />{course.title}
        </Link>
        {user && <p className="tabular mt-4 text-xs text-muted">{doneCount} / {lessons.length} leçons terminées</p>}
        <nav aria-label="Leçons de la formation" className="mt-4">
          <ol className="relative space-y-0.5 border-l border-tint/10">
            {lessons.map((l) => {
              const current = l.id === lesson.id;
              return (
                <li key={l.id}>
                  <Link href={`/formations/${course.slug}/lecons/${l.slug}`} aria-current={current ? "page" : undefined}
                        className={`relative -ml-px flex items-center gap-2.5 border-l-2 py-2 pl-4 pr-2 text-sm transition-colors duration-200 ${current ? "rounded-r-xl border-primary bg-tint/[0.07] text-text" : "border-transparent text-muted hover:border-tint/25 hover:text-text"}`}>
                    {doneIds.has(l.id) ? <CheckCircle2 size={14} className="shrink-0 text-ok" aria-label="Terminée" /> : <span className="tabular w-3.5 shrink-0 font-mono text-[11px]">{l.position}</span>}
                    <span>{l.title}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </aside>

      <article className="min-w-0">
        <p className="flex items-baseline gap-2 text-sm"><span className="tabular font-mono text-xs text-copper">Module {lesson.module_position}</span><span className="text-muted">{lesson.module_title}</span></p>
        <h1 className="mt-3 text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[2.4rem]">{lesson.title}</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">{lesson.intro}</p>

        {lesson.objectives.length > 0 && (
          <div className="mt-8 glass rounded-[24px] p-5">
            <p className="flex items-center gap-2 text-sm font-medium"><Target size={16} className="text-copper" aria-hidden="true" />Objectifs de la leçon</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">{lesson.objectives.map((o) => <li key={o} className="flex gap-2.5"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-copper" aria-hidden="true" />{o}</li>)}</ul>
          </div>
        )}

        <div className="prose-lab mt-8"><Markdown source={lesson.content_md} /></div>

        {video && <p className="mt-6"><a href={video} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-copper hover:underline">Vidéo associée <ExternalLink size={14} aria-hidden="true" /></a></p>}

        {wokwi && (
          <div className="glass relative mt-10 flex flex-wrap items-center gap-4 overflow-hidden rounded-[24px] bg-[linear-gradient(90deg,rgb(217_164_65/0.12),rgb(255_255_255/0.02))] p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-tint/10 bg-tint/[0.06] text-copper shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]"><FlaskConical size={20} strokeWidth={1.75} aria-hidden="true" /></span>
            <div className="min-w-48 flex-1 text-sm"><p className="font-medium">Simulation Wokwi</p><p className="mt-0.5 text-muted">Ouvre un nouveau projet dans Wokwi : reproduisez le montage et collez le code de la leçon.</p></div>
            <a href={wokwi} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary")}>Ouvrir Wokwi <ExternalLink size={14} aria-hidden="true" /></a>
          </div>
        )}

        {lessonExercises.map((ex) => (
          <section key={ex.id} className="mt-10 glass rounded-[24px] p-5 sm:p-7">
            <h2 className="text-lg font-semibold tracking-[-0.01em]">{ex.title}</h2>
            <div className="prose-lab"><Markdown source={ex.instructions_md} /></div>
            {(ex.components.length > 0 || ex.wiring_md) && (
              <dl className="mt-4 grid gap-3 rounded-2xl border border-tint/[0.07] bg-well p-4 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
                {ex.components.length > 0 && <><dt className="font-medium">Matériel</dt><dd className="text-muted">{ex.components.join(", ")}</dd></>}
                {ex.wiring_md && <><dt className="font-medium">Câblage</dt><dd className="text-muted">{ex.wiring_md}</dd></>}
              </dl>
            )}
            {ex.starter_code && <pre className="mt-4 overflow-x-auto rounded-[18px] border border-tint/[0.08] bg-[#070b14] text-[#e6edf7] p-4 font-mono text-sm leading-relaxed"><code>{ex.starter_code}</code></pre>}
            <div className="mt-6 border-t border-tint/[0.08] pt-6">
              {user ? <ExerciseSubmitForm exerciseId={ex.id} courseSlug={course.slug} />
                : <p className="text-sm text-muted"><Link href={loginHref} className="text-copper hover:underline">Connectez-vous</Link> pour soumettre votre travail.</p>}
            </div>
          </section>
        ))}

        {quiz?.quiz && (
          <section className="mt-10 glass rounded-[24px] p-5 sm:p-7">
            <h2 className="text-lg font-semibold tracking-[-0.01em]">{quiz.title}</h2>
            <p className="mb-6 mt-1 text-sm text-muted">{quiz.instructions_md}</p>
            {user ? <QuizForm exerciseId={quiz.id} courseSlug={course.slug} questions={quiz.quiz} />
              : <p className="text-sm text-muted"><Link href={loginHref} className="text-copper hover:underline">Connectez-vous</Link> pour passer le quiz.</p>}
          </section>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-tint/[0.08] pt-6">
          {user
            ? <CompleteButton lessonId={lesson.id} courseId={course.id} courseSlug={course.slug} done={done} />
            : <LinkButton href={loginHref} variant="secondary">Se connecter pour suivre ma progression</LinkButton>}
          <div className="flex gap-2">
            {prev && <LinkButton href={`/formations/${course.slug}/lecons/${prev.slug}`} variant="ghost"><ArrowLeft size={16} aria-hidden="true" /> Précédente</LinkButton>}
            {next && <LinkButton href={`/formations/${course.slug}/lecons/${next.slug}`} variant="secondary">Suivante <ArrowRight size={16} aria-hidden="true" /></LinkButton>}
          </div>
        </div>
      </article>
    </div>
  );
}
