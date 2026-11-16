"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Footprints, Crosshair, ScanEye } from "lucide-react";
import { WidgetFrame, chip, range, well } from "./WidgetFrame";

const CX = 320, CY = 350;       // position du capteur (face vers le haut)
const PX_PER_M = 44;
const HALF_ANGLE = 55;          // demi-angle de détection (environ 110° au total)
const TICK_MS = 100;
const HIST = 300;               // 30 s d'historique
const BLOCK_MS = 2000;          // temps de blocage après retour à LOW

interface Pt { x: number; y: number }

// Couleurs du thème : zone en azur, déclenchement en cuivre (sortie HIGH).
const C = { zone: "var(--primary)", zoneLine: "var(--primary-soft)", hot: "var(--copper)", muted: "var(--muted)", text: "var(--text)", grid: "var(--line-strong)" };

function wedge(R: number) {
  const a = (HALF_ANGLE * Math.PI) / 180;
  const x1 = CX - R * Math.sin(a), x2 = CX + R * Math.sin(a), y = CY - R * Math.cos(a);
  return `M ${CX} ${CY} L ${x1} ${y} A ${R} ${R} 0 0 1 ${x2} ${y} Z`;
}

export default function PirSim() {
  const [pos, setPos] = useState<Pt>({ x: 150, y: 200 });
  const [rangeM, setRangeM] = useState(5);
  const [holdS, setHoldS] = useState(5);
  const [mode, setMode] = useState<"H" | "L">("H");
  const [walking, setWalking] = useState(false);
  const uid = useId();
  const [view, setView] = useState({ out: false, hist: [] as number[], inZone: false, motion: false, holdLeft: 0 });

  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const lastMove = useRef(0);
  const posRef = useRef(pos);
  const cfg = useRef({ rangeM, holdS, mode, walking });
  useEffect(() => { posRef.current = pos; cfg.current = { rangeM, holdS, mode, walking }; });
  const sim = useRef({ out: false, holdUntil: 0, blockUntil: 0, hist: [] as number[], dir: 1 });

  const moveTo = (p: Pt) => {
    const q = { x: Math.min(620, Math.max(20, p.x)), y: Math.min(CY - 16, Math.max(20, p.y)) };
    if (Math.hypot(q.x - posRef.current.x, q.y - posRef.current.y) > 1.2) lastMove.current = performance.now();
    setPos(q);
  };
  const toSvg = (cx: number, cy: number): Pt => {
    const svg = svgRef.current; const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return posRef.current;
    const pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy;
    const r = pt.matrixTransform(ctm.inverse());
    return { x: r.x, y: r.y };
  };

  useEffect(() => {
    const id = setInterval(() => {
      const now = performance.now();
      const c = cfg.current; const s = sim.current;
      if (c.walking) {                     // la personne marche en travers de la zone
        const p = posRef.current;
        let x = p.x + s.dir * 14;
        if (x > 570) { x = 570; s.dir = -1; } else if (x < 70) { x = 70; s.dir = 1; }
        lastMove.current = now;
        setPos({ x, y: p.y });
        posRef.current = { x, y: p.y };
      }
      const p = posRef.current;
      const dx = p.x - CX, dy = CY - p.y, r = Math.hypot(dx, dy);
      const theta = (Math.atan2(Math.abs(dx), dy) * 180) / Math.PI;
      const inZone = dy > 0 && r <= c.rangeM * PX_PER_M && theta <= HALF_ANGLE;
      const motion = inZone && now - lastMove.current < 400;

      if (s.out) {
        if (c.mode === "H" && motion) s.holdUntil = now + c.holdS * 1000;
        if (now >= s.holdUntil) { s.out = false; s.blockUntil = now + BLOCK_MS; }
      } else if (motion && now >= s.blockUntil) {
        s.out = true; s.holdUntil = now + c.holdS * 1000;
      }
      s.hist.push(s.out ? 1 : 0); if (s.hist.length > HIST) s.hist.shift();
      setView({ out: s.out, hist: [...s.hist], inZone, motion, holdLeft: s.out ? Math.max(0, (s.holdUntil - now) / 1000) : 0 });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const R = rangeM * PX_PER_M;
  const status = !view.inZone ? "La personne est hors de la zone de détection."
    : view.motion ? "Mouvement dans la zone : le PIR voit la chaleur se déplacer d'une zone à l'autre."
    : "La personne est dans la zone mais immobile : aucun changement, donc rien n'est détecté.";
  const histPts = view.hist.map((v, i) => `${(i / (HIST - 1)) * 580 + 10},${v ? 14 : 54}`).join(" ");

  return (
    <WidgetFrame icon={<ScanEye size={17} strokeWidth={1.75} />} title="Simulateur du PIR HC-SR501"
                 hint="Simulation pédagogique à échelle réduite : la durée Tx réelle va de 0,3 s à plusieurs minutes. Faites glisser la personne ou utilisez les flèches du clavier.">
      <svg ref={svgRef} viewBox="0 0 640 380" className={`${well} h-auto w-full touch-pan-y select-none`}
           onPointerMove={(e) => { if (dragging.current) moveTo(toSvg(e.clientX, e.clientY)); }}
           onPointerUp={(e) => { dragging.current = false; (e.currentTarget as SVGSVGElement).releasePointerCapture?.(e.pointerId); }}
           onPointerCancel={() => { dragging.current = false; }}
           role="img" aria-label="Vue de dessus d'une pièce : le capteur PIR en bas, sa zone de détection en éventail et une personne que l'on déplace">
        {[1, 2, 3, 4, 5, 6, 7].map((m) => <circle key={m} cx={CX} cy={CY} r={m * PX_PER_M} fill="none" stroke={C.grid} strokeDasharray="3 6" />)}
        {[1, 3, 5, 7].map((m) => <text key={m} x={CX + 6} y={CY - m * PX_PER_M + 12} fontSize="11" fill={C.muted} fontFamily="var(--font-geist-mono)">{m} m</text>)}
        <path d={wedge(R)} fill={view.out ? C.hot : C.zone} fillOpacity={view.out ? 0.26 : 0.12} stroke={view.out ? C.hot : C.zoneLine} strokeOpacity=".8" strokeWidth="2" style={{ transition: "fill .3s, stroke .3s" }} />
        {[-44, -22, 0, 22, 44].map((a) => {
          const r = (a * Math.PI) / 180;
          return <line key={a} x1={CX} y1={CY} x2={CX + R * Math.sin(r)} y2={CY - R * Math.cos(r)} stroke={C.zoneLine} strokeOpacity=".35" strokeDasharray="5 6" />;
        })}
        <rect x={CX - 30} y={CY} width="60" height="26" rx="5" fill="#2f8a57" />
        <path d={`M ${CX - 14} ${CY} A 14 14 0 0 1 ${CX + 14} ${CY} Z`} fill="#f4f4ef" />
        <text x={CX} y={CY + 18} fontSize="11" fill="#fff" textAnchor="middle">PIR</text>
        <g tabIndex={0} role="group" aria-label="Personne : déplacez-la avec les flèches du clavier" className="outline-none [&:focus-visible>circle:first-child]:stroke-[var(--primary)]" style={{ cursor: "grab", touchAction: "none" }}
           onKeyDown={(e) => {
             const d = e.shiftKey ? 24 : 10; const p = posRef.current;
             if (e.key === "ArrowLeft") moveTo({ x: p.x - d, y: p.y });
             else if (e.key === "ArrowRight") moveTo({ x: p.x + d, y: p.y });
             else if (e.key === "ArrowUp") moveTo({ x: p.x, y: p.y - d });
             else if (e.key === "ArrowDown") moveTo({ x: p.x, y: p.y + d });
             else return;
             e.preventDefault();
           }}
           onPointerDown={(e) => { dragging.current = true; svgRef.current?.setPointerCapture(e.pointerId); }}>
          <circle cx={pos.x} cy={pos.y} r="30" fill="transparent" stroke="transparent" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx={pos.x} cy={pos.y} r="15" fill={view.inZone ? C.hot : C.muted} stroke="var(--panel)" strokeWidth="2.5" />
          <circle cx={pos.x} cy={pos.y - 22} r="7" fill={view.inZone ? C.hot : C.muted} stroke="var(--panel)" strokeWidth="2.5" />
        </g>
      </svg>

      <p aria-live="polite" className={`mt-3 min-h-5 text-sm ${view.motion ? "text-copper" : "text-muted"}`}>{status}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setWalking((w) => !w)} aria-pressed={walking} className={chip(walking)}>
          <Footprints size={15} aria-hidden="true" /> {walking ? "Arrêter la marche" : "Faire marcher la personne"}
        </button>
        <button onClick={() => { setWalking(false); setPos({ x: 320, y: 200 }); posRef.current = { x: 320, y: 200 }; }} className={chip(false)}>
          <Crosshair size={15} aria-hidden="true" /> Placer au centre, immobile
        </button>
      </div>

      <div className={`${well} mt-4 grid gap-4 px-4 py-3.5 md:grid-cols-3`}>
        <label className="block text-sm">Portée (Sx) : <span className="tabular font-mono">{rangeM.toLocaleString("fr-FR")} m</span>
          <input type="range" min={3} max={7} step={0.5} value={rangeM} onChange={(e) => setRangeM(Number(e.target.value))} className={range} /></label>
        <label className="block text-sm">Durée à HIGH (Tx, démo) : <span className="tabular font-mono">{holdS} s</span>
          <input type="range" min={1} max={15} value={holdS} onChange={(e) => setHoldS(Number(e.target.value))} className={range} /></label>
        <fieldset className="text-sm">
          <legend>Mode du cavalier</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {([["H", "H : repeatable"], ["L", "L : single"]] as const).map(([k, l]) => (
              <label key={k} className={`${chip(mode === k)} cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/45`}><input type="radio" name={`pir-mode-${uid}`} checked={mode === k} onChange={() => setMode(k)} className="sr-only" />{l}</label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[200px_1fr]">
        <div className={`${well} px-3.5 py-3 text-sm`}>
          <p className="text-xs text-muted">Sortie OUT</p>
          <p className="tabular mt-1 flex items-center gap-2 font-mono text-lg">
            <span className={`inline-block h-3.5 w-3.5 rounded-full transition-[background-color,box-shadow] duration-300 ${view.out ? "bg-copper shadow-[0_0_14px_var(--copper)]" : "bg-line-strong"}`} aria-hidden="true" />
            {view.out ? "HIGH" : "LOW"}
          </p>
          <p className="mt-1 text-xs text-muted">{view.out ? `3,3 V · reste ${view.holdLeft.toFixed(1)} s` : "0 V"}</p>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-muted">Signal OUT sur les 30 dernières secondes</p>
          <svg viewBox="0 0 600 70" className={`${well} h-auto w-full`} role="img" aria-label="Historique du signal OUT">
            <text x="10" y="11" fontSize="10" fill={C.muted}>HIGH</text><text x="10" y="68" fontSize="10" fill={C.muted}>LOW</text>
            <polyline points={histPts} fill="none" stroke={C.hot} strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </WidgetFrame>
  );
}
