"use client";

import { useMemo, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Box } from "@/components/fx/board3d/primitives";
import { useOrbit } from "@/components/fx/board3d/useOrbit";
import { BB_TOP, WIRE_Z, wirePath } from "./geometry";
import { HighlightContext, Z } from "./parts";
import { SCENES, type MontageSlug, type WireDef } from "./scenes";

/*
 * Schéma de câblage en CSS 3D. Même manipulation que les cartes (glisser, flèches, double-clic).
 * Les fils sont des courbes SVG posées à hauteur de connecteur ; chaque extrémité a son embout.
 * Variante « card » : aperçu fixe pour le catalogue.
 */

const REST = { rx: 50, rz: -8 };
/* Le cadre fait au plus 640 x 400 px utiles sur grand écran ; les classes réduisent ensuite pour les petits écrans. */
const SIZES = {
  detail: { scene: "h-[250px] sm:h-[430px]", scale: "max-sm:scale-[0.55] sm:scale-[0.92] lg:scale-100" },
  card: { scene: "h-[220px] md:h-[250px]", scale: "scale-[0.62] md:scale-[0.72]" },
} as const;

/** Échelle qui fait tenir la scène, vue sous l'angle de repos, dans 640 x 400 px. */
function fitFor({ w, h }: { w: number; h: number }) {
  const rz = (Math.abs(REST.rz) * Math.PI) / 180, rx = (REST.rx * Math.PI) / 180;
  const projW = w * Math.cos(rz) + h * Math.sin(rz);
  const projH = (w * Math.sin(rz) + h * Math.cos(rz)) * Math.cos(rx) + 90;
  return Math.min(1.2, 640 / projW, 400 / projH);
}

function Wires({ wires, bounds, active, anyActive }: {
  wires: WireDef[]; bounds: { x: number; y: number; w: number; h: number }; active: (id: string) => boolean; anyActive: boolean;
}) {
  const paths = useMemo(() => wires.map((w) => ({ ...w, d: wirePath(w.from, w.to, w.via, w.reach) })), [wires]);
  // Le SVG ne capte rien ; seuls les tracés des fils (plus une marge invisible) répondent au toucher.
  const svg = (z: number, children: ReactNode) => (
    <svg viewBox={`${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}`} aria-hidden="true" className="pointer-events-none absolute overflow-visible"
         style={{ left: bounds.x, top: bounds.y, width: bounds.w, height: bounds.h, transform: `translateZ(${z}px)` }}>
      {children}
    </svg>
  );
  return (
    <>
      {/* Ombre portée des fils sur la platine */}
      {svg(BB_TOP + 0.5, <g transform="translate(5 8)" opacity={0.16}>
        {paths.map((w) => <path key={w.id} d={w.d} fill="none" stroke="#000" strokeWidth="5" strokeLinecap="round" />)}
      </g>)}
      {/* Embouts : la partie isolée du fil qui descend dans le trou ou sur la broche */}
      {paths.flatMap((w) => [w.from, w.to].filter((p) => p.z < WIRE_Z - 1).map((p, i) => (
        <Z key={`${w.id}-${i}`} z={p.z}>
          <Box x={p.x - 3} y={p.y - 3} w={6} d={6} h={WIRE_Z - p.z} top={w.color} side="#24272d" shade="#141619" radius={1} />
        </Z>
      )))}
      {svg(WIRE_Z, paths.map((w) => {
        const on = active(w.id);
        return (
          <g key={w.id} data-wire={w.id} className="transition-opacity duration-500" opacity={anyActive && !on ? 0.28 : 1} style={{ pointerEvents: "stroke" }}>
            {on && <path d={w.d} fill="none" stroke="var(--primary)" strokeOpacity="0.5" strokeWidth="13" strokeLinecap="round" />}
            <path d={w.d} fill="none" stroke="rgb(0 0 0 / 0.45)" strokeWidth="6.4" strokeLinecap="round" />
            <path d={w.d} fill="none" stroke={w.color} strokeWidth="4.6" strokeLinecap="round" />
            <path d={w.d} fill="none" stroke="#fff" strokeOpacity="0.38" strokeWidth="1.2" strokeLinecap="round" transform="translate(-0.7 -0.9)" />
            <path d={w.d} fill="none" stroke="transparent" strokeWidth="14" strokeLinecap="round" />
          </g>
        );
      }))}
    </>
  );
}

export function Wiring3D({ slug, variant = "detail", highlight, onWireTap, label, sceneClassName = "" }: {
  slug: MontageSlug;
  variant?: keyof typeof SIZES;
  /** Fils et composants mis en avant (étape choisie). */
  highlight?: string[];
  onWireTap?: (wireId: string) => void;
  label?: string;
  sceneClassName?: string;
}) {
  const scene = useMemo(() => SCENES[slug](), [slug]);
  const interactive = variant === "detail";
  const set = useMemo(() => new Set(highlight ?? []), [highlight]);
  const ctx = useMemo(() => ({ on: (id: string) => set.has(id), any: set.size > 0 }), [set]);
  const { bounds } = scene;
  const fit = fitFor(bounds);
  const size = SIZES[variant];

  const { scene: sceneRef, rig, handlers, onKey, reset } = useOrbit({
    rest: REST, enabled: interactive, idleSpin: false,
    onTap: (t) => {
      const id = (t as Element | null)?.closest?.("[data-wire]")?.getAttribute("data-wire");
      if (id) onWireTap?.(id);
    },
  });

  const world = (
    <div className="pointer-events-none absolute inset-0 [transform-style:preserve-3d]">
      <div className={`pointer-events-none absolute inset-0 [transform-style:preserve-3d] ${size.scale}`}>
        <div className="pointer-events-none absolute inset-0 [transform-style:preserve-3d]" style={{ transform: `scale(${fit})` }}>
          <div ref={rig} className="rig pointer-events-none"
               style={{ width: bounds.w, height: bounds.h, margin: `${-bounds.h / 2}px 0 0 ${-bounds.w / 2}px`, transform: `rotateX(${REST.rx}deg) rotateZ(${REST.rz}deg)` }}>
            <div className="pointer-events-none absolute -inset-10 rounded-[40%] bg-[var(--floor-shadow)] blur-2xl" style={{ transform: "translateZ(-30px)" }} />
            <div className="pointer-events-none absolute left-0 top-0 [transform-style:preserve-3d]" style={{ transform: `translate(${-bounds.x}px, ${-bounds.y}px)` }}>
              <HighlightContext.Provider value={ctx}>
                {scene.render()}
                <Wires wires={scene.wires} bounds={bounds} active={(id) => set.has(id)} anyActive={ctx.any} />
              </HighlightContext.Provider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!interactive) return <div aria-hidden="true" className={`scene board-static relative w-full ${size.scene} ${sceneClassName}`}>{world}</div>;

  return (
    <div className="relative">
      <div ref={sceneRef} tabIndex={0} role="group" aria-roledescription="schéma de câblage 3D interactif" aria-label={label}
           {...handlers} onKeyDown={onKey}
           className={`scene relative w-full cursor-grab touch-pan-y select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/60 active:cursor-grabbing ${size.scene} ${sceneClassName}`}>
        {world}
      </div>
      <button type="button" onClick={reset} aria-label="Recentrer la vue" title="Recentrer la vue"
              className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full border border-tint/10 bg-[var(--panel)]/80 text-muted backdrop-blur transition-colors hover:text-text active:scale-95">
        <RotateCcw size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
