"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./MobileMenu";

/** Vrai si le lien correspond à la page courante (ou à l'une de ses sous-pages). */
export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-0.5 rounded-full p-1 lg:flex" aria-label="Navigation principale">
      {items.map((i) => {
        const active = isActive(pathname, i.href);
        return (
          <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined}
                title={i.hint}
                className={`relative whitespace-nowrap rounded-full px-4 py-1.5 text-[14px] transition-[color,background-color] duration-300 ${active
                  ? "bg-tint/[0.09] text-text shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]"
                  : "text-muted hover:bg-tint/[0.05] hover:text-text"}`}>
            {i.label}
            {active && <span className="absolute -bottom-px left-1/2 h-px w-5 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary to-transparent" aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );
}
