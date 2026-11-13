"use client";

import { createContext, useContext, useId, type CSSProperties, type ReactNode } from "react";
import { BLACK, Box, METAL, PITCH } from "@/components/fx/board3d/primitives";
import { BB_D, BB_H, BB_W, FLOOR, P, ROW_Y, WIRE_Z, railHasHole, type Pt } from "./geometry";

/*
 * Composants des schémas de câblage, en CSS 3D, à l'échelle des cartes.
 * Chaque composant porte un identifiant : quand l'étape qui le concerne est choisie,
 * un halo azur s'allume sous lui (voir HighlightContext).
 */

/** Étape active : les composants et fils qu'elle concerne sont mis en avant, le reste s'estompe. */
export const HighlightContext = createContext<{ on: (id: string) => boolean; any: boolean }>({ on: () => false, any: false });
const useOn = (id?: string) => { const h = useContext(HighlightContext); return Boolean(id && h.on(id)); };

/** Décale ses enfants en hauteur, sans casser la 3D. */
export function Z({ z, children, style }: { z: number; children: ReactNode; style?: CSSProperties }) {
  return <div className="pointer-events-none absolute left-0 top-0 [transform-style:preserve-3d]" style={{ transform: `translateZ(${z}px)`, ...style }}>{children}</div>;
}

/** Halo de mise en avant posé sous un composant. */
function Halo({ x, y, w, d, z, on }: { x: number; y: number; w: number; d: number; z: number; on: boolean }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute rounded-[10px] bg-primary blur-[7px] transition-opacity duration-500"
          style={{ left: x - 6, top: y - 6, width: w + 12, height: d + 12, transform: `translateZ(${z + 0.6}px)`, opacity: on ? 0.8 : 0 }} />
  );
}

/** Halo seul, pour mettre en avant une zone (une carte, par exemple). */
export function Spot({ id, x, y, w, d, z }: { id: string; x: number; y: number; w: number; d: number; z: number }) {
  return <Halo x={x} y={y} w={w} d={d} z={z} on={useOn(id)} />;
}

/**
 * Cylindre vertical : un tube de facettes verticales, éclairées selon leur orientation,
 * fermé par un disque au sommet. Les facettes qui tournent le dos sont masquées.
 */
export function Cyl({ x, y, d, h, color, cap, z = 0, n = 16, capChildren, className }: {
  x: number; y: number; d: number; h: number; color: string; cap: string; z?: number; n?: number; capChildren?: ReactNode; className?: string;
}) {
  const w = d * Math.sin(Math.PI / n) + 0.6, r = (d / 2) * Math.cos(Math.PI / n);
  return (
    <div className={`pointer-events-none absolute [transform-style:preserve-3d] ${className ?? ""}`} style={{ left: x, top: y, transform: `translateZ(${z}px)` }}>
      {Array.from({ length: n }, (_, i) => {
        const a = (360 / n) * i;
        const light = Math.cos(((a - 40) * Math.PI) / 180); // lumière face au visiteur, un peu à gauche
        const shade = light > 0 ? `color-mix(in srgb, ${color}, white ${Math.round(light * 30)}%)` : `color-mix(in srgb, ${color}, black ${Math.round(-light * 48)}%)`;
        return (
          <span key={i} className="absolute [backface-visibility:hidden]" style={{ left: -w / 2, top: 0, width: w, height: h, transformOrigin: "50% 0", background: shade,
            transform: `rotateZ(${a}deg) translateY(${r}px) translateZ(${h}px) rotateX(-90deg)` }} />
        );
      })}
      <span className="absolute overflow-hidden rounded-full" style={{ left: -d / 2, top: -d / 2, width: d, height: d, transform: `translateZ(${h}px)`, background: cap }}>{capChildren}</span>
    </div>
  );
}

/** Patte métallique verticale qui entre dans la platine. */
const Leg = ({ p, h }: { p: Pt; h: number }) => (
  <Z z={p.z}><Box x={p.x - 1.2} y={p.y - 1.2} w={2.4} d={2.4} h={h} {...METAL} radius={0} /></Z>
);

/* ---------- Platine d'essai ---------- */

