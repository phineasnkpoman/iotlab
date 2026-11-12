import type { CSSProperties, ReactNode } from "react";

/*
 * Briques des cartes en 3D (CSS 3D pur).
 * Échelle commune : 4,47 px par millimètre, la carte posée dans le plan z = 0,
 * le dessus des composants vers le visiteur (+z).
 */

export const PX_PER_MM = 4.47;
export const PITCH = 2.54 * PX_PER_MM; // pas standard des broches (2,54 mm)

/** Matières réutilisées par les modèles. */
export const METAL = { top: "linear-gradient(135deg,#e3e8ef,#9ba7b7)", side: "#aeb8c6", shade: "#6c7889" };
export const BLACK = { top: "linear-gradient(135deg,#2a2d33,#111317)", side: "#1b1d22", shade: "#0b0c0f" };
export const CREAM = { top: "linear-gradient(135deg,#f1ece0,#cfc6b3)", side: "#d6ceba", shade: "#a99f8a" };
export const PORT_FACE = "linear-gradient(180deg,#c9d1dc,#97a2b1)";

/** Pas de broches : trous (connecteur femelle) ou picots dorés (connecteur mâle). */
export const holes = (cols = PITCH) =>
  ({ backgroundImage: "radial-gradient(circle,#05070b 0 2.2px,transparent 2.7px)", backgroundSize: `${cols}px ${PITCH}px`, backgroundPosition: "center" }) as CSSProperties;
export const pins = (cols = PITCH) =>
  ({ backgroundImage: "radial-gradient(circle,#e8c15c 0 1.9px,transparent 2.4px)", backgroundSize: `${cols}px ${PITCH}px`, backgroundPosition: "center" }) as CSSProperties;

type Faces = { north?: ReactNode; south?: ReactNode; east?: ReactNode; west?: ReactNode };

/**
 * Pavé posé sur la carte : dessus + quatre côtés, chacun orienté vers l'extérieur
 * (backface-visibility: hidden masque proprement les faces qui tournent le dos).
 * Le dessus porte la classe board-top : la surbrillance de sélection y est appliquée en CSS.
 * Repères locaux des faces, pour y placer des ouvertures :
 * - sud : x local = x de la carte, y local va du haut du pavé (0) vers la carte (h) ;
 * - nord : x local = x de la carte, y local va de la carte (0) vers le haut du pavé (h) ;
 * - est : y local = y de la carte, x local va du haut du pavé (0) vers la carte (h) ;
 * - ouest : y local = y de la carte, x local va de la carte (0) vers le haut du pavé (h).
 * Les ouvertures étant symétriques, on les centre simplement dans la face.
 */
export function Box({ x, y, w, d, h, top, side, shade, topContent, radius = 2, topStyle, ...faces }: {
  x: number; y: number; w: number; d: number; h: number;
  top: string; side: string; shade: string;
  topContent?: ReactNode; radius?: number; topStyle?: CSSProperties;
} & Faces) {
  const f: CSSProperties = { position: "absolute", backfaceVisibility: "hidden", overflow: "hidden" };
  return (
    <>
      <div style={{ ...f, left: x, top: y + d, width: w, height: h, transformOrigin: "top", transform: `translateZ(${h}px) rotateX(-90deg)`, background: side }}>{faces.south}</div>
      <div style={{ ...f, left: x, top: y, width: w, height: h, transformOrigin: "top", transform: "rotateX(90deg)", background: shade }}>{faces.north}</div>
      <div style={{ ...f, left: x + w, top: y, width: h, height: d, transformOrigin: "left", transform: `translateZ(${h}px) rotateY(90deg)`, background: side }}>{faces.east}</div>
      <div style={{ ...f, left: x, top: y, width: h, height: d, transformOrigin: "left", transform: "rotateY(-90deg)", background: shade }}>{faces.west}</div>
      <div className="board-top" style={{ ...f, left: x, top: y, width: w, height: d, transform: `translateZ(${h}px)`, background: top, borderRadius: radius, ...topStyle }}>{topContent}</div>
    </>
  );
}

/** Ouverture sombre d'un connecteur, avec sa languette éventuelle. */
export function Slot({ style, tongue, round = false }: { style: CSSProperties; tongue?: string; round?: boolean }) {
  return (
    <span className={`absolute bg-[#05070b] shadow-[inset_0_1px_3px_rgb(0_0_0/0.9)] ${round ? "rounded-full" : "rounded-[2px]"}`} style={style}>
      {tongue && <span className="absolute inset-y-[4px] left-[2px] w-[4px] rounded-[1px]" style={{ background: tongue }} />}
    </span>
  );
}

/** Épaisseur du circuit imprimé (tranches tournées vers le bas). */
export function BoardEdges({ W, H, T, color }: { W: number; H: number; T: number; color: string }) {
  const s = (st: CSSProperties) => <span className="absolute" style={{ background: color, ...st }} />;
  return (
    <>
      {s({ left: 0, top: H, width: W, height: T, transformOrigin: "top", transform: "rotateX(-90deg)" })}
      {s({ left: 0, top: -T, width: W, height: T, transformOrigin: "bottom", transform: "rotateX(90deg)" })}
      {s({ left: W, top: 0, width: T, height: H, transformOrigin: "left", transform: "rotateY(90deg)" })}
      {s({ left: -T, top: 0, width: T, height: H, transformOrigin: "right", transform: "rotateY(-90deg)" })}
    </>
  );
}

/** Lueur douce d'un voyant (LED). */
export function Glow({ x, y, color, blink = false, size = 32 }: { x: number; y: number; color: string; blink?: boolean; size?: number }) {
  return (
    <span className={`pointer-events-none absolute rounded-full ${blink ? "animate-pulse motion-reduce:animate-none" : "led-glow"}`}
          style={{ left: x - size / 2, top: y - size / 2, width: size, height: size, background: `radial-gradient(circle, ${color}, transparent 65%)`, transform: "translateZ(3px)" }} />
  );
}

/** Texte de sérigraphie posé sur le circuit (dans un SVG). */
export const SILK = { fill: "rgb(255 255 255 / 0.72)", fontFamily: "var(--font-geist-mono), monospace", letterSpacing: ".8" } as const;
