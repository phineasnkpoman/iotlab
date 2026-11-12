import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical, ExternalLink, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { safeUrl } from "@/utils/format";

export const metadata: Metadata = { title: "Laboratoire virtuel" };

interface Row {
  id: string; title: string; kind: "practice" | "quiz"; components: string[]; wiring_md: string | null;
  wokwi_url: string | null; lesson_id: string | null;
  lessons: { slug: string; title: string } | null;
  courses: { slug: string; title: string } | null;
}

export default async function LabPage() {
  let rows: Row[] = [];
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.from("exercises")
      .select("id, title, kind, components, wiring_md, wokwi_url, lesson_id, lessons(slug, title), courses(slug, title)")
      .eq("kind", "practice").eq("published", true).order("position");
    rows = (data ?? []) as unknown as Row[];
  }
  return (
    <>
      <PageHeader title="Laboratoire virtuel"
        description="Chaque activité suit le même parcours : comprendre les composants, consulter le câblage, ouvrir la simulation, tester le code, puis soumettre son travail depuis la leçon." />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((r) => {
            const lessonHref = r.courses && r.lessons ? `/formations/${r.courses.slug}/lecons/${r.lessons.slug}` : null;
            const wokwi = safeUrl(r.wokwi_url);
            return (
              <article key={r.id} className="flex flex-col glass rounded-[24px] p-6 transition-colors duration-300 hover:border-tint/20">
                <div className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-tint/10 bg-tint/[0.06] text-copper shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]"><FlaskConical size={19} strokeWidth={1.75} aria-hidden="true" /></span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold leading-snug tracking-[-0.01em]">{r.title}</h2>
                    {r.courses && <p className="mt-1 text-xs text-muted">{r.courses.title}</p>}
                  </div>
                </div>
                {(r.components.length > 0 || r.wiring_md) && (
                  <dl className="mt-5 space-y-2.5 rounded-2xl border border-tint/[0.07] bg-well p-4 text-sm">
                    {r.components.length > 0 && <div><dt className="font-medium">Matériel</dt><dd className="mt-0.5 text-muted">{r.components.join(", ")}</dd></div>}
                    {r.wiring_md && <div><dt className="font-medium">Câblage</dt><dd className="mt-0.5 text-muted">{r.wiring_md}</dd></div>}
                  </dl>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-5 pt-5 text-sm">
                  {lessonHref && <Link href={lessonHref} className="group inline-flex items-center gap-1.5 font-medium text-copper">Ouvrir l&apos;exercice <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" /></Link>}
                  {wokwi && <a href={wokwi} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-text">Wokwi <ExternalLink size={14} aria-hidden="true" /></a>}
                </div>
              </article>
            );
          })}
        </div>
        {rows.length === 0 && <EmptyState title="Aucune activité pratique publiée" />}
      </div>
    </>
  );
}
