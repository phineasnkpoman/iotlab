"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copie un texte dans le presse-papiers et le confirme pendant deux secondes. */
export function CopyButton({ text, label = "Copier", copiedLabel = "Copié", className = "" }: { text: string; label?: string; copiedLabel?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      setState("error");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2000);
  };

  return (
    <button type="button" onClick={copy}
            className={`inline-flex items-center gap-1.5 rounded-full border border-tint/10 bg-tint/[0.05] px-3 py-1.5 text-[12.5px] font-medium text-text transition-[background-color,border-color] duration-300 hover:border-tint/25 hover:bg-tint/[0.09] active:scale-[0.97] ${className}`}>
      {state === "done" ? <Check size={14} className="text-ok-soft" aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      <span aria-live="polite">{state === "done" ? copiedLabel : state === "error" ? "Copie impossible" : label}</span>
    </button>
  );
}
