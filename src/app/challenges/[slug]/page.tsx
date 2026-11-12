import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Target } from "lucide-react";
import { getChallenge } from "@/services/catalog";
import { getUser } from "@/services/auth";
import { createClient } from "@/lib/supabase/server";
import { Markdown } from "@/utils/markdown";
import { LevelBadge } from "@/components/ui/Badge";
import { ChallengeSubmitForm } from "@/components/forms/ChallengeSubmitForm";
import { challengeWindow, formatDate, safeUrl } from "@/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";

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

  const loginHref = `/connexion?redirection=/challenges/${c.slug}`;
  return (
    <>
      <PageHeader narrow back={{ href: "/challenges", label: "Tous les challenges" }} title={c.title} description={c.description}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
          <LevelBadge level={c.level} />
          {c.ends_at && <span>Fin le {formatDate(c.ends_at)}</span>}
          <span className={ended ? "text-muted" : notStarted ? "text-copper" : "text-ok-soft"}>{ended ? "Terminé" : notStarted ? "Bientôt ouvert" : "Ouvert"}</span>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {c.objectives.length > 0 && (
          <div className="glass rounded-[24px] p-5">
            <p className="flex items-center gap-2 text-sm font-medium"><Target size={16} className="text-copper" aria-hidden="true" />Objectifs</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">{c.objectives.map((o) => <li key={o} className="flex gap-2.5"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-copper" aria-hidden="true" />{o}</li>)}</ul>
          </div>
        )}
        <div className="prose-lab mt-8"><h2>Consignes</h2><Markdown source={c.instructions_md} /></div>
        {c.resources.length > 0 && (
          <div className="mt-8"><p className="font-medium">Ressources</p>
            <ul className="mt-3 space-y-2">{c.resources.map((r) => safeUrl(r.url) && <li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-copper hover:underline">{r.label} <ExternalLink size={14} aria-hidden="true" /></a></li>)}</ul>
          </div>
        )}

        <section className="bezel mt-12">
          <div className="bezel-core glass p-5 sm:p-7">
            <h2 className="text-lg font-semibold tracking-[-0.01em]">Participer</h2>
            {notStarted ? <p className="mt-2 text-sm text-muted">Ce challenge commence le {formatDate(c.starts_at)}.</p>
              : ended ? <p className="mt-2 text-sm text-muted">Ce challenge est terminé : les soumissions sont fermées.</p>
              : user ? <div className="mt-5"><ChallengeSubmitForm challengeId={c.id} slug={c.slug} /></div>
              : <p className="mt-2 text-sm text-muted"><Link href={loginHref} className="text-copper hover:underline">Connectez-vous</Link> ou <Link href="/inscription" className="text-copper hover:underline">créez un compte</Link> pour soumettre votre réalisation.</p>}
          </div>
        </section>

        {mine.length > 0 && (
          <section className="mt-10">
            <h2 className="font-semibold">Mes soumissions</h2>
            <ul className="mt-4 space-y-3">{mine.map((s) => (
              <li key={s.id} className="glass rounded-[24px] p-4 text-sm">
                <p className="tabular flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
                  <span>{formatDate(s.created_at)}</span>
                  <span className={s.status === "reviewed" ? "text-ok-soft" : "text-copper"}>{s.status === "reviewed" ? "Corrigée" : "En attente de correction"}</span>
                  {s.score !== null && <span className="text-text">Note : {s.score}</span>}
                </p>
                {s.feedback && <p className="mt-2 leading-relaxed">{s.feedback}</p>}
              </li>))}</ul>
          </section>
        )}
      </div>
    </>
  );
}
