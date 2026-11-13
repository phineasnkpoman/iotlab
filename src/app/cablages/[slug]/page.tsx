import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, Clock, Lightbulb, Send } from "lucide-react";
import { MONTAGES, getMontage } from "@/data/montages";
import { getBoard } from "@/data/boards";
import { PageHeader } from "@/components/layout/PageHeader";
import { LevelBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { BoardIcon } from "@/components/boards/BoardIcon";
import { MontageLab } from "@/components/wiring/MontageLab";
import { CodeBlock } from "@/components/wiring/CodeBlock";
import { WokwiPanel } from "@/components/wiring/WokwiPanel";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const m = getMontage((await params).slug);
  return m ? { title: `${m.title} · Câblage 3D`, description: m.summary } : { title: "Montage introuvable" };
}

const h2 = "reveal text-[1.75rem] font-medium tracking-[-0.035em] sm:text-[2.1rem]";

export default async function MontagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getMontage(slug);
  if (!m) notFound();
  const board = getBoard(m.board)!;
  const others = [...MONTAGES.filter((x) => x.slug !== m.slug && x.board === m.board), ...MONTAGES.filter((x) => x.board !== m.board)].slice(0, 3);

  return (
    <>
      <PageHeader back={{ href: "/cablages", label: "Tous les câblages" }} title={m.title} description={m.summary}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-muted">
          <Link href={`/cartes/${board.slug}`} className="inline-flex items-center gap-2 transition-colors hover:text-text">
            <BoardIcon name={board.icon} swatch={board.swatch} size="sm" />{board.name}
          </Link>
          <LevelBadge level={m.level} />
          <span className="tabular inline-flex items-center gap-1.5"><Clock size={14} aria-hidden="true" />{m.minutes} min</span>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MontageLab slug={m.slug} steps={m.steps} label={`Montage « ${m.title} » avec ${board.name}`} />
      </div>

      {/* Matériel et objectifs */}
      <section aria-label="Matériel et objectifs" className="mx-auto grid max-w-6xl gap-5 px-4 pt-20 sm:px-6 md:grid-cols-2">
        <div className="reveal glass rounded-[24px] p-6">
          <h2 className="text-lg font-medium tracking-[-0.015em]">Matériel</h2>
          <ul className="mt-4 divide-y divide-tint/[0.07]">
            {m.parts.map((p) => (
              <li key={p.name} className="flex items-baseline gap-4 py-2.5 text-[14.5px]">
                <span className="tabular w-7 shrink-0 text-muted">{p.qty} ×</span>
                <span className="min-w-0 flex-1">{p.name}{p.note && <span className="text-muted"> ({p.note})</span>}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal glass rounded-[24px] p-6">
          <h2 className="text-lg font-medium tracking-[-0.015em]">Ce que vous apprenez</h2>
          <ul className="mt-4 space-y-3 text-[14.5px] leading-snug">
            {m.learn.map((x) => (
              <li key={x} className="flex gap-3">
                <span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary-soft" aria-hidden="true"><Check size={12} strokeWidth={2.4} /></span>
                {x}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Programme */}
      <section aria-labelledby="programme" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <h2 id="programme" className={h2}>Le programme</h2>
        <p className="reveal mt-3 max-w-2xl text-muted">
          {m.code.lang === "python" ? "À lancer sur le Raspberry Pi avec Python 3 ; la bibliothèque gpiozero est déjà installée dans Raspberry Pi OS." : "À téléverser avec l'IDE Arduino. Les commentaires expliquent chaque ligne importante."}
        </p>
        <div className="reveal mt-6"><CodeBlock source={m.code.source} file={m.code.file} lang={m.code.lang} /></div>
      </section>

      {/* Wokwi */}
      <section aria-labelledby="wokwi" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="reveal bezel"><WokwiPanel montage={m} /></div>
      </section>

      {/* Soumettre */}
      <section aria-labelledby="soumettre" className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <div className="reveal glass flex flex-wrap items-center gap-5 rounded-[24px] p-6">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary-soft"><Send size={19} strokeWidth={1.7} aria-hidden="true" /></span>
          <div className="min-w-56 flex-1">
            <h2 id="soumettre" className="font-medium">Faites corriger votre montage</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">Dans un challenge ou un exercice de formation, envoyez votre lien Wokwi, votre programme ou une photo du montage réel. Le formateur vous répond avec une note et un commentaire.</p>
          </div>
          <LinkButton href="/challenges" variant="secondary">Choisir un challenge</LinkButton>
        </div>
      </section>

      {/* Conseils */}
      <section aria-labelledby="conseils" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="reveal bezel">
          <div className="bezel-core glass p-6 sm:p-9">
            <div className="flex items-center gap-3.5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-tint/10 bg-tint/[0.06] text-copper shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]">
                <Lightbulb size={20} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <h2 id="conseils" className="text-2xl font-medium tracking-[-0.025em]">Bon à savoir</h2>
            </div>
            <ol className="mt-7 grid gap-x-12 gap-y-6 md:grid-cols-3">
              {m.tips.map((t, i) => (
                <li key={t} className="flex gap-4 text-[15px] leading-relaxed">
                  <span className="tabular mt-[3px] font-mono text-[13px] text-copper" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Autres montages */}
      <section aria-labelledby="autres" className="mx-auto max-w-6xl px-4 pb-28 pt-20 sm:px-6">
        <h2 id="autres" className={h2}>Autres montages</h2>
        <ul className="mt-8 grid gap-3 md:grid-cols-3">
          {others.map((o) => {
            const b = getBoard(o.board)!;
            return (
              <li key={o.slug} className="reveal">
                <Link href={`/cablages/${o.slug}`} className="glass group flex h-full items-center gap-4 rounded-[22px] p-4 outline-none transition-[border-color] duration-500 hover:border-tint/20 focus-visible:ring-2 focus-visible:ring-primary/60">
                  <BoardIcon name={b.icon} swatch={b.swatch} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium leading-snug tracking-[-0.01em]">{o.title}</span>
                    <span className="mt-0.5 block truncate text-[13px] text-muted">{b.name} · {o.minutes} min</span>
                  </span>
                  <ArrowUpRight size={16} className="shrink-0 text-muted transition-[transform,color] duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
