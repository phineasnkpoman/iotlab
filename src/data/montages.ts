import type { CourseLevel } from "@/types/db";
import type { BoardSlug } from "@/components/fx/board3d/models";

/*
 * Montages pas à pas (câblages 3D). Les identifiants cités dans `steps[].ids` sont ceux
 * des fils et des composants déclarés dans src/components/fx/wiring/scenes.tsx.
 *
 * Wokwi : noms de pièces et de broches vérifiés dans la documentation (docs.wokwi.com) le
 * 13 novembre 2026. Le diagram.json relie les pièces directement à la carte, sans platine,
 * pour rester lisible dans le simulateur ; le résultat électrique est le même.
 */

export type MontageSlug =
  | "led-clignotante" | "bouton-led" | "ultrasons-hc-sr04" | "servo-potentiometre" | "ecran-lcd-i2c"
  | "alarme-lumiere" | "station-meteo-mega" | "esp32-dht22-wifi" | "esp32-detecteur-pir" | "raspberry-pi-led-bouton";

export interface MontageStep { id: string; title: string; detail: string; ids: string[] }

export interface Montage {
  slug: MontageSlug;
  title: string;
  board: BoardSlug;
  level: CourseLevel;
  minutes: number;
  summary: string;
  learn: string[];
  parts: { name: string; qty: number; note?: string }[];
  steps: MontageStep[];
  code: { lang: "cpp" | "python"; file: string; source: string };
  wokwi:
    | { kind: "diagram"; url: string; diagram: object; libraries?: string[]; tip?: string }
    | { kind: "pico"; url: string; code: string; wiring: string[]; tip: string };
  tips: string[];
}

const WOKWI = {
  uno: "https://wokwi.com/projects/new/arduino-uno",
  mega: "https://wokwi.com/projects/new/arduino-mega",
  esp32: "https://wokwi.com/projects/new/esp32",
  pico: "https://wokwi.com/projects/new/micropython-pi-pico",
};

const diagram = (parts: object[], connections: (string | string[])[][]) => ({
  version: 1, author: "IoT LAB ESATIC", editor: "wokwi", parts, connections, dependencies: {},
});
const ESP_SERIAL = [["esp:TX", "$serialMonitor:RX", "", []], ["esp:RX", "$serialMonitor:TX", "", []]];

