import type { Metadata } from "next";
import { requireProfile } from "@/services/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { CourseStatusTable, SubmissionsList, type SubmissionRow } from "@/components/dashboard/StaffTables";

export const metadata: Metadata = { title: "Espace formateur" };
const SUB_SELECT = "id, content, link_url, status, score, feedback, created_at, profiles(full_name), exercises(title), challenges(title)";

export default async function TrainerPage() {
  const profile = await requireProfile(["trainer", "admin"], "/formateur");
  const supabase = await createClient();
  // RLS ne renvoie que les formations et soumissions que ce formateur peut gérer.
  const [{ data: courses }, { data: subs }] = await Promise.all([
    supabase.from("courses").select("id, title, status").order("created_at", { ascending: false }),
    supabase.from("submissions").select(SUB_SELECT).order("created_at", { ascending: false }).limit(50),
  ]);
  const mine = profile.role === "admin" ? courses ?? [] : courses ?? [];
  return (
    <>
      <PageHeader title="Espace formateur" />
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
      <h2 className="mt-12 text-xl font-semibold tracking-[-0.015em]">Mes formations</h2>
      <div className="mt-4"><CourseStatusTable courses={mine} /></div>
      <p className="mt-3 text-sm text-muted">La création et l&apos;édition des leçons se font pour l&apos;instant via le tableau de bord Supabase (Table Editor), voir README.</p>
      <h2 className="mt-12 text-xl font-semibold tracking-[-0.015em]">Soumissions des étudiants</h2>
      <div className="mt-4"><SubmissionsList rows={(subs ?? []) as unknown as SubmissionRow[]} /></div>
      </div>
    </>
  );
}
