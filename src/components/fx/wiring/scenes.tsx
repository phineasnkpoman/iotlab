"use client";

import type { ReactNode } from "react";
import { BoardBody } from "@/components/fx/board3d/Board3D";
import { FLOOR, hole, pin, type Pt, type Row } from "./geometry";
import {
  Breadboard, Buzzer, Dht22, HcSr04, Lcd1602, LdrModule, Led, Pir, Pot, PushButton, Resistor, Servo, Spot, WifiWaves,
  lcdPins, ldrPins, pirPins, servoCable,
} from "./parts";

/*
 * Les dix montages en 3D. Chaque scène place la carte, la platine et les composants
 * (coordonnées monde, voir geometry.ts) et déclare ses fils. Les identifiants des fils
 * et des composants sont ceux que citent les étapes dans src/data/montages.ts.
 */

export interface WireDef { id: string; from: Pt; to: Pt; color: string; via?: [number, number][]; reach?: number }
export interface SceneDef {
  /** Emprise de la scène dans le repère monde. */
  bounds: { x: number; y: number; w: number; h: number };
  wires: WireDef[];
  render: () => ReactNode;
}

export const WIRE = {
  red: "#e5484d", black: "#2b2f36", yellow: "#f2b134", orange: "#f08a24", green: "#22c55e",
  blue: "#3b82f6", white: "#e8ebef", brown: "#8a5a35", purple: "#a855f7",
} as const;

const bbAt = (ox: number, oy: number) => (c: number, r: Row, dir?: [number, number]) => hole(ox, oy, c, r, dir);
const S: [number, number] = [0, 1];
/** Halo sous une carte, pour l'étape qui la met en avant. */
const boardSpot = (id: string, x: number, y: number, w: number, d: number) => <Spot id={id} x={x} y={y} w={w} d={d} z={FLOOR + 2} />;
const Board = ({ slug, x, y }: { slug: Parameters<typeof BoardBody>[0]["slug"]; x: number; y: number }) => (
  <div className="pointer-events-none absolute left-0 top-0 [transform-style:preserve-3d]" style={{ transform: `translate(${x}px, ${y}px)` }}>
    <BoardBody slug={slug} />
  </div>
);

/* 1. LED clignotante (Arduino Uno) */
const ledClignotante = (): SceneDef => {
  const U = (n: string) => pin("arduino-uno", n, 0, 0), h = bbAt(360, 18);
  return {
    bounds: { x: -40, y: -70, w: 800, h: 330 },
    wires: [
      { id: "w-d13", from: U("13"), to: h(10, "a"), color: WIRE.yellow },
      { id: "w-gnd", from: h(15, "a"), to: U("GND.t"), color: WIRE.black },
    ],
    render: () => <>
      <Board slug="arduino-uno" x={0} y={0} />
      <Breadboard x={360} y={18} />
      <Resistor id="r" a={h(10, "b")} b={h(14, "b")} value="220" />
      <Led id="led" a={h(14, "d")} c={h(15, "d")} color="red" light="blink" />
    </>,
  };
};

/* 2. Bouton poussoir et LED (Arduino Uno) */
const boutonLed = (): SceneDef => {
  const U = (n: string) => pin("arduino-uno", n, 0, 0), h = bbAt(360, 18);
  return {
    bounds: { x: -40, y: -70, w: 800, h: 340 },
    wires: [
      { id: "w-d9", from: U("9"), to: h(6, "a"), color: WIRE.orange },
      { id: "w-gnd-led", from: h(11, "a"), to: U("GND.t"), color: WIRE.black },
      { id: "w-d2", from: U("2"), to: h(18, "a"), color: WIRE.blue },
      { id: "w-gnd-btn", from: h(20, "j"), to: U("GND"), color: WIRE.black },
    ],
    render: () => <>
      <Board slug="arduino-uno" x={0} y={0} />
      <Breadboard x={360} y={18} />
      <Resistor id="r" a={h(6, "b")} b={h(10, "b")} value="220" />
      <Led id="led" a={h(10, "d")} c={h(11, "d")} color="green" light="press" />
      <PushButton id="btn" legs={[h(18, "e"), h(20, "e"), h(18, "f"), h(20, "f")]} animate />
    </>,
  };
};

/* 3. Mesure de distance par ultrasons (Arduino Uno) */
const ultrasons = (): SceneDef => {
  const U = (n: string) => pin("arduino-uno", n, 0, 0), h = bbAt(360, 18);
  return {
    bounds: { x: -40, y: -70, w: 800, h: 340 },
    wires: [
      { id: "w-5v", from: U("5V"), to: h(12, "d"), color: WIRE.red },
      { id: "w-gnd", from: U("GND"), to: h(15, "d"), color: WIRE.black },
      { id: "w-trig", from: U("9"), to: h(13, "d", S), color: WIRE.yellow, via: [[340, 112], [430, 150]] },
      { id: "w-echo", from: U("10"), to: h(14, "d", S), color: WIRE.green, via: [[352, 104], [445, 158]] },
    ],
    render: () => <>
      <Board slug="arduino-uno" x={0} y={0} />
      <Breadboard x={360} y={18} />
      <HcSr04 id="us" pins={[h(12, "a"), h(13, "a"), h(14, "a"), h(15, "a")]} waves />
    </>,
  };
};