export const MONTAGES: Montage[] = [
  {
    slug: "led-clignotante",
    title: "Faire clignoter une LED",
    board: "arduino-uno",
    level: "debutant",
    minutes: 15,
    summary: "Le « Hello World » de l'électronique : la broche 13 allume et éteint une LED toutes les demi-secondes.",
    learn: ["Repérer l'anode et la cathode d'une LED", "Pourquoi une LED a besoin d'une résistance", "Les fonctions pinMode, digitalWrite et delay"],
    parts: [
      { name: "Arduino Uno et son câble USB", qty: 1 },
      { name: "Platine d'essai (breadboard)", qty: 1 },
      { name: "LED rouge 5 mm", qty: 1 },
      { name: "Résistance 220 Ω", qty: 1, note: "rouge, rouge, marron" },
      { name: "Fils de connexion mâle-mâle", qty: 2 },
    ],
    steps: [
      { id: "s1", title: "Plantez la LED", detail: "Patte longue (anode, +) en colonne 14, patte courte (cathode, −) en colonne 15, rangée d.", ids: ["led"] },
      { id: "s2", title: "Ajoutez la résistance", detail: "Entre les colonnes 10 et 14, rangée b. Elle limite le courant à environ 15 mA et protège la LED.", ids: ["r"] },
      { id: "s3", title: "Fil jaune : broche 13", detail: "De la broche numérique 13 de l'Uno vers la colonne 10, rangée a.", ids: ["w-d13"] },
      { id: "s4", title: "Fil noir : masse", detail: "De la colonne 15, rangée a, vers une broche GND de l'Uno. Le circuit est fermé.", ids: ["w-gnd"] },
    ],
    code: { lang: "cpp", file: "led-clignotante.ino", source: `// La broche 13 commande la LED à travers une résistance de 220 ohms.
const int LED = 13;

void setup() {
  pinMode(LED, OUTPUT);      // la broche 13 devient une sortie
}

void loop() {
  digitalWrite(LED, HIGH);   // 5 V : la LED s'allume
  delay(500);                // attendre 500 ms
  digitalWrite(LED, LOW);    // 0 V : la LED s'éteint
  delay(500);
}
` },
    wokwi: { kind: "diagram", url: WOKWI.uno, diagram: diagram([
      { type: "wokwi-arduino-uno", id: "uno", top: 0, left: 0, attrs: {} },
      { type: "wokwi-resistor", id: "r1", top: -76.8, left: 105.6, rotate: 0, attrs: { value: "220" } },
      { type: "wokwi-led", id: "led1", top: -138, left: 186, attrs: { color: "red" } },
    ], [
      ["uno:13", "r1:1", "gold", []],
      ["r1:2", "led1:A", "gold", []],
      ["led1:C", "uno:GND.1", "black", []],
    ]) },
    tips: [
      "La LED ne s'allume pas ? Retournez-la : une LED ne laisse passer le courant que dans un sens.",
      "Sans résistance, la LED et la broche peuvent griller. 220 Ω à 330 Ω conviennent pour une LED rouge en 5 V.",
      "Changez les deux delay(500) pour faire varier le rythme, puis essayez un signal SOS en morse.",
    ],
  },
  {
    slug: "bouton-led",
    title: "Allumer une LED avec un bouton",
    board: "arduino-uno",
    level: "debutant",
    minutes: 20,
    summary: "Lire un bouton poussoir et commander une LED : la base de toute interface physique.",
    learn: ["Lire une entrée numérique avec digitalRead", "La résistance de rappel interne (INPUT_PULLUP)", "Placer un bouton à cheval sur la rainure de la platine"],
    parts: [
      { name: "Arduino Uno", qty: 1 },
      { name: "Platine d'essai", qty: 1 },
      { name: "Bouton poussoir 6 x 6 mm", qty: 1 },
      { name: "LED verte 5 mm", qty: 1 },
      { name: "Résistance 220 Ω", qty: 1 },
      { name: "Fils de connexion", qty: 4 },
    ],
    steps: [
      { id: "s1", title: "LED et résistance", detail: "Résistance entre les colonnes 6 et 10, LED : anode en colonne 10, cathode en colonne 11.", ids: ["r", "led"] },
      { id: "s2", title: "Fil orange : broche 9", detail: "De la broche 9 vers la colonne 6 : la sortie qui alimente la LED.", ids: ["w-d9"] },
      { id: "s3", title: "Fil noir : masse de la LED", detail: "De la colonne 11 vers le GND situé à côté de la broche 13.", ids: ["w-gnd-led"] },
      { id: "s4", title: "Plantez le bouton", detail: "À cheval sur la rainure centrale, pattes en colonnes 18 et 20. Appuyer relie ces deux colonnes.", ids: ["btn"] },
      { id: "s5", title: "Fil bleu : broche 2", detail: "De la broche 2 vers la colonne 18 : l'entrée qui lit le bouton.", ids: ["w-d2"] },
      { id: "s6", title: "Fil noir : masse du bouton", detail: "De la colonne 20, côté bas, vers un GND du connecteur d'alimentation.", ids: ["w-gnd-btn"] },
    ],
    code: { lang: "cpp", file: "bouton-led.ino", source: `const int BOUTON = 2;
const int LED = 9;

void setup() {
  pinMode(BOUTON, INPUT_PULLUP);  // résistance interne vers 5 V : la broche lit HIGH au repos
  pinMode(LED, OUTPUT);
}

void loop() {
  bool appuye = digitalRead(BOUTON) == LOW;  // appuyer relie la broche à GND : elle lit LOW
  digitalWrite(LED, appuye ? HIGH : LOW);
}
` },
    wokwi: { kind: "diagram", url: WOKWI.uno, diagram: diagram([
      { type: "wokwi-arduino-uno", id: "uno", top: 0, left: 0, attrs: {} },
      { type: "wokwi-pushbutton", id: "btn1", top: -86.2, left: 230.4, attrs: { color: "blue" } },
      { type: "wokwi-resistor", id: "r1", top: -76.8, left: 57.6, attrs: { value: "220" } },
      { type: "wokwi-led", id: "led1", top: -138, left: 138, attrs: { color: "green" } },
    ], [
      ["uno:9", "r1:1", "orange", []],
      ["r1:2", "led1:A", "orange", []],
      ["led1:C", "uno:GND.1", "black", []],
      ["btn1:1.l", "uno:2", "blue", []],
      ["btn1:2.l", "uno:GND.2", "black", []],
    ]), tip: "Pendant la simulation, cliquez sur le bouton (ou maintenez-le) pour allumer la LED." },
    tips: [
      "Avec INPUT_PULLUP, pas besoin de résistance externe pour le bouton : la logique est inversée (appuyé = LOW).",
      "Le bouton doit enjamber la rainure centrale, sinon ses pattes sont déjà reliées entre elles.",
      "Défi : faites basculer la LED à chaque appui (allumée, puis éteinte) au lieu de la tenir allumée.",
    ],
  },
  {
    slug: "ultrasons-hc-sr04",
    title: "Mesurer une distance aux ultrasons",
    board: "arduino-uno",
    level: "debutant",
    minutes: 25,
    summary: "Le capteur HC-SR04 envoie une salve d'ultrasons et chronomètre l'écho : on en déduit la distance d'un obstacle.",
    learn: ["Envoyer une impulsion de 10 µs sur TRIG", "Mesurer la durée d'un écho avec pulseIn", "Convertir un temps en distance avec la vitesse du son"],
    parts: [
      { name: "Arduino Uno", qty: 1 },
      { name: "Capteur à ultrasons HC-SR04", qty: 1 },
      { name: "Platine d'essai", qty: 1 },
      { name: "Fils de connexion", qty: 4 },
    ],
    steps: [
      { id: "s1", title: "Plantez le capteur", detail: "Rangée a, colonnes 12 à 15 (VCC, TRIG, ECHO, GND), les « yeux » tournés vers l'extérieur.", ids: ["us"] },
      { id: "s2", title: "Fil rouge : 5 V", detail: "De la broche 5V vers la colonne 12 (VCC). Le HC-SR04 fonctionne en 5 V.", ids: ["w-5v"] },
      { id: "s3", title: "Fil noir : masse", detail: "D'un GND vers la colonne 15.", ids: ["w-gnd"] },
      { id: "s4", title: "Fil jaune : TRIG sur 9", detail: "De la broche 9 vers la colonne 13 : l'Arduino déclenche la mesure.", ids: ["w-trig"] },
      { id: "s5", title: "Fil vert : ECHO sur 10", detail: "De la broche 10 vers la colonne 14 : le capteur renvoie la durée de l'écho.", ids: ["w-echo"] },
    ],
    code: { lang: "cpp", file: "distance-ultrasons.ino", source: `const int TRIG = 9;
const int ECHO = 10;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
}

void loop() {
  // Impulsion de 10 microsecondes sur TRIG : le capteur émet ses ultrasons.
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long duree = pulseIn(ECHO, HIGH, 30000);  // aller-retour en microsecondes (30 ms au plus)
  float distance = duree * 0.0343 / 2;       // son : 0,0343 cm/µs ; on divise par 2 (aller-retour)

  Serial.print("Distance : ");
  Serial.print(distance);
  Serial.println(" cm");
  delay(250);
}
` },
    wokwi: { kind: "diagram", url: WOKWI.uno, diagram: diagram([
      { type: "wokwi-arduino-uno", id: "uno", top: 0, left: 0, attrs: {} },
      { type: "wokwi-hc-sr04", id: "ultrasonic1", top: -142.5, left: 120, attrs: { distance: "100" } },
    ], [
      ["ultrasonic1:VCC", "uno:5V", "red", []],
      ["ultrasonic1:TRIG", "uno:9", "gold", []],
      ["ultrasonic1:ECHO", "uno:10", "green", []],
      ["ultrasonic1:GND", "uno:GND.2", "black", []],
    ]), tip: "Lancez la simulation, cliquez sur le capteur et déplacez le curseur de distance : le moniteur série affiche la nouvelle mesure." },
    tips: [
      "Portée utile : de 2 cm à 4 m environ. Les surfaces molles ou très inclinées renvoient mal l'écho.",
      "Une mesure à 0 signifie qu'aucun écho n'est revenu dans les 30 ms : obstacle trop loin ou capteur mal branché.",
      "Défi : ajoutez un buzzer qui bipe de plus en plus vite quand l'obstacle approche, comme un radar de recul.",
    ],
  },
  {
    slug: "servo-potentiometre",
    title: "Piloter un servomoteur au potentiomètre",
    board: "arduino-uno",
    level: "intermediaire",
    minutes: 30,
    summary: "Tournez le bouton, le bras du servomoteur suit : une entrée analogique commande une sortie PWM.",
    learn: ["Lire une tension avec analogRead (0 à 1023)", "Convertir une plage de valeurs avec map", "Commander un servomoteur avec la bibliothèque Servo", "Partager le 5 V et la masse sur les rails"],
    parts: [
      { name: "Arduino Uno", qty: 1 },
      { name: "Servomoteur SG90", qty: 1 },
      { name: "Potentiomètre 10 kΩ", qty: 1 },
      { name: "Platine d'essai", qty: 1 },
      { name: "Fils de connexion", qty: 9 },
    ],
    steps: [
      { id: "s1", title: "Alimentez les rails", detail: "Fil rouge du 5V vers le rail +, fil noir d'un GND vers le rail −, en bas de la platine.", ids: ["w-5v", "w-gnd"] },
      { id: "s2", title: "Potentiomètre", detail: "Pattes en colonnes 8, 9 et 10. Les pattes extérieures vont aux rails − et +, celle du milieu est le signal.", ids: ["pot", "w-pot-gnd", "w-pot-vcc"] },
      { id: "s3", title: "Fil vert : signal sur A0", detail: "De la colonne 9 vers l'entrée analogique A0.", ids: ["w-a0"] },
      { id: "s4", title: "Câble du servomoteur", detail: "Marron vers le rail −, rouge vers le rail +, orange (signal) vers la colonne 25.", ids: ["servo", "w-servo-gnd", "w-servo-5v", "w-servo-sig"] },
      { id: "s5", title: "Fil orange : broche 9", detail: "De la colonne 25 vers la broche 9, une sortie PWM (repérée par ~).", ids: ["w-d9"] },
    ],
    code: { lang: "cpp", file: "servo-potentiometre.ino", source: `#include <Servo.h>

Servo servo;
const int POT = A0;

void setup() {
  servo.attach(9);                            // signal du servomoteur sur la broche 9
}

void loop() {
  int valeur = analogRead(POT);               // de 0 à 1023
  int angle = map(valeur, 0, 1023, 0, 180);   // converti en degrés
  servo.write(angle);
  delay(15);                                  // laisser au servomoteur le temps de bouger
}
` },
    wokwi: { kind: "diagram", url: WOKWI.uno, diagram: diagram([
      { type: "wokwi-arduino-uno", id: "uno", top: 0, left: 0, attrs: {} },
      { type: "wokwi-potentiometer", id: "pot1", top: -126, left: 76.8, attrs: {} },
      { type: "wokwi-servo", id: "servo1", top: -124, left: 230.4, attrs: {} },
    ], [
      ["pot1:GND", "uno:GND.1", "black", []],
      ["pot1:VCC", "uno:5V", "red", []],
      ["pot1:SIG", "uno:A0", "green", []],
      ["servo1:GND", "uno:GND.2", "black", []],
      ["servo1:V+", "uno:5V", "red", []],
      ["servo1:PWM", "uno:9", "orange", []],
    ]), tip: "Pendant la simulation, faites tourner le potentiomètre à la souris : le bras du servomoteur suit." },
    tips: [
      "Un servomoteur qui tremble ou fait redémarrer la carte manque de courant : alimentez-le à part, en reliant les masses.",
      "La bibliothèque Servo désactive le PWM des broches 9 et 10 pour analogWrite : gardez-les pour les servomoteurs.",
      "Défi : remplacez le potentiomètre par le capteur à ultrasons pour faire une barrière automatique.",
    ],
  },
  {
    slug: "ecran-lcd-i2c",
    title: "Afficher du texte sur un écran LCD I2C",
    board: "arduino-uno",
    level: "intermediaire",
    minutes: 25,
    summary: "Un écran de 16 caractères sur 2 lignes, piloté avec seulement deux fils de données grâce au bus I2C.",
    learn: ["Le bus I2C : SDA (données) et SCL (horloge)", "L'adresse I2C d'un module (0x27 ici)", "Installer et utiliser la bibliothèque LiquidCrystal I2C"],
    parts: [
      { name: "Arduino Uno", qty: 1 },
      { name: "Écran LCD 16 x 2 avec adaptateur I2C", qty: 1 },
      { name: "Fils de connexion mâle-femelle", qty: 4 },
    ],
    steps: [
      { id: "s1", title: "Repérez les broches", detail: "L'adaptateur I2C soudé au dos de l'écran a quatre broches : GND, VCC, SDA, SCL.", ids: ["lcd"] },
      { id: "s2", title: "Fil noir : GND", detail: "Du GND de l'écran vers un GND de l'Uno.", ids: ["w-gnd"] },
      { id: "s3", title: "Fil rouge : VCC", detail: "Du VCC de l'écran vers la broche 5V.", ids: ["w-vcc"] },
      { id: "s4", title: "Fil bleu : SDA sur A4", detail: "Sur l'Uno, la ligne de données I2C est la broche A4.", ids: ["w-sda"] },
      { id: "s5", title: "Fil jaune : SCL sur A5", detail: "La ligne d'horloge I2C est la broche A5.", ids: ["w-scl"] },
    ],
    code: { lang: "cpp", file: "ecran-lcd-i2c.ino", source: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);   // adresse I2C, 16 colonnes, 2 lignes

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);                // colonne 0, ligne 0
  lcd.print("IoT LAB ESATIC");
  lcd.setCursor(0, 1);
  lcd.print("Bonjour !");
}

