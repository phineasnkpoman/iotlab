"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { BoardEdges } from "./primitives";
import { MODELS, type BoardSlug } from "./models";

/*
 * Carte électronique en CSS 3D, manipulable.
 * - Glisser : la carte tourne et garde son élan au lâcher ; l'inclinaison résiste en bout de course.
 * - Toucher un composant (ou sa pastille) : il se soulève, un halo azur marque son emplacement.
 * - Clavier : flèches pour tourner, Échap pour désélectionner, Début ou double-clic pour recentrer.
 * - Au repos, la carte pivote très lentement ; tout mouvement automatique est coupé
 *   quand l'utilisateur demande moins d'animations.
 * Variante « card » : aperçu fixe et décoratif, sans interaction (vignettes du catalogue).
 */

type Variant = "hero" | "detail" | "card";

const RX_MIN = 18, RX_MAX = 82;
const rubber = (o: number, dim = 40, c = 0.55) => (o * dim * c) / (dim + c * Math.abs(o));
const band = (raw: number) => (raw < RX_MIN ? RX_MIN - rubber(RX_MIN - raw) : raw > RX_MAX ? RX_MAX + rubber(raw - RX_MAX) : raw);
const clampRx = (v: number) => Math.min(RX_MAX, Math.max(RX_MIN, v));

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

/** `sceneClassName` habille la zone de manipulation (fond, arrondi) sans toucher à la légende. */
export function Board3D({ slug, variant = "detail", sceneClassName = "rounded-[28px]" }: { slug: BoardSlug; variant?: Variant; sceneClassName?: string }) {
  const m = MODELS[slug];
  const interactive = variant !== "card";
  const scene = useRef<HTMLDivElement>(null);
  const rig = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const pointerInside = useRef(false);

  // État physique, hors React : mis à jour à chaque image sans provoquer de rendu.
  const st = useRef({
    rx: m.rest.rx, rxRaw: m.rest.rx, rz: m.rest.rz, vz: 0,
    tx: null as number | null, tz: null as number | null,
    drag: false, moved: false, sx: 0, sy: 0, lx: 0, ly: 0, lt: 0, last: 0,
    startPart: null as string | null, reduce: false, kick: () => {},
  });

  useEffect(() => {
    const el = scene.current, r = rig.current;
    if (!interactive || !el || !r) return;
    const s = st.current;
    s.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    s.last = performance.now();
    let raf = 0, visible = true;

    const write = () => { r.style.transform = `rotateX(${s.rx.toFixed(2)}deg) rotateZ(${s.rz.toFixed(2)}deg)`; };
    const step = (now: number) => {
      if (!s.drag) {
        if (s.tz !== null && s.tx !== null) {
          s.rz += (s.tz - s.rz) * 0.12;
          s.rxRaw += (s.tx - s.rxRaw) * 0.12;
          if (Math.abs(s.tz - s.rz) < 0.05 && Math.abs(s.tx - s.rxRaw) < 0.05) { s.rz = s.tz; s.rxRaw = s.tx; s.tz = s.tx = null; }
        } else {
          s.rz += s.vz;
          s.vz *= 0.95;
          if (Math.abs(s.vz) < 0.01) s.vz = 0;
          s.rxRaw += (clampRx(s.rxRaw) - s.rxRaw) * 0.18;
          if (!s.reduce && s.vz === 0 && !pointerInside.current && now - s.last > 3500) s.rz += 0.06;
        }
        s.rx = band(s.rxRaw);
      }
      write();
      const settled = s.vz === 0 && s.tz === null && Math.abs(clampRx(s.rxRaw) - s.rxRaw) < 0.01;
      raf = visible && !(s.reduce && settled && !s.drag) ? requestAnimationFrame(step) : 0;
    };
    s.kick = () => { if (!raf && visible) raf = requestAnimationFrame(step); };

    // Rien n'est calculé quand la carte est hors de l'écran.
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) s.kick(); });
    io.observe(el);
    write();
    s.kick();
    return () => { io.disconnect(); cancelAnimationFrame(raf); raf = 0; };
  }, [interactive]);

  const partAt = (t: EventTarget | null) => (t as HTMLElement | null)?.closest?.("[data-part]")?.getAttribute("data-part") ?? null;

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const s = st.current;
    Object.assign(s, { drag: true, moved: false, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, lt: performance.now(), vz: 0, tx: null, tz: null, startPart: partAt(e.target) });
    s.rxRaw = s.rx;
    s.kick();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.drag) return;
    if (!s.moved) {
      if (Math.hypot(e.clientX - s.sx, e.clientY - s.sy) < 6) return; // simple clic, pas encore un glisser
      s.moved = true;
      scene.current?.setPointerCapture(e.pointerId);
    }
    const now = performance.now();
    const dt = Math.max(1, now - s.lt);
    const dz = (e.clientX - s.lx) * 0.42;
    s.rz += dz;
    s.rxRaw -= (e.clientY - s.ly) * 0.3;
    s.rx = band(s.rxRaw);
    s.vz = (dz / dt) * 16; // vitesse en degrés par image, reprise telle quelle au lâcher
    s.lx = e.clientX; s.ly = e.clientY; s.lt = now; s.last = now;
    if (rig.current) rig.current.style.transform = `rotateX(${s.rx.toFixed(2)}deg) rotateZ(${s.rz.toFixed(2)}deg)`;
  };
  const endDrag = (e: React.PointerEvent, cancelled = false) => {
    const s = st.current;
    if (!s.drag) return;
    s.drag = false;
    s.last = performance.now();
    if (!s.moved && !cancelled && s.startPart) { const p = s.startPart; setSelected((cur) => (cur === p ? null : p)); }
    if (s.moved) {
      if (s.last - s.lt > 90 || s.reduce) s.vz = 0; // pointeur arrêté avant le lâcher : pas d'élan
      s.vz = Math.max(-14, Math.min(14, s.vz));
      if (scene.current?.hasPointerCapture(e.pointerId)) scene.current.releasePointerCapture(e.pointerId);
    }
    s.kick();
  };

  const reset = () => {
    const s = st.current;
    s.tz = s.rz + ((((m.rest.rz - s.rz) % 360) + 540) % 360 - 180); // chemin le plus court vers l'angle de repos
    s.tx = m.rest.rx;
    s.vz = 0;
    s.last = performance.now();
    s.kick();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const s = st.current;
    const turn = (dz: number, dx: number) => {
      s.tz = (s.tz ?? s.rz) + dz;
      s.tx = clampRx((s.tx ?? s.rxRaw) + dx);
      s.vz = 0; s.last = performance.now(); s.kick();
      e.preventDefault();
    };
    if (e.key === "ArrowLeft") turn(-15, 0);
    else if (e.key === "ArrowRight") turn(15, 0);
    else if (e.key === "ArrowUp") turn(0, -8);
    else if (e.key === "ArrowDown") turn(0, 8);
    else if (e.key === "Home") { reset(); e.preventDefault(); }
    else if (e.key === "Escape") setSelected(null);
  };

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
           onPointerDown={onPointerDown} onPointerMove={onPointerMove}
           onPointerUp={(e) => endDrag(e)} onPointerCancel={(e) => endDrag(e, true)}
           onPointerEnter={() => { pointerInside.current = true; }}
           onPointerLeave={() => { pointerInside.current = false; setHovered(null); }}
           onPointerOver={(e) => { if (!st.current.drag) setHovered(partAt(e.target)); }}
           onDoubleClick={reset} onKeyDown={onKeyDown}
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
