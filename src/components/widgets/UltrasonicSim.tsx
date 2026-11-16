"use client";

import { useEffect, useRef, useState } from "react";
import { Radar } from "lucide-react";
import { WidgetFrame, Readout, range, well } from "./WidgetFrame";

const X0 = 96;            // face avant du capteur (coordonnée x du dessin)
const Y = 110;            // axe du capteur
const PX_PER_CM = 1.5;
const MAX_CM = 450;
const PERIOD_MS = 2600;
const f1 = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
const f0 = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
// Couleurs du thème (clair ou sombre) : onde émise en azur, écho en cuivre, anomalie en rouge.
const C = { out: "var(--primary-soft)", back: "var(--copper)", bad: "var(--signal)", ok: "var(--ok)", muted: "var(--muted)", text: "var(--text)", line: "var(--line-strong)" };

function arc(cx: number, r: number, dir: 1 | -1) {
  const a = (25 * Math.PI) / 180;
  const x = cx + dir * r * Math.cos(a);
  const dy = r * Math.sin(a);
  return `M ${x} ${Y - dy} A ${r} ${r} 0 0 ${dir === 1 ? 1 : 0} ${x} ${Y + dy}`;
}

export default function UltrasonicSim() {
  const [d, setD] = useState(120);
  const [temp, setTemp] = useState(20);
  const [angle, setAngle] = useState(0);
  const [phase, setPhase] = useState(0.35);
  const [log, setLog] = useState<string[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  // grandeurs physiques
  const v = 331.3 + 0.606 * temp;                 // m/s
  const echoUs = (2 * d * 1e4) / v;               // µs : aller-retour à la vitesse réelle
  const tooClose = d < 2;
  const outOfRange = d > 400;
  const tilted = Math.abs(angle) > 15;
  const valid = !tooClose && !outOfRange && !tilted;
  const arduinoCm = (echoUs * 0.0343) / 2;        // calcul d'Arduino : 343 m/s fixe
  const reason = valid ? "" : tooClose ? "Trop proche : en dessous de 2 cm, la mesure n'est pas fiable."
    : outOfRange ? "Hors portée : au-delà de 400 cm, l'écho est trop faible (pulseIn() atteint son délai)."
    : "Surface trop inclinée (plus de 15°) : l'onde est renvoyée ailleurs, l'écho ne revient pas au capteur.";

  const live = useRef({ valid, arduinoCm });
  useEffect(() => { live.current = { valid, arduinoCm }; });

  // animation de l'onde (désactivée si l'utilisateur préfère moins d'animations)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0; const t0 = performance.now();
    const tick = (now: number) => { setPhase(((now - t0) % PERIOD_MS) / PERIOD_MS); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // moniteur série simulé : une ligne par mesure, comme le programme de la leçon
  useEffect(() => {
    const id = setInterval(() => {
      const { valid: ok, arduinoCm: cm } = live.current;
      setLog((l) => [...l.slice(-3), ok ? `${f1(cm)} cm` : "Pas d'écho"]);
    }, 1300);
    return () => clearInterval(id);
  }, []);

  const ox = X0 + d * PX_PER_CM;
  const toCm = (clientX: number) => {
    const svg = svgRef.current; const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return d;
    const pt = svg.createSVGPoint(); pt.x = clientX; pt.y = 0;
    const x = pt.matrixTransform(ctm.inverse()).x;
    return Math.min(MAX_CM, Math.max(0, Math.round((x - X0) / PX_PER_CM)));
  };
  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { setD((x) => Math.min(MAX_CM, x + step)); e.preventDefault(); }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { setD((x) => Math.max(0, x - step)); e.preventDefault(); }
  };

  // fronts d'onde
  const out = phase < 0.5 ? phase / 0.5 : 1;
  const back = phase >= 0.5 ? (phase - 0.5) / 0.5 : 0;
  const span = ox - X0;
  const waves: { d: string; o: number; c: string }[] = [];
  if (phase < 0.5) {
    for (let i = 0; i < 3; i++) { const r = out * span - i * 16; if (r > 4) waves.push({ d: arc(X0, r, 1), o: 1 - i * 0.3, c: C.out }); }
  } else if (valid) {
    const sx = X0 + 2 * span;                       // source « miroir » de l'écho
    for (let i = 0; i < 3; i++) { const r = 2 * span - back * span - i * 16; if (r > 4 && r <= 2 * span) waves.push({ d: arc(sx, r, -1), o: 1 - i * 0.3, c: C.back }); }
  }
  const deflect = phase >= 0.5 && !valid && !tooClose && tilted;
  const deflectAng = (2 * angle * Math.PI) / 180;

  // chronogramme
  const echoW = Math.min(echoUs, 25000) / 25000 * 560;
  const ticks = Array.from({ length: 9 }, (_, i) => i * 50);

  return (
    <WidgetFrame icon={<Radar size={17} strokeWidth={1.75} />} title="Simulateur du HC-SR04 : mesure par écho"
                 hint="Simulation pédagogique : les valeurs sont calculées avec la formule de la leçon, pas lues sur un vrai capteur. Faites glisser le mur (ou utilisez les flèches du clavier).">
      <svg ref={svgRef} viewBox="0 0 800 230" className={`${well} h-auto w-full touch-pan-y select-none`}
           onPointerMove={(e) => { if (dragging.current) setD(toCm(e.clientX)); }}
           onPointerUp={(e) => { dragging.current = false; (e.currentTarget as SVGSVGElement).releasePointerCapture?.(e.pointerId); }}
           onPointerCancel={() => { dragging.current = false; }}
           role="img" aria-label={`Vue de dessus : le capteur à gauche, un mur à ${d} centimètres`}>
        <rect x={X0 + 2 * PX_PER_CM} y="188" width={398 * PX_PER_CM} height="6" fill={C.ok} opacity=".35" />
        <rect x={X0} y="188" width={2 * PX_PER_CM} height="6" fill={C.bad} opacity=".6" />
        {ticks.map((t) => (
          <g key={t}><line x1={X0 + t * PX_PER_CM} y1="194" x2={X0 + t * PX_PER_CM} y2="202" stroke={C.muted} />
            <text x={X0 + t * PX_PER_CM} y="216" textAnchor="middle" fontSize="11" fill={C.muted}>{t}</text></g>
        ))}
        <text x="792" y="216" textAnchor="end" fontSize="11" fill={C.muted}>cm</text>
        {/* capteur */}
        <rect x="40" y={Y - 38} width={X0 - 40} height="76" rx="6" fill="#1b6fb8" />
        <circle cx={X0 - 14} cy={Y - 18} r="13" fill="#b8bfc7" stroke="#14181b" strokeWidth="3" />
        <circle cx={X0 - 14} cy={Y + 18} r="13" fill="#b8bfc7" stroke="#14181b" strokeWidth="3" />
        <text x="58" y={Y - 14} fontSize="12" fill="#fff" textAnchor="middle" fontWeight="600">T</text>
        <text x="58" y={Y + 22} fontSize="12" fill="#fff" textAnchor="middle" fontWeight="600">R</text>
        {/* ondes */}
        {waves.map((w, i) => <path key={i} d={w.d} fill="none" stroke={w.c} strokeWidth="3" strokeLinecap="round" opacity={w.o} />)}
        {deflect && <line x1={ox} y1={Y} x2={ox - 90 * Math.cos(deflectAng)} y2={Y - 90 * Math.sin(deflectAng)} stroke={C.bad} strokeWidth="3" strokeDasharray="6 5" opacity={1 - back} />}
        {/* obstacle */}
        <g transform={`rotate(${angle} ${ox} ${Y})`}>
          <rect x={ox} y={Y - 55} width="14" height="110" rx="3" fill="var(--panel-2)" stroke={C.text} strokeOpacity=".55" strokeWidth="2" />
          {[-12, 0, 12].map((dy) => <line key={dy} x1={ox + 4} y1={Y + dy} x2={ox + 10} y2={Y + dy} stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" />)}
        </g>
        <rect x={ox - 16} y={Y - 65} width="48" height="130" fill="transparent" style={{ cursor: "ew-resize", touchAction: "none" }}
              tabIndex={0} role="slider" aria-label="Distance du mur en centimètres" aria-valuemin={0} aria-valuemax={MAX_CM} aria-valuenow={d}
              onKeyDown={onKey}
              onPointerDown={(e) => { dragging.current = true; svgRef.current?.setPointerCapture(e.pointerId); setD(toCm(e.clientX)); }} />
        <text x={Math.min(ox + 6, 700)} y="32" fontSize="14" fill={C.text} fontWeight="600" fontFamily="var(--font-geist-mono)">{f0(d)} cm</text>
        <line x1={X0} y1="44" x2={ox} y2="44" stroke={C.muted} strokeDasharray="4 4" />
      </svg>

      <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Readout label="Distance réelle" value={`${f0(d)} cm`} />
        <Readout label="Durée de l'écho" value={valid ? `${f0(echoUs)} µs` : "—"} tone={valid ? "text" : "muted"} />
        <Readout label="Lue par Arduino (343 m/s)" value={valid ? `${f1(arduinoCm)} cm` : "Pas d'écho"} tone={valid ? "ok" : "copper"} />
        <Readout label="Vitesse du son" value={`${f1(v)} m/s`} />
      </div>
      <p aria-live="polite" className={`mt-3 min-h-5 text-sm ${valid ? "text-ok-soft" : "text-copper"}`}>
        {valid ? (temp !== 20 ? `À ${temp} °C le son va à ${f1(v)} m/s : Arduino, qui calcule avec 343 m/s, se trompe de ${f1(Math.abs(arduinoCm - d))} cm.` : "Mesure valide.") : reason}
      </p>

      <div className={`${well} mt-4 grid gap-4 px-4 py-3.5 md:grid-cols-3`}>
        <label className="block text-sm">Distance du mur : <span className="tabular font-mono">{f0(d)} cm</span>
          <input type="range" min={0} max={MAX_CM} value={d} onChange={(e) => setD(Number(e.target.value))} className={range} /></label>
        <label className="block text-sm">Température de l&apos;air : <span className="tabular font-mono">{temp} °C</span>
          <input type="range" min={-10} max={50} value={temp} onChange={(e) => setTemp(Number(e.target.value))} className={range} /></label>
        <label className="block text-sm">Inclinaison de la surface : <span className="tabular font-mono">{angle}°</span>
          <input type="range" min={-45} max={45} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className={range} /></label>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-muted">Chronogramme</p>
          <svg viewBox="0 0 700 120" className={`${well} h-auto w-full`} role="img" aria-label="Signaux Trig et Echo dans le temps">
            <text x="8" y="38" fontSize="16" fill={C.muted}>Trig</text>
            <text x="8" y="98" fontSize="16" fill={C.muted}>Echo</text>
            <polyline points="60,44 90,44 90,22 104,22 104,44 640,44" fill="none" stroke={C.out} strokeWidth="2.5" />
            <text x="112" y="20" fontSize="14" fill={C.out}>10 µs (hors échelle)</text>
            {valid
              ? <polyline points={`60,104 140,104 140,80 ${140 + echoW},80 ${140 + echoW},104 640,104`} fill="none" stroke={C.back} strokeWidth="2.5" />
              : <polyline points="60,104 640,104" fill="none" stroke={C.back} strokeWidth="2.5" strokeDasharray="5 5" />}
            {valid && <text x={140 + echoW / 2} y="70" fontSize="15" fill={C.back} textAnchor="middle">{f0(echoUs)} µs</text>}
            {!valid && <text x="350" y="70" fontSize="15" fill={C.muted} textAnchor="middle">pas d&apos;impulsion Echo</text>}
            <text x="640" y="117" fontSize="13" fill={C.muted} textAnchor="end">échelle : 0 à 25 ms</text>
          </svg>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-muted">Moniteur série (simulé)</p>
          <pre aria-label="Moniteur série simulé" className="h-[120px] overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#070b14] px-4 py-3 font-mono text-sm leading-6 text-[#9fe0c2]">
            {log.length ? log.join("\n") : "…"}
          </pre>
        </div>
      </div>
    </WidgetFrame>
  );
}