export function Breadboard({ x, y, id = "bb" }: { x: number; y: number; id?: string }) {
  const pid = useId().replace(/:/g, "");
  const on = useOn(id);
  const railGroups = [1, 7, 13, 19, 25];
  return (
    <>
      <Halo x={x} y={y} w={BB_W} d={BB_D} z={FLOOR} on={on} />
      <Z z={FLOOR}>
        <Box x={x} y={y} w={BB_W} d={BB_D} h={BB_H} top="linear-gradient(160deg,#f7f8fa,#e4e8ed)" side="#d8dde3" shade="#bcc3cc" radius={6}
             topContent={
               <svg viewBox={`0 0 ${BB_W} ${BB_D}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
                 <defs>
                   <pattern id={`h${pid}`} x={P / 2} y={P / 2} width={P} height={P} patternUnits="userSpaceOnUse">
                     <rect x={P / 2 - 1.9} y={P / 2 - 1.9} width="3.8" height="3.8" rx="0.7" fill="#3b4048" />
                   </pattern>
                 </defs>
                 {/* Rails d'alimentation : bleu = −, rouge = + */}
                 <g strokeWidth="1.2" strokeLinecap="round">
                   <line x1={1.6 * P} x2={31.4 * P} y1={0.55 * P} y2={0.55 * P} stroke="#3b6fd8" />
                   <line x1={1.6 * P} x2={31.4 * P} y1={3.0 * P} y2={3.0 * P} stroke="#d94848" />
                   <line x1={1.6 * P} x2={31.4 * P} y1={15.0 * P} y2={15.0 * P} stroke="#d94848" />
                   <line x1={1.6 * P} x2={31.4 * P} y1={17.45 * P} y2={17.45 * P} stroke="#3b6fd8" />
                 </g>
                 {(["t-", "t+", "b+", "b-"] as const).flatMap((r) => railGroups.map((c) => (
                   <rect key={`${r}${c}`} x={(c + 0.5) * P} y={(ROW_Y[r] - 0.5) * P} width={5 * P} height={P} fill={`url(#h${pid})`} />
                 )))}
                 <rect x={1.5 * P} y={3.5 * P} width={30 * P} height={5 * P} fill={`url(#h${pid})`} />
                 <rect x={1.5 * P} y={9.5 * P} width={30 * P} height={5 * P} fill={`url(#h${pid})`} />
                 <rect x={1.5 * P} y={8.72 * P} width={30 * P} height={0.56 * P} rx="1" fill="#d3d8de" />
                 <g fill="#8b929c" fontSize="5.2" fontFamily="var(--font-geist-mono), monospace" textAnchor="middle">
                   {[1, 5, 10, 15, 20, 25, 30].map((c) => <text key={c} x={(c + 1) * P} y={3.38 * P}>{c}</text>)}
                   {(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"] as const).map((r) => <text key={r} x={0.85 * P} y={ROW_Y[r] * P + 1.8}>{r}</text>)}
                   <text x={0.85 * P} y={1.3 * P + 1.8} fill="#3b6fd8">−</text><text x={0.85 * P} y={2.3 * P + 1.8} fill="#d94848">+</text>
                   <text x={0.85 * P} y={15.7 * P + 1.8} fill="#d94848">+</text><text x={0.85 * P} y={16.7 * P + 1.8} fill="#3b6fd8">−</text>
                 </g>
               </svg>
             } />
      </Z>
    </>
  );
}
export { railHasHole };

/* ---------- Composants discrets ---------- */

const LED_COLORS = {
  red: { color: "#d42a31", cap: "radial-gradient(circle at 36% 34%,#fff 0 7%,#ff6b70 22%,#c4161d 70%)", glow: "rgb(255 60 70 / 0.85)" },
  green: { color: "#1f9c58", cap: "radial-gradient(circle at 36% 34%,#fff 0 7%,#6cf0a5 22%,#13834a 70%)", glow: "rgb(70 230 140 / 0.8)" },
  yellow: { color: "#d9a51c", cap: "radial-gradient(circle at 36% 34%,#fff 0 7%,#ffe17a 22%,#c08b0b 70%)", glow: "rgb(255 205 60 / 0.85)" },
} as const;

/**
 * LED de 5 mm : patte longue (anode +) en `a`, patte courte (cathode −) en `c`.
 * `light` : "blink" clignote, "press" s'allume avec le bouton animé, "motion" avec le détecteur.
 */
