"use client";

import { useState } from "react";
import { Cable, CheckCircle2, ChevronDown, RotateCcw, XCircle } from "lucide-react";
import { WidgetFrame, chip, well } from "./WidgetFrame";
import { buttonClass } from "@/components/ui/Button";

type SensorKey = "hcsr04" | "pir" | "dht11";
type Rule = "5v" | "vcc" | "gnd" | "digital";
interface PinDef { id: string; label: string; rule: Rule; role: string }

const SENSORS: Record<SensorKey, { name: string; pins: PinDef[]; consts: Record<string, string> }> = {
  hcsr04: {
    name: "HC-SR04",
    pins: [
      { id: "vcc", label: "VCC", rule: "5v", role: "alimentation 5 V" },
      { id: "trig", label: "Trig", rule: "digital", role: "sortie d'Arduino (déclenchement)" },
      { id: "echo", label: "Echo", rule: "digital", role: "entrée d'Arduino (écho)" },
      { id: "gnd", label: "GND", rule: "gnd", role: "masse" },
    ],
    consts: { trig: "TRIG", echo: "ECHO" },
  },
  pir: {
    name: "HC-SR501 (PIR)",
    pins: [
      { id: "vcc", label: "VCC", rule: "5v", role: "alimentation 5 V" },
      { id: "out", label: "OUT", rule: "digital", role: "entrée d'Arduino (détection)" },
      { id: "gnd", label: "GND", rule: "gnd", role: "masse" },
    ],
    consts: { out: "PIR" },
  },
  dht11: {
    name: "DHT11",
    pins: [
      { id: "vcc", label: "VCC", rule: "vcc", role: "alimentation 3,3 V ou 5 V" },
      { id: "data", label: "DATA", rule: "digital", role: "données (entrée d'Arduino)" },
      { id: "gnd", label: "GND", rule: "gnd", role: "masse" },
    ],
    consts: { data: "DHTPIN" },
  },
};

const TERMINALS = ["5V", "3.3V", "GND", ...Array.from({ length: 12 }, (_, i) => `D${i + 2}`), "A0"];
const isDigital = (t: string) => /^D\d+$/.test(t);

function evaluate(sensor: SensorKey, wiring: Record<string, string>): Record<string, string | null> {
  const res: Record<string, string | null> = {};
  const used: Record<string, string[]> = {};
  for (const p of SENSORS[sensor].pins) {
    const t = wiring[p.id] ?? "";
    if (isDigital(t) || t === "A0") (used[t] ||= []).push(p.label);
  }
  for (const p of SENSORS[sensor].pins) {
    const t = wiring[p.id] ?? "";
    let err: string | null = null;
    if (!t) err = "Choisissez une connexion.";
    else if (p.rule === "5v") {
      if (t === "5V") err = null;
      else if (t === "3.3V") err = "Le module a besoin de 5 V : en 3,3 V il fonctionne mal ou pas du tout.";
      else if (t === "GND") err = "Court-circuit : VCC ne doit jamais être relié à GND.";
      else err = "VCC se branche sur une broche d'alimentation (5V), pas sur une entrée/sortie.";
    } else if (p.rule === "vcc") {
      if (t === "5V" || t === "3.3V") err = null;
      else if (t === "GND") err = "Court-circuit : VCC ne doit jamais être relié à GND.";
      else err = "VCC se branche sur 5V ou 3.3V.";
    } else if (p.rule === "gnd") {
      err = t === "GND" ? null : t === "5V" || t === "3.3V" ? "Court-circuit : GND ne doit pas aller sur une alimentation." : "GND doit être relié à la masse (GND) d'Arduino.";
    } else {
      if (isDigital(t)) err = (used[t]?.length ?? 0) > 1 ? `${used[t].join(" et ")} sur la même broche : choisissez deux broches différentes.` : null;
      else if (t === "A0") err = "A0 est surtout une entrée analogique : dans ce cours, utilisez D2 à D13.";
      else err = "Cette broche transporte un signal : ne la reliez pas à une alimentation ou à GND.";
    }
    res[p.id] = err;
  }
  return res;
}

