import type { Metadata } from "next";
import { requireProfile } from "@/services/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { listSubmissionsForReview, parseReviewFilter } from "@/services/submissions";
import { SubmissionsReview } from "@/components/dashboard/SubmissionsReview";
import { ChallengeStatusTable, CourseStatusTable, ToolsTable, UsersTable } from "@/components/dashboard/StaffTables";

export const metadata: Metadata = { title: "Administration" };

const h2 = "scroll-mt-28 text-xl font-semibold tracking-[-0.015em]";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ soumissions?: string }> }) {
  const me = await requireProfile(["admin"], "/admin");
  const filter = parseReviewFilter((await searchParams).soumissions);
  const supabase = await createClient();
  const [review, users, courses, challenges, tools] = await Promise.all([
    listSubmissionsForReview(filter),
    supabase.from("profiles").select("id, full_name, role").order("created_at", { ascending: false }),
    supabase.from("courses").select("id, title, status").order("created_at", { ascending: false }),
    supabase.from("challenges").select("id, title, status").order("created_at", { ascending: false }),
    supabase.from("tools").select("id, name, published").order("position"),
  ]);
  return (
    <>
      <PageHeader title="Administration" description="Corrigez les travaux des apprenants, gérez les rôles et publiez les contenus." />
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-4 sm:px-6">
        <h2 id="soumissions" className={`mt-10 ${h2}`}>Soumissions des apprenants</h2>
        <p className="mt-1.5 text-sm text-muted">Fichiers, liens Wokwi et explications envoyés pour les exercices et les challenges. Votre note et votre commentaire s&apos;affichent chez l&apos;apprenant.</p>
        <div className="mt-5"><SubmissionsReview {...review} filter={filter} basePath="/admin" /></div>
        <h2 className={`mt-16 ${h2}`}>Utilisateurs et rôles</h2>
        <div className="mt-4"><UsersTable users={users.data ?? []} me={me.id} /></div>
        <h2 className={`mt-12 ${h2}`}>Formations</h2>
        <div className="mt-4"><CourseStatusTable courses={courses.data ?? []} /></div>
        <h2 className={`mt-12 ${h2}`}>Challenges</h2>
        <div className="mt-4"><ChallengeStatusTable items={challenges.data ?? []} /></div>
        <h2 className={`mt-12 ${h2}`}>Outils</h2>
        <div className="mt-4"><ToolsTable tools={tools.data ?? []} /></div>
      </div>
    </>
  );
}
