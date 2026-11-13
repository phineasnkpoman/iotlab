"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive } from "./NavLinks";

/** `wideOnly` : masqué dans la barre entre 1024 et 1280 px (le logo mène déjà à l'accueil).
 *  `mobileOnly` : seulement dans le menu mobile (sur ordinateur, l'entrée est dans le menu « Cartes »). */
export interface NavItem { href: string; label: string; wideOnly?: boolean; mobileOnly?: boolean }

export function MobileMenu({ items, children }: { items: NavItem[]; children?: React.ReactNode }) {
  const pathname = usePathname();
  // On mémorise la page où le menu a été ouvert : il se referme tout seul après une navigation.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const close = () => setOpenedOn(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenedOn(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const bar = "absolute left-1/2 top-1/2 h-[1.5px] w-[18px] -translate-x-1/2 rounded-full bg-current transition-transform duration-300 ease-[var(--ease-spring)]";

  return (
    <div className="lg:hidden">
      <button onClick={() => setOpenedOn(open ? null : pathname)} aria-expanded={open} aria-controls="menu-mobile"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              className="relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-tint/[0.08] active:scale-95">
        {/* Deux traits qui pivotent pour former une croix */}
        <span className={`${bar} ${open ? "rotate-45" : "-translate-y-[4px]"}`} />
        <span className={`${bar} ${open ? "-rotate-45" : "translate-y-[3px]"}`} />
      </button>
      {open && (
        <div id="menu-mobile" className="glass-menu menu-in absolute inset-x-0 top-[calc(100%+0.5rem)] rounded-[28px] p-3">
          <nav className="flex flex-col" aria-label="Navigation mobile">
            {items.map((i, n) => {
              const active = isActive(pathname, i.href);
              return (
                <Link key={i.href} href={i.href} onClick={close} aria-current={active ? "page" : undefined}
                      style={{ animationDelay: `${40 + n * 35}ms` }}
                      className={`rise flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] transition-colors ${active ? "bg-tint/[0.08] text-text" : "text-muted hover:bg-tint/[0.04] hover:text-text"}`}>
                  {i.label}
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />}
                </Link>
              );
            })}
          </nav>
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-tint/10 px-1 pt-3 [&_form]:contents" onClick={close}>{children}</div>
        </div>
      )}
    </div>
  );
}