export function Led({ id, a, c, color = "red", light }: { id: string; a: Pt; c: Pt; color?: keyof typeof LED_COLORS; light?: "blink" | "press" | "motion" | "on" }) {
  const on = useOn(id);
  const k = LED_COLORS[color];
  const cx = (a.x + c.x) / 2, cy = (a.y + c.y) / 2, leg = 16;
  const anim = light === "blink" ? "led-blink" : light === "press" ? "led-press" : light === "motion" ? "led-motion" : "";
  return (
    <>
      <Halo x={cx - 13} y={cy - 13} w={26} d={26} z={a.z} on={on} />
      <Leg p={a} h={leg} /><Leg p={c} h={leg - 3} />
      <Cyl x={cx} y={cy} d={25} h={4} z={a.z + leg} color={k.color} cap={k.cap} />
      <Cyl x={cx} y={cy} d={21} h={22} z={a.z + leg + 4} color={k.color} cap={k.cap} />
      {light && (
        <span aria-hidden="true" className={`pointer-events-none absolute rounded-full ${anim}`}
              style={{ left: cx - 34, top: cy - 34, width: 68, height: 68, transform: `translateZ(${a.z + leg + 14}px)`, background: `radial-gradient(circle, ${k.glow}, transparent 68%)` }} />
      )}
    </>
  );
}

/** Code couleur des résistances (deux chiffres, multiplicateur, tolérance). */
export const BANDS = { "220": ["#d0312d", "#d0312d", "#7b4a26", "#c9a227"], "330": ["#e2732b", "#e2732b", "#7b4a26", "#c9a227"], "10k": ["#7b4a26", "#1a1a1a", "#e2732b", "#c9a227"] } as const;

/** Résistance couchée entre deux trous d'une même rangée. */
export function Resistor({ id, a, b, value = "220" }: { id: string; a: Pt; b: Pt; value?: keyof typeof BANDS }) {
  const on = useOn(id);
  const x1 = Math.min(a.x, b.x), x2 = Math.max(a.x, b.x), y = a.y, len = 30, cx = (x1 + x2) / 2, lift = 7;
  const bands = BANDS[value];
  const body = `linear-gradient(90deg, transparent 0 22%, ${bands[0]} 22% 30%, transparent 30% 38%, ${bands[1]} 38% 46%, transparent 46% 54%, ${bands[2]} 54% 62%, transparent 62% 76%, ${bands[3]} 76% 84%, transparent 84%), linear-gradient(180deg,#f0dcb4,#cdb281)`;
  return (
    <>
      <Halo x={x1 - 4} y={y - 8} w={x2 - x1 + 8} d={16} z={a.z} on={on} />
      <Leg p={a} h={lift} /><Leg p={b} h={lift} />
      <Z z={a.z + lift}>
        <Box x={x1 - 1} y={y - 1} w={cx - len / 2 - x1 + 1} d={2} h={2} {...METAL} radius={0} />
        <Box x={cx + len / 2} y={y - 1} w={x2 - cx - len / 2 + 1} d={2} h={2} {...METAL} radius={0} />
        <Box x={cx - len / 2} y={y - 5} w={len} d={10} h={9} top={body} side="#c7ab78" shade="#a68a5c" radius={5} />
      </Z>
    </>
  );
}

/** Bouton poussoir 6 x 6 mm à cheval sur la rainure centrale : pattes en (c, e), (c+2, e), (c, f), (c+2, f). */
export function PushButton({ id, legs, color = "#2b68ea", animate = false }: { id: string; legs: [Pt, Pt, Pt, Pt]; color?: string; animate?: boolean }) {
  const on = useOn(id);
  const xs = legs.map((l) => l.x), ys = legs.map((l) => l.y);
  const x1 = Math.min(...xs) - 4, x2 = Math.max(...xs) + 4, y1 = Math.min(...ys) - 4, y2 = Math.max(...ys) + 4;
  const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, z = legs[0].z + 2;
  return (
    <>
      <Halo x={x1} y={y1} w={x2 - x1} d={y2 - y1} z={legs[0].z} on={on} />
      {legs.map((l, i) => <Leg key={i} p={l} h={2} />)}
      <Z z={z}><Box x={x1} y={y1} w={x2 - x1} d={y2 - y1} h={12} {...BLACK} radius={3} topContent={<span className="absolute inset-[3px] rounded-[2px] bg-[linear-gradient(135deg,#d7dde5,#8f9aa8)]" />} /></Z>
      <div className={`pointer-events-none absolute left-0 top-0 [transform-style:preserve-3d] ${animate ? "btn-press" : ""}`}>
        <Cyl x={cx} y={cy} d={17} h={9} z={z + 12} color={color} cap={`radial-gradient(circle at 38% 36%,#ffffff55 0 10%,${color} 40%,#123a8f)`} />
      </div>
    </>
  );
}

