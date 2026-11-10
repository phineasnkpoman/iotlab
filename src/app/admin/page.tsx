import type { Metadata } from "next";
import { requireProfile } from "@/services/auth";
import { createClient } from "@/lib/supabase/server";
import { ChallengeStatusTable, CourseStatusTable, SubmissionsList, ToolsTable, UsersTable, type SubmissionRow } from "@/components/dashboard/StaffTables";

export const metadata: Metadata = { title: "Administration" };
const SUB_SELECT = "id, content, link_url, status, score, feedback, created_at, profiles(full_name), exercises(title), challenges(title)";

export default async function AdminPage() {
  const me = await requireProfile(["admin"], "/admin");
  const supabase = await createClient();
  const [users, courses, challenges, tools, subs] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role").order("created_at", { ascending: false }),
    supabase.from("courses").select("id, title, status").order("created_at", { ascending: false }),
    supabase.from("challenges").select("id, title, status").order("created_at", { ascending: false }),
    supabase.from("tools").select("id, name, published").order("position"),
    supabase.from("submissions").select(SUB_SELECT).order("created_at", { ascending: false }).limit(30),
  ]);
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Administration</h1>
      <h2 className="mt-10 text-xl font-semibold">Utilisateurs et rôles</h2>
      <div className="mt-4"><UsersTable users={users.data ?? []} me={me.id} /></div>
      <h2 className="mt-10 text-xl font-semibold">Formations</h2>
      <div className="mt-4"><CourseStatusTable courses={courses.data ?? []} /></div>
      <h2 className="mt-10 text-xl font-semibold">Challenges</h2>
      <div className="mt-4"><ChallengeStatusTable items={challenges.data ?? []} /></div>
      <h2 className="mt-10 text-xl font-semibold">Outils</h2>
      <div className="mt-4"><ToolsTable tools={tools.data ?? []} /></div>
      <h2 className="mt-10 text-xl font-semibold">Soumissions récentes</h2>
      <div className="mt-4"><SubmissionsList rows={(subs.data ?? []) as unknown as SubmissionRow[]} /></div>
    </div>
  );
}
