"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Cpu, ScanEye, Wrench } from "lucide-react";

/** Les quatre rubriques du Laboratoire, dans l'ordre où l'on s'en sert. */
export const LAB_SECTIONS = [
  { href: "/laboratoire", label: "Montages 3D", icon: Box, match: (p: string) => p === "/laboratoire" || p.startsWith("/laboratoire/montages") },
  { href: "/laboratoire/simulateurs", label: "Simulateurs", icon: ScanEye, match: (p: string) => p.startsWith("/laboratoire/simulateurs") },
  { href: "/laboratoire/cartes", label: "Cartes", icon: Cpu, match: (p: string) => p.startsWith("/laboratoire/cartes") },
  { href: "/laboratoire/outils", label: "Outils", icon: Wrench, match: (p: string) => p.startsWith("/laboratoire/outils") },
] as const;

/** Sous-navigation commune à toutes les pages du Laboratoire : on sait toujours où l'on est. */
export function LabNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Rubriques du Laboratoire" className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <Link href="/laboratoire" className="font-mono text-xs uppercase tracking-[0.14em] text-copper transition-opacity hover:opacity-80">Laboratoire</Link>
      <ul className="flex w-full max-w-full justify-between gap-1 overflow-x-auto rounded-full border border-tint/10 bg-tint/[0.04] p-1 backdrop-blur [scrollbar-width:none] sm:w-auto sm:justify-start">
        {LAB_SECTIONS.map(({ href, label, icon: Icon, match }) => {
          const on = match(pathname);
          return (
            <li key={href} className="shrink-0">
              <Link href={href} aria-current={on ? "page" : undefined}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] transition-[color,background-color,box-shadow] duration-300 sm:px-3.5 ${on
                      ? "bg-primary text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]"
                      : "text-muted hover:bg-tint/[0.06] hover:text-text"}`}>
                <Icon size={14} strokeWidth={1.8} className="hidden sm:block" aria-hidden="true" />{label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
