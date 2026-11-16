import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listChallenges } from "@/services/catalog";
import { LevelBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/utils/format";

export const metadata: Metadata = { title: "Challenges" };

const LEVELS = [
  { value: "", label: "Tous" },
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "avance", label: "Avancé" },
] as const;
const RANK: Record<string, number> = { debutant: 0, intermediaire: 1, avance: 2 };

export default async function ChallengesPage({ searchParams }: { searchParams: Promise<{ niveau?: string }> }) {
  const { niveau = "" } = await searchParams;
  const level = LEVELS.some((l) => l.value === niveau) ? niveau : "";
  const all = await listChallenges();
  // Ouverts d'abord, puis du plus simple au plus avancé.
  const challenges = all
    .filter((c) => !level || c.level === level)
    .sort((a, b) => Number(a.status === "closed") - Number(b.status === "closed") || RANK[a.level] - RANK[b.level]);
  const count = (v: string) => all.filter((c) => !v || c.level === v).length;
  return (
    <>
      <PageHeader title="Challenges" description="Des défis techniques pour mettre vos compétences en pratique. Soumettez votre réalisation et recevez un retour." />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {all.length > 0 && (
          <nav aria-label="Filtrer par niveau" className="mb-6 flex flex-wrap gap-2">
            {LEVELS.map((l) => {
              const on = l.value === level;
              return (
                <Link key={l.value} href={l.value ? `/challenges?niveau=${l.value}` : "/challenges"} aria-current={on ? "page" : undefined} scroll={false}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors duration-300 ${on ? "border-primary/50 bg-primary text-white" : "border-tint/10 bg-tint/[0.04] text-muted hover:border-tint/20 hover:text-text"}`}>
                  {l.label}
                  <span className={`tabular rounded-full px-1.5 text-[11px] font-medium ${on ? "bg-white/25" : "bg-tint/[0.08]"}`}>{count(l.value)}</span>
                </Link>
              );
            })}
          </nav>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {challenges.map((c) => {
            const closed = c.status === "closed";
            return (
              <Link key={c.id} href={`/challenges/${c.slug}`}
                    className={`glass group relative flex h-full flex-col overflow-hidden rounded-[24px] p-7 transition-[border-color] duration-300 hover:border-tint/20 ${closed ? "opacity-80" : "bg-[linear-gradient(135deg,rgb(var(--primary-rgb)/0.14),rgb(255_255_255/0.02)_60%)]"}`}>
                <div className="flex items-center justify-between gap-3">
                  <LevelBadge level={c.level} />
                  <span className={`text-xs ${closed ? "text-muted" : "text-ok-soft"}`}>
                    {closed ? "Terminé" : c.ends_at ? `Jusqu'au ${formatDate(c.ends_at)}` : "Ouvert"}
                  </span>
                </div>
                <h2 className="mt-5 text-lg font-semibold leading-snug tracking-[-0.01em]">{c.title}</h2>
                <p className="mb-6 mt-2 text-sm leading-relaxed text-muted">{c.description}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary-soft">
                  {closed ? "Voir le défi" : "Relever le défi"}
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
        {all.length === 0 && <EmptyState title="Aucun challenge pour le moment">Les prochains défis seront publiés ici.</EmptyState>}
        {all.length > 0 && challenges.length === 0 && <EmptyState title="Aucun challenge à ce niveau pour le moment"><Link href="/challenges" className="text-primary-soft hover:underline">Voir tous les challenges</Link></EmptyState>}
      </div>
    </>
  );
}