void loop() {
  lcd.setCursor(12, 1);
  lcd.print(millis() / 1000);         // secondes écoulées depuis le démarrage
  delay(500);
}
` },
    wokwi: { kind: "diagram", url: WOKWI.uno, diagram: diagram([
      { type: "wokwi-arduino-uno", id: "uno", top: 0, left: 0, attrs: {} },
      { type: "wokwi-lcd1602", id: "lcd1", top: -150, left: 20, attrs: { pins: "i2c" } },
    ], [
      ["lcd1:GND", "uno:GND.2", "black", []],
      ["lcd1:VCC", "uno:5V", "red", []],
      ["lcd1:SDA", "uno:A4", "blue", []],
      ["lcd1:SCL", "uno:A5", "gold", []],
    ]), libraries: ["LiquidCrystal I2C"] },
    tips: [
      "Écran allumé mais vide ? Tournez le petit potentiomètre bleu au dos de l'adaptateur : il règle le contraste.",
      "Rien ne s'affiche ? Votre module est peut-être à l'adresse 0x3F : lancez un programme « I2C scanner » pour la trouver.",
      "Sur une Mega, SDA et SCL sont les broches 20 et 21 ; sur un ESP32, les GPIO 21 et 22.",
    ],
  },
  {
    slug: "alarme-lumiere",
    title: "Alarme de luminosité",
    board: "arduino-uno",
    level: "debutant",
    minutes: 25,
    summary: "Une photorésistance mesure la lumière ; quand la pièce devient sombre, un buzzer sonne.",
    learn: ["Lire un capteur analogique et choisir un seuil", "Produire un son avec tone et noTone", "Observer des valeurs dans le moniteur série"],
    parts: [
      { name: "Arduino Uno", qty: 1 },
      { name: "Module photorésistance (LDR)", qty: 1, note: "sorties AO et DO" },
      { name: "Buzzer piézo", qty: 1 },
      { name: "Platine d'essai", qty: 1 },
      { name: "Fils de connexion", qty: 5 },
    ],
    steps: [
      { id: "s1", title: "Plantez le buzzer", detail: "Patte + en colonne 14, patte − en colonne 17.", ids: ["buzzer"] },
      { id: "s2", title: "Fil orange : broche 8", detail: "De la broche 8 vers la colonne 14 (patte +).", ids: ["w-d8"] },
      { id: "s3", title: "Fil noir : masse du buzzer", detail: "De la colonne 17 vers le GND à côté de la broche 13.", ids: ["w-gnd-bz"] },
      { id: "s4", title: "Alimentez le module", detail: "VCC vers 5V (rouge), GND vers GND (noir).", ids: ["ldr", "w-ldr-vcc", "w-ldr-gnd"] },
      { id: "s5", title: "Fil vert : AO sur A0", detail: "La sortie analogique du module vers l'entrée A0.", ids: ["w-ldr-ao"] },
    ],
    code: { lang: "cpp", file: "alarme-lumiere.ino", source: `const int CAPTEUR = A0;  // sortie AO du module : plus il fait sombre, plus la valeur est grande
