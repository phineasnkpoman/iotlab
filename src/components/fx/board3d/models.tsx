import type { ReactNode } from "react";
import { BLACK, Box, CREAM, Glow, METAL, PITCH, PORT_FACE, SILK, Slot, holes, pins } from "./primitives";

/*
 * Modèles 3D des cartes du catalogue, à l'échelle (4,47 px/mm).
 * On reproduit la forme et les composants, jamais les logos ni les noms de marque :
 * la sérigraphie porte « IOT LAB ESATIC » et des repères fonctionnels (GPIO, POWER, ANALOG IN…).
 */

export type BoardSlug = "arduino-uno" | "arduino-mega" | "esp32" | "raspberry-pi";

export interface PartDef {
  id: string;
  label: string;
  text: string;
  /** Emprise au sol [x, y, largeur, profondeur] : le halo de sélection s'y dessine. */
  spots: [number, number, number, number][];
  node: ReactNode;
}

export interface BoardModel {
  W: number; H: number; T: number;
  /** Mise à l'échelle d'affichage, pour que toutes les cartes occupent une place comparable. */
  fit: number;
  rest: { rx: number; rz: number };
  radius: number;
  pcb: string;
  edge: string;
  ariaLabel: string;
  base: ReactNode;
  parts: PartDef[];
}

/** Connecteur à broches au pas de 2,54 mm (femelle : trous ; mâle : picots dorés). */
function Header({ x, y, n, rows = 1, h = 19, male = false, vertical = false }: { x: number; y: number; n: number; rows?: number; h?: number; male?: boolean; vertical?: boolean }) {
  const len = n * PITCH, wid = rows * PITCH;
  return <Box x={x} y={y} w={vertical ? wid : len} d={vertical ? len : wid} h={h} {...BLACK} radius={1} topStyle={male ? pins() : holes()} />;
}

/** Bouton poussoir : socle métallique et capuchon noir. */
function Button({ x, y, s = 20 }: { x: number; y: number; s?: number }) {
  return <Box x={x} y={y} w={s} d={s} h={7} {...METAL} radius={2}
              topContent={<span className="absolute inset-[4px] rounded-full bg-[#1b1d22] shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]" />} />;
}

/** Port USB-B (Arduino), ouverture tournée vers l'ouest. */
function UsbB({ x, y }: { x: number; y: number }) {
  return <Box x={x} y={y} w={72} d={54} h={30} {...METAL} radius={2}
              west={<span className="absolute inset-0" style={{ background: PORT_FACE }}><Slot style={{ left: 6, right: 6, top: 12, bottom: 12 }} /></span>} />;
}

/** Prise jack d'alimentation, trou rond tourné vers l'ouest. */
function Jack({ x, y }: { x: number; y: number }) {
  return <Box x={x} y={y} w={63} d={40} h={26} {...BLACK} radius={3}
              west={<Slot round style={{ left: 6, width: 14, top: 13, height: 14 }} />} />;
}

const led = (x: number, y: number, top: string, side: string) => <Box x={x} y={y} w={8} d={5} h={2} top={top} side={side} shade={side} />;
const LED = { red: ["#ff5a5d", "#b3262a"], green: ["#4ee08f", "#1f8f5c"], amber: ["#ffb347", "#b46b12"] } as const;

/* ======================================================================
   Raspberry Pi 4 Model B : 85 x 56 mm
   ====================================================================== */
