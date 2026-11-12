import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listChallenges } from "@/services/catalog";
import { LevelBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/utils/format";

export const metadata: Metadata = { title: "Challenges" };

export default async function ChallengesPage() {
  const challenges = await listChallenges();
  return (
    <>
      <PageHeader title="Challenges" description="Des défis techniques pour mettre vos compétences en pratique. Soumettez votre réalisation et recevez un retour." />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
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
        {challenges.length === 0 && <EmptyState title="Aucun challenge pour le moment">Les prochains défis seront publiés ici.</EmptyState>}
      </div>
    </>
  );
}
