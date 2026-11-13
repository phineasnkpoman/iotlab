import { PITCH } from "@/components/fx/board3d/primitives";

/*
 * Géométrie des schémas de câblage (même échelle que les cartes : 4,47 px/mm).
 * Repère monde : x vers l'est, y vers le sud, z vers le haut.
 * - le dessus des circuits imprimés des cartes est à z = 0 ;
 * - la table est à z = FLOOR ;
 * - les fils volent à z = WIRE_Z, juste au-dessus des connecteurs.
 */

export const P = PITCH;
export const FLOOR = -10;
export const BB_H = 24;
export const BB_TOP = FLOOR + BB_H;
export const WIRE_Z = 30;

/** Point d'attache d'un fil : position, hauteur de la surface et direction de sortie du fil. */
export interface Pt { x: number; y: number; z: number; dir?: [number, number] }

const N: [number, number] = [0, -1], S: [number, number] = [0, 1];

/* ---------- Platine d'essai (400 points : 30 colonnes, 2 x 5 rangées, 4 rails) ---------- */

export type Row = "t-" | "t+" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "b+" | "b-";
export const BB_W = 33 * P, BB_D = 18 * P;
export const ROW_Y: Record<Row, number> = {
  "t-": 1.3, "t+": 2.3, a: 4, b: 5, c: 6, d: 7, e: 8, f: 10, g: 11, h: 12, i: 13, j: 14, "b+": 15.7, "b-": 16.7,
};
/** Trou de la platine posée en (ox, oy). Colonnes 1 à 30. */
export const hole = (ox: number, oy: number, col: number, row: Row, dir?: [number, number]): Pt =>
  ({ x: ox + (col + 1) * P, y: oy + ROW_Y[row] * P, z: BB_TOP, dir });
/** Sur les rails, les trous vont par groupes de cinq : colonnes 6, 12, 18, 24 et 30 absentes. */
export const railHasHole = (col: number) => col % 6 !== 0;

/* ---------- Broches des cartes, dans le repère de la carte ---------- */

type PinMap = Record<string, Pt>;

function row(names: string[], x0: number, y: number, z: number, dir: [number, number]): PinMap {
  return Object.fromEntries(names.map((n, i) => [n, { x: x0 + (i + 0.5) * P, y, z, dir }]));
}

/** Arduino Uno vu de dessus, USB à l'ouest : connecteurs numériques au nord, alimentation et analogiques au sud. */
const UNO: PinMap = {
  ...row(["SCL", "SDA", "AREF", "GND.t", "13", "12", "11", "10", "9", "8"], 72, 4 + P / 2, 19, N),
  ...row(["7", "6", "5", "4", "3", "2", "1", "0"], 196, 4 + P / 2, 19, N),
  ...row(["NC", "IOREF", "RESET", "3.3V", "5V", "GND", "GND.2", "VIN"], 98, 224 + P / 2, 19, S),
  ...row(["A0", "A1", "A2", "A3", "A4", "A5"], 205, 224 + P / 2, 19, S),
};

/** Arduino Mega : mêmes connecteurs que l'Uno, plus la rangée « communication » et le double connecteur à l'est. */
const MEGA: PinMap = {
  ...row(["SCL", "SDA", "AREF", "GND.t", "13", "12", "11", "10", "9", "8"], 72, 4 + P / 2, 19, N),
  ...row(["7", "6", "5", "4", "3", "2", "1", "0"], 196, 4 + P / 2, 19, N),
  ...row(["14", "15", "16", "17", "18", "19", "20", "21"], 300, 4 + P / 2, 19, N),
  ...row(["NC", "IOREF", "RESET", "3.3V", "5V", "GND", "GND.2", "VIN"], 98, 224 + P / 2, 19, S),
  ...row(["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7"], 205, 224 + P / 2, 19, S),
  ...row(["A8", "A9", "A10", "A11", "A12", "A13", "A14", "A15"], 307, 224 + P / 2, 19, S),
  ...Object.fromEntries(Array.from({ length: 18 }, (_, j) => {
    const names = j === 0 ? ["5V.e1", "5V.e2"] : j === 17 ? ["GND.e1", "GND.e2"] : [String(22 + 2 * (j - 1)), String(23 + 2 * (j - 1))];
    return names.map((n, c) => [n, { x: 420 + (c + 0.5) * P, y: 14 + (j + 0.5) * P, z: 19, dir: [1, 0] as [number, number] }]);
  }).flat()),
};

/** ESP32-DevKitC : antenne à l'est, USB à l'ouest. Rangée nord = J2 (3V3…5V), rangée sud = J3 (GND…CLK). */
const ESP_X = (i: number) => 14 + (19 - i + 0.5) * P;
const ESP32: PinMap = {
  ...Object.fromEntries(["3V3", "EN", "36", "39", "34", "35", "32", "33", "25", "26", "27", "14", "12", "GND.1", "13", "D2", "D3", "CMD", "5V"]
    .map((n, k) => [n, { x: ESP_X(k + 1), y: 1 + P / 2, z: 8, dir: N }])),
  ...Object.fromEntries(["GND.2", "23", "22", "TX", "RX", "21", "GND.3", "19", "18", "5", "17", "16", "4", "0", "2", "15", "D1", "D0", "CLK"]
    .map((n, k) => [n, { x: ESP_X(k + 1), y: 113 + P / 2, z: 8, dir: S }])),
};

/** Raspberry Pi : connecteur GPIO au nord, broche 1 à l'ouest. Rangée intérieure = broches impaires. */
const PI: PinMap = Object.fromEntries(Array.from({ length: 40 }, (_, k) => {
  const pin = k + 1, col = Math.floor(k / 2), odd = pin % 2 === 1;
  return [String(pin), { x: 38 + (col + 0.5) * P, y: 7 + (odd ? 1.5 : 0.5) * P, z: 16, dir: N }];
}));

export const BOARD_PINS = { "arduino-uno": UNO, "arduino-mega": MEGA, esp32: ESP32, "raspberry-pi": PI } as const;

/** Broche d'une carte posée en (ox, oy), dans le repère monde. */
export function pin(board: keyof typeof BOARD_PINS, name: string, ox: number, oy: number): Pt {
  const p = BOARD_PINS[board][name];
  if (!p) throw new Error(`Broche inconnue : ${board} ${name}`);
  return { ...p, x: ox + p.x, y: oy + p.y };
}

/* ---------- Tracé des fils ---------- */

/** Courbe douce (Catmull-Rom convertie en Bézier) qui passe par tous les points. */
function smooth(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/**
 * Chemin d'un fil : il quitte chaque extrémité dans sa direction (vers le haut d'un connecteur nord,
 * vers le bas d'un connecteur sud…), passe par les points intermédiaires éventuels et arrive en douceur.
 */
export function wirePath(a: Pt, b: Pt, via: [number, number][] = [], reach?: number) {
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const k = reach ?? Math.min(70, Math.max(18, dist * 0.22));
  const da = a.dir ?? [0, Math.sign(b.y - a.y) || 1];
  const db = b.dir ?? [0, Math.sign(a.y - b.y) || -1];
  const pts: [number, number][] = [
    [a.x, a.y], [a.x + da[0] * k, a.y + da[1] * k], ...via, [b.x + db[0] * k, b.y + db[1] * k], [b.x, b.y],
  ];
  return smooth(pts);
}