/* 4. Servomoteur piloté par un potentiomètre (Arduino Uno) */
const servoPot = (): SceneDef => {
  const U = (n: string) => pin("arduino-uno", n, 0, 0), h = bbAt(360, 18);
  const [brown, red, orange] = servoCable(790, 74);
  return {
    bounds: { x: -40, y: -70, w: 990, h: 340 },
    wires: [
      { id: "w-5v", from: U("5V"), to: h(2, "b+"), color: WIRE.red },
      { id: "w-gnd", from: U("GND"), to: h(3, "b-"), color: WIRE.black },
      { id: "w-pot-gnd", from: h(8, "i"), to: h(8, "b-"), color: WIRE.black, reach: 6 },
      { id: "w-pot-vcc", from: h(10, "i"), to: h(10, "b+"), color: WIRE.red, reach: 6 },
      { id: "w-a0", from: h(9, "j"), to: U("A0"), color: WIRE.green },
      { id: "w-servo-gnd", from: brown, to: h(28, "b-"), color: WIRE.brown },
      { id: "w-servo-5v", from: red, to: h(27, "b+"), color: WIRE.red },
      { id: "w-servo-sig", from: orange, to: h(25, "a", [0, -1]), color: WIRE.orange, via: [[700, 30]] },
      { id: "w-d9", from: h(25, "c"), to: U("9"), color: WIRE.orange },
    ],
    render: () => <>
      <Board slug="arduino-uno" x={0} y={0} />
      <Breadboard x={360} y={18} />
      <Pot id="pot" legs={[h(8, "h"), h(9, "h"), h(10, "h")]} animate />
      <Servo id="servo" x={790} y={74} sweep />
    </>,
  };
};

/* 5. Écran LCD 16 x 2 en I2C (Arduino Uno) */
const ecranLcd = (): SceneDef => {
  const U = (n: string) => pin("arduino-uno", n, 0, 0), L = lcdPins(390, 40);
  return {
    bounds: { x: -40, y: -20, w: 820, h: 330 },
    wires: [
      { id: "w-gnd", from: U("GND"), to: L.GND, color: WIRE.black },
      { id: "w-vcc", from: U("5V"), to: L.VCC, color: WIRE.red },
      { id: "w-sda", from: U("A4"), to: L.SDA, color: WIRE.blue },
      { id: "w-scl", from: U("A5"), to: L.SCL, color: WIRE.yellow },
    ],
    render: () => <>
      <Board slug="arduino-uno" x={0} y={0} />
      <Lcd1602 id="lcd" x={390} y={40} lines={["IoT LAB ESATIC", "Bonjour !   42"]} />
    </>,
  };
};

/* 6. Alarme de luminosité : photorésistance et buzzer (Arduino Uno) */
const alarmeLumiere = (): SceneDef => {
  const U = (n: string) => pin("arduino-uno", n, 0, 0), h = bbAt(360, 18), L = ldrPins(420, 262);
  return {
    bounds: { x: -40, y: -70, w: 800, h: 420 },
    wires: [
      { id: "w-d8", from: U("8"), to: h(14, "a"), color: WIRE.orange },
      { id: "w-gnd-bz", from: h(17, "a"), to: U("GND.t"), color: WIRE.black },
      { id: "w-ldr-vcc", from: L.VCC, to: U("5V"), color: WIRE.red },
      { id: "w-ldr-gnd", from: L.GND, to: U("GND"), color: WIRE.black },
      { id: "w-ldr-ao", from: L.AO, to: U("A0"), color: WIRE.green },
    ],
    render: () => <>
      <Board slug="arduino-uno" x={0} y={0} />
      <Breadboard x={360} y={18} />
      <Buzzer id="buzzer" plus={h(14, "e")} minus={h(17, "e")} sound />
      <LdrModule id="ldr" x={420} y={262} />
    </>,
  };
};

/* 7. Station météo : DHT22 et écran LCD (Arduino Mega) */
const stationMega = (): SceneDef => {
  const M = (n: string) => pin("arduino-mega", n, 0, 0), h = bbAt(500, 30), L = lcdPins(500, -230);
  return {
    bounds: { x: -40, y: -250, w: 940, h: 520 },
    wires: [
      { id: "w-dht-vcc", from: M("5V.e1"), to: h(6, "c", S), color: WIRE.red, via: [[520, 128]] },
      { id: "w-dht-data", from: M("22"), to: h(7, "c", S), color: WIRE.green, via: [[530, 138]] },
      { id: "w-dht-gnd", from: M("GND.e1"), to: h(9, "c", S), color: WIRE.black },
      { id: "w-lcd-gnd", from: M("GND.t"), to: L.GND, color: WIRE.black },
      { id: "w-lcd-vcc", from: M("5V.e2"), to: L.VCC, color: WIRE.red, via: [[478, -60]] },
      { id: "w-sda", from: M("20"), to: L.SDA, color: WIRE.blue },
      { id: "w-scl", from: M("21"), to: L.SCL, color: WIRE.yellow },
    ],
    render: () => <>
      <Board slug="arduino-mega" x={0} y={0} />
      <Breadboard x={500} y={30} />
      <Dht22 id="dht" pins={[h(6, "a"), h(7, "a"), h(8, "a"), h(9, "a")]} />
      <Lcd1602 id="lcd" x={500} y={-230} lines={["Temp : 24.5 C", "Humid: 40 %"]} />
    </>,
  };
};

