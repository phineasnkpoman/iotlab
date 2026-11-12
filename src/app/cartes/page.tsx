import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BOARDS, CHOOSER, COMPARE_ROWS, getBoard } from "@/data/boards";
import { PageHeader } from "@/components/layout/PageHeader";
import { LevelBadge } from "@/components/ui/Badge";
import { Tilt } from "@/components/fx/Tilt";
import { Board3D } from "@/components/fx/board3d/Board3D";
import { BoardIcon } from "@/components/boards/BoardIcon";

export const metadata: Metadata = {
  title: "Catalogue des cartes",
  description: "Arduino Uno, Arduino Mega, ESP32 et Raspberry Pi en 3D interactive, avec leurs caractéristiques et un comparatif.",
};

/** Met l'initiale en minuscule, sauf pour un sigle (« GPIO » reste « GPIO »). */
const lowerFirst = (t: string) => t.replace(/^\p{Lu}(?!\p{Lu})/u, (c) => c.toLowerCase());

const arrow = "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-tint/10 bg-tint/[0.04] text-muted transition-[transform,color,background-color] duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-tint/10 group-hover:text-text";

export default function BoardsPage() {
  return (
    <>
      <PageHeader
        title="Catalogue des cartes"
        description="Quatre cartes pour apprendre l'IoT, du premier montage au serveur Linux. Ouvrez-en une pour la faire tourner en 3D, toucher ses composants et lire ses caractéristiques."
      />

      {/* Les quatre cartes */}
      <section aria-label="Cartes disponibles" className="mx-auto max-w-6xl px-4 sm:px-6">
        <ul className="grid gap-5 md:grid-cols-2">
          {BOARDS.map((b, i) => (
            <li key={b.slug} className="rise" style={{ ["--d" as string]: `${120 + i * 70}ms` }}>
              <Tilt max={5} className="glass group h-full overflow-hidden rounded-[28px] transition-[border-color,box-shadow] duration-500 hover:border-tint/20">
                <Link href={`/cartes/${b.slug}`} className="relative flex h-full flex-col rounded-[28px] p-2 outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                  <div className="stage overflow-hidden rounded-[22px]">
                    <div className="transition-transform duration-700 ease-[var(--ease-spring)] group-hover:scale-[1.05]">
                      <Board3D slug={b.slug} variant="card" />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col px-4 pb-4 pt-5 sm:px-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{b.kind}</span>
                      <LevelBadge level={b.level} />
                    </div>
                    <h2 className="mt-4 text-[1.45rem] font-medium tracking-[-0.03em]">{b.name}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{b.tagline}</p>
                    <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Chiffres clés">
                      {b.figures.slice(0, 3).map((f) => (
                        <li key={f.label} className="rounded-full border border-tint/10 bg-tint/[0.04] px-3 py-1.5 text-[12.5px] text-muted">
                          <span className="tabular font-medium text-text">{f.value}{f.unit ? ` ${f.unit}` : ""}</span> {lowerFirst(f.label)}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-6">
                      <div className="flex items-center justify-between gap-3 border-t border-tint/[0.07] pt-4">
                        <span className="text-sm font-medium">Explorer en 3D</span>
                        <span className={arrow} aria-hidden="true"><ArrowUpRight size={16} /></span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Tilt>
            </li>
          ))}
        </ul>
      </section>

      {/* Comparatif */}
      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6" aria-labelledby="comparer">
        <h2 id="comparer" className="reveal text-[2rem] font-medium tracking-[-0.035em] sm:text-[2.4rem]">Comparer en un coup d&apos;œil</h2>
        <p className="reveal mt-3 max-w-2xl text-muted">Les trois premières sont des microcontrôleurs : elles exécutent un seul programme, dès la mise sous tension. Le Raspberry Pi est un ordinateur complet.</p>
        <div className="reveal bezel mt-8">
          <div className="bezel-core glass overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <caption className="sr-only">Comparaison des quatre cartes du catalogue</caption>
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 z-10 w-[170px] bg-panel/90 px-5 py-4 backdrop-blur"><span className="sr-only">Caractéristique</span></th>
                  {BOARDS.map((b) => (
                    <th key={b.slug} scope="col" className="px-4 py-4 align-bottom font-medium">
                      <Link href={`/cartes/${b.slug}`} className="group inline-flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                        <BoardIcon name={b.icon} swatch={b.swatch} size="sm" />
                        <span className="leading-tight transition-colors group-hover:text-primary-soft">{b.name}</span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((r) => (
                  <tr key={r.key} className="border-t border-tint/[0.07]">
                    <th scope="row" className="sticky left-0 z-10 bg-panel/90 px-5 py-3.5 font-normal text-muted backdrop-blur">{r.label}</th>
                    {BOARDS.map((b) => {
                      const v = b.compare[r.key];
                      return <td key={b.slug} className={`px-4 py-3.5 ${v === "Aucun" ? "text-muted" : "text-text"}`}>{v}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Guide de choix */}
      <section className="mx-auto max-w-6xl px-4 pb-28 pt-24 sm:px-6" aria-labelledby="choisir">
        <h2 id="choisir" className="reveal text-[2rem] font-medium tracking-[-0.035em] sm:text-[2.4rem]">Quelle carte choisir ?</h2>
        <p className="reveal mt-3 max-w-2xl text-muted">Partez de votre besoin, pas de la fiche technique.</p>
        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {CHOOSER.map((c) => {
            const b = getBoard(c.slug)!;
            return (
              <li key={c.slug} className="reveal">
                <Link href={`/cartes/${b.slug}`} className="glass group flex h-full items-start gap-4 rounded-[24px] p-5 outline-none transition-[border-color] duration-500 hover:border-tint/20 focus-visible:ring-2 focus-visible:ring-primary/60 sm:p-6">
                  <BoardIcon name={b.icon} swatch={b.swatch} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[1.05rem] font-medium leading-snug tracking-[-0.015em]">{c.need}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted"><span className="font-medium text-primary-soft">{b.name}.</span> {c.why}</p>
                  </div>
                  <span className={arrow} aria-hidden="true"><ArrowUpRight size={16} /></span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
