import type { CourseLevel } from "@/types/db";
import type { BoardSlug } from "@/components/fx/board3d/models";

/*
 * Catalogue des cartes : caractéristiques issues des fiches officielles
 * (docs.arduino.cc, Espressif, raspberrypi.com), vérifiées le 12 novembre 2026.
 * Les modèles 3D associés sont dans src/components/fx/board3d/models.tsx.
 */

export type BoardIcon = "cpu" | "circuit" | "wifi" | "server";

export interface BoardInfo {
  slug: BoardSlug;
  name: string;
  /** Une ligne pour le menu de navigation. */
  short: string;
  kind: "Microcontrôleur" | "Micro-ordinateur";
  level: CourseLevel;
  icon: BoardIcon;
  /** Couleur du circuit imprimé, pour la pastille du menu. */
  swatch: string;
  tagline: string;
  summary: string;
  figures: { value: string; unit?: string; label: string }[];
  groups: { title: string; rows: [string, string][] }[];
  idealFor: string[];
  tips: string[];
  compare: Record<CompareKey, string>;
  /** Catégorie de formations liée (slug de la table categories), si elle existe. */
  category?: { slug: string; label: string };
  docs: { label: string; url: string };
}

export type CompareKey = "type" | "cpu" | "clock" | "ram" | "storage" | "io" | "logic" | "wireless" | "code";

export const COMPARE_ROWS: { key: CompareKey; label: string }[] = [
  { key: "type", label: "Type" },
  { key: "cpu", label: "Processeur" },
  { key: "clock", label: "Fréquence" },
  { key: "ram", label: "Mémoire vive" },
  { key: "storage", label: "Stockage du programme" },
  { key: "io", label: "Entrées / sorties" },
  { key: "logic", label: "Tension des broches" },
  { key: "wireless", label: "Réseau" },
  { key: "code", label: "On programme en" },
];