/* 8. Capteur DHT22 connecté en Wi-Fi (ESP32) */
const espDhtWifi = (): SceneDef => {
  const E = (n: string) => pin("esp32", n, 0, 60), h = bbAt(300, 0);
  return {
    bounds: { x: -30, y: -60, w: 730, h: 320 },
    wires: [
      { id: "w-3v3", from: E("3V3"), to: h(8, "c", S), color: WIRE.red, via: [[300, 112]] },
      { id: "w-data", from: E("15"), to: h(9, "c", S), color: WIRE.green, via: [[310, 128]] },
      { id: "w-gnd", from: E("GND.2"), to: h(11, "c", S), color: WIRE.black },
    ],
    render: () => <>
      {boardSpot("esp", 0, 60, 243, 125)}
      <Board slug="esp32" x={0} y={60} />
      <Breadboard x={300} y={0} />
      <Dht22 id="dht" pins={[h(8, "a"), h(9, "a"), h(10, "a"), h(11, "a")]} />
      <WifiWaves x={177} y={122} z={44} />
    </>,
  };
};

/* 9. Détecteur de mouvement PIR (ESP32) */
const espPir = (): SceneDef => {
  const E = (n: string) => pin("esp32", n, 0, 60), h = bbAt(300, 0), Q = pirPins(40, 262);
  return {
    bounds: { x: -70, y: -40, w: 770, h: 430 },
    wires: [
      { id: "w-pir-vcc", from: Q.VCC, to: E("5V"), color: WIRE.red, via: [[-40, 236], [-46, 40]] },
      { id: "w-pir-out", from: Q.OUT, to: E("4"), color: WIRE.yellow },
      { id: "w-pir-gnd", from: Q.GND, to: E("GND.3"), color: WIRE.black },
      { id: "w-led", from: E("2"), to: h(10, "j"), color: WIRE.orange },
      { id: "w-led-gnd", from: h(15, "j"), to: E("GND.2"), color: WIRE.black },
    ],
    render: () => <>
      {boardSpot("esp", 0, 60, 243, 125)}
      <Board slug="esp32" x={0} y={60} />
      <Breadboard x={300} y={0} />
      <Resistor id="r" a={h(10, "i")} b={h(14, "i")} value="220" />
      <Led id="led" a={h(14, "g")} c={h(15, "g")} color="red" light="motion" />
      <Pir id="pir" x={40} y={262} />
    </>,
  };
};

/* 10. LED et bouton sur les GPIO (Raspberry Pi) */
const piLedBouton = (): SceneDef => {
  const R = (n: string) => pin("raspberry-pi", n, 0, 0), h = bbAt(0, -260);
  return {
    bounds: { x: -40, y: -290, w: 480, h: 570 },
    wires: [
      { id: "w-gpio17", from: R("11"), to: h(6, "j"), color: WIRE.orange },
      { id: "w-gnd-led", from: h(11, "j"), to: R("6"), color: WIRE.black },
      { id: "w-gpio27", from: R("13"), to: h(18, "j"), color: WIRE.blue },
      { id: "w-gnd-btn", from: h(20, "j"), to: R("14"), color: WIRE.black },
    ],
    render: () => <>
      <Board slug="raspberry-pi" x={0} y={0} />
      <Breadboard x={0} y={-260} />
      <Resistor id="r" a={h(6, "h")} b={h(10, "h")} value="330" />
      <Led id="led" a={h(10, "f")} c={h(11, "f")} color="yellow" light="press" />
      <PushButton id="btn" legs={[h(18, "e"), h(20, "e"), h(18, "f"), h(20, "f")]} color="#d0312d" animate />
    </>,
  };
};

export const SCENES = {
  "led-clignotante": ledClignotante,
  "bouton-led": boutonLed,
  "ultrasons-hc-sr04": ultrasons,
  "servo-potentiometre": servoPot,
  "ecran-lcd-i2c": ecranLcd,
  "alarme-lumiere": alarmeLumiere,
  "station-meteo-mega": stationMega,
  "esp32-dht22-wifi": espDhtWifi,
  "esp32-detecteur-pir": espPir,
  "raspberry-pi-led-bouton": piLedBouton,
} as const;

export type MontageSlug = keyof typeof SCENES;
