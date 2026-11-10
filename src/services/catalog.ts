import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Category, Challenge, Course, Exercise, Lesson, Tool } from "@/types/db";

const COURSE_SELECT =
  "id, slug, title, description, image_url, level, category_id, duration_minutes, skills, prerequisites, instructor_id, status, categories(name, slug), instructor:profiles!courses_instructor_id_fkey(full_name), lessons(count)";

export interface CourseFilters { q?: string; level?: string; category?: string; sort?: string }

export async function listCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("position");
  return (data ?? []) as Category[];
}

export async function listCourses(filters: CourseFilters = {}): Promise<Course[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  let query = supabase.from("courses").select(COURSE_SELECT).eq("status", "published");
  if (filters.level) query = query.eq("level", filters.level);
  if (filters.category) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", filters.category).maybeSingle();
    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }
  if (filters.q) {
    // On retire les caractères spéciaux du filtre PostgREST avant de construire la requête.
    const safe = filters.q.replace(/[%,()*\\]/g, " ").trim();
    if (safe) query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
  }
  if (filters.sort === "duree") query = query.order("duration_minutes");
  else if (filters.sort === "titre") query = query.order("title");
  else query = query.order("created_at", { ascending: false });
  const { data } = await query;
  return (data ?? []) as unknown as Course[];
}

export async function getCourse(slug: string): Promise<Course | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select(COURSE_SELECT).eq("slug", slug).maybeSingle();
  return (data as unknown as Course | null) ?? null;
}

export async function listLessons(courseId: string): Promise<Lesson[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("lessons").select("*").eq("course_id", courseId).order("position");
  return (data ?? []) as Lesson[];
}

export async function listExercises(courseId: string): Promise<Exercise[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("exercises").select("*").eq("course_id", courseId).order("position");
  return (data ?? []) as Exercise[];
}

export async function listTools(): Promise<Tool[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("tools").select("*").eq("published", true).order("position");
  return (data ?? []) as Tool[];
}

export async function listChallenges(): Promise<Challenge[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("challenges").select("*").in("status", ["published", "closed"]).order("created_at", { ascending: false });
  return (data ?? []) as Challenge[];
}

export async function getChallenge(slug: string): Promise<Challenge | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("challenges").select("*").eq("slug", slug).maybeSingle();
  return (data as Challenge | null) ?? null;
}
