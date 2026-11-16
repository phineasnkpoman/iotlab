import { createClient } from "@/lib/supabase/server";
import type { Course, Submission } from "@/types/db";

export interface CourseProgress {
  course: Course;
  total: number;
  done: number;
  percent: number;
  nextLessonSlug: string | null;
}

/** Formations suivies par l'étudiant avec leur progression, calculées depuis Supabase. */
export async function getMyCourseProgress(userId: string): Promise<CourseProgress[]> {
  const supabase = await createClient();
  const { data: enr } = await supabase
    .from("enrollments")
    .select("course_id, courses(id, slug, title, description, image_url, level, duration_minutes, status, skills, prerequisites, category_id, instructor_id)")
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });
  if (!enr?.length) return [];

  const courseIds = enr.map((e) => e.course_id);
  const [{ data: lessons }, { data: progress }] = await Promise.all([
    supabase.from("lessons").select("id, course_id, slug, position").in("course_id", courseIds).order("position"),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId),
  ]);
  const doneIds = new Set((progress ?? []).map((p) => p.lesson_id));

  return enr.flatMap((e) => {
    const course = (Array.isArray(e.courses) ? e.courses[0] : e.courses) as unknown as Course | null;
    if (!course) return [];
    const ls = (lessons ?? []).filter((l) => l.course_id === e.course_id);
    const done = ls.filter((l) => doneIds.has(l.id)).length;
    const next = ls.find((l) => !doneIds.has(l.id));
    return [{
      course, total: ls.length, done,
      percent: ls.length ? Math.round((done / ls.length) * 100) : 0,
      nextLessonSlug: next?.slug ?? null,
    }];
  });
}

export async function getMySubmissions(userId: string, limit = 20) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("id, exercise_id, challenge_id, link_url, status, score, feedback, created_at, exercises(title, kind, courses(slug, title)), challenges(title, slug)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as (Submission & {
    exercises: { title: string; kind: "practice" | "quiz"; courses: { slug: string; title: string } | null } | null;
    challenges: { title: string; slug: string } | null;
  })[];
}

export async function getRecentCompletions(userId: string, limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_progress")
    .select("completed_at, lessons(title, slug, courses(slug, title))")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as {
    completed_at: string;
    lessons: { title: string; slug: string; courses: { slug: string; title: string } | null } | null;
  }[];
}

/** Meilleur score (en %) de l'apprenant pour chaque QCM : { exercice_id: score }. */
export async function getBestQuizScores(userId: string, exerciseIds: string[]): Promise<Record<string, number>> {
  if (exerciseIds.length === 0) return {};
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("exercise_id, score")
    .eq("user_id", userId)
    .in("exercise_id", exerciseIds)
    .not("score", "is", null);
  const best: Record<string, number> = {};
  for (const row of data ?? []) {
    const score = Number(row.score);
    if (row.exercise_id && (best[row.exercise_id] === undefined || score > best[row.exercise_id])) best[row.exercise_id] = score;
  }
  return best;
}

/** Titres des QCM obligatoires d'une leçon pas encore validés : ils bloquent « Marquer comme terminée ». */
export async function getPendingRequiredQuizzes(userId: string, lessonId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data: quizzes } = await supabase
    .from("exercises").select("id, title, pass_score")
    .eq("lesson_id", lessonId).eq("kind", "quiz").eq("required", true).eq("published", true);
  if (!quizzes?.length) return [];
  const best = await getBestQuizScores(userId, quizzes.map((q) => q.id));
  return quizzes.filter((q) => (best[q.id] ?? -1) < q.pass_score).map((q) => q.title);
}

/** Chiffres du tableau de bord : exercices pratiques rendus et QCM réussis (distincts). */
export async function getMyLearningStats(userId: string): Promise<{ exercises: number; quizzesPassed: number }> {
  const supabase = await createClient();
  const [{ data: practice }, { data: quizzes, error }] = await Promise.all([
    supabase.from("submissions").select("exercise_id, exercises!inner(kind)").eq("user_id", userId).eq("exercises.kind", "practice"),
    supabase.from("submissions").select("exercise_id, score, exercises!inner(kind, pass_score)").eq("user_id", userId).eq("exercises.kind", "quiz").not("score", "is", null),
  ]);
  const passed = new Set<string>();
  if (!error) {
    for (const row of (quizzes ?? []) as unknown as { exercise_id: string; score: number; exercises: { pass_score: number | null } | null }[]) {
      if (Number(row.score) >= (row.exercises?.pass_score ?? 70)) passed.add(row.exercise_id);
    }
  }
  return { exercises: new Set((practice ?? []).map((r) => r.exercise_id)).size, quizzesPassed: passed.size };
}