const int BUZZER = 8;
const int SEUIL = 600;    // à ajuster selon votre pièce (regardez le moniteur série)

void setup() {
  Serial.begin(9600);
}

void loop() {
  int lumiere = analogRead(CAPTEUR);
  Serial.println(lumiere);

  if (lumiere > SEUIL) {
    tone(BUZZER, 1000);   // obscurité : son à 1000 Hz
  } else {
    noTone(BUZZER);
  }
  delay(100);
}
` },
    wokwi: { kind: "diagram", url: WOKWI.uno, diagram: diagram([
      { type: "wokwi-arduino-uno", id: "uno", top: 0, left: 0, attrs: {} },
      { type: "wokwi-photoresistor-sensor", id: "ldr1", top: -96, left: 230, attrs: {} },
      { type: "wokwi-buzzer", id: "bz1", top: -112.8, left: 69, attrs: { volume: "0.2" } },
    ], [
      ["ldr1:VCC", "uno:5V", "red", []],
      ["ldr1:GND", "uno:GND.2", "black", []],
      ["ldr1:AO", "uno:A0", "green", []],
      ["bz1:2", "uno:8", "orange", []],
      ["bz1:1", "uno:GND.1", "black", []],
    ]), tip: "Cliquez sur la photorésistance et baissez la luminosité (en lux) : au-dessus du seuil, le buzzer sonne." },
    tips: [
      "Ouvrez le moniteur série, notez la valeur en pleine lumière puis main posée sur le capteur, et placez le seuil entre les deux.",
      "La sortie DO du module donne directement « sombre / clair » selon le réglage de son potentiomètre.",
      "Défi : remplacez le buzzer par une LED pour fabriquer une veilleuse automatique.",
    ],
  },
  {
    slug: "station-meteo-mega",
    title: "Station météo sur écran LCD",
    board: "arduino-mega",
    level: "intermediaire",
    minutes: 35,
    summary: "Un DHT22 mesure température et humidité, l'écran LCD I2C les affiche. La Mega laisse de la place pour d'autres capteurs.",
    learn: ["Lire un capteur numérique DHT22 avec sa bibliothèque", "Utiliser le bus I2C de la Mega (broches 20 et 21)", "Gérer une lecture ratée avec isnan"],
    parts: [
      { name: "Arduino Mega 2560", qty: 1 },
      { name: "Capteur DHT22 (AM2302)", qty: 1 },
      { name: "Écran LCD 16 x 2 avec adaptateur I2C", qty: 1 },
      { name: "Platine d'essai", qty: 1 },
      { name: "Fils de connexion", qty: 7 },
    ],
    steps: [
      { id: "s1", title: "Plantez le DHT22", detail: "Rangée a, colonnes 6 à 9 : VCC, DATA, (non connectée), GND.", ids: ["dht"] },
      { id: "s2", title: "Fil rouge : 5 V", detail: "Du 5V du double connecteur de droite vers la colonne 6.", ids: ["w-dht-vcc"] },
      { id: "s3", title: "Fil vert : données sur 22", detail: "De la broche 22 vers la colonne 7.", ids: ["w-dht-data"] },
      { id: "s4", title: "Fil noir : masse", detail: "Du GND en bas du double connecteur vers la colonne 9.", ids: ["w-dht-gnd"] },
      { id: "s5", title: "Alimentez l'écran", detail: "GND de l'écran vers un GND, VCC vers 5V.", ids: ["lcd", "w-lcd-gnd", "w-lcd-vcc"] },
      { id: "s6", title: "Bus I2C : 20 et 21", detail: "SDA de l'écran vers la broche 20 (bleu), SCL vers la broche 21 (jaune).", ids: ["w-sda", "w-scl"] },
    ],
    code: { lang: "cpp", file: "station-meteo.ino", source: `#include <DHT.h>
