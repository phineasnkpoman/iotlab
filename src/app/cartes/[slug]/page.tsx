import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, ExternalLink, Lightbulb } from "lucide-react";
import { BOARDS, getBoard } from "@/data/boards";
import { montagesFor } from "@/data/montages";
import { PageHeader } from "@/components/layout/PageHeader";
import { LevelBadge } from "@/components/ui/Badge";
import { ArrowChip, LinkButton, buttonClass } from "@/components/ui/Button";
import { Board3D } from "@/components/fx/board3d/Board3D";
import { BoardIcon } from "@/components/boards/BoardIcon";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const board = getBoard((await params).slug);
  return board
    ? { title: `${board.name} en 3D`, description: board.tagline }
    : { title: "Carte introuvable" };
}

const h2 = "reveal text-[1.9rem] font-medium tracking-[-0.035em] sm:text-[2.3rem]";

export default async function BoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const board = getBoard(slug);
  if (!board) notFound();
  const others = BOARDS.filter((b) => b.slug !== board.slug);

  return (
    <>
      <PageHeader back={{ href: "/cartes", label: "Toutes les cartes" }} title={board.name} description={board.summary}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-muted">
          <LevelBadge level={board.level} />
          <span>{board.kind}</span>
        </div>
      </PageHeader>

      {/* Modèle 3D et chiffres clés */}
      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.35fr_1fr] lg:items-start">
        <section aria-label={`Modèle 3D de la carte ${board.name}`} className="rise bezel" style={{ ["--d" as string]: "160ms" }}>
          <div className="bezel-core glass p-2.5 pb-1 sm:p-3 sm:pb-1.5">
            <Board3D slug={board.slug} variant="detail" sceneClassName="stage rounded-[18px]" />
          </div>
        </section>

        <div className="flex flex-col gap-5">
          <dl className="rise grid grid-cols-2 gap-3" style={{ ["--d" as string]: "220ms" }}>
            {board.figures.map((f) => (
              <div key={f.label} className="glass flex flex-col-reverse justify-end gap-2 rounded-[22px] p-5">
                <dt className="text-[13px] leading-snug text-muted">{f.label}</dt>
                <dd className="tabular text-[2.1rem] font-medium leading-none tracking-[-0.045em]">
                  {f.value}{f.unit && <span className="ml-1 text-base font-normal tracking-normal text-muted">{f.unit}</span>}
                </dd>
              </div>
            ))}
          </dl>

          <section aria-labelledby="ideale" className="rise glass rounded-[22px] p-5 sm:p-6" style={{ ["--d" as string]: "280ms" }}>
            <h2 id="ideale" className="text-[15px] font-medium">Idéale pour</h2>
            <ul className="mt-3.5 space-y-3 text-[15px] leading-snug">
              {board.idealFor.map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary-soft" aria-hidden="true"><Check size={12} strokeWidth={2.4} /></span>
                  {x}
                </li>
              ))}
            </ul>
          </section>

          <div className="rise flex flex-wrap gap-2.5" style={{ ["--d" as string]: "340ms" }}>
            {board.category && (
              <LinkButton href={`/formations?categorie=${board.category.slug}`}>
                Formations {board.category.label}
                <ArrowChip><ArrowUpRight size={14} aria-hidden="true" /></ArrowChip>
              </LinkButton>
            )}
            <a href={board.docs.url} target="_blank" rel="noreferrer" className={buttonClass(board.category ? "secondary" : "primary")}>
              {board.docs.label}
              <ExternalLink size={15} aria-hidden="true" />
              <span className="sr-only">(nouvel onglet)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Caractéristiques détaillées */}
      <section aria-labelledby="specs" className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
        <h2 id="specs" className={h2}>Caractéristiques</h2>
        <p className="reveal mt-3 max-w-2xl text-muted">D&apos;après la documentation officielle du fabricant.</p>
        <div className="mt-8 gap-4 md:columns-2">
          {board.groups.map((g) => (
            <section key={g.title} className="reveal glass mb-4 break-inside-avoid rounded-[24px] px-6 py-5">
              <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{g.title}</h3>
              <dl className="mt-2 divide-y divide-tint/[0.07]">
                {g.rows.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-6 py-3 text-[14.5px]">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </section>

      {/* Conseils pratiques */}
      <section aria-labelledby="conseils" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="reveal bezel">
          <div className="bezel-core glass p-6 sm:p-9">
            <div className="flex items-center gap-3.5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-tint/10 bg-tint/[0.06] text-copper shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]">
                <Lightbulb size={20} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <h2 id="conseils" className="text-2xl font-medium tracking-[-0.025em]">Bon à savoir</h2>
            </div>
            <ol className="mt-7 grid gap-x-12 gap-y-6 md:grid-cols-2">
              {board.tips.map((t, i) => (
                <li key={t} className="flex gap-4 text-[15px] leading-relaxed">
                  <span className="tabular mt-[3px] font-mono text-[13px] text-copper" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Montages avec cette carte */}
      {montagesFor(board.slug).length > 0 && (
        <section aria-labelledby="montages" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="montages" className={h2}>Montages en 3D</h2>
              <p className="reveal mt-3 max-w-2xl text-muted">Câblages pas à pas avec cette carte, à refaire sur Wokwi{board.slug === "raspberry-pi" ? " (avec un Raspberry Pi Pico)" : ""}.</p>
            </div>
            <Link href={`/cablages?carte=${board.slug}`} className="reveal inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-text">
              Tous les câblages <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {montagesFor(board.slug).map((m) => (
              <li key={m.slug} className="reveal">
                <Link href={`/cablages/${m.slug}`} className="glass group flex h-full items-center gap-4 rounded-[22px] p-5 outline-none transition-[border-color] duration-500 hover:border-tint/20 focus-visible:ring-2 focus-visible:ring-primary/60">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium tracking-[-0.01em]">{m.title}</span>
                    <span className="mt-1 block text-[13.5px] leading-relaxed text-muted">{m.summary}</span>
                  </span>
                  <ArrowUpRight size={16} className="shrink-0 text-muted transition-[transform,color] duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Autres cartes */}
      <section aria-labelledby="autres" className="mx-auto max-w-6xl px-4 pb-28 pt-24 sm:px-6">
        <h2 id="autres" className={h2}>Autres cartes</h2>
        <ul className="mt-8 grid gap-3 md:grid-cols-3">
          {others.map((b) => (
            <li key={b.slug} className="reveal">
              <Link href={`/cartes/${b.slug}`} className="glass group flex h-full items-center gap-4 rounded-[22px] p-4 outline-none transition-[border-color] duration-500 hover:border-tint/20 focus-visible:ring-2 focus-visible:ring-primary/60">
                <BoardIcon name={b.icon} swatch={b.swatch} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium tracking-[-0.01em]">{b.name}</span>
                  <span className="mt-0.5 block truncate text-[13px] text-muted">{b.short}</span>
                </span>
                <ArrowUpRight size={16} className="shrink-0 text-muted transition-[transform,color] duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
