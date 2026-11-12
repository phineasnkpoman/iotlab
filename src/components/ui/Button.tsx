import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost";

// Retour tactile : légère compression à l'appui, transitions sur couleur et transform uniquement.
const base =
  "group/btn inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium " +
  "transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-spring)] active:scale-[0.97] " +
  "disabled:pointer-events-none disabled:opacity-55";
const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_12px_32px_-12px_rgb(var(--primary-rgb)/0.75)] hover:bg-primary-hover",
  secondary:
    "border border-tint/10 bg-tint/[0.05] text-text shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-xl hover:border-tint/20 hover:bg-tint/[0.09]",
  ghost: "text-muted hover:bg-tint/[0.06] hover:text-text",
};

export const buttonClass = (v: Variant = "primary", extra = "") => `${base} ${variants[v]} ${extra}`;

export function LinkButton({ variant = "primary", className = "", ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link {...props} className={buttonClass(variant, className)} />;
}

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button {...props} className={buttonClass(variant, className)} />;
}

/** Flèche logée dans sa propre pastille, à droite d'un bouton pilule (« bouton dans le bouton »). */
export function ArrowChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="-mr-2.5 ml-1 grid h-7 w-7 place-items-center rounded-full bg-white/20 transition-transform duration-300 ease-[var(--ease-spring)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-px group-hover/btn:scale-105">
      {children}
    </span>
  );
}
