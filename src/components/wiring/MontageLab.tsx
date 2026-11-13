"use client";

import { useState } from "react";
import { Wiring3D } from "@/components/fx/wiring/Wiring3D";
import type { MontageSlug, MontageStep } from "@/data/montages";

/**
 * Le schéma 3D et la liste des branchements, reliés : choisir une étape met en avant ses fils
 * et ses composants ; toucher un fil dans la scène sélectionne l'étape correspondante.
 */
export function MontageLab({ slug, steps, label }: { slug: MontageSlug; steps: MontageStep[]; label: string }) {
  const [active, setActive] = useState<string | null>(null);
  const step = steps.find((s) => s.id === active);
  const toggle = (id: string) => setActive((cur) => (cur === id ? null : id));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <section aria-label="Schéma de câblage en 3D" className="rise bezel" style={{ ["--d" as string]: "140ms" }}>
        <div className="bezel-core glass p-2.5 sm:p-3">
          <Wiring3D slug={slug} label={label} highlight={step?.ids} sceneClassName="stage rounded-[18px]"
                    onWireTap={(w) => { const s = steps.find((x) => x.ids.includes(w)); if (s) toggle(s.id); }} />
          <p className="px-2 pb-1.5 pt-3 text-[13px] text-muted">
            Faites glisser pour tourner le montage. Touchez un fil ou une étape pour le mettre en avant.
          </p>
        </div>
      </section>

      <section aria-labelledby="branchements" className="rise" style={{ ["--d" as string]: "220ms" }}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="branchements" className="text-[1.35rem] font-medium tracking-[-0.025em]">Branchements</h2>
          {step && <button type="button" onClick={() => setActive(null)} className="text-[13px] text-muted transition-colors hover:text-text">Tout afficher</button>}
        </div>
        <ol className="mt-4 space-y-2">
          {steps.map((s, i) => {
            const on = s.id === active;
            return (
              <li key={s.id}>
                <button type="button" aria-pressed={on} onClick={() => toggle(s.id)}
                        className={`group flex w-full items-start gap-3.5 rounded-[20px] border p-4 text-left transition-[background-color,border-color] duration-300 ${on
                          ? "border-primary/50 bg-primary/[0.09]" : "glass border-tint/[0.08] hover:border-tint/20"}`}>
                  <span className={`tabular grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] font-medium transition-colors duration-300 ${on
                    ? "bg-primary text-white" : "bg-tint/[0.08] text-muted group-hover:text-text"}`}>{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium leading-snug">{s.title}</span>
                    <span className="mt-1 block text-[13.5px] leading-relaxed text-muted">{s.detail}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