/** Potentiomètre rotatif : trois pattes (GND, signal, VCC) et un bouton qui tourne. */
export function Pot({ id, legs, animate = false }: { id: string; legs: [Pt, Pt, Pt]; animate?: boolean }) {
  const on = useOn(id);
  const cx = legs[1].x, y0 = legs[1].y, z = legs[0].z;
  return (
    <>
      <Halo x={cx - 26} y={y0 - 46} w={52} d={52} z={z} on={on} />
      {legs.map((l, i) => <Leg key={i} p={l} h={4} />)}
      <Z z={z + 4}><Box x={cx - 24} y={y0 - 44} w={48} d={46} h={18} top="linear-gradient(135deg,#2f6fd6,#1b3f8f)" side="#1f4ba5" shade="#163679" radius={4} /></Z>
      <Cyl x={cx} y={y0 - 21} d={30} h={8} z={z + 22} color="#c3cad3" cap="radial-gradient(circle at 40% 38%,#ffffff,#c4ccd6 70%)" />
      <Cyl x={cx} y={y0 - 21} d={20} h={16} z={z + 30} color="#2c3038" n={12} cap="radial-gradient(circle at 40% 38%,#5b616b,#1d2026 70%)"
           className={animate ? "knob-sweep" : undefined}
           capChildren={<span className="absolute left-1/2 top-[2px] h-[8px] w-[2.5px] -translate-x-1/2 rounded-full bg-white/85" />} />
    </>
  );
}

/** Buzzer piézo : patte + en `plus`, patte − en `minus`. */
export function Buzzer({ id, plus, minus, sound = false }: { id: string; plus: Pt; minus: Pt; sound?: boolean }) {
  const on = useOn(id);
  const cx = (plus.x + minus.x) / 2, cy = plus.y, z = plus.z;
  return (
    <>
      <Halo x={cx - 28} y={cy - 28} w={56} d={56} z={z} on={on} />
      <Leg p={plus} h={3} /><Leg p={minus} h={3} />
      <Cyl x={cx} y={cy} d={54} h={36} z={z + 3} color="#24272d" n={20}
           cap="radial-gradient(circle at 50% 50%,#05060a 0 9%,#24272e 10% 60%,#17191e 61%)"
           capChildren={<span className="absolute left-[16%] top-[44%] font-mono text-[8px] text-white/60">+</span>} />
      {sound && [0, 1, 2].map((i) => (
        <span key={i} aria-hidden="true" className="sound-ring pointer-events-none absolute rounded-full border-2 border-primary/70"
              style={{ left: cx - 30, top: cy - 30, width: 60, height: 60, transform: `translateZ(${z + 42}px)`, animationDelay: `${i * 0.5}s` }} />
      ))}
    </>
  );
}

/* ---------- Modules ---------- */

/** Pièce verticale, face avant tournée vers le sud (vers le visiteur au repos). */
function Upright({ x, y, w, d, h, z, top, side, shade, front }: { x: number; y: number; w: number; d: number; h: number; z: number; top: string; side: string; shade: string; front: ReactNode }) {
  return <Z z={z}><Box x={x} y={y} w={w} d={d} h={h} top={top} side={side} shade={shade} radius={1} south={front} /></Z>;
}