export const BOARDS: BoardInfo[] = [
  {
    slug: "arduino-uno",
    name: "Arduino Uno",
    short: "La carte de référence pour débuter",
    kind: "Microcontrôleur",
    level: "debutant",
    icon: "cpu",
    swatch: "#0f7083",
    tagline: "La carte de référence pour apprendre l'électronique et la programmation.",
    summary: "Simple, robuste et documentée partout : l'Arduino Uno R3 exécute un seul programme en boucle et pilote LED, boutons, capteurs et moteurs en 5 V.",
    figures: [
      { value: "16", unit: "MHz", label: "Fréquence" },
      { value: "32", unit: "Ko", label: "Mémoire flash" },
      { value: "20", label: "Entrées / sorties" },
      { value: "5", unit: "V", label: "Tension des broches" },
    ],
    groups: [
      { title: "Calcul", rows: [["Microcontrôleur", "ATmega328P, 8 bits"], ["Fréquence", "16 MHz"], ["Liaison USB", "ATmega16U2"]] },
      { title: "Mémoire", rows: [["Flash", "32 Ko, dont 0,5 Ko pour le bootloader"], ["SRAM", "2 Ko"], ["EEPROM", "1 Ko"]] },
      { title: "Entrées / sorties", rows: [["Numériques", "14, dont 6 en PWM"], ["Analogiques", "6 (A0 à A5), 10 bits"], ["Courant par broche", "20 mA"], ["Bus", "UART, I2C, SPI"]] },
      { title: "Alimentation", rows: [["Tension de fonctionnement", "5 V"], ["Entrée recommandée", "7 à 12 V (limites 6 à 20 V)"], ["Connecteurs", "USB-B, prise jack"]] },
      { title: "Format", rows: [["Dimensions", "68,6 x 53,4 mm"], ["Masse", "25 g"], ["LED intégrée", "Broche 13"]] },
    ],
    idealFor: ["Débuter en électronique et en programmation", "Prototyper un montage avec LED, boutons et capteurs", "Suivre la grande majorité des tutoriels Arduino"],
    tips: [
      "Ne demandez pas plus de 20 mA à une broche : pour un moteur ou un relais, passez par un transistor ou un module pilote.",
      "Les broches 0 et 1 servent aussi au téléversement : évitez-les pour vos premiers montages.",
      "Une LED est déjà reliée à la broche 13 : parfait pour un premier programme « Blink » sans câbler.",
      "Pour un module en 3,3 V, vérifiez qu'il tolère le 5 V ou ajoutez un adaptateur de niveau.",
    ],
    compare: { type: "Microcontrôleur", cpu: "ATmega328P, 8 bits", clock: "16 MHz", ram: "2 Ko", storage: "32 Ko de flash", io: "14 numériques, 6 analogiques", logic: "5 V", wireless: "Aucun", code: "Arduino (C/C++)" },
    category: { slug: "arduino", label: "Arduino" },
    docs: { label: "Documentation Arduino", url: "https://docs.arduino.cc/hardware/uno-rev3/" },
  },
  {
    slug: "arduino-mega",
    name: "Arduino Mega 2560",
    short: "Beaucoup de broches pour les gros projets",
    kind: "Microcontrôleur",
    level: "intermediaire",
    icon: "circuit",
    swatch: "#0e5f86",
    tagline: "La grande sœur de l'Uno, pour les projets qui manquent de broches ou de mémoire.",
    summary: "Même logique et même code que l'Uno, mais avec 54 broches numériques, 16 entrées analogiques, 4 ports série et huit fois plus de mémoire flash.",
    figures: [
      { value: "16", unit: "MHz", label: "Fréquence" },
      { value: "256", unit: "Ko", label: "Mémoire flash" },
      { value: "70", label: "Entrées / sorties" },
      { value: "5", unit: "V", label: "Tension des broches" },
    ],
    groups: [
      { title: "Calcul", rows: [["Microcontrôleur", "ATmega2560, 8 bits"], ["Fréquence", "16 MHz"], ["Liaison USB", "ATmega16U2"]] },
      { title: "Mémoire", rows: [["Flash", "256 Ko, dont 8 Ko pour le bootloader"], ["SRAM", "8 Ko"], ["EEPROM", "4 Ko"]] },
      { title: "Entrées / sorties", rows: [["Numériques", "54, dont 15 en PWM"], ["Analogiques", "16 (A0 à A15), 10 bits"], ["Ports série", "4 UART matériels"], ["Courant par broche", "20 mA"]] },
      { title: "Alimentation", rows: [["Tension de fonctionnement", "5 V"], ["Entrée recommandée", "7 à 12 V (limites 6 à 20 V)"], ["Connecteurs", "USB-B, prise jack"]] },
      { title: "Format", rows: [["Dimensions", "101,5 x 53,3 mm"], ["Masse", "37 g"], ["Compatibilité", "La plupart des shields Uno"]] },
    ],
    idealFor: ["Projets avec beaucoup de capteurs et d'actionneurs", "Robotique, imprimantes 3D, grands afficheurs", "Programmes devenus trop lourds pour une Uno"],
    tips: [
      "La plupart des shields de l'Uno se branchent directement dessus.",
      "Ses 4 ports série matériels dialoguent en même temps avec un GPS, un module Bluetooth et l'ordinateur.",
      "Dans l'IDE Arduino, choisissez la carte « Arduino Mega or Mega 2560 » avant de téléverser.",
      "Même limite que l'Uno : 20 mA par broche au maximum recommandé.",
    ],
    compare: { type: "Microcontrôleur", cpu: "ATmega2560, 8 bits", clock: "16 MHz", ram: "8 Ko", storage: "256 Ko de flash", io: "54 numériques, 16 analogiques", logic: "5 V", wireless: "Aucun", code: "Arduino (C/C++)" },
    category: { slug: "arduino", label: "Arduino" },
    docs: { label: "Documentation Arduino", url: "https://docs.arduino.cc/hardware/mega-2560/" },
  },
  {
    slug: "esp32",
    name: "ESP32 DevKitC",
    short: "Wi-Fi et Bluetooth pour les objets connectés",
    kind: "Microcontrôleur",
    level: "intermediaire",
    icon: "wifi",
    swatch: "#1b1d22",
    tagline: "Le microcontrôleur des objets connectés : Wi-Fi et Bluetooth intégrés, pour quelques euros.",
    summary: "Deux cœurs à 240 MHz, beaucoup de mémoire, et surtout le Wi-Fi et le Bluetooth sur la puce. Il se programme avec l'IDE Arduino ou en MicroPython, en logique 3,3 V.",
    figures: [
      { value: "240", unit: "MHz", label: "Fréquence, 2 cœurs" },
      { value: "520", unit: "Ko", label: "Mémoire vive" },
      { value: "34", label: "GPIO sur la puce" },
      { value: "3,3", unit: "V", label: "Tension des broches" },
    ],
    groups: [
      { title: "Calcul", rows: [["Module", "ESP32-WROOM-32"], ["Processeur", "2 cœurs Xtensa LX6, 32 bits"], ["Fréquence", "Jusqu'à 240 MHz"], ["Basse consommation", "Coprocesseur ULP"]] },
      { title: "Mémoire", rows: [["SRAM", "520 Ko"], ["Flash", "4 Mo (module)"], ["ROM", "448 Ko"]] },
      { title: "Entrées / sorties", rows: [["GPIO", "Jusqu'à 34 sur la puce"], ["Analogiques", "18 voies, 12 bits"], ["Sorties analogiques", "2 DAC, 8 bits"], ["Tactiles", "10 broches capacitives"], ["Bus", "UART, I2C, SPI, I2S, CAN, PWM"]] },
      { title: "Connectivité", rows: [["Wi-Fi", "802.11 b/g/n, 2,4 GHz"], ["Bluetooth", "4.2 classique et BLE"]] },
      { title: "Alimentation et format", rows: [["Tension des broches", "3,3 V"], ["Alimentation", "5 V par micro-USB"], ["Dimensions", "54,4 x 27,9 mm"]] },
    ],
    idealFor: ["Objets connectés en Wi-Fi ou Bluetooth", "Envoyer des mesures vers MQTT, Node-RED ou un tableau de bord", "Projets sur batterie grâce à la veille profonde"],
    tips: [
      "Ses broches fonctionnent en 3,3 V et ne tolèrent pas le 5 V : utilisez un adaptateur de niveau pour les capteurs 5 V.",
      "Les entrées analogiques du groupe ADC2 sont indisponibles quand le Wi-Fi est actif : préférez celles de l'ADC1.",
      "Si le téléversement reste bloqué sur « Connecting… », maintenez le bouton BOOT enfoncé quelques secondes.",
      "En veille profonde, la puce ne consomme presque plus rien : parfait pour un capteur qui se réveille toutes les minutes.",
    ],
    compare: { type: "Microcontrôleur", cpu: "ESP32, 2 cœurs 32 bits", clock: "240 MHz", ram: "520 Ko", storage: "4 Mo de flash", io: "Jusqu'à 34 GPIO, 18 analogiques", logic: "3,3 V", wireless: "Wi-Fi, Bluetooth", code: "Arduino, MicroPython" },
    category: { slug: "esp32", label: "ESP32" },
    docs: { label: "Site d'Espressif", url: "https://www.espressif.com/en/products/socs/esp32" },
  },
  {
    slug: "raspberry-pi",
    name: "Raspberry Pi 4",
    short: "Un vrai ordinateur Linux miniature",
    kind: "Micro-ordinateur",
    level: "avance",
    icon: "server",
    swatch: "#11405a",
    tagline: "Un ordinateur complet sous Linux, de la taille d'une carte de crédit.",
    summary: "Le Raspberry Pi 4 Model B fait tourner un système d'exploitation complet : bureau, navigateur, Python, serveurs. Ses 40 broches GPIO le relient aussi à l'électronique.",
    figures: [
      { value: "1,8", unit: "GHz", label: "Fréquence, 4 cœurs" },
      { value: "8", unit: "Go", label: "Mémoire vive, au plus" },
      { value: "40", label: "Broches GPIO" },
      { value: "4K", label: "Sortie vidéo" },
    ],
    groups: [
      { title: "Calcul", rows: [["Puce", "Broadcom BCM2711"], ["Processeur", "4 cœurs Cortex-A72, 64 bits"], ["Fréquence", "1,8 GHz (1,5 GHz sur les premières séries)"], ["Graphique", "VideoCore VI"]] },
      { title: "Mémoire", rows: [["Mémoire vive", "1, 2, 4 ou 8 Go LPDDR4"], ["Stockage", "Carte microSD"]] },
      { title: "Entrées / sorties", rows: [["GPIO", "40 broches, 3,3 V"], ["USB", "2 x USB 3.0 et 2 x USB 2.0"], ["Vidéo", "2 x micro-HDMI, jusqu'en 4K"], ["Caméra et écran", "Connecteurs CSI et DSI"]] },
      { title: "Connectivité", rows: [["Wi-Fi", "802.11ac, 2,4 et 5 GHz"], ["Bluetooth", "5.0 et BLE"], ["Ethernet", "Gigabit"]] },
      { title: "Alimentation et format", rows: [["Alimentation", "USB-C, 5 V, 3 A minimum"], ["Dimensions", "85 x 56 mm"]] },
    ],
    idealFor: ["Passerelle IoT, serveur web ou broker MQTT", "Vision par ordinateur avec une caméra", "Apprendre Linux, Python et l'administration système"],
    tips: [
      "Prévoyez une alimentation 5 V capable de fournir 3 A : un chargeur trop faible provoque des plantages.",
      "Les broches GPIO fonctionnent en 3,3 V et ne supportent pas le 5 V.",
      "Éteignez proprement (sudo shutdown now) avant de débrancher, pour ne pas abîmer la carte microSD.",
      "Il n'a pas d'entrée analogique : pour lire un capteur analogique, ajoutez un convertisseur comme le MCP3008.",
    ],
    compare: { type: "Micro-ordinateur", cpu: "BCM2711, 4 cœurs 64 bits", clock: "1,8 GHz", ram: "1 à 8 Go", storage: "Carte microSD", io: "40 broches GPIO", logic: "3,3 V", wireless: "Wi-Fi, Bluetooth, Ethernet", code: "Python, C, Node.js (Linux)" },
    docs: { label: "Fiche officielle", url: "https://www.raspberrypi.com/products/raspberry-pi-4-model-b/specifications/" },
  },
];

export const getBoard = (slug: string) => BOARDS.find((b) => b.slug === slug) ?? null;

/** Le guide « Quelle carte choisir ? ». */
export const CHOOSER: { need: string; slug: BoardSlug; why: string }[] = [
  { need: "Je débute en électronique et en code.", slug: "arduino-uno", why: "La référence pour apprendre, avec des milliers de tutoriels." },
  { need: "Mon projet manque de broches.", slug: "arduino-mega", why: "54 broches numériques et 16 entrées analogiques, même code que l'Uno." },
  { need: "Mon objet doit se connecter en Wi-Fi ou en Bluetooth.", slug: "esp32", why: "La radio est intégrée à la puce, et il reste programmable avec l'IDE Arduino." },
  { need: "Il me faut un vrai ordinateur sous Linux.", slug: "raspberry-pi", why: "Serveur, caméra, écran, Python : tout un système dans la main." },
];