#include <LiquidCrystal_I2C.h>

DHT dht(22, DHT22);                  // capteur sur la broche 22
LiquidCrystal_I2C lcd(0x27, 16, 2);  // écran I2C : SDA = 20, SCL = 21 sur la Mega

void setup() {
  dht.begin();
  lcd.init();
  lcd.backlight();
}

void loop() {
  float t = dht.readTemperature();   // en degrés Celsius
  float h = dht.readHumidity();      // en pourcentage

  lcd.clear();
  if (isnan(t) || isnan(h)) {        // lecture ratée : on le dit au lieu d'afficher n'importe quoi
    lcd.print("Erreur capteur");
  } else {
    lcd.setCursor(0, 0);
    lcd.print("Temp : "); lcd.print(t, 1); lcd.print(" C");
    lcd.setCursor(0, 1);
    lcd.print("Humid: "); lcd.print(h, 0); lcd.print(" %");
  }
  delay(2000);                       // le DHT22 se lit au plus une fois toutes les 2 secondes
}
` },
    wokwi: { kind: "diagram", url: WOKWI.mega, diagram: diagram([
      { type: "wokwi-arduino-mega", id: "mega", top: 0, left: 0, attrs: {} },
      { type: "wokwi-dht22", id: "dht1", top: -105.3, left: 432, attrs: { temperature: "24.5", humidity: "40" } },
      { type: "wokwi-lcd1602", id: "lcd1", top: -160, left: 60, attrs: { pins: "i2c" } },
    ], [
      ["dht1:VCC", "mega:5V", "red", []],
      ["dht1:SDA", "mega:22", "green", []],
      ["dht1:GND", "mega:GND.2", "black", []],
      ["lcd1:GND", "mega:GND.1", "black", []],
      ["lcd1:VCC", "mega:5V", "red", []],
      ["lcd1:SDA", "mega:20", "blue", []],
      ["lcd1:SCL", "mega:21", "gold", []],
    ]), libraries: ["DHT sensor library", "LiquidCrystal I2C"], tip: "Cliquez sur le DHT22 pendant la simulation pour changer la température et l'humidité." },
    tips: [
      "Un DHT22 « nu » (4 broches) a besoin d'une résistance de 10 kΩ entre VCC et DATA ; les modules sur petite carte l'ont déjà.",
      "Ne lisez pas le capteur plus d'une fois toutes les 2 secondes, sinon il renvoie des erreurs.",
      "Défi : ajoutez le capteur à ultrasons et une LED d'alerte quand l'humidité dépasse 70 %.",
    ],
  },
  {
    slug: "esp32-dht22-wifi",
    title: "Capteur connecté : DHT22 en Wi-Fi vers MQTT",
    board: "esp32",
    level: "intermediaire",
    minutes: 40,
    summary: "L'ESP32 lit la température et l'humidité, se connecte au Wi-Fi et publie les mesures en JSON sur un broker MQTT public.",
    learn: ["Connecter un ESP32 au Wi-Fi", "Publier des messages MQTT avec PubSubClient", "Câbler un capteur en logique 3,3 V"],
    parts: [
      { name: "ESP32 DevKitC", qty: 1 },
      { name: "Capteur DHT22", qty: 1 },
      { name: "Platine d'essai", qty: 1 },
      { name: "Fils de connexion", qty: 3 },
    ],
    steps: [
      { id: "s1", title: "Plantez le DHT22", detail: "Rangée a, colonnes 8 à 11 : VCC, DATA, (non connectée), GND.", ids: ["dht"] },
      { id: "s2", title: "Fil rouge : 3,3 V", detail: "De la broche 3V3 de l'ESP32 vers la colonne 8. Le DHT22 fonctionne aussi en 3,3 V.", ids: ["w-3v3"] },
      { id: "s3", title: "Fil vert : GPIO 15", detail: "De la broche 15 vers la colonne 9 (DATA).", ids: ["w-data"] },
      { id: "s4", title: "Fil noir : masse", detail: "D'un GND de l'ESP32 vers la colonne 11.", ids: ["w-gnd"] },
      { id: "s5", title: "Le Wi-Fi est intégré", detail: "Aucun module à ajouter : l'antenne est gravée sur la carte. Le programme fait le reste.", ids: ["esp"] },
    ],
    code: { lang: "cpp", file: "esp32-dht22-mqtt.ino", source: `#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