/** Capteur à ultrasons HC-SR04 planté dans la platine : broches VCC, TRIG, ECHO, GND. */
export function HcSr04({ id, pins, waves = false }: { id: string; pins: [Pt, Pt, Pt, Pt]; waves?: boolean }) {
  const on = useOn(id);
  const cx = (pins[0].x + pins[3].x) / 2, y = pins[0].y, z = pins[0].z, W = 200, H = 88, lift = 10;
  return (
    <>
      <Halo x={cx - W / 2} y={y - 6} w={W} d={14} z={z} on={on} />
      {pins.map((p, i) => <Leg key={i} p={p} h={lift} />)}
      <Upright x={cx - W / 2} y={y - 3} w={W} d={6} h={H} z={z + lift} top="#1c4f97" side="#1d58a8" shade="#143f7a"
               front={<span className="absolute inset-0 bg-[linear-gradient(180deg,#2464bf,#1b4f99)]">
                 <span className="absolute left-1/2 top-[6px] h-[10px] w-[34px] -translate-x-1/2 rounded-[3px] bg-[linear-gradient(180deg,#e3e8ef,#9ba7b7)]" />
                 <span className="absolute bottom-[4px] left-1/2 -translate-x-1/2 font-mono text-[6.5px] tracking-[0.18em] text-white/70">VCC TRIG ECHO GND</span>
               </span>} />
      {/* Les deux transducteurs : cylindres couchés, tournés vers l'avant */}
      {[-50, 50].map((dx) => (
        <div key={dx} className="pointer-events-none absolute left-0 top-0 [transform-style:preserve-3d]"
             style={{ transform: `translate3d(${cx + dx}px, ${y + 3}px, ${z + lift + H / 2 + 4}px) rotateX(-90deg)` }}>
          <Cyl x={0} y={0} d={72} h={42} color="#c9d0d9" n={20}
               cap="radial-gradient(circle,#2a2f36 0 54%,#9aa4b1 56% 62%,#d9dee5 64%)"
               capChildren={<span className="absolute inset-[24%] rounded-full bg-[repeating-linear-gradient(45deg,#3b414a_0_2px,#1d2127_2px_4px)]" />} />
        </div>
      ))}
      {waves && [0, 1, 2].map((i) => (
        <span key={i} aria-hidden="true" className="us-wave pointer-events-none absolute rounded-t-full border-2 border-b-0 border-primary/70"
              style={{ left: cx - 70, top: y + 60, width: 140, height: 70, transform: `translateZ(${z + 2}px)`, animationDelay: `${i * 0.6}s` }} />
      ))}
    </>
  );
}

/** Capteur de température et d'humidité DHT22 planté dans la platine : VCC, DATA, NC, GND. */
export function Dht22({ id, pins }: { id: string; pins: [Pt, Pt, Pt, Pt] }) {
  const on = useOn(id);
  const cx = (pins[0].x + pins[3].x) / 2, y = pins[0].y, z = pins[0].z, W = 68, H = 106, D = 30, lift = 8;
  return (
    <>
      <Halo x={cx - W / 2} y={y - D / 2} w={W} d={D} z={z} on={on} />
      {pins.map((p, i) => <Leg key={i} p={p} h={lift} />)}
      <Upright x={cx - W / 2} y={y - D / 2} w={W} d={D} h={H} z={z + lift} top="#f2f3f0" side="#e9ebe6" shade="#c9ccc4"
               front={<span className="absolute inset-[5px] rounded-[2px] bg-[radial-gradient(circle,#9aa09a_0_1.6px,transparent_2px)] [background-size:7px_7px]" />} />
    </>
  );
}

/** Servomoteur SG90 posé sur la table ; le palonnier balaie 0 à 180° si `sweep`. */
export function Servo({ id, x, y, sweep = false }: { id: string; x: number; y: number; sweep?: boolean }) {
  const on = useOn(id);
  const W = 100, D = 54, z = FLOOR;
  const blue = { top: "linear-gradient(135deg,#3a7bd5cc,#1e4fa3cc)", side: "#2a62bdcc", shade: "#1a4590cc" };
  return (
    <>
      <Halo x={x - 22} y={y} w={W + 44} d={D} z={z} on={on} />
      <Z z={z}><Box x={x} y={y} w={W} d={D} h={92} {...blue} radius={2} /></Z>
      <Z z={z + 70}><Box x={x - 22} y={y} w={W + 44} d={D} h={8} {...blue} radius={2} /></Z>
      <Cyl x={x + 26} y={y + D / 2} d={44} h={10} z={z + 92} color="#2a62bd" cap="linear-gradient(135deg,#3a7bd5,#1e4fa3)" />
      <div className={`pointer-events-none absolute left-0 top-0 [transform-style:preserve-3d] ${sweep ? "servo-sweep" : ""}`}
           style={{ transformOrigin: `${x + 26}px ${y + D / 2}px` }}>
        <Z z={z + 102}><Box x={x + 26 - 8} y={y + D / 2 - 8} w={84} d={16} h={5} top="linear-gradient(180deg,#ffffff,#d9dde3)" side="#e3e6ea" shade="#b8bec7" radius={8} /></Z>
      </div>
    </>
  );
}
/** Sortie du câble du servomoteur (marron, rouge, orange) côté ouest du boîtier. */
export const servoCable = (x: number, y: number): [Pt, Pt, Pt] =>
  [0, 1, 2].map((i) => ({ x: x - 2, y: y + 19 + i * 8, z: WIRE_Z, dir: [-1, 0] as [number, number] })) as [Pt, Pt, Pt];

