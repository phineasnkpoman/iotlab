import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost";
const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
const variants: Record<Variant, string> = {
  primary: "bg-signal text-white hover:bg-[#c92d30]",
  secondary: "border border-line bg-panel text-text hover:bg-panel2",
  ghost: "text-muted hover:text-text",
};

export const buttonClass = (v: Variant = "primary", extra = "") => `${base} ${variants[v]} ${extra}`;

export function LinkButton({ variant = "primary", className = "", ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link {...props} className={buttonClass(variant, className)} />;
}

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button {...props} className={buttonClass(variant, className)} />;
}