const char* WIFI_NOM = "Wokwi-GUEST";   // réseau de la simulation ; sur la vraie carte, mettez le vôtre
const char* WIFI_MDP = "";
const char* BROKER = "broker.hivemq.com";
const char* SUJET = "iotlab-esatic/station/demo";   // remplacez « demo » par votre nom

DHT dht(15, DHT22);
WiFiClient wifi;
PubSubClient mqtt(wifi);

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.begin(WIFI_NOM, WIFI_MDP);
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    Serial.print(".");
  }
  Serial.println(" Wi-Fi connecté");
  mqtt.setServer(BROKER, 1883);
}

void loop() {
  if (!mqtt.connected()) {
    String id = "esatic-" + String((uint32_t)ESP.getEfuseMac(), HEX);
    if (!mqtt.connect(id.c_str())) { delay(2000); return; }
    Serial.println("MQTT connecté");
  }
  mqtt.loop();

  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (!isnan(t) && !isnan(h)) {
    String json = "{\\"temperature\\":" + String(t, 1) + ",\\"humidite\\":" + String(h, 0) + "}";
    mqtt.publish(SUJET, json.c_str());
    Serial.println(json);
  }
  delay(5000);
}
` },
    wokwi: { kind: "diagram", url: WOKWI.esp32, diagram: diagram([
      { type: "board-esp32-devkit-c-v4", id: "esp", top: 0, left: 0, attrs: {} },
      { type: "wokwi-dht22", id: "dht1", top: -76.5, left: 177, attrs: { temperature: "27", humidity: "65" } },
    ], [
      ...ESP_SERIAL,
      ["dht1:VCC", "esp:3V3", "red", []],
      ["dht1:SDA", "esp:15", "green", []],
      ["dht1:GND", "esp:GND.1", "black", []],
    ]), libraries: ["DHT sensor library", "PubSubClient"], tip: "Pour voir les messages arriver, abonnez-vous au même sujet avec MQTT Explorer ou le client web de HiveMQ." },
    tips: [
      "Le broker public est partagé avec le monde entier : n'y envoyez jamais de données personnelles et choisissez un sujet unique.",
      "Les entrées analogiques ADC2 ne marchent pas quand le Wi-Fi est actif : pour un capteur analogique, prenez les GPIO 32 à 39.",
      "Défi : affichez les mesures dans Node-RED avec un tableau de bord (formation Node-RED du site).",
    ],
  },
  {
    slug: "esp32-detecteur-pir",
    title: "Détecteur de mouvement PIR",
    board: "esp32",
    level: "debutant",
    minutes: 20,
    summary: "Un capteur infrarouge passif repère une présence ; l'ESP32 allume une LED et le signale sur le moniteur série.",
    learn: ["Lire la sortie numérique d'un capteur PIR", "Détecter un front montant (début de mouvement)", "Alimenter un module en 5 V avec une carte en 3,3 V"],
    parts: [
      { name: "ESP32 DevKitC", qty: 1 },
      { name: "Détecteur PIR HC-SR501", qty: 1 },
      { name: "LED rouge 5 mm", qty: 1 },
      { name: "Résistance 220 Ω", qty: 1 },
      { name: "Platine d'essai", qty: 1 },
      { name: "Fils de connexion", qty: 5 },
    ],
    steps: [
      { id: "s1", title: "Repérez le capteur", detail: "Trois broches sur le bord du module : VCC, OUT, GND.", ids: ["pir"] },
      { id: "s2", title: "Fil rouge : 5 V", detail: "Le HC-SR501 s'alimente en 5 V : broche 5V de l'ESP32 (alimentée par l'USB).", ids: ["w-pir-vcc"] },
      { id: "s3", title: "Fil jaune : OUT sur GPIO 4", detail: "La sortie du capteur donne 3,3 V : sans danger pour l'ESP32.", ids: ["w-pir-out"] },
      { id: "s4", title: "Fil noir : masse", detail: "Du GND du capteur vers un GND de l'ESP32.", ids: ["w-pir-gnd"] },
      { id: "s5", title: "LED et résistance", detail: "Résistance entre les colonnes 10 et 14, LED : anode en 14, cathode en 15.", ids: ["led", "r"] },
      { id: "s6", title: "Fils de la LED", detail: "GPIO 2 vers la colonne 10 (orange), colonne 15 vers GND (noir).", ids: ["w-led", "w-led-gnd"] },
    ],
    code: { lang: "cpp", file: "esp32-pir.ino", source: `const int PIR = 4;
