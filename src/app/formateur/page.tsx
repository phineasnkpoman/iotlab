import type { Metadata } from "next";
import { requireProfile } from "@/services/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { listSubmissionsForReview, parseReviewFilter } from "@/services/submissions";
import { SubmissionsReview } from "@/components/dashboard/SubmissionsReview";
import { CourseStatusTable } from "@/components/dashboard/StaffTables";

export const metadata: Metadata = { title: "Espace formateur" };

const h2 = "scroll-mt-28 text-xl font-semibold tracking-[-0.015em]";

export default async function TrainerPage({ searchParams }: { searchParams: Promise<{ soumissions?: string }> }) {
  await requireProfile(["trainer", "admin"], "/formateur");
  const filter = parseReviewFilter((await searchParams).soumissions);
  const supabase = await createClient();
  // RLS ne renvoie que les formations et soumissions que ce formateur peut gérer.
  const [review, { data: courses }] = await Promise.all([
    listSubmissionsForReview(filter),
    supabase.from("courses").select("id, title, status").order("created_at", { ascending: false }),
  ]);
  return (
    <>
      <PageHeader title="Espace formateur" description="Les travaux de vos apprenants et l'état de vos formations." />
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-4 sm:px-6">
        <h2 id="soumissions" className={`mt-10 ${h2}`}>Soumissions des apprenants</h2>
        <p className="mt-1.5 text-sm text-muted">Seules les soumissions de vos formations et de vos challenges apparaissent ici.</p>
        <div className="mt-5"><SubmissionsReview {...review} filter={filter} basePath="/formateur" /></div>
        <h2 className={`mt-16 ${h2}`}>Mes formations</h2>
        <div className="mt-4"><CourseStatusTable courses={courses ?? []} /></div>
        <p className="mt-3 text-sm text-muted">La création et l&apos;édition des leçons se font pour l&apos;instant via le tableau de bord Supabase (Table Editor), voir README.</p>
      </div>
    </>
  );
}
