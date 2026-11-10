import type { Metadata } from "next";
import Link from "next/link";
import { listChallenges } from "@/services/catalog";
import { LevelBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/utils/format";

export const metadata: Metadata = { title: "Challenges" };

export default async function ChallengesPage() {
  const challenges = await listChallenges();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Challenges</h1>
      <p className="mt-2 max-w-2xl text-muted">Des défis techniques pour mettre vos compétences en pratique. Soumettez votre réalisation et recevez un retour.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {challenges.map((c) => (
          <Link key={c.id} href={`/challenges/${c.slug}`} className="rounded-lg border border-line bg-panel p-5 transition-colors hover:border-copper/60">
            <div className="flex items-center justify-between"><LevelBadge level={c.level} /><span className="text-xs text-muted">{c.status === "closed" ? "Terminé" : c.ends_at ? `Jusqu'au ${formatDate(c.ends_at)}` : "Ouvert"}</span></div>
            <h2 className="mt-4 text-lg font-semibold">{c.title}</h2>
            <p className="mt-2 text-sm text-muted">{c.description}</p>
          </Link>
        ))}
      </div>
      {challenges.length === 0 && <div className="mt-8"><EmptyState title="Aucun challenge pour le moment">Les prochains défis seront publiés ici.</EmptyState></div>}
    </div>
  );
}