const int LED = 2;
bool avant = false;

void setup() {
  Serial.begin(115200);
  pinMode(PIR, INPUT);
  pinMode(LED, OUTPUT);
}

void loop() {
  bool mouvement = digitalRead(PIR) == HIGH;
  digitalWrite(LED, mouvement);

  if (mouvement && !avant) {            // front montant : un mouvement commence
    Serial.println("Mouvement détecté !");
  }
  avant = mouvement;
  delay(50);
}
` },
    wokwi: { kind: "diagram", url: WOKWI.esp32, diagram: diagram([
      { type: "board-esp32-devkit-c-v4", id: "esp", top: 0, left: 0, attrs: {} },
      { type: "wokwi-pir-motion-sensor", id: "pir1", top: -101.6, left: 145.2, attrs: {} },
      { type: "wokwi-resistor", id: "r1", top: 158.4, left: -86.4, rotate: 90, attrs: { value: "220" } },
      { type: "wokwi-led", id: "led1", top: 92.4, left: -122.2, attrs: { color: "red" } },
    ], [
      ...ESP_SERIAL,
      ["pir1:VCC", "esp:5V", "red", []],
      ["pir1:OUT", "esp:4", "gold", []],
      ["pir1:GND", "esp:GND.2", "black", []],
      ["esp:2", "r1:2", "orange", []],
      ["r1:1", "led1:A", "orange", []],
      ["led1:C", "esp:GND.1", "black", []],
    ]), tip: "Cliquez sur le capteur PIR pendant la simulation pour simuler un passage devant lui." },
    tips: [
      "Après la mise sous tension, le HC-SR501 a besoin d'environ une minute pour se stabiliser : ignorez les premières détections.",
      "Ses deux potentiomètres orange règlent la sensibilité (portée) et la durée pendant laquelle OUT reste haut.",
      "Défi : envoyez une notification MQTT à chaque mouvement, en reprenant le montage DHT22 Wi-Fi.",
    ],
  },
  {
    slug: "raspberry-pi-led-bouton",
    title: "LED et bouton sur les GPIO en Python",
    board: "raspberry-pi",
    level: "debutant",
    minutes: 25,
    summary: "Premier pas avec les broches du Raspberry Pi : un bouton allume une LED, en quelques lignes de Python avec gpiozero.",
    learn: ["Numérotation physique et numérotation GPIO (BCM)", "La logique 3,3 V du Raspberry Pi", "Programmer par événements avec gpiozero"],
    parts: [
      { name: "Raspberry Pi 4 avec carte microSD (Raspberry Pi OS)", qty: 1 },
      { name: "Platine d'essai", qty: 1 },
      { name: "LED jaune 5 mm", qty: 1 },
      { name: "Résistance 330 Ω", qty: 1, note: "orange, orange, marron" },
      { name: "Bouton poussoir", qty: 1 },
      { name: "Fils mâle-femelle", qty: 4 },
    ],
    steps: [
      { id: "s1", title: "LED et résistance", detail: "Résistance 330 Ω entre les colonnes 6 et 10 ; LED : anode en 10, cathode en 11.", ids: ["r", "led"] },
      { id: "s2", title: "Fil orange : GPIO 17", detail: "De la broche physique 11 (GPIO 17) vers la colonne 6.", ids: ["w-gpio17"] },
      { id: "s3", title: "Fil noir : masse de la LED", detail: "De la colonne 11 vers la broche physique 6 (GND).", ids: ["w-gnd-led"] },
      { id: "s4", title: "Plantez le bouton", detail: "À cheval sur la rainure, pattes en colonnes 18 et 20.", ids: ["btn"] },
      { id: "s5", title: "Fil bleu : GPIO 27", detail: "De la broche physique 13 (GPIO 27) vers la colonne 18.", ids: ["w-gpio27"] },
      { id: "s6", title: "Fil noir : masse du bouton", detail: "De la colonne 20 vers la broche physique 14 (GND).", ids: ["w-gnd-btn"] },
    ],
    code: { lang: "python", file: "led_bouton.py", source: `from gpiozero import LED, Button
