import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getChallenge } from "@/services/catalog";
import { getUser } from "@/services/auth";
import { createClient } from "@/lib/supabase/server";
import { Markdown } from "@/utils/markdown";
import { LevelBadge } from "@/components/ui/Badge";
import { ChallengeSubmitForm } from "@/components/forms/ChallengeSubmitForm";
import { challengeWindow, formatDate, safeUrl } from "@/utils/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = await getChallenge((await params).slug);
  return { title: c?.title ?? "Challenge" };
}

export default async function ChallengePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getChallenge(slug);
  if (!c || c.status === "draft") notFound();
  const user = await getUser();
  const win = challengeWindow(c.starts_at, c.ends_at);
  const notStarted = win.notStarted;
  const ended = c.status === "closed" || win.ended;

  let mine: { id: string; status: string; score: number | null; feedback: string | null; created_at: string }[] = [];
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase.from("submissions").select("id, status, score, feedback, created_at").eq("user_id", user.id).eq("challenge_id", c.id).order("created_at", { ascending: false });
    mine = data ?? [];
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/challenges" className="text-sm text-muted hover:text-text">← Tous les challenges</Link>
      <div className="mt-4 flex items-center gap-3"><LevelBadge level={c.level} />{c.ends_at && <span className="text-sm text-muted">Fin le {formatDate(c.ends_at)}</span>}</div>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{c.title}</h1>
      <p className="mt-3 text-muted">{c.description}</p>
      {c.objectives.length > 0 && <div className="mt-6"><p className="font-medium">Objectifs</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">{c.objectives.map((o) => <li key={o}>{o}</li>)}</ul></div>}
      <div className="prose-lab mt-6"><h2>Consignes</h2><Markdown source={c.instructions_md} /></div>
      {c.resources.length > 0 && (
        <div className="mt-6"><p className="font-medium">Ressources</p>
          <ul className="mt-2 space-y-1">{c.resources.map((r) => safeUrl(r.url) && <li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-copper">{r.label} <ExternalLink size={14} /></a></li>)}</ul>
        </div>
      )}

      <section className="mt-10 rounded-lg border border-line bg-panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Participer</h2>
        {notStarted ? <p className="mt-2 text-sm text-muted">Ce challenge commence le {formatDate(c.starts_at)}.</p>
          : ended ? <p className="mt-2 text-sm text-muted">Ce challenge est terminé : les soumissions sont fermées.</p>
          : user ? <div className="mt-4"><ChallengeSubmitForm challengeId={c.id} slug={c.slug} /></div>
          : <p className="mt-2 text-sm text-muted"><Link href={`/connexion?redirection=/challenges/${c.slug}`} className="text-copper">Connectez-vous</Link> ou <Link href="/inscription" className="text-copper">créez un compte</Link> pour soumettre votre réalisation.</p>}
      </section>

      {mine.length > 0 && (
        <section className="mt-8">
          <h2 className="font-semibold">Mes soumissions</h2>
          <ul className="mt-3 space-y-3">{mine.map((s) => (
            <li key={s.id} className="rounded-md border border-line bg-panel p-4 text-sm">
              <p className="text-muted">{formatDate(s.created_at)} · {s.status === "reviewed" ? "Corrigée" : "En attente de correction"}{s.score !== null && ` · Note : ${s.score}`}</p>
              {s.feedback && <p className="mt-2">{s.feedback}</p>}
            </li>))}</ul>
        </section>
      )}
    </div>
  );
}
