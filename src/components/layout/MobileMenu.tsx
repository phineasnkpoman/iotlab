"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export interface NavItem { href: string; label: string }

export function MobileMenu({ items, children }: { items: NavItem[]; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="menu-mobile"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} className="rounded-md p-2 hover:bg-panel2">
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && (
        <div id="menu-mobile" className="absolute inset-x-0 top-full border-b border-line bg-ink px-4 pb-5 pt-2 shadow-xl">
          <nav className="flex flex-col">
            {items.map((i) => (
              <Link key={i.href} href={i.href} onClick={() => setOpen(false)} className="border-b border-line/60 py-3 text-[15px]">{i.label}</Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2" onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}
