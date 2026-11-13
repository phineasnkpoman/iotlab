import { ExternalLink, FlaskConical, Library } from "lucide-react";
import type { Montage } from "@/data/montages";
import { buttonClass } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";

/** Les trois gestes pour refaire le montage dans le simulateur Wokwi. */
export function WokwiPanel({ montage }: { montage: Montage }) {
  const w = montage.wokwi;
  const step = (n: number, title: string, body: React.ReactNode, action?: React.ReactNode) => (
    <li className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <span className="tabular grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-sm font-medium text-primary-soft">{n}</span>
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <div className="mt-0.5 text-sm leading-relaxed text-muted">{body}</div>
      </div>
      {action && <div className="sm:justify-self-end">{action}</div>}
    </li>
  );

  return (
    <div className="bezel-core glass p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-3.5">
        <span className="grid h-11 w-11 place-items-center rounded-2xl border border-tint/10 bg-tint/[0.06] text-primary-soft shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]">
          <FlaskConical size={20} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="wokwi" className="text-2xl font-medium tracking-[-0.025em]">S&apos;exercer sur Wokwi</h2>
          <p className="mt-0.5 text-sm text-muted">Le simulateur gratuit, dans le navigateur : pas de matériel, rien à installer.</p>
        </div>
      </div>

      {w.kind === "diagram" ? (
        <ol className="mt-7 space-y-6">
          {step(1, "Ouvrez un projet vierge", <>Wokwi crée un projet {montage.board === "esp32" ? "ESP32" : montage.board === "arduino-mega" ? "Arduino Mega" : "Arduino Uno"} dans un nouvel onglet.</>,
            <a href={w.url} target="_blank" rel="noopener noreferrer" className={buttonClass("primary")}>
              Ouvrir Wokwi <ExternalLink size={14} aria-hidden="true" /><span className="sr-only">(nouvel onglet)</span>
            </a>)}
          {step(2, "Collez le schéma", <>Ouvrez l&apos;onglet <code className="font-mono text-[12.5px] text-text">diagram.json</code>, remplacez tout son contenu par celui-ci : les composants et les fils apparaissent.</>,
            <CopyButton text={JSON.stringify(w.diagram, null, 2)} label="Copier diagram.json" />)}
          {step(3, "Collez le programme", <>Dans l&apos;onglet du code, remplacez le contenu par le programme ci-dessus, puis lancez la simulation avec le bouton ▶.</>,
            <CopyButton text={montage.code.source} label="Copier le code" />)}
        </ol>
      ) : (
        <div className="mt-7 space-y-5">
          <p className="rounded-[16px] border border-copper/30 bg-copper/[0.08] px-4 py-3 text-sm leading-relaxed">{w.tip}</p>
          <ol className="space-y-6">
            {step(1, "Ouvrez un projet Raspberry Pi Pico", "Modèle MicroPython, dans un nouvel onglet.",
              <a href={w.url} target="_blank" rel="noopener noreferrer" className={buttonClass("primary")}>
                Ouvrir Wokwi <ExternalLink size={14} aria-hidden="true" /><span className="sr-only">(nouvel onglet)</span>
              </a>)}
            {step(2, "Ajoutez et reliez les composants", <ul className="mt-1 list-disc space-y-1 pl-4">{w.wiring.map((l) => <li key={l}>{l}</li>)}</ul>)}
            {step(3, "Collez le programme MicroPython", <>Remplacez le contenu de <code className="font-mono text-[12.5px] text-text">main.py</code>, puis lancez la simulation.</>,
              <CopyButton text={w.code} label="Copier le code" />)}
          </ol>
        </div>
      )}

      {w.kind === "diagram" && (w.libraries?.length || w.tip) && (
        <div className="mt-7 grid gap-3 border-t border-tint/[0.08] pt-6 text-sm sm:grid-cols-2">
          {w.libraries?.length ? (
            <p className="flex gap-2.5 leading-relaxed text-muted">
              <Library size={16} className="mt-0.5 shrink-0 text-primary-soft" aria-hidden="true" />
              <span>Bibliothèques à ajouter dans l&apos;onglet <span className="text-text">Library Manager</span> : {w.libraries.map((l, i) => <span key={l}>{i > 0 && ", "}<span className="font-medium text-text">{l}</span></span>)}.</span>
            </p>
          ) : <span />}
          {w.tip && <p className="leading-relaxed text-muted">{w.tip}</p>}
        </div>
      )}
    </div>
  );
}