/** Écran LCD 16 x 2 avec adaptateur I2C : quatre broches GND, VCC, SDA, SCL sur le bord ouest. */
export function Lcd1602({ id, x, y, lines }: { id: string; x: number; y: number; lines: [string, string] }) {
  const on = useOn(id);
  const W = 358, D = 161, z = FLOOR + 10;
  return (
    <>
      <Halo x={x} y={y} w={W} d={D} z={FLOOR} on={on} />
      {[[14, 14], [W - 14, 14], [14, D - 14], [W - 14, D - 14]].map(([sx, sy]) => (
        <Cyl key={`${sx}-${sy}`} x={x + sx} y={y + sy} d={12} h={10} z={FLOOR} color="#b9c0ca" n={10} cap="#d8dde4" />
      ))}
      <Z z={z}>
        <Box x={x} y={y} w={W} d={D} h={6} top="linear-gradient(140deg,#1f7a4a,#135b35)" side="#176341" shade="#0e4428" radius={4}
             topContent={<svg viewBox={`0 0 ${W} ${D}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
               <g fill="#0e4428" stroke="#d9a441" strokeWidth="1.6">{[[14, 14], [W - 14, 14], [14, D - 14], [W - 14, D - 14]].map(([a, b]) => <circle key={`${a}${b}`} cx={a} cy={b} r="6" />)}</g>
               <g fill="rgb(255 255 255 / 0.72)" fontFamily="var(--font-geist-mono), monospace" fontSize="6.5">
                 <text x="30" y="44">GND</text><text x="30" y="55.4">VCC</text><text x="30" y="66.8">SDA</text><text x="30" y="78.2">SCL</text>
               </g>
             </svg>} />
      </Z>
      <Z z={z + 6}>
        <Box x={x + 14} y={y + 34} w={PITCH} d={4 * PITCH} h={10} {...BLACK} radius={1}
             topStyle={{ backgroundImage: "radial-gradient(circle,#e8c15c 0 1.9px,transparent 2.4px)", backgroundSize: `${PITCH}px ${PITCH}px` }} />
        <Box x={x + 54} y={y + 26} w={280} d={108} h={12} top="linear-gradient(180deg,#24272d,#111317)" side="#1b1d22" shade="#0b0c0f" radius={3}
             topContent={
               <span className="absolute inset-x-[16px] inset-y-[22px] flex flex-col justify-center gap-[6px] rounded-[2px] bg-[linear-gradient(180deg,#3f6fe0,#2b55c2)] px-[10px] shadow-[inset_0_0_10px_rgb(0_0_0/0.45)]">
                 {lines.map((l, i) => (
                   <span key={i} className="block whitespace-pre font-mono text-[17px] font-medium leading-none tracking-[0.12em] text-[#eaf2ff] [text-shadow:0_0_6px_rgb(234_242_255/0.6)]">{l.padEnd(16, " ").slice(0, 16)}</span>
                 ))}
               </span>
             } />
      </Z>
    </>
  );
}
/** Broches de l'écran I2C dans le repère monde. */
export const lcdPins = (x: number, y: number) => Object.fromEntries(["GND", "VCC", "SDA", "SCL"].map((n, i) => [n, {
  x: x + 14 + PITCH / 2, y: y + 34 + (i + 0.5) * PITCH, z: FLOOR + 26, dir: [-1, 0] as [number, number],
}])) as Record<"GND" | "VCC" | "SDA" | "SCL", Pt>;

/** Détecteur de mouvement infrarouge (PIR) : dôme de Fresnel ; broches VCC, OUT, GND au nord. */
export function Pir({ id, x, y }: { id: string; x: number; y: number }) {
  const on = useOn(id);
  const W = 143, D = 107, z = FLOOR + 6;
  return (
    <>
      <Halo x={x} y={y} w={W} d={D} z={FLOOR} on={on} />
      <Z z={z}><Box x={x} y={y} w={W} d={D} h={5} top="linear-gradient(140deg,#1f7a4a,#135b35)" side="#176341" shade="#0e4428" radius={4} /></Z>
      <Z z={z + 5}><Box x={x + W / 2 - 1.5 * PITCH} y={y + 4} w={3 * PITCH} d={PITCH} h={10} {...BLACK} radius={1}
                        topStyle={{ backgroundImage: "radial-gradient(circle,#e8c15c 0 1.9px,transparent 2.4px)", backgroundSize: `${PITCH}px ${PITCH}px` }} /></Z>
      <Cyl x={x + W / 2} y={y + D / 2 + 8} d={92} h={34} z={z + 5} n={24} color="#e9ebe7"
           cap="radial-gradient(circle at 42% 38%,#ffffff,#e4e6e1 55%,#c8ccc4)"
           capChildren={<span className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0_12%,rgb(0_0_0/0.06)_12%_13%,transparent_13%_25%,rgb(0_0_0/0.06)_25%_26%,transparent_26%_37%,rgb(0_0_0/0.06)_37%_38%,transparent_38%_50%,rgb(0_0_0/0.06)_50%_51%,transparent_51%_62%,rgb(0_0_0/0.06)_62%_63%,transparent_63%_75%,rgb(0_0_0/0.06)_75%_76%,transparent_76%_87%,rgb(0_0_0/0.06)_87%_88%,transparent_88%)]" />} />
    </>
  );
}
export const pirPins = (x: number, y: number) => Object.fromEntries(["VCC", "OUT", "GND"].map((n, i) => [n, {
  x: x + 143 / 2 + (i - 1) * PITCH, y: y + 4 + PITCH / 2, z: FLOOR + 21, dir: [0, -1] as [number, number],
}])) as Record<"VCC" | "OUT" | "GND", Pt>;

/** Module photorésistance (LDR) : la cellule à l'est, quatre broches VCC, GND, DO, AO à l'ouest. */
export function LdrModule({ id, x, y }: { id: string; x: number; y: number }) {
  const on = useOn(id);
  const W = 143, D = 63, z = FLOOR + 6;
  return (
    <>
      <Halo x={x} y={y} w={W} d={D} z={FLOOR} on={on} />
      <Z z={z}><Box x={x} y={y} w={W} d={D} h={5} top="linear-gradient(140deg,#2a62bd,#1a4590)" side="#1f50a3" shade="#163679" radius={3} /></Z>
      <Z z={z + 5}>
        <Box x={x + 6} y={y + D / 2 - 2 * PITCH} w={PITCH} d={4 * PITCH} h={10} {...BLACK} radius={1}
             topStyle={{ backgroundImage: "radial-gradient(circle,#e8c15c 0 1.9px,transparent 2.4px)", backgroundSize: `${PITCH}px ${PITCH}px` }} />
        <Box x={x + 50} y={y + 14} w={26} d={26} h={12} top="linear-gradient(135deg,#3a7bd5,#1e4fa3)" side="#2a62bd" shade="#1a4590" radius={3}
             topContent={<span className="absolute inset-[7px] rounded-full bg-[#eef1f5]"><span className="absolute inset-x-[5px] top-1/2 h-[2px] -translate-y-1/2 bg-[#8d96a3]" /></span>} />
      </Z>
      <Cyl x={x + W - 22} y={y + D / 2} d={24} h={10} z={z + 5} color="#b86a3f" n={12}
           cap="radial-gradient(circle,#f2c9a5 0 60%,#c47a4c 62%)"
           capChildren={<svg viewBox="0 0 24 24" className="absolute inset-0" aria-hidden="true"><path d="M6 8 H18 M6 12 H18 M6 16 H18 M18 8 V12 M6 12 V16" stroke="#7a2d14" strokeWidth="1.2" fill="none" /></svg>} />
    </>
  );
}
export const ldrPins = (x: number, y: number) => Object.fromEntries(["VCC", "GND", "DO", "AO"].map((n, i) => [n, {
  x: x + 6 + PITCH / 2, y: y + 63 / 2 + (i - 1.5) * PITCH, z: FLOOR + 21, dir: [-1, 0] as [number, number],
}])) as Record<"VCC" | "GND" | "DO" | "AO", Pt>;

/** Ondes Wi-Fi au-dessus d'un module radio. */
export function WifiWaves({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <span key={i} aria-hidden="true" className="wifi-ring pointer-events-none absolute rounded-full border-2 border-primary/75"
              style={{ left: x - 40, top: y - 40, width: 80, height: 80, transform: `translateZ(${z}px)`, animationDelay: `${i * 0.7}s` }} />
      ))}
    </>
  );
}