export default function WiringCheck({ sensor }: { sensor: SensorKey }) {
  const def = SENSORS[sensor];
  const [wiring, setWiring] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const result = evaluate(sensor, wiring);
  const allOk = def.pins.every((p) => result[p.id] === null);

  const pinY = (i: number) => 60 + i * 70;
  const termY = (t: string) => 22 + TERMINALS.indexOf(t) * 22;
  const wireColor = (ok: boolean) => !checked ? "var(--primary-soft)" : ok ? "var(--ok)" : "var(--signal)";

  return (
    <WidgetFrame icon={<Cable size={17} strokeWidth={1.75} />} title={`Câblage du ${def.name} : à vous de brancher`}
                 hint="Exercice de vérification : il contrôle la logique de votre câblage, pas un vrai circuit. Testez sur Wokwi pour voir le résultat.">
      <div className="grid gap-5 md:grid-cols-[1fr_300px]">
        <svg viewBox="0 0 560 400" className={`${well} h-auto w-full`} role="img" aria-label={`Schéma de câblage du ${def.name} vers la carte Arduino Uno`}>
          <rect x="10" y="20" width="130" height={def.pins.length * 70 + 10} rx="12" fill="var(--panel-2)" stroke="var(--line-strong)" strokeWidth="1.5" />
          <text x="75" y="14" fontSize="12" fill="var(--muted)" textAnchor="middle">{def.name}</text>
          <rect x="420" y="6" width="134" height="388" rx="12" fill="#0f5d8a" fillOpacity=".16" stroke="var(--line-strong)" strokeWidth="1.5" />
          {def.pins.map((p, i) => {
            const t = wiring[p.id];
            const ok = result[p.id] === null;
            return (
              <g key={p.id}>
                <circle cx="140" cy={pinY(i)} r="6" fill="#d4af37" />
                <text x="124" y={pinY(i) + 4} fontSize="13" fill="var(--text)" textAnchor="end" fontFamily="var(--font-geist-mono)">{p.label}</text>
                {t && <path d={`M 140 ${pinY(i)} C 280 ${pinY(i)}, 280 ${termY(t)}, 420 ${termY(t)}`} fill="none" stroke={wireColor(ok)} strokeWidth="3" strokeLinecap="round" />}
              </g>
            );
          })}
          {TERMINALS.map((t) => (
            <g key={t}>
              <circle cx="420" cy={termY(t)} r="5" fill="#d4af37" />
              <text x="436" y={termY(t) + 4} fontSize="12" fill={Object.values(wiring).includes(t) ? "var(--text)" : "var(--muted)"} fontFamily="var(--font-geist-mono)">{t}</text>
            </g>
          ))}
        </svg>

        <div className="space-y-3">
          {def.pins.map((p) => (
            <div key={p.id} className="space-y-1">
              <label htmlFor={`w-${sensor}-${p.id}`} className="text-sm"><span className="font-mono font-semibold">{p.label}</span> <span className="text-muted">({p.role})</span></label>
              <span className="relative block">
              <select id={`w-${sensor}-${p.id}`} value={wiring[p.id] ?? ""} onChange={(e) => { setWiring({ ...wiring, [p.id]: e.target.value }); setChecked(false); }}
                      className="min-h-11 w-full cursor-pointer appearance-none rounded-full border border-tint/10 bg-well py-2.5 pl-4 pr-10 text-sm text-text transition-colors hover:border-tint/20 focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/15">
                <option value="">Choisir une broche d&apos;Arduino…</option>
                {TERMINALS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
              </span>
              {checked && (result[p.id] === null
                ? <p className="flex items-center gap-1.5 text-xs text-ok-soft"><CheckCircle2 size={14} aria-hidden="true" /> Correct</p>
                : <p className="flex items-start gap-1.5 text-xs leading-relaxed text-signal-soft"><XCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" /> {result[p.id]}</p>)}
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={() => setChecked(true)} className={buttonClass("primary")}>Vérifier le câblage</button>
            {Object.keys(wiring).length > 0 && <button type="button" onClick={() => { setWiring({}); setChecked(false); }} className={chip(false)}><RotateCcw size={14} aria-hidden="true" /> Tout débrancher</button>}
          </div>
          {checked && allOk && (
            <div role="status" className="rounded-[18px] border border-ok/35 bg-ok/10 px-4 py-3 text-sm text-ok-soft">
              <p className="font-medium">Câblage valide.</p>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-[#070b14] px-3 py-2 font-mono text-xs text-[#e6edf7]">{def.pins.filter((p) => def.consts[p.id]).map((p) => `const int ${def.consts[p.id]} = ${(wiring[p.id] ?? "").replace("D", "")};`).join("\n")}</pre>
            </div>
          )}
        </div>
      </div>
    </WidgetFrame>
  );
}