const PI_W = 380, PI_H = 252;
const raspberryPi: BoardModel = {
  W: PI_W, H: PI_H, T: 6, fit: 1, rest: { rx: 58, rz: 30 }, radius: 12,
  pcb: "linear-gradient(140deg,#11405a,#0a2534 55%,#081d29)",
  edge: "linear-gradient(#174a5f,#06141d)",
  ariaLabel: "Ordinateur monocarte de type Raspberry Pi en 3D",
  base: (
    <>
      <svg viewBox={`0 0 ${PI_W} ${PI_H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <g fill="none" stroke="#d9a441" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity=".5">
          <path d="M135 78 V46 H70 V29" /><path d="M150 78 V40 H120 V29" /><path d="M166 104 H186" /><path d="M166 118 H186" />
          <path d="M234 107 H270 V60 H296" /><path d="M234 118 H280 V124 H296" /><path d="M166 132 H200 V150" />
          <path d="M120 140 V190 H62 V236" /><path d="M140 140 V200 H93 V238" /><path d="M150 140 V210 H133 V238" />
          <path d="M104 100 H74 V96" /><path d="M104 120 H40 V176" /><path d="M222 166 H252 V172" />
        </g>
        <g fill="#081a24" stroke="#d9a441" strokeWidth="2">
          {[[15.6, 15.6], [274.9, 15.6], [15.6, 234.6], [274.9, 234.6]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6.5" />)}
        </g>
        <g {...SILK} fontSize="7">
          <text x="40" y="40">GPIO</text><text x="30" y="230">PWR</text><text x="80" y="232">HDMI0</text>
          <text x="120" y="232">HDMI1</text><text x="168" y="226">A/V</text><text x="16" y="194" fontSize="6">PWR ACT</text>
          <text x="190" y="196" fontSize="9" letterSpacing="2">IOT LAB ESATIC</text>
        </g>
      </svg>
      <Box x={186} y={92} w={48} d={30} h={3} {...BLACK} />
      <Box x={70} y={160} w={22} d={18} h={2} {...BLACK} />
      <Box x={200} y={150} w={22} d={16} h={2} {...BLACK} />
      <Box x={8} y={112} w={10} d={64} h={6} {...CREAM} radius={1} />
      <Box x={252} y={140} w={10} d={64} h={6} {...CREAM} radius={1} />
      <Box x={166} y={234} w={24} d={24} h={14} {...BLACK} radius={3}
           south={<span className="absolute left-1/2 top-[3px] h-2 w-2 -translate-x-1/2 rounded-full bg-[#05070b]" />} />
      {led(6, 198, ...LED.red)}{led(6, 207, ...LED.green)}
      <Glow x={10} y={200} color="rgb(255 70 70 / 0.75)" />
      <Glow x={10} y={210} color="rgb(78 224 143 / 0.6)" blink />
    </>
  ),
  parts: [
    { id: "soc", label: "Processeur", text: "Le cerveau de la carte : quatre cœurs à 1,8 GHz qui font tourner Linux et vos programmes Python.", spots: [[104, 78, 62, 62]],
      node: <Box x={104} y={78} w={62} d={62} h={5} {...METAL} radius={4} topContent={<>
        <span className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgb(255_255_255/0.45)_45%,transparent_60%)]" />
        <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-black/25" /></>} /> },
    { id: "gpio", label: "GPIO", text: "40 broches pour brancher capteurs, LED et moteurs, en logique 3,3 V.", spots: [[38, 7, 224, 22]],
      node: <Header x={38} y={7} n={20} rows={2} h={16} male /> },
    { id: "wifi", label: "Wi-Fi", text: "La radio intégrée, Wi-Fi double bande et Bluetooth 5.0, qui relie la carte à vos objets connectés.", spots: [[28, 46, 46, 50]],
      node: <Box x={28} y={46} w={46} d={50} h={5} {...METAL} radius={3} topContent={<span className="absolute inset-3 rounded-[2px] border border-black/15" />} /> },
    { id: "usb", label: "USB", text: "Deux ports USB 3.0 (bleus) et deux USB 2.0 : clavier, souris, clé USB, webcam.", spots: [[296, 96, 90, 56], [296, 162, 90, 56]],
      node: <>
        {[["#2b68ea", 96], ["#1b1d22", 162]].map(([tongue, y]) => (
          <Box key={y as number} x={296} y={y as number} w={90} d={56} h={32} {...METAL} radius={2}
               east={<span className="absolute inset-0" style={{ background: PORT_FACE }}>
                 <Slot style={{ left: 3, width: 11, top: 5, bottom: 5 }} tongue={tongue as string} />
                 <Slot style={{ left: 18, width: 11, top: 5, bottom: 5 }} tongue={tongue as string} />
               </span>} />
        ))}</> },
    { id: "eth", label: "Ethernet", text: "La prise réseau Gigabit, idéale pour un serveur ou une passerelle IoT.", spots: [[296, 12, 90, 74]],
      node: <Box x={296} y={12} w={90} d={74} h={28} {...METAL} radius={2}
                 east={<span className="absolute inset-0" style={{ background: PORT_FACE }}>
                   <Slot style={{ left: 5, right: 5, top: 12, bottom: 12 }} />
                   <span className="absolute left-[2px] top-[3px] h-[5px] w-[3px] bg-[#3fdc7f]" />
                   <span className="absolute bottom-[3px] left-[2px] h-[5px] w-[3px] bg-[#f2b134]" />
                 </span>} /> },
    { id: "hdmi", label: "HDMI", text: "Deux sorties micro-HDMI pour brancher un ou deux écrans, jusqu'en 4K.", spots: [[80, 238, 26, 20], [120, 238, 26, 20]],
      node: <>{[80, 120].map((x) => (
        <Box key={x} x={x} y={238} w={26} d={20} h={10} {...METAL} radius={2}
             south={<span className="absolute inset-0" style={{ background: PORT_FACE }}>
               <span className="absolute left-[4px] right-[4px] top-[3px] h-[4px] bg-[#05070b] [clip-path:polygon(0_0,100%_0,88%_100%,12%_100%)]" />
             </span>} />))}</> },
    { id: "power", label: "Alimentation", text: "L'entrée USB-C : il faut une alimentation 5 V capable de fournir 3 A.", spots: [[30, 236, 32, 22]],
      node: <Box x={30} y={236} w={32} d={22} h={12} {...METAL} radius={3}
                 south={<span className="absolute inset-0" style={{ background: PORT_FACE }}><span className="absolute left-[6px] right-[6px] top-[3px] h-[6px] rounded-full bg-[#05070b]" /></span>} /> },
  ],
};

/* ======================================================================
   Arduino Uno R3 : 68,6 x 53,4 mm
   ====================================================================== */
const UNO_W = 307, UNO_H = 239;
/** Pattes d'un circuit DIP, dessinées sur le circuit sous les bords de la puce. */
const dipLegs = (x: number, y1: number, y2: number, n: number) =>
  Array.from({ length: n }, (_, i) => x + 6 + i * PITCH).flatMap((lx) => [
    <rect key={`a${lx}`} x={lx} y={y1} width="4" height="6" rx="1" fill="#c9d1dc" />,
    <rect key={`b${lx}`} x={lx} y={y2} width="4" height="6" rx="1" fill="#c9d1dc" />,
  ]);

const arduinoUno: BoardModel = {
  W: UNO_W, H: UNO_H, T: 7, fit: 1.12, rest: { rx: 56, rz: -30 }, radius: 10,
  pcb: "linear-gradient(140deg,#0f7083,#0a4f5e 55%,#083f4b)",
  edge: "linear-gradient(#0d5a69,#04252d)",
  ariaLabel: "Carte de type Arduino Uno en 3D",
  base: (
    <>
      <svg viewBox={`0 0 ${UNO_W} ${UNO_H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <g fill="none" stroke="#d9a441" strokeWidth="1.2" strokeLinecap="round" opacity=".45">
          <path d="M86 70 H110 V150" /><path d="M150 150 V100 H180 V30" /><path d="M240 150 V60 H260 V30" />
          <path d="M140 184 V215" /><path d="M230 184 V215" /><path d="M54 190 H96 V215" /><path d="M200 118 H170" />
        </g>
        {dipLegs(118, 144, 184, 14)}
        <g fill="#062f38" stroke="#d9a441" strokeWidth="2">
          {[[60, 228], [60, 12], [295, 205], [295, 80]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" />)}
        </g>
        <g {...SILK} fontSize="7">
          <text x="150" y="27">DIGITAL (PWM ~)</text><text x="120" y="219">POWER</text><text x="214" y="219">ANALOG IN</text>
          <text x="10" y="40">RESET</text><text x="282" y="96">ICSP</text><text x="114" y="94" fontSize="6">L  TX  RX</text>
          <text x="128" y="120" fontSize="9" letterSpacing="2">IOT LAB ESATIC</text>
        </g>
      </svg>
      <Box x={64} y={56} w={22} d={22} h={2} {...BLACK} />
      <Box x={170} y={118} w={36} d={14} h={9} {...METAL} radius={7} />
      <Box x={62} y={176} w={16} d={16} h={16} {...METAL} radius={8} />
      <Box x={86} y={200} w={18} d={14} h={3} {...BLACK} />
      <Box x={284} y={100} w={17} d={26} h={12} {...BLACK} radius={1} topStyle={pins()} />
      {led(114, 98, ...LED.amber)}{led(126, 98, ...LED.amber)}{led(138, 98, ...LED.amber)}{led(250, 64, ...LED.green)}
      <Glow x={118} y={100} color="rgb(255 179 71 / 0.6)" size={24} />
      <Glow x={254} y={66} color="rgb(78 224 143 / 0.7)" />
    </>
  ),
  parts: [
    { id: "mcu", label: "Microcontrôleur", text: "La puce ATmega328P exécute votre programme : 16 MHz, 32 Ko de mémoire flash et 2 Ko de RAM.", spots: [[118, 150, 160, 34]],
      node: <Box x={118} y={150} w={160} d={34} h={9} {...BLACK} radius={2} topContent={<>
        <span className="absolute -left-[7px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 rounded-full bg-[#0b0c0f]" />
        <span className="absolute left-3 top-2 h-1.5 w-1.5 rounded-full bg-white/15" />
        <span className="absolute inset-0 grid place-items-center font-mono text-[8px] tracking-[0.15em] text-white/55">ATMEGA328P</span></>} /> },
    { id: "digital", label: "Broches numériques", text: "14 entrées/sorties numériques (D0 à D13), dont 6 en PWM, repérées par le signe ~.", spots: [[72, 4, 114, 11], [196, 4, 91, 11]],
      node: <><Header x={72} y={4} n={10} /><Header x={196} y={4} n={8} /></> },
    { id: "analog", label: "Entrées analogiques", text: "6 entrées A0 à A5 qui mesurent une tension entre 0 et 5 V sur 10 bits (0 à 1023).", spots: [[205, 224, 68, 11]],
      node: <Header x={205} y={224} n={6} /> },
    { id: "power", label: "Alimentation", text: "Les broches 5 V, 3,3 V, GND et VIN pour alimenter vos capteurs et modules.", spots: [[98, 224, 91, 11]],
      node: <Header x={98} y={224} n={8} /> },
    { id: "usb", label: "USB", text: "Le port USB-B sert à téléverser le programme, à dialoguer avec le moniteur série et à alimenter la carte.", spots: [[-27, 40, 72, 54]],
      node: <UsbB x={-27} y={40} /> },
    { id: "jack", label: "Prise jack", text: "Une alimentation externe de 7 à 12 V, pratique quand la carte n'est plus reliée à l'ordinateur.", spots: [[-9, 172, 63, 40]],
      node: <Jack x={-9} y={172} /> },
    { id: "reset", label: "Reset", text: "Le bouton reset redémarre votre programme depuis le début, sans débrancher la carte.", spots: [[12, 8, 22, 22]],
      node: <Button x={12} y={8} s={22} /> },
  ],
};

/* ======================================================================
   Arduino Mega 2560 Rev3 : 101,5 x 53,3 mm
   ====================================================================== */
const MEGA_W = 454, MEGA_H = 238;
/** Pattes d'un boîtier carré TQFP, dessinées tout autour de la puce. */
const qfpLegs = (x: number, y: number, s: number, n: number) => {
  const step = (s - 8) / (n - 1);
  return Array.from({ length: n }, (_, i) => 4 + i * step).flatMap((o) => [
    <rect key={`t${o}`} x={x + o - 1} y={y - 5} width="2" height="5" fill="#c9d1dc" />,
    <rect key={`b${o}`} x={x + o - 1} y={y + s} width="2" height="5" fill="#c9d1dc" />,
    <rect key={`l${o}`} x={x - 5} y={y + o - 1} width="5" height="2" fill="#c9d1dc" />,
    <rect key={`r${o}`} x={x + s} y={y + o - 1} width="5" height="2" fill="#c9d1dc" />,
  ]);
};

const arduinoMega: BoardModel = {
  W: MEGA_W, H: MEGA_H, T: 7, fit: 0.82, rest: { rx: 56, rz: -28 }, radius: 10,
  pcb: "linear-gradient(140deg,#0e5f86,#0a4463 55%,#07354f)",
  edge: "linear-gradient(#0d4f70,#041c2a)",
  ariaLabel: "Carte de type Arduino Mega 2560 en 3D",
  base: (
    <>
      <svg viewBox={`0 0 ${MEGA_W} ${MEGA_H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <g fill="none" stroke="#d9a441" strokeWidth="1.2" strokeLinecap="round" opacity=".45">
          <path d="M86 70 H130 V128 H195" /><path d="M232 96 V40 H240 V16" /><path d="M264 128 H330 V16" /><path d="M264 140 H410 V120" />
          <path d="M215 160 V200 H250 V224" /><path d="M250 160 V190 H350 V224" /><path d="M54 190 H96 V224" /><path d="M200 176 H185" />
        </g>
        {qfpLegs(200, 96, 64, 25)}
        <g fill="#05283b" stroke="#d9a441" strokeWidth="2">
          {[[62, 227], [68, 12], [295, 205], [295, 80], [403, 12], [431, 227]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" />)}
        </g>
        <g {...SILK} fontSize="7">
          <text x="150" y="27">PWM ~</text><text x="320" y="27">COMMUNICATION</text><text x="120" y="219">POWER</text>
          <text x="250" y="219">ANALOG IN</text><text x="384" y="200" fontSize="6">DIGITAL</text><text x="10" y="40">RESET</text>
          <text x="114" y="94" fontSize="6">L  TX  RX</text><text x="276" y="176" fontSize="9" letterSpacing="2">IOT LAB ESATIC</text>
        </g>
      </svg>
      <Box x={64} y={56} w={22} d={22} h={2} {...BLACK} />
      <Box x={168} y={170} w={30} d={12} h={8} {...METAL} radius={6} />
      <Box x={62} y={176} w={16} d={16} h={16} {...METAL} radius={8} />
      <Box x={86} y={200} w={18} d={14} h={3} {...BLACK} />
      <Box x={376} y={108} w={17} d={26} h={12} {...BLACK} radius={1} topStyle={pins()} />
      {led(114, 98, ...LED.amber)}{led(126, 98, ...LED.amber)}{led(138, 98, ...LED.amber)}{led(250, 64, ...LED.green)}
      <Glow x={118} y={100} color="rgb(255 179 71 / 0.6)" size={24} />
      <Glow x={254} y={66} color="rgb(78 224 143 / 0.7)" />
    </>
  ),
  parts: [
    { id: "mcu", label: "Microcontrôleur", text: "L'ATmega2560 à 16 MHz : 256 Ko de flash et 8 Ko de RAM, quatre fois la mémoire vive d'une Uno.", spots: [[200, 96, 64, 64]],
      node: <Box x={200} y={96} w={64} d={64} h={3} {...BLACK} radius={2} topContent={<>
        <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-white/15" />
        <span className="absolute inset-0 grid place-items-center font-mono text-[7px] tracking-[0.12em] text-white/55">ATMEGA2560</span></>} /> },
    { id: "digital", label: "Broches numériques", text: "54 entrées/sorties numériques, dont 15 en PWM, et 4 ports série matériels.", spots: [[72, 4, 114, 11], [196, 4, 91, 11], [300, 4, 91, 11], [420, 14, 23, 204]],
      node: <><Header x={72} y={4} n={10} /><Header x={196} y={4} n={8} /><Header x={300} y={4} n={8} /><Header x={420} y={14} n={18} rows={2} vertical /></> },
    { id: "analog", label: "Entrées analogiques", text: "16 entrées A0 à A15, lues sur 10 bits : de quoi brancher beaucoup de capteurs à la fois.", spots: [[205, 224, 91, 11], [307, 224, 91, 11]],
      node: <><Header x={205} y={224} n={8} /><Header x={307} y={224} n={8} /></> },
    { id: "power", label: "Alimentation", text: "Les broches 5 V, 3,3 V, GND et VIN, comme sur une Uno.", spots: [[98, 224, 91, 11]],
      node: <Header x={98} y={224} n={8} /> },
    { id: "usb", label: "USB", text: "Le port USB-B : téléversement, moniteur série et alimentation.", spots: [[-27, 40, 72, 54]],
      node: <UsbB x={-27} y={40} /> },
    { id: "jack", label: "Prise jack", text: "Une alimentation externe de 7 à 12 V pour les projets autonomes.", spots: [[-9, 172, 63, 40]],
      node: <Jack x={-9} y={172} /> },
    { id: "reset", label: "Reset", text: "Redémarre le programme depuis le début.", spots: [[12, 8, 22, 22]],
      node: <Button x={12} y={8} s={22} /> },
  ],
};

/* ======================================================================
   ESP32-DevKitC (module ESP32-WROOM-32) : 54,4 x 27,9 mm
   ====================================================================== */
const ESP_W = 243, ESP_H = 125;
const esp32: BoardModel = {
  W: ESP_W, H: ESP_H, T: 7, fit: 1.45, rest: { rx: 54, rz: -28 }, radius: 6,
  pcb: "linear-gradient(140deg,#24272c,#121417 60%,#0b0c0e)",
  edge: "linear-gradient(#2a2d33,#060708)",
  ariaLabel: "Carte de développement ESP32 en 3D",
  base: (
    <>
      <svg viewBox={`0 0 ${ESP_W} ${ESP_H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <g fill="none" stroke="#d9a441" strokeWidth="1" strokeLinecap="round" opacity=".35">
          <path d="M26 62 H56" /><path d="M78 63 H134" /><path d="M101 36 V22" /><path d="M114 30 H134" /><path d="M60 74 V100" />
        </g>
        <g {...SILK} fontSize="6">
          <text x="30" y="44">EN</text><text x="28" y="86">BOOT</text>
          <text x="58" y="98" fontSize="7" letterSpacing="1.5">IOT LAB ESATIC</text>
        </g>
      </svg>
      <Box x={56} y={52} w={22} d={22} h={2} {...BLACK} />
      {led(98, 82, ...LED.red)}
      <Glow x={102} y={84} color="rgb(255 70 70 / 0.75)" size={28} />
    </>
  ),
  parts: [
    { id: "module", label: "Module ESP32", text: "Deux cœurs à 240 MHz, 520 Ko de RAM et 4 Mo de flash, protégés par un blindage métallique.", spots: [[134, 22, 86, 80]],
      node: <>
        <Box x={134} y={22} w={86} d={80} h={3} top="linear-gradient(135deg,#27313d,#151b23)" side="#1c232c" shade="#0e1318" radius={2} />
        <Box x={138} y={26} w={78} d={72} h={7} {...METAL} radius={3} topContent={<>
          <span className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgb(255_255_255/0.4)_45%,transparent_60%)]" />
          <span className="absolute inset-0 grid place-items-center font-mono text-[6.5px] tracking-[0.1em] text-black/45">ESP32-WROOM-32</span></>} />
      </> },
    { id: "antenna", label: "Antenne", text: "Une antenne Wi-Fi et Bluetooth gravée en zigzag dans le circuit : gardez-la dégagée, sans métal autour.", spots: [[220, 22, 28, 80]],
      node: <Box x={220} y={22} w={28} d={80} h={3} top="linear-gradient(135deg,#27313d,#151b23)" side="#1c232c" shade="#0e1318" radius={2}
                 topContent={<svg viewBox="0 0 28 80" className="absolute inset-0 h-full w-full" aria-hidden="true">
                   <path d="M6 72 V12 H12 V64 H18 V12 H22 V64" fill="none" stroke="#d9a441" strokeWidth="1.6" strokeLinejoin="round" />
                 </svg>} /> },
    { id: "pins", label: "Broches GPIO", text: "Jusqu'à 34 GPIO sur la puce, dont 18 entrées analogiques 12 bits et 10 touches capacitives. Attention : logique 3,3 V.", spots: [[14, 1, 216, 11], [14, 113, 216, 11]],
      node: <><Header x={14} y={1} n={19} h={8} male /><Header x={14} y={113} n={19} h={8} male /></> },
    { id: "usb", label: "Micro-USB", text: "Pour téléverser le programme et alimenter la carte en 5 V ; une puce USB-série fait le lien avec l'ESP32.", spots: [[-6, 46, 32, 33]],
      node: <Box x={-6} y={46} w={32} d={33} h={11} {...METAL} radius={2}
                 west={<span className="absolute inset-0" style={{ background: PORT_FACE }}><Slot style={{ left: 3, width: 5, top: 8, height: 17 }} /></span>} /> },
    { id: "buttons", label: "EN et BOOT", text: "EN redémarre la carte ; BOOT, maintenu pendant le téléversement, force le mode programmation.", spots: [[30, 17, 20, 18], [30, 90, 20, 18]],
      node: <><Button x={30} y={17} s={18} /><Button x={30} y={90} s={18} /></> },
    { id: "reg", label: "Régulateur", text: "Il abaisse le 5 V de l'USB en 3,3 V, la tension de travail de l'ESP32.", spots: [[88, 20, 26, 16]],
      node: <Box x={88} y={20} w={26} d={16} h={4} {...BLACK} radius={1} /> },
  ],
};

export const MODELS: Record<BoardSlug, BoardModel> = {
  "arduino-uno": arduinoUno,
  "arduino-mega": arduinoMega,
  esp32,
  "raspberry-pi": raspberryPi,
};
