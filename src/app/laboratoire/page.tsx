import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { EmptyState } from "@/components/ui/EmptyState";
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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Laboratoire virtuel</h1>
      <p className="mt-2 max-w-2xl text-muted">Chaque activité suit le même parcours : comprendre les composants, consulter le câblage, ouvrir la simulation, tester le code, puis soumettre son travail depuis la leçon.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {rows.map((r) => {
          const lessonHref = r.courses && r.lessons ? `/formations/${r.courses.slug}/lecons/${r.lessons.slug}` : null;
          const wokwi = safeUrl(r.wokwi_url);
          return (
            <article key={r.id} className="flex flex-col rounded-lg border border-line bg-panel p-5">
              <FlaskConical size={20} className="text-copper" />
              <h2 className="mt-3 text-lg font-semibold">{r.title}</h2>
              {r.courses && <p className="mt-1 text-xs text-muted">{r.courses.title}</p>}
              {r.components.length > 0 && <p className="mt-3 text-sm"><span className="font-medium">Matériel : </span><span className="text-muted">{r.components.join(", ")}</span></p>}
              {r.wiring_md && <p className="mt-2 text-sm"><span className="font-medium">Câblage : </span><span className="text-muted">{r.wiring_md}</span></p>}
              <div className="mt-auto flex flex-wrap gap-4 pt-4 text-sm">
                {lessonHref && <Link href={lessonHref} className="text-copper">Ouvrir l&apos;exercice</Link>}
                {wokwi && <a href={wokwi} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-text">Wokwi <ExternalLink size={14} /></a>}
              </div>
            </article>
          );
        })}
      </div>
      {rows.length === 0 && <div className="mt-8"><EmptyState title="Aucune activité pratique publiée" /></div>}
    </div>
  );
}
