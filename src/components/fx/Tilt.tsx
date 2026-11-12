"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Carte inclinable en 3D : suit le pointeur avec un ressort, et un reflet de verre suit le curseur.
 * Les valeurs sont écrites dans des variables CSS (aucun rendu React par image).
 * Inclinaison désactivée sur écran tactile et quand l'utilisateur demande moins d'animations.
 */
export function Tilt({ children, className = "", max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const canTilt = matchMedia("(hover: hover) and (pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, x = 0, y = 0, vx = 0, vy = 0, tx = 0, ty = 0;

    // Ressort amorti : la carte rattrape le pointeur sans à-coup et peut être interrompue à tout moment.
    const step = () => {
      vx = (vx + (tx - x) * 0.09) * 0.72; x += vx;
      vy = (vy + (ty - y) * 0.09) * 0.72; y += vy;
      el.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
      raf = Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(vx) + Math.abs(vy) > 0.0005 ? requestAnimationFrame(step) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(step); };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      if (canTilt) { tx = px - 0.5; ty = py - 0.5; kick(); }
    };
    const leave = () => { tx = 0; ty = 0; if (canTilt) kick(); };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, [max]);

  return <div ref={ref} className={`tilt ${className}`}>{children}</div>;
}
