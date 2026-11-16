import type { ReactNode } from "react";
import { Info } from "lucide-react";

/** Cadre commun des modules interactifs d'une leçon (« not-prose » : le style Markdown ne s'y applique pas). */
export function WidgetFrame({ title, hint, icon, children }: { title: string; hint?: string; icon: ReactNode; children: ReactNode }) {
  return (
    <figure className="not-prose glass my-9 overflow-hidden rounded-[28px]">
      <figcaption className="flex flex-wrap items-center gap-3 border-b border-tint/[0.07] px-4 py-3.5 sm:px-5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/[0.1] text-primary-soft shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]" aria-hidden="true">{icon}</span>
        <span className="min-w-40 flex-1 text-[15px] font-medium tracking-[-0.01em]">{title}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.08] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-primary-soft">
          <span className="led-glow h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />Interactif
        </span>
      </figcaption>
      <div className="p-4 sm:p-5">{children}</div>
      {hint && (
        <p className="flex gap-2 border-t border-tint/[0.07] px-4 py-3 text-xs leading-relaxed text-muted sm:px-5">
          <Info size={14} className="mt-px shrink-0" aria-hidden="true" />{hint}
        </p>
      )}
    </figure>
  );
}

/** Styles partagés des commandes des modules. */
export const chip = (on: boolean) =>
  `inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] transition-[color,background-color,border-color,transform] duration-200 active:scale-[0.97] ${on
    ? "border-primary/50 bg-primary/[0.12] text-text"
    : "border-tint/10 bg-tint/[0.04] text-muted hover:border-tint/20 hover:text-text"}`;
export const well = "rounded-[18px] border border-tint/[0.08] bg-well";
export const range = "mt-2 w-full cursor-pointer accent-primary";

/** Valeur mesurée : petit libellé et grand chiffre. */
export function Readout({ label, value, tone = "text" }: { label: string; value: string; tone?: "text" | "ok" | "copper" | "muted" }) {
  const color = { text: "text-text", ok: "text-ok-soft", copper: "text-copper", muted: "text-muted" }[tone];
  return (
    <div className={`${well} px-3.5 py-3`}>
      <p className="text-xs text-muted">{label}</p>
      <p className={`tabular mt-1 font-mono text-lg ${color}`}>{value}</p>
    </div>
  );
}