from signal import pause

led = LED(17)          # GPIO 17 = broche physique 11
bouton = Button(27)    # GPIO 27 = broche 13 ; résistance de rappel interne activée

bouton.when_pressed = led.on
bouton.when_released = led.off

pause()                # le programme attend les appuis (Ctrl+C pour quitter)
` },
    wokwi: {
      kind: "pico",
      url: WOKWI.pico,
      code: `from machine import Pin
import time

led = Pin(15, Pin.OUT)
bouton = Pin(14, Pin.IN, Pin.PULL_UP)   # appuyé = 0

while True:
    led.value(1 if bouton.value() == 0 else 0)
    time.sleep(0.02)
`,
      wiring: [
        "GP15 → résistance 330 Ω → anode de la LED ; cathode → GND",
        "GP14 → une patte du bouton ; l'autre patte → GND",
      ],
      tip: "Wokwi ne simule pas le Raspberry Pi 4. Entraînez-vous sur un Raspberry Pi Pico en MicroPython : même logique, mêmes composants.",
    },
    tips: [
      "Les GPIO du Raspberry Pi sont en 3,3 V et ne tolèrent pas le 5 V : ne branchez jamais un capteur 5 V directement sur une entrée.",
      "Ne confondez pas numéro de broche physique (1 à 40) et numéro GPIO : gpiozero utilise les numéros GPIO.",
      "Lancez le script avec « python3 led_bouton.py » dans un terminal du Raspberry Pi.",
    ],
  },
];

export const getMontage = (slug: string) => MONTAGES.find((m) => m.slug === slug) ?? null;
export const montagesFor = (board: BoardSlug) => MONTAGES.filter((m) => m.board === board);
