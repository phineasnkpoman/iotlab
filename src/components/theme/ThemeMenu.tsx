"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { readPref, setPref, subscribe, type ThemePref } from "./theme";

const OPTIONS: { value: ThemePref; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Clair", Icon: Sun },
  { value: "dark", label: "Sombre", Icon: Moon },
  { value: "system", label: "Système", Icon: Monitor },
];

/** Sélecteur de thème : un bouton dans la barre, qui ouvre un petit menu de verre. */
export function ThemeMenu() {
  // Côté serveur on ne connaît pas le choix : « system » sert de valeur neutre jusqu'à l'hydratation.
  const pref = useSyncExternalStore(subscribe, readPref, () => "system" as ThemePref);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    // Le focus va sur l'option active ; Échap ou un clic à l'extérieur referme le menu.
    items.current[OPTIONS.findIndex((o) => o.value === pref)]?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("pointerdown", onDown); };
  }, [open, pref]);

  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const i = items.current.findIndex((el) => el === document.activeElement);
    const next = (i + (e.key === "ArrowDown" ? 1 : -1) + OPTIONS.length) % OPTIONS.length;
    items.current[next]?.focus();
  };

  const Current = OPTIONS.find((o) => o.value === pref)?.Icon ?? Monitor;

  return (
    <div ref={root} className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open}
              aria-label="Changer le thème" title="Thème"
              className="grid h-10 w-10 place-items-center rounded-full text-muted transition-[color,background-color,transform] duration-300 hover:bg-tint/[0.07] hover:text-text active:scale-95">
        <Current size={17} strokeWidth={1.75} aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" aria-label="Thème" onKeyDown={onMenuKey}
             className="glass-menu menu-in absolute right-0 top-[calc(100%+0.6rem)] z-50 w-44 rounded-[20px] p-1.5">
          {OPTIONS.map(({ value, label, Icon }, i) => {
            const active = value === pref;
            return (
              <button key={value} ref={(el) => { items.current[i] = el; }} type="button" role="menuitemradio" aria-checked={active}
                      onClick={() => { setPref(value); setOpen(false); }}
                      className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm outline-none transition-colors focus-visible:bg-tint/[0.07] ${active ? "text-text" : "text-muted hover:bg-tint/[0.05] hover:text-text"}`}>
                <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                <span className="flex-1 text-left">{label}</span>
                {active && <Check size={15} className="text-primary-soft" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
