import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, FlaskConical, CheckCircle2 } from "lucide-react";
import { getCourse, listLessons, listExercises } from "@/services/catalog";
import { getUser } from "@/services/auth";
import { createClient } from "@/lib/supabase/server";
import { Markdown } from "@/utils/markdown";
import { safeUrl } from "@/utils/format";
import { CompleteButton, ExerciseSubmitForm, QuizForm } from "@/components/courses/LessonActions";
import { LinkButton } from "@/components/ui/Button";

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

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[260px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <Link href={`/formations/${course.slug}`} className="text-sm text-muted hover:text-text">← {course.title}</Link>
        <nav aria-label="Leçons de la formation" className="mt-4">
          <ol className="space-y-1">
            {lessons.map((l) => (
              <li key={l.id}>
                <Link href={`/formations/${course.slug}/lecons/${l.slug}`} aria-current={l.id === lesson.id ? "page" : undefined}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${l.id === lesson.id ? "bg-panel2 text-text" : "text-muted hover:text-text"}`}>
                  {doneIds.has(l.id) ? <CheckCircle2 size={14} className="shrink-0 text-ok" /> : <span className="w-3.5 shrink-0 text-xs">{l.position}</span>}
                  <span>{l.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </aside>

      <article className="min-w-0">
        <p className="text-sm text-copper">Module {lesson.module_position} : {lesson.module_title}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{lesson.title}</h1>
        <p className="mt-3 max-w-2xl text-muted">{lesson.intro}</p>

        {lesson.objectives.length > 0 && (
          <div className="mt-6 rounded-lg border border-line bg-panel p-5">
            <p className="text-sm font-medium">Objectifs de la leçon</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">{lesson.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
          </div>
        )}

        <div className="prose-lab mt-6"><Markdown source={lesson.content_md} /></div>

        {video && <p className="mt-6"><a href={video} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-copper">Vidéo associée <ExternalLink size={14} /></a></p>}

        {wokwi && (
          <div className="mt-8 flex flex-wrap items-center gap-3 rounded-lg border border-copper/40 bg-panel p-5">
            <FlaskConical className="text-copper" size={22} />
            <div className="flex-1 text-sm"><p className="font-medium">Simulation Wokwi</p><p className="text-muted">Ouvre un nouveau projet dans Wokwi : reproduisez le montage et collez le code de la leçon.</p></div>
            <a href={wokwi} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border border-line bg-panel2 px-4 py-2.5 text-sm font-medium hover:bg-line">Ouvrir Wokwi <ExternalLink size={14} /></a>
          </div>
        )}

        {lessonExercises.map((ex) => (
          <section key={ex.id} className="mt-10 rounded-lg border border-line bg-panel p-5 sm:p-6">
            <h2 className="text-lg font-semibold">{ex.title}</h2>
            <div className="prose-lab"><Markdown source={ex.instructions_md} /></div>
            {ex.components.length > 0 && <p className="mt-3 text-sm"><span className="font-medium">Matériel : </span><span className="text-muted">{ex.components.join(", ")}</span></p>}
            {ex.wiring_md && <p className="mt-2 text-sm"><span className="font-medium">Câblage : </span><span className="text-muted">{ex.wiring_md}</span></p>}
            {ex.starter_code && <pre className="prose-lab mt-3 overflow-x-auto rounded-md border border-line bg-[#0a0d10] p-4 text-sm"><code>{ex.starter_code}</code></pre>}
            <div className="mt-5 border-t border-line pt-5">
              {user ? <ExerciseSubmitForm exerciseId={ex.id} courseSlug={course.slug} />
                : <p className="text-sm text-muted"><Link href={`/connexion?redirection=/formations/${course.slug}/lecons/${lesson.slug}`} className="text-copper">Connectez-vous</Link> pour soumettre votre travail.</p>}
            </div>
          </section>
        ))}

        {quiz?.quiz && (
          <section className="mt-10 rounded-lg border border-line bg-panel p-5 sm:p-6">
            <h2 className="text-lg font-semibold">{quiz.title}</h2>
            <p className="mb-5 mt-1 text-sm text-muted">{quiz.instructions_md}</p>
            {user ? <QuizForm exerciseId={quiz.id} courseSlug={course.slug} questions={quiz.quiz} />
              : <p className="text-sm text-muted"><Link href={`/connexion?redirection=/formations/${course.slug}/lecons/${lesson.slug}`} className="text-copper">Connectez-vous</Link> pour passer le quiz.</p>}
          </section>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          {user
            ? <CompleteButton lessonId={lesson.id} courseId={course.id} courseSlug={course.slug} done={done} />
            : <LinkButton href={`/connexion?redirection=/formations/${course.slug}/lecons/${lesson.slug}`} variant="secondary">Se connecter pour suivre ma progression</LinkButton>}
          <div className="flex gap-2">
            {prev && <LinkButton href={`/formations/${course.slug}/lecons/${prev.slug}`} variant="secondary"><ArrowLeft size={16} /> Précédente</LinkButton>}
            {next && <LinkButton href={`/formations/${course.slug}/lecons/${next.slug}`} variant="secondary">Suivante <ArrowRight size={16} /></LinkButton>}
          </div>
        </div>
      </article>
    </div>
  );
}
