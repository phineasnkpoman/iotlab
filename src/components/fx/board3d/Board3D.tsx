"use client";

import { useId, useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { BoardEdges } from "./primitives";
import { MODELS, type BoardSlug } from "./models";
import { useOrbit } from "./useOrbit";

/*
 * Carte électronique en CSS 3D, manipulable.
 * - Rotation, élan et clavier : voir useOrbit.
 * - Toucher un composant (ou sa pastille) : il se soulève, un halo azur marque son emplacement.
 * - Échap désélectionne.
 * Variante « card » : aperçu fixe et décoratif, sans interaction (vignettes du catalogue).
 */

type Variant = "hero" | "detail" | "card";

const SIZES: Record<Variant, { scene: string; scale: string }> = {
  hero: { scene: "h-[320px] sm:h-[380px]", scale: "max-sm:scale-[0.74] lg:scale-[1.18]" },
  detail: { scene: "h-[330px] sm:h-[440px]", scale: "max-sm:scale-[0.72] lg:scale-[1.22]" },
  card: { scene: "h-[210px] md:h-[250px]", scale: "scale-[0.62] md:scale-[0.76]" },
};

/** Groupe de pavés sélectionnable, soulevé quand il est survolé ou choisi ; un halo reste à son emplacement. */
function Part({ id, index, state, spots, children }: { id: string; index: number; state: "active" | "hover" | "idle"; spots: [number, number, number, number][]; children: ReactNode }) {
  const lift = state === "active" ? 30 : state === "hover" ? 12 : 0;
  return (
    <div data-part={id} data-state={state} className="pi-part" style={{ transform: `translateZ(${lift}px)`, ["--i" as string]: index }}>
      {spots.map(([x, y, w, d]) => (
        <span key={`${x}-${y}`} aria-hidden="true"
              className="pi-halo pointer-events-none absolute rounded-[6px] bg-primary blur-[6px] transition-opacity duration-500"
              style={{ left: x - 4, top: y - 4, width: w + 8, height: d + 8, transform: `translateZ(${1 - lift}px)`, opacity: state === "active" ? 0.85 : state === "hover" ? 0.4 : 0 }} />
      ))}
      {children}
    </div>
  );
}

/** Carte seule, immobile et sans interaction : réutilisée dans les schémas de câblage. */
export function BoardBody({ slug }: { slug: BoardSlug }) {
  const m = MODELS[slug];
  return (
    <div className="pointer-events-none absolute left-0 top-0 [transform-style:preserve-3d]" style={{ width: m.W, height: m.H }}>
      <div className="absolute inset-0 overflow-hidden shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]" style={{ background: m.pcb, borderRadius: m.radius }} />
      <BoardEdges W={m.W} H={m.H} T={m.T} color={m.edge} />
      <div className="absolute inset-0 [transform-style:preserve-3d]">{m.base}</div>
      {m.parts.map((p) => <div key={p.id} className="absolute inset-0 [transform-style:preserve-3d]">{p.node}</div>)}
    </div>
  );
}

/** `sceneClassName` habille la zone de manipulation (fond, arrondi) sans toucher à la légende. */
export function Board3D({ slug, variant = "detail", sceneClassName = "rounded-[28px]" }: { slug: BoardSlug; variant?: Variant; sceneClassName?: string }) {
  const m = MODELS[slug];
  const interactive = variant !== "card";
  const hintId = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const partAt = (t: EventTarget | null) => (t as HTMLElement | null)?.closest?.("[data-part]")?.getAttribute("data-part") ?? null;
  const { scene, rig, handlers, onKey, reset } = useOrbit({
    rest: m.rest, enabled: interactive,
    onTap: (t) => { const p = partAt(t); if (p) setSelected((cur) => (cur === p ? null : p)); },
  });
  const onKeyDown = (e: React.KeyboardEvent) => { if (!onKey(e) && e.key === "Escape") setSelected(null); };

  const info = m.parts.find((p) => p.id === (selected ?? hovered));
  const stateOf = (id: string) => (selected === id ? "active" : (hovered ?? selected) === id ? "hover" : "idle");
  const size = SIZES[variant];

  const board = (
    <div className="float pointer-events-none absolute inset-0 [transform-style:preserve-3d]">
      <div className={`pointer-events-none absolute inset-0 [transform-style:preserve-3d] ${size.scale}`}>
        <div className="pointer-events-none absolute inset-0 [transform-style:preserve-3d]" style={{ transform: `scale(${m.fit})` }}>
          <div ref={rig} className="rig pointer-events-none"
               style={{ width: m.W, height: m.H, margin: `${-m.H / 2}px 0 0 ${-m.W / 2}px`, transform: `rotateX(${m.rest.rx}deg) rotateZ(${m.rest.rz}deg)` }}>
            <div className="pointer-events-none absolute -inset-8 rounded-[40%] bg-[var(--floor-shadow)] blur-2xl" style={{ transform: "translateZ(-40px)" }} />
            <div className="pointer-events-none absolute inset-0 [transform-style:preserve-3d]">
              <div className="absolute inset-0 overflow-hidden shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]" style={{ background: m.pcb, borderRadius: m.radius }} />
              <BoardEdges W={m.W} H={m.H} T={m.T} color={m.edge} />
            </div>
            <div className="pointer-events-none absolute inset-0 [transform-style:preserve-3d]">{m.base}</div>
            {m.parts.map((p, i) => (
              <Part key={p.id} id={p.id} index={i} state={interactive ? stateOf(p.id) : "idle"} spots={p.spots}>{p.node}</Part>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!interactive) {
    return <div aria-hidden="true" className={`scene board-static relative w-full ${size.scene}`}>{board}</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div ref={scene} tabIndex={0} role="group" aria-roledescription="modèle 3D interactif" aria-label={m.ariaLabel} aria-describedby={hintId}
           {...handlers}
           onPointerLeave={() => { handlers.onPointerLeave(); setHovered(null); }}
           onPointerOver={(e) => { if (e.buttons === 0) setHovered(partAt(e.target)); }}
           onKeyDown={onKeyDown}
           className={`scene relative w-full cursor-grab touch-pan-y select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/60 active:cursor-grabbing ${size.scene} ${sceneClassName}`}>
        {board}
      </div>

      {/* Légende : chaque pastille met en avant le composant correspondant */}
      <div className="flex flex-wrap items-center gap-1.5">
        {m.parts.map((p) => {
          const on = selected === p.id;
          return (
            <button key={p.id} type="button" aria-pressed={on}
                    onClick={() => setSelected(on ? null : p.id)}
                    onMouseEnter={() => setHovered(p.id)} onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(p.id)} onBlur={() => setHovered(null)}
                    className={`rounded-full border px-3 py-1.5 text-[12.5px] transition-[background-color,border-color,color] duration-300 ${on
                      ? "border-primary bg-primary text-white"
                      : "border-tint/10 bg-tint/[0.04] text-muted backdrop-blur hover:border-tint/20 hover:text-text"}`}>
              {p.label}
            </button>
          );
        })}
        <button type="button" onClick={reset} aria-label="Recentrer la vue" title="Recentrer la vue"
                className="ml-auto grid h-8 w-8 place-items-center rounded-full border border-tint/10 bg-tint/[0.04] text-muted transition-colors hover:text-text active:scale-95">
          <RotateCcw size={14} aria-hidden="true" />
        </button>
      </div>
      <p id={hintId} aria-live="polite" className="min-h-[2.75rem] text-sm leading-relaxed text-muted">
        {info
          ? <><span className="font-medium text-text">{info.label}.</span> {info.text}</>
          : "Faites glisser la carte pour la tourner, puis touchez un composant pour découvrir son rôle."}
      </p>
    </div>
  );
}
