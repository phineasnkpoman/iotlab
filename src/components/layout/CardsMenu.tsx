"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, LayoutGrid } from "lucide-react";
import { BOARDS } from "@/data/boards";
import { BoardIcon } from "@/components/boards/BoardIcon";

/**
 * Entrée « Cartes » de la barre de navigation : un panneau de verre qui présente les quatre cartes.
 * Modèle « disclosure » (bouton + liens) : clic ou Entrée pour ouvrir, flèches pour parcourir,
 * Échap pour refermer et rendre le focus au bouton. Avec une souris, le survol ouvre aussi le panneau.
 */
export function CardsMenu({ active }: { active: boolean }) {
  const pathname = usePathname();
  const panelId = useId();
  // Le panneau est lié à la page où il a été ouvert : il se referme seul après une navigation.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = () => setOpenedOn(pathname);
  const hide = () => setOpenedOn(null);
  const later = (fn: () => void, ms: number) => { window.clearTimeout(timer.current); timer.current = window.setTimeout(fn, ms); };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { hide(); button.current?.focus(); } };
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) hide(); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("pointerdown", onDown); };
  }, [open]);

  const links = () => Array.from(root.current?.querySelectorAll<HTMLAnchorElement>("[data-menu-link]") ?? []);

  const onButtonKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown") return;
    e.preventDefault();
    show();
    requestAnimationFrame(() => links()[0]?.focus());
  };

  const onPanelKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const all = links();
    const i = all.findIndex((el) => el === document.activeElement);
    all[(i + (e.key === "ArrowDown" ? 1 : -1) + all.length) % all.length]?.focus();
  };

  // Survol à la souris uniquement : au toucher, seul le clic compte.
  const enter = (e: React.PointerEvent) => { if (e.pointerType === "mouse") later(show, 90); };
  const leave = (e: React.PointerEvent) => { if (e.pointerType === "mouse") later(hide, 200); };

  return (
    <div ref={root} className="relative" onPointerEnter={enter} onPointerLeave={leave}
         onBlur={(e) => { if (!root.current?.contains(e.relatedTarget as Node)) hide(); }}>
      <button ref={button} type="button" aria-expanded={open} aria-controls={panelId}
              onClick={() => (open ? hide() : show())} onKeyDown={onButtonKey}
              className={`relative inline-flex items-center gap-1 whitespace-nowrap rounded-full py-1.5 pl-2.5 pr-2 text-[13.5px] transition-[color,background-color] duration-300 xl:pl-3.5 xl:pr-2.5 ${active || open
                ? "bg-tint/[0.09] text-text shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]"
                : "text-muted hover:bg-tint/[0.05] hover:text-text"}`}>
        Cartes
        <ChevronDown size={14} strokeWidth={1.9} aria-hidden="true"
                     className={`transition-transform duration-300 ease-[var(--ease-spring)] ${open ? "rotate-180" : ""}`} />
        {active && <span className="absolute -bottom-px left-1/2 h-px w-5 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary to-transparent" aria-hidden="true" />}
      </button>

      {open && (
        // Le pont transparent couvre l'espace entre le bouton et le panneau pour que le survol ne se perde pas.
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
          <div id={panelId} onKeyDown={onPanelKey} className="glass-menu menu-in w-[min(36rem,calc(100vw-2rem))] rounded-[26px] p-2">
            <ul className="grid grid-cols-2 gap-1">
              {BOARDS.map((b) => {
                const here = pathname === `/cartes/${b.slug}`;
                return (
                  <li key={b.slug}>
                    <Link href={`/cartes/${b.slug}`} data-menu-link aria-current={here ? "page" : undefined} onClick={hide}
                          className={`group flex h-full items-start gap-3.5 rounded-[18px] p-3.5 outline-none transition-colors duration-300 focus-visible:bg-tint/[0.07] ${here ? "bg-tint/[0.07]" : "hover:bg-tint/[0.05]"}`}>
                      <BoardIcon name={b.icon} swatch={b.swatch} />
                      <span className="min-w-0 pt-0.5">
                        <span className="block text-[14.5px] font-medium leading-tight tracking-[-0.01em] text-text">{b.name}</span>
                        <span className="mt-1 block text-[13px] leading-snug text-muted">{b.short}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mx-3 my-1 h-px bg-tint/[0.08]" aria-hidden="true" />
            <Link href="/cartes" data-menu-link onClick={hide} aria-current={pathname === "/cartes" ? "page" : undefined}
                  className="group flex items-center gap-3 rounded-[18px] px-3.5 py-3 text-[13.5px] text-muted outline-none transition-colors hover:bg-tint/[0.05] hover:text-text focus-visible:bg-tint/[0.07] focus-visible:text-text">
              <LayoutGrid size={16} strokeWidth={1.7} aria-hidden="true" />
              <span className="flex-1">Voir le catalogue et comparer les cartes</span>
              <ArrowRight size={15} aria-hidden="true" className="transition-transform duration-300 ease-[var(--ease-spring)] group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
