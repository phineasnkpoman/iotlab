"use client";

import { useEffect, useRef } from "react";

/*
 * Rotation d'une scène CSS 3D, partagée par les cartes et les câblages.
 * - Glisser : la scène tourne et garde son élan au lâcher ; l'inclinaison résiste en bout de course.
 * - Clavier : flèches pour tourner, Début (ou double-clic) pour recentrer.
 * - Au repos, la scène pivote très lentement ; tout mouvement automatique est coupé
 *   quand l'utilisateur demande moins d'animations, et rien n'est calculé hors de l'écran.
 * L'état physique vit dans une ref : il change à chaque image sans provoquer de rendu React.
 */

export const RX_MIN = 18, RX_MAX = 82;
const rubber = (o: number, dim = 40, c = 0.55) => (o * dim * c) / (dim + c * Math.abs(o));
const band = (raw: number) => (raw < RX_MIN ? RX_MIN - rubber(RX_MIN - raw) : raw > RX_MAX ? RX_MAX + rubber(raw - RX_MAX) : raw);
const clampRx = (v: number) => Math.min(RX_MAX, Math.max(RX_MIN, v));

export function useOrbit({ rest, enabled, idleSpin = true, onTap }: {
  rest: { rx: number; rz: number };
  enabled: boolean;
  /** Rotation lente au repos (désactivée pour les schémas, plus lisibles immobiles). */
  idleSpin?: boolean;
  /** Clic sans glisser : reçoit l'élément touché au départ du geste. */
  onTap?: (target: EventTarget | null) => void;
}) {
  const scene = useRef<HTMLDivElement>(null);
  const rig = useRef<HTMLDivElement>(null);
  const pointerInside = useRef(false);
  const tap = useRef(onTap);
  useEffect(() => { tap.current = onTap; }, [onTap]);

  const st = useRef({
    rx: rest.rx, rxRaw: rest.rx, rz: rest.rz, vz: 0,
    tx: null as number | null, tz: null as number | null,
    drag: false, moved: false, sx: 0, sy: 0, lx: 0, ly: 0, lt: 0, last: 0,
    startTarget: null as EventTarget | null, reduce: false, kick: () => {},
  });

  useEffect(() => {
    const el = scene.current, r = rig.current;
    if (!enabled || !el || !r) return;
    const s = st.current;
    s.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    s.last = performance.now();
    let raf = 0, visible = true;

    const write = () => { r.style.transform = `rotateX(${s.rx.toFixed(2)}deg) rotateZ(${s.rz.toFixed(2)}deg)`; };
    const step = (now: number) => {
      if (!s.drag) {
        if (s.tz !== null && s.tx !== null) {
          s.rz += (s.tz - s.rz) * 0.12;
          s.rxRaw += (s.tx - s.rxRaw) * 0.12;
          if (Math.abs(s.tz - s.rz) < 0.05 && Math.abs(s.tx - s.rxRaw) < 0.05) { s.rz = s.tz; s.rxRaw = s.tx; s.tz = s.tx = null; }
        } else {
          s.rz += s.vz;
          s.vz *= 0.95;
          if (Math.abs(s.vz) < 0.01) s.vz = 0;
          s.rxRaw += (clampRx(s.rxRaw) - s.rxRaw) * 0.18;
          if (idleSpin && !s.reduce && s.vz === 0 && !pointerInside.current && now - s.last > 3500) s.rz += 0.06;
        }
        s.rx = band(s.rxRaw);
      }
      write();
      const settled = s.vz === 0 && s.tz === null && Math.abs(clampRx(s.rxRaw) - s.rxRaw) < 0.01;
      const idle = settled && !s.drag && (s.reduce || !idleSpin);
      raf = visible && !idle ? requestAnimationFrame(step) : 0;
    };
    s.kick = () => { if (!raf && visible) raf = requestAnimationFrame(step); };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) s.kick(); });
    io.observe(el);
    write();
    s.kick();
    return () => { io.disconnect(); cancelAnimationFrame(raf); raf = 0; };
  }, [enabled, idleSpin]);

  const reset = () => {
    const s = st.current;
    s.tz = s.rz + ((((rest.rz - s.rz) % 360) + 540) % 360 - 180); // chemin le plus court vers l'angle de repos
    s.tx = rest.rx;
    s.vz = 0;
    s.last = performance.now();
    s.kick();
  };

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const s = st.current;
      Object.assign(s, { drag: true, moved: false, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, lt: performance.now(), vz: 0, tx: null, tz: null, startTarget: e.target });
      s.rxRaw = s.rx;
      s.kick();
    },
    onPointerMove: (e: React.PointerEvent) => {
      const s = st.current;
      if (!s.drag) return;
      if (!s.moved) {
        if (Math.hypot(e.clientX - s.sx, e.clientY - s.sy) < 6) return; // simple clic, pas encore un glisser
        s.moved = true;
        scene.current?.setPointerCapture(e.pointerId);
      }
      const now = performance.now();
      const dt = Math.max(1, now - s.lt);
      const dz = (e.clientX - s.lx) * 0.42;
      s.rz += dz;
      s.rxRaw -= (e.clientY - s.ly) * 0.3;
      s.rx = band(s.rxRaw);
      s.vz = (dz / dt) * 16; // vitesse en degrés par image, reprise telle quelle au lâcher
      s.lx = e.clientX; s.ly = e.clientY; s.lt = now; s.last = now;
      if (rig.current) rig.current.style.transform = `rotateX(${s.rx.toFixed(2)}deg) rotateZ(${s.rz.toFixed(2)}deg)`;
    },
    onPointerUp: (e: React.PointerEvent) => endDrag(e, false),
    onPointerCancel: (e: React.PointerEvent) => endDrag(e, true),
    onPointerEnter: () => { pointerInside.current = true; },
    onPointerLeave: () => { pointerInside.current = false; },
    onDoubleClick: reset,
  };

  function endDrag(e: React.PointerEvent, cancelled: boolean) {
    const s = st.current;
    if (!s.drag) return;
    s.drag = false;
    s.last = performance.now();
    if (!s.moved && !cancelled) tap.current?.(s.startTarget);
    if (s.moved) {
      if (s.last - s.lt > 90 || s.reduce) s.vz = 0; // pointeur arrêté avant le lâcher : pas d'élan
      s.vz = Math.max(-14, Math.min(14, s.vz));
      if (scene.current?.hasPointerCapture(e.pointerId)) scene.current.releasePointerCapture(e.pointerId);
    }
    s.kick();
  }

  /** Flèches et Début ; renvoie true si la touche a été prise en charge. */
  const onKey = (e: React.KeyboardEvent) => {
    const s = st.current;
    const turn = (dz: number, dx: number) => {
      s.tz = (s.tz ?? s.rz) + dz;
      s.tx = clampRx((s.tx ?? s.rxRaw) + dx);
      s.vz = 0; s.last = performance.now(); s.kick();
      e.preventDefault();
      return true;
    };
    if (e.key === "ArrowLeft") return turn(-15, 0);
    if (e.key === "ArrowRight") return turn(15, 0);
    if (e.key === "ArrowUp") return turn(0, -8);
    if (e.key === "ArrowDown") return turn(0, 8);
    if (e.key === "Home") { reset(); e.preventDefault(); return true; }
    return false;
  };

  return { scene, rig, handlers, onKey, reset, pointerInside };
}
