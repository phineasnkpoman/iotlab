import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock, ExternalLink, FlaskConical } from "lucide-react";
import { MONTAGES } from "@/data/montages";
import { BOARDS, getBoard } from "@/data/boards";
import { PageHeader } from "@/components/layout/PageHeader";
import { LevelBadge } from "@/components/ui/Badge";
import { Tilt } from "@/components/fx/Tilt";
import { Wiring3D } from "@/components/fx/wiring/Wiring3D";
import { BoardIcon } from "@/components/boards/BoardIcon";
import { buttonClass } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Câblages en 3D",
  description: "Montages pas à pas avec les capteurs du kit Arduino, l'ESP32 et le Raspberry Pi : schéma 3D, programme et simulation Wokwi.",
};

const chip = (on: boolean) => `inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-300 ${on
  ? "border-primary bg-primary text-white" : "border-tint/10 bg-tint/[0.04] text-muted hover:border-tint/20 hover:text-text"}`;

export default async function WiringPage({ searchParams }: { searchParams: Promise<{ carte?: string }> }) {
  const carte = (await searchParams).carte;
  const board = carte ? getBoard(carte) : null;
  const list = board ? MONTAGES.filter((m) => m.board === board.slug) : MONTAGES;

  return (
    <>
      <PageHeader
        title="Câblages en 3D"
        description="Des montages pas à pas avec les capteurs et modules du kit. Tournez le schéma, suivez chaque fil, copiez le programme, puis entraînez-vous sur Wokwi avant de passer au vrai matériel."
      >
        <nav aria-label="Filtrer par carte" className="flex flex-wrap gap-1.5">
          <Link href="/cablages" scroll={false} aria-current={!board ? "page" : undefined} className={chip(!board)}>Toutes</Link>
          {BOARDS.map((b) => (
            <Link key={b.slug} href={`/cablages?carte=${b.slug}`} scroll={false} aria-current={board?.slug === b.slug ? "page" : undefined} className={chip(board?.slug === b.slug)}>
              {b.name}
            </Link>
          ))}
        </nav>
      </PageHeader>

      <section aria-label="Montages" className="mx-auto max-w-6xl px-4 sm:px-6">
        <ul className="grid gap-5 md:grid-cols-2">
          {list.map((m, i) => {
            const b = getBoard(m.board)!;
            return (
              <li key={m.slug} className="rise" style={{ ["--d" as string]: `${100 + i * 60}ms` }}>
                <Tilt max={4} className="glass group h-full overflow-hidden rounded-[28px] transition-[border-color] duration-500 hover:border-tint/20">
                  <Link href={`/cablages/${m.slug}`} className="relative flex h-full flex-col rounded-[28px] p-2 outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                    <div className="stage overflow-hidden rounded-[22px]">
                      <div className="transition-transform duration-700 ease-[var(--ease-spring)] group-hover:scale-[1.04]">
                        <Wiring3D slug={m.slug} variant="card" />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col px-4 pb-4 pt-5 sm:px-5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="inline-flex items-center gap-2 text-[13px] text-muted"><BoardIcon name={b.icon} swatch={b.swatch} size="sm" />{b.name}</span>
                        <span className="ml-auto"><LevelBadge level={m.level} /></span>
                      </div>
                      <h2 className="mt-4 text-[1.3rem] font-medium tracking-[-0.025em]">{m.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{m.summary}</p>
                      <div className="mt-auto pt-6">
                        <div className="flex items-center justify-between gap-3 border-t border-tint/[0.07] pt-4">
                          <span className="tabular inline-flex items-center gap-1.5 text-[13px] text-muted"><Clock size={14} aria-hidden="true" />{m.minutes} min · {m.parts.length} composants</span>
                          <span className="grid h-9 w-9 place-items-center rounded-full border border-tint/10 bg-tint/[0.04] text-muted transition-[transform,color,background-color] duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-tint/10 group-hover:text-text" aria-hidden="true">
                            <ArrowUpRight size={16} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Tilt>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="simuler" className="mx-auto max-w-6xl px-4 pb-28 pt-20 sm:px-6">
        <div className="reveal bezel">
          <div className="bezel-core glass grid gap-6 p-6 sm:p-9 md:grid-cols-[auto_1fr_auto] md:items-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-tint/10 bg-tint/[0.06] text-primary-soft shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]">
              <FlaskConical size={22} strokeWidth={1.6} aria-hidden="true" />
            </span>
            <div>
              <h2 id="simuler" className="text-[1.6rem] font-medium tracking-[-0.03em]">Pas de matériel sous la main ?</h2>
              <p className="mt-2 max-w-2xl text-muted">Chaque montage se refait dans Wokwi, le simulateur Arduino et ESP32 en ligne : copiez le schéma, collez le programme, lancez. Rendez ensuite votre lien Wokwi ou votre fichier dans un exercice ou un challenge.</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <a href="https://wokwi.com" target="_blank" rel="noopener noreferrer" className={buttonClass("secondary")}>Wokwi <ExternalLink size={14} aria-hidden="true" /><span className="sr-only">(nouvel onglet)</span></a>
              <Link href="/challenges" className={buttonClass("primary")}>Voir les challenges</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
