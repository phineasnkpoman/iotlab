export type UserRole = "student" | "trainer" | "admin";
export type CourseLevel = "debutant" | "intermediaire" | "avance";
export type PublishStatus = "draft" | "published" | "archived";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  filiere: string | null;
  promotion: string | null;
  role: UserRole;
}

export interface Category { id: string; slug: string; name: string; description: string | null; icon: string | null; position: number }

export interface Course {
  id: string; slug: string; title: string; description: string; image_url: string | null;
  level: CourseLevel; category_id: string | null; duration_minutes: number; skills: string[];
  prerequisites: string | null; instructor_id: string | null; status: PublishStatus;
  categories?: { name: string; slug: string } | null;
  instructor?: { full_name: string | null } | null;
  lessons?: { count: number }[];
}

export interface Lesson {
  id: string; course_id: string; module_position: number; module_title: string; position: number;
  slug: string; title: string; intro: string; objectives: string[]; content_md: string;
  video_url: string | null; wokwi_url: string | null; duration_minutes: number;
}

export interface QuizQuestion { id: string; question: string; options: string[] }

export interface Exercise {
  id: string; course_id: string; lesson_id: string | null; position: number; kind: "practice" | "quiz";
  title: string; instructions_md: string; components: string[]; wiring_md: string | null;
  starter_code: string | null; wokwi_url: string | null; requires_submission: boolean;
  quiz: QuizQuestion[] | null;
}

export interface Submission {
  id: string; user_id: string; exercise_id: string | null; challenge_id: string | null;
  content: string | null; link_url: string | null; status: "submitted" | "reviewed";
  score: number | null; feedback: string | null; created_at: string;
}

export interface Tool {
  id: string; slug: string; name: string; description: string; category: string;
  official_url: string; usefulness: string | null; tutorial_url: string | null;
}

export interface Challenge {
  id: string; slug: string; title: string; description: string; level: CourseLevel;
  starts_at: string | null; ends_at: string | null; objectives: string[];
  instructions_md: string; resources: { label: string; url: string }[];
  status: "draft" | "published" | "closed";
}
