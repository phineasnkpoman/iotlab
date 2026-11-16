-- =====================================================================
-- IoT LAB ESATIC — Cours « Capteurs : ultrason, PIR et température »
-- À exécuter APRÈS 0005_quiz_gating.sql. Relançable sans doublon (les QCM sont mis à jour).
-- Le cours est créé PUBLIÉ : il apparaît directement dans l'onglet Formations.
-- (Pour le masquer : /admin, section Formations, « Dépublier ».)
-- Les lignes « @@widget nom » dans les leçons affichent les modules interactifs
-- (voir src/components/widgets/).
-- =====================================================================

insert into public.courses (slug, title, description, level, category_id, duration_minutes, skills, prerequisites, status)
select 'capteurs-ultrason-pir-dht11',
  'Capteurs : ultrason, PIR et température',
  'Manipulez en 3D les capteurs HC-SR04, HC-SR501 (PIR) et DHT11, comprenez leur fonctionnement avec des simulateurs interactifs, câblez-les, programmez-les et validez chaque étape par un QCM.',
  'intermediaire', c.id, 180,
  array['Expliquer le principe de mesure de trois capteurs','Brancher un capteur ultrason, PIR et DHT11 sur Arduino','Lire un capteur avec pulseIn(), digitalRead() et une bibliothèque','Combiner plusieurs capteurs dans un mini-projet'],
  'Avoir suivi « Premiers pas avec Arduino » ou savoir câbler une LED et utiliser pinMode(), digitalWrite() et delay().',
  'published'
from public.categories c where c.slug = 'capteurs-actionneurs'
on conflict (slug) do nothing;

insert into public.lessons (course_id, module_position, module_title, position, slug, title, intro, objectives, content_md, wokwi_url, duration_minutes)
select c.id, v.mp, v.mt, v.pos, v.slug, v.title, v.intro, v.obj, v.body, v.wokwi, v.dur
from public.courses c,
(values
 (1,'Comprendre les capteurs',1,'quest-ce-quun-capteur','Qu''est-ce qu''un capteur ?',
  'Un capteur est les yeux et les oreilles de votre carte. Découvrons les trois capteurs de ce cours, en 3D.',
  array['Définir capteur et actionneur','Distinguer signal numérique et signal analogique','Reconnaître les composants des capteurs HC-SR04, PIR et DHT11'],
  $md$## Du monde physique au signal électrique

Un **capteur** transforme une grandeur physique (distance, mouvement, température, lumière…) en un **signal électrique** que la carte peut lire. Un **actionneur** fait l'inverse : il transforme un signal en action (LED, buzzer, moteur).

Tout système connecté suit la même chaîne : **mesurer** (capteur), **décider** (programme), **agir** (actionneur).

## Deux familles de signaux

- **Signal numérique** : la broche vaut HIGH ou LOW, ou bien le capteur envoie une suite de bits. C'est le cas du PIR, de la broche Echo du HC-SR04 et du DHT11.
- **Signal analogique** : une tension qui varie de façon continue, lue sur les broches A0 à A5 (potentiomètre, capteur de lumière…).

## Explorez les capteurs du cours

Faites glisser pour **faire tourner** le capteur, utilisez la molette ou deux doigts pour **zoomer**, et cliquez sur une pièce (ou sur la liste) pour la repérer.

@@widget sensor-3d

## Les trois capteurs en un coup d'œil

| Capteur | Il mesure | Alimentation | Sortie |
|---|---|---|---|
| HC-SR04 | Distance (2 à 400 cm) | 5 V | Impulsion sur Echo |
| HC-SR501 (PIR) | Mouvement d'un corps chaud | 5 V à 20 V | Niveau HIGH ou LOW (3,3 V) |
| DHT11 | Température et humidité | 3,3 V à 5 V | Trame numérique sur un fil |

## Lire la fiche d'un capteur

Avant de câbler, cherchez toujours : la **tension d'alimentation**, le **type de sortie**, la **plage de mesure**, la **précision** et le **temps entre deux mesures**.

## À retenir

- Capteur : mesure. Actionneur : agit.
- Numérique : HIGH/LOW ou bits. Analogique : tension variable.
- Toujours lire la fiche technique avant de brancher.

Validez le QCM en fin de leçon pour la terminer.$md$, null, 15),

 (2,'Le capteur à ultrasons HC-SR04',2,'principe-echo-ultrasons','Le principe de l''écho',
  'Comme une chauve-souris, le HC-SR04 envoie un son inaudible et mesure le temps que met l''écho à revenir.',
  array['Expliquer la mesure par temps de vol','Appliquer la formule d = v × t / 2','Citer les limites du capteur (portée, angle, température)'],
  $md$## Mesurer avec le son

Le HC-SR04 possède deux « yeux » : un **émetteur** (T) et un **récepteur** (R). Quand on le déclenche :

1. l'émetteur envoie une salve de 8 impulsions ultrasonores à **40 kHz** (inaudible pour l'humain) ;
2. l'onde se réfléchit sur un obstacle ;
3. le récepteur capte l'écho ;
4. la broche **Echo** reste à HIGH pendant tout le trajet aller-retour.

@@widget sensor-3d-hcsr04

## La formule

Le son parcourt la distance **deux fois** (aller, puis retour). Avec le temps `t` mesuré :

`d = v × t / 2`

À 20 °C, le son va à **343 m/s**, soit **0,0343 cm/µs**. Donc `d (cm) = t (µs) × 0,0343 / 2`, ou simplement `t / 58`.

La vitesse du son dépend de la température : `v = 331,3 + 0,606 × T` (en m/s, T en °C).

## Simulateur : à vous de jouer

**Glissez le mur** pour changer la distance, changez la **température**, **inclinez** la surface et observez le chronogramme et le moniteur série.

@@widget ultrasonic-sim

## Ce qu'il faut observer

- **Portée** : de 2 cm à 400 cm. En dessous ou au-dessus, le capteur ne mesure pas correctement.
- **Angle** : si la surface est inclinée de plus de 15 degrés environ, l'onde est renvoyée ailleurs et l'écho ne revient pas.
- **Température** : Arduino calcule avec 343 m/s. À 40 °C, le son est plus rapide : l'erreur atteint environ 3,6 %.
- **Surfaces molles** (tissu, mousse) : elles absorbent le son, l'écho est faible.

## À retenir

- Distance = vitesse du son × temps / 2.
- Portée 2 à 400 cm, angle utile environ 15 degrés.
- La température influence légèrement la mesure.

Validez le QCM en fin de leçon pour la terminer.$md$, null, 25),

 (2,'Le capteur à ultrasons HC-SR04',3,'brancher-programmer-hcsr04','Brancher et programmer le HC-SR04',
  'Du schéma de câblage au moniteur série : lisez votre première distance.',
  array['Câbler le HC-SR04 sur Arduino Uno','Déclencher une mesure avec Trig','Mesurer l''écho avec pulseIn() et calculer la distance'],
  $md$## Câblage

| HC-SR04 | Arduino Uno |
|---|---|
| VCC | 5V |
| Trig | D9 |
| Echo | D10 |
| GND | GND |

Essayez ci-dessous : choisissez la connexion de chaque broche, puis vérifiez.

@@widget wiring-hcsr04

> Débranchez l'USB avant de modifier un câblage, et ne reliez jamais VCC à GND.

## Séquence de mesure

1. Mettre Trig à LOW pendant 2 µs pour stabiliser.
2. Mettre Trig à HIGH pendant **10 µs**, puis à LOW.
3. Mesurer la durée de l'impulsion HIGH sur Echo avec `pulseIn()`.
4. Convertir la durée en distance.

## Le programme

```cpp
const int TRIG = 9;
const int ECHO = 10;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long duree = pulseIn(ECHO, HIGH, 30000);   // attend au plus 30 ms

  if (duree == 0) {
    Serial.println("Pas d'écho");
  } else {
    float distance = duree * 0.0343 / 2;
    Serial.print(distance);
    Serial.println(" cm");
  }
  delay(100);
}
```

## Les pièges à éviter

- **Timeout** : sans le troisième argument de `pulseIn()`, un écho perdu bloque le programme jusqu'à une seconde.
- **Cadence** : laissez au moins 60 ms entre deux mesures pour que l'écho précédent s'éteigne.
- **Broches inversées** : Trig est une sortie, Echo une entrée.

## À faire

Ouvrez la simulation Wokwi, câblez le capteur, collez le code, puis déplacez l'obstacle et observez le moniteur série. Soumettez ensuite votre travail avec l'exercice ci-dessous.

Validez aussi le QCM pour terminer la leçon.$md$, 'https://wokwi.com/projects/new/arduino-uno', 30),

 (3,'Le détecteur de mouvement PIR',4,'principe-pir','Le principe du capteur PIR',
  'Le PIR ne voit pas les personnes : il voit la chaleur qui bouge. Découvrez pourquoi un corps immobile lui échappe.',
  array['Expliquer la détection infrarouge passive','Décrire le rôle de la lentille de Fresnel','Connaître les réglages du HC-SR501 (portée, durée, mode)'],
  $md$## Un capteur qui voit la chaleur

**PIR** signifie *Passive InfraRed*. Le capteur ne produit rien : il **observe** le rayonnement infrarouge émis par tous les corps chauds. Son élément pyroélectrique est partagé en deux zones. Quand un corps chaud passe d'une zone à l'autre, le signal change : c'est ce **changement** qui est détecté, pas la chaleur elle-même.

Conséquence : une personne **parfaitement immobile** finit par ne plus être détectée.

@@widget sensor-3d-pir

## Le dôme blanc

C'est une **lentille de Fresnel** : elle découpe l'espace en plusieurs zones et concentre l'infrarouge sur le capteur. Elle donne un angle de détection d'environ **110 degrés**.

## Les réglages du HC-SR501

- **Sx** : sensibilité, donc portée (environ 3 à 7 m).
- **Tx** : durée pendant laquelle la sortie reste à HIGH (de 0,3 s à plusieurs minutes).
- **Cavalier H / L** : *H* (repeatable) prolonge la durée tant que le mouvement continue ; *L* (single) ne se redéclenche qu'après la fin.

## Simulateur

Déplacez la personne **dans** le cône, puis laissez-la **immobile**. Faites-la marcher avec le bouton, modifiez la portée, la durée et le mode, et regardez le signal OUT.

@@widget pir-sim

## À retenir

- Le PIR détecte un **mouvement de chaleur**, pas une présence.
- Sortie HIGH pendant la durée Tx après un mouvement.
- Portée, durée et mode se règlent sur la carte.

Validez le QCM en fin de leçon pour la terminer.$md$, null, 25),

 (3,'Le détecteur de mouvement PIR',5,'brancher-programmer-pir','Brancher et programmer le PIR',
  'Lisez la sortie du PIR et allumez une LED quand un mouvement est détecté.',
  array['Câbler le HC-SR501 (3 broches)','Prévoir le temps de stabilisation','Lire la sortie avec digitalRead()'],
  $md$## Câblage

Le HC-SR501 a **trois broches** : VCC, OUT et GND (vérifiez l'ordre sur la sérigraphie de votre carte, il varie selon les modèles).

| HC-SR501 | Arduino Uno |
|---|---|
| VCC | 5V |
| OUT | D2 |
| GND | GND |

@@widget wiring-pir

## Le programme

```cpp
const int PIR = 2;
const int LED = 13;

void setup() {
  pinMode(PIR, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("Stabilisation du capteur...");
  delay(30000);          // environ une minute sur un vrai module
  Serial.println("Pret");
}

void loop() {
  int etat = digitalRead(PIR);
  digitalWrite(LED, etat);
  if (etat == HIGH) {
    Serial.println("Mouvement detecte");
  }
  delay(200);
}
```

## Points d'attention

- **Stabilisation** : au démarrage, le PIR a besoin d'environ une minute pour s'adapter à son environnement. Ignorez ses mesures pendant ce temps.
- **Ne pas confondre** : le PIR reste à HIGH pendant la durée réglée par Tx, même si la personne s'est arrêtée.
- **Faux positifs** : évitez les sources de chaleur (radiateur, soleil direct) et les courants d'air chaud.

## À faire

Réalisez le montage sur Wokwi, puis soumettez l'exercice ci-dessous. Validez aussi le QCM pour terminer la leçon.$md$, 'https://wokwi.com/projects/new/arduino-uno', 25),

 (4,'Température et humidité : le DHT11',6,'dht11','Le capteur DHT11',
  'Un seul fil pour deux mesures : température et humidité.',
  array['Câbler le DHT11','Installer la bibliothèque DHT','Gérer les erreurs de lecture avec isnan()'],
  $md$## Le capteur

Le **DHT11** mesure la **température** (0 à 50 °C, précision environ 2 °C) et l'**humidité** (20 à 80 %, précision environ 5 %). Il envoie ses données sous forme de **trame numérique** sur un seul fil.

@@widget sensor-3d-dht11

## Câblage

| DHT11 | Arduino Uno |
|---|---|
| VCC | 5V |
| DATA | D2 |
| NC | (non connecté) |
| GND | GND |

@@widget wiring-dht11

## Installer la bibliothèque

Dans Arduino IDE : **Croquis > Inclure une bibliothèque > Gérer les bibliothèques**, recherchez **DHT sensor library** (Adafruit) et installez-la, avec la bibliothèque **Adafruit Unified Sensor** si elle est proposée.

## Le programme

```cpp
#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  delay(2000);                       // le DHT11 est lent
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("Erreur de lecture");
    return;
  }
  Serial.print("Temperature : ");
  Serial.print(t);
  Serial.print(" C   Humidite : ");
  Serial.print(h);
  Serial.println(" %");
}
```

## À retenir

- Une lecture toutes les 2 secondes au plus.
- `isnan()` détecte une lecture invalide.
- Précision limitée : adapté à l'apprentissage, pas à la mesure de précision.

Validez le QCM en fin de leçon pour la terminer.$md$, 'https://wokwi.com/projects/new/arduino-uno', 25),

 (5,'Mini-projet',7,'projet-assistant-stationnement','Mini-projet : assistant de stationnement',
  'Combinez le HC-SR04, le PIR, trois LED et un buzzer dans un système complet.',
  array['Combiner plusieurs capteurs et actionneurs','Structurer un programme avec des seuils','Documenter son montage'],
  $md$## Cahier des charges

Réalisez un **assistant de stationnement** :

- Le **PIR** détecte une présence. Sans présence, tout est éteint.
- Avec présence, le **HC-SR04** mesure la distance à l'obstacle :
  - plus de 100 cm : LED **verte** ;
  - de 30 à 100 cm : LED **orange** ;
  - moins de 30 cm : LED **rouge** et **buzzer** en continu.

## Branchements proposés

| Élément | Broche |
|---|---|
| HC-SR04 Trig / Echo | D9 / D10 |
| PIR (OUT) | D2 |
| LED verte / orange / rouge | D8 / D7 / D6 |
| Buzzer | D5 |

Chaque LED a sa résistance de 220 Ω.

## Programme de départ

```cpp
const int TRIG = 9, ECHO = 10, PIR = 2;
const int VERT = 8, ORANGE = 7, ROUGE = 6, BUZZER = 5;

float mesurerDistance() {
  digitalWrite(TRIG, LOW);  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long duree = pulseIn(ECHO, HIGH, 30000);
  if (duree == 0) return -1;            // aucun écho
  return duree * 0.0343 / 2;
}

void toutEteindre() {
  digitalWrite(VERT, LOW); digitalWrite(ORANGE, LOW);
  digitalWrite(ROUGE, LOW); noTone(BUZZER);
}

void setup() {
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT); pinMode(PIR, INPUT);
  pinMode(VERT, OUTPUT); pinMode(ORANGE, OUTPUT); pinMode(ROUGE, OUTPUT);
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  if (digitalRead(PIR) == LOW) {
    toutEteindre();
  } else {
    float d = mesurerDistance();
    // À vous : choisir la LED selon les seuils 100 cm et 30 cm,
    // et faire sonner le buzzer avec tone(BUZZER, 1000) sous 30 cm.
  }
  delay(100);
}
```

## Pour aller plus loin

- Faire bip-biper le buzzer de plus en plus vite quand l'obstacle approche.
- Afficher la distance dans le moniteur série.

## Rendu

Soumettez le lien Wokwi et votre code avec l'exercice ci-dessous. Le QCM final est obligatoire pour terminer le cours.$md$, 'https://wokwi.com/projects/new/arduino-uno', 40)
) as v(mp, mt, pos, slug, title, intro, obj, body, wokwi, dur)
where c.slug = 'capteurs-ultrason-pir-dht11'
on conflict (course_id, slug) do nothing;

-- Exercices pratiques (avec soumission)
insert into public.exercises (course_id, lesson_id, position, kind, title, instructions_md, components, wiring_md, starter_code, wokwi_url)
select c.id, l.id, v.pos, 'practice', v.title, v.instr, v.comp, v.wiring, v.code, 'https://wokwi.com/projects/new/arduino-uno'
from public.courses c
join (values
 (3,10,'Exercice : afficher la distance dans le moniteur série',
  $md$Câblez le HC-SR04 et affichez la distance en centimètres dans le moniteur série. Testez trois distances différentes (par exemple 20, 100 et 250 cm) et indiquez dans votre soumission le lien Wokwi et les valeurs affichées.$md$,
  array['Arduino Uno','HC-SR04'],
  $md$VCC → 5V, Trig → D9, Echo → D10, GND → GND.$md$,
  $md$const int TRIG = 9;
const int ECHO = 10;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
}

void loop() {
  // À compléter : impulsion Trig, pulseIn(), calcul de la distance
}$md$),
 (5,20,'Exercice : une LED commandée par le PIR',
  $md$Allumez la LED de la broche 13 tant que le PIR détecte un mouvement, et affichez un message dans le moniteur série. Dans votre soumission, indiquez le lien Wokwi et ce que vous observez quand la personne reste immobile.$md$,
  array['Arduino Uno','HC-SR501 (PIR)','LED','Résistance 220 Ω'],
  $md$PIR : VCC → 5V, OUT → D2, GND → GND. LED : D13 → résistance 220 Ω → anode, cathode → GND.$md$, null),
 (7,30,'Exercice : l''assistant de stationnement complet',
  $md$Réalisez le cahier des charges complet (PIR, HC-SR04, trois LED, buzzer). Soumettez le lien Wokwi, votre code commenté, et une phrase expliquant comment vous avez choisi les seuils.$md$,
  array['Arduino Uno','HC-SR04','HC-SR501 (PIR)','3 LED (verte, orange, rouge)','3 résistances 220 Ω','Buzzer'],
  $md$Voir le tableau des branchements de la leçon.$md$, null)
) as v(lesson_pos, pos, title, instr, comp, wiring, code) on true
join public.lessons l on l.course_id = c.id and l.position = v.lesson_pos
where c.slug = 'capteurs-ultrason-pir-dht11'
  and not exists (select 1 from public.exercises e where e.course_id = c.id and e.title = v.title);

-- QCM obligatoires : un par leçon
-- Questions et indices : lisibles par tous. Bonnes réponses et explications : table
-- exercise_answers, jamais lisible par les apprenants (renvoyées par grade_quiz après réussite).
-- Relançable : un QCM existant (même titre) est mis à jour, sans doublon.
do $do$
declare cid uuid; q jsonb; lid uuid; eid uuid;
begin
  select id into cid from public.courses where slug = 'capteurs-ultrason-pir-dht11';
  if cid is null then return; end if;

  for q in select * from jsonb_array_elements($j$[
 {
  "lesson": 1,
  "title": "QCM : comprendre les capteurs",
  "intro": "Quatre questions pour vérifier l'essentiel. Il en faut trois justes pour terminer la leçon.",
  "pass": 70,
  "questions": [
   {
    "id": "q1",
    "question": "Quel est le rôle d'un capteur ?",
    "options": [
     "Transformer une grandeur physique en signal électrique exploitable",
     "Alimenter la carte Arduino",
     "Stocker le programme",
     "Afficher du texte à l'écran"
    ],
    "hint": "Un capteur fait le lien entre le monde physique et la carte."
   },
   {
    "id": "q2",
    "question": "Lequel de ces composants est un actionneur ?",
    "options": [
     "Le capteur de température DHT11",
     "Le détecteur de mouvement PIR",
     "Le buzzer",
     "Le capteur à ultrasons HC-SR04"
    ],
    "hint": "Un actionneur transforme un signal en action."
   },
   {
    "id": "q3",
    "question": "Un capteur numérique fournit à Arduino :",
    "options": [
     "Une tension qui varie de façon continue de 0 à 5 V",
     "Un signal numérique : HIGH ou LOW, ou une suite de bits",
     "Un courant de 220 V",
     "Une image"
    ],
    "hint": "Numérique : deux états, ou une suite de bits."
   },
   {
    "id": "q4",
    "question": "Avant de brancher un nouveau capteur, que vérifier d'abord sur sa fiche technique ?",
    "options": [
     "Sa couleur et sa forme",
     "Le nom du fabricant",
     "Le prix du module",
     "Sa tension d'alimentation et son type de sortie"
    ],
    "hint": "Relisez « Lire la fiche d'un capteur »."
   }
  ],
  "answers": {
   "q1": 0,
   "q2": 2,
   "q3": 1,
   "q4": 3
  },
  "explanations": {
   "q1": "Un capteur transforme une grandeur physique (distance, mouvement, température…) en signal électrique que la carte sait lire.",
   "q2": "Le buzzer produit un son à partir d'un signal : c'est un actionneur. DHT11, PIR et HC-SR04 sont des capteurs.",
   "q3": "Un capteur numérique fournit HIGH/LOW (PIR, Echo du HC-SR04) ou une suite de bits (DHT11). Une tension continue, c'est de l'analogique.",
   "q4": "La tension d'alimentation évite d'abîmer le module ; le type de sortie dit comment le lire (numérique, analogique, impulsion)."
  }
 },
 {
  "lesson": 2,
  "title": "QCM : le principe de l'écho",
  "intro": "Quatre questions pour vérifier l'essentiel. Il en faut trois justes pour terminer la leçon.",
  "pass": 70,
  "questions": [
   {
    "id": "q1",
    "question": "Comment le HC-SR04 mesure-t-il une distance ?",
    "options": [
     "Il mesure la lumière réfléchie",
     "Il mesure le temps entre l'émission d'une onde sonore et le retour de son écho",
     "Il mesure la température de l'objet",
     "Il compte les objets qui passent"
    ],
    "hint": "Le capteur fonctionne comme une chauve-souris."
   },
   {
    "id": "q2",
    "question": "L'écho dure 5 831 µs (son à 343 m/s). Quelle est la distance ?",
    "options": [
     "50 cm",
     "100 cm",
     "200 cm",
     "583 cm"
    ],
    "hint": "d = t × 0,0343 / 2, avec t en microsecondes."
   },
   {
    "id": "q3",
    "question": "Pourquoi divise-t-on par 2 dans la formule d = v × t / 2 ?",
    "options": [
     "Parce que le son va deux fois plus vite au retour",
     "Parce que le temps mesuré correspond à l'aller ET au retour",
     "Parce que le capteur a deux transducteurs",
     "Pour convertir en centimètres"
    ],
    "hint": "Que représente la durée de l'impulsion Echo ?"
   },
   {
    "id": "q4",
    "question": "Quand la température de l'air augmente, la vitesse du son :",
    "options": [
     "Diminue",
     "Reste identique",
     "Augmente",
     "Devient nulle"
    ],
    "hint": "v = 331,3 + 0,606 × T (T en °C)."
   }
  ],
  "answers": {
   "q1": 1,
   "q2": 1,
   "q3": 1,
   "q4": 2
  },
  "explanations": {
   "q1": "Le HC-SR04 émet une salve ultrasonore et mesure le temps de vol : le temps que met l'écho à revenir.",
   "q2": "d = 5 831 × 0,0343 / 2 ≈ 100 cm. Sans la division par 2, on obtiendrait 200 cm : l'aller-retour.",
   "q3": "L'impulsion Echo dure le temps de l'aller ET du retour : la distance à l'obstacle correspond à la moitié du trajet.",
   "q4": "La vitesse du son augmente avec la température : environ 331 m/s à 0 °C, 343 m/s à 20 °C."
  }
 },
 {
  "lesson": 3,
  "title": "QCM : brancher et programmer le HC-SR04",
  "intro": "Quatre questions pour vérifier l'essentiel. Il en faut trois justes pour terminer la leçon.",
  "pass": 70,
  "questions": [
   {
    "id": "q1",
    "question": "Sur le HC-SR04, quelle broche reçoit l'impulsion de déclenchement envoyée par Arduino ?",
    "options": [
     "Echo",
     "Trig",
     "VCC",
     "GND"
    ],
    "hint": "Une broche déclenche la mesure, l'autre répond."
   },
   {
    "id": "q2",
    "question": "Quelle fonction mesure la durée de l'impulsion sur la broche Echo ?",
    "options": [
     "digitalRead()",
     "analogRead()",
     "pulseIn()",
     "delay()"
    ],
    "hint": "Cette fonction mesure la durée d'une impulsion."
   },
   {
    "id": "q3",
    "question": "Quelle est la durée de l'impulsion HIGH envoyée sur Trig ?",
    "options": [
     "10 µs",
     "10 ms",
     "1 s",
     "2 µs"
    ],
    "hint": "C'est très court : quelques microsecondes."
   },
   {
    "id": "q4",
    "question": "Avec la durée en µs, quelle formule donne la distance en cm (son à 343 m/s) ?",
    "options": [
     "duree × 0,0343 / 2",
     "duree × 343",
     "duree / 0,0343",
     "duree × 2 / 100"
    ],
    "hint": "343 m/s = 0,0343 cm/µs, et le trajet est un aller-retour."
   }
  ],
  "answers": {
   "q1": 1,
   "q2": 2,
   "q3": 0,
   "q4": 0
  },
  "explanations": {
   "q1": "Arduino envoie l'impulsion de déclenchement sur Trig ; le capteur répond sur Echo.",
   "q2": "pulseIn(ECHO, HIGH, 30000) renvoie, en microsecondes, la durée pendant laquelle Echo reste à HIGH (0 si rien n'arrive avant le délai).",
   "q3": "On met Trig à HIGH pendant 10 µs avec delayMicroseconds(10) pour lancer une mesure.",
   "q4": "distance (cm) = durée (µs) × 0,0343 / 2, ou simplement durée / 58."
  }
 },
 {
  "lesson": 4,
  "title": "QCM : le principe du PIR",
  "intro": "Quatre questions pour vérifier l'essentiel. Il en faut trois justes pour terminer la leçon.",
  "pass": 70,
  "questions": [
   {
    "id": "q1",
    "question": "Que détecte réellement un capteur PIR ?",
    "options": [
     "Les sons",
     "Les variations de rayonnement infrarouge dues au mouvement d'un corps chaud",
     "La distance d'un objet",
     "La lumière visible"
    ],
    "hint": "Le capteur est « passif » : il n'émet rien."
   },
   {
    "id": "q2",
    "question": "Une personne parfaitement immobile devant le PIR :",
    "options": [
     "Est détectée en continu",
     "N'est plus détectée après un instant",
     "Fait griller le capteur",
     "Est détectée plus fort"
    ],
    "hint": "Le PIR réagit à un changement, pas à une présence."
   },
   {
    "id": "q3",
    "question": "À quoi sert le dôme blanc du HC-SR501 ?",
    "options": [
     "Protéger de la pluie uniquement",
     "Concentrer l'infrarouge sur le capteur et répartir les zones de détection (lentille de Fresnel)",
     "Émettre des infrarouges",
     "Refroidir le capteur"
    ],
    "hint": "Ce dôme est une lentille particulière."
   },
   {
    "id": "q4",
    "question": "Que règle le potentiomètre Tx du HC-SR501 ?",
    "options": [
     "La portée de détection",
     "La durée pendant laquelle la sortie reste à HIGH",
     "La tension d'alimentation",
     "La couleur de la LED"
    ],
    "hint": "Sx règle la sensibilité ; Tx, autre chose."
   }
  ],
  "answers": {
   "q1": 1,
   "q2": 1,
   "q3": 1,
   "q4": 1
  },
  "explanations": {
   "q1": "Le PIR détecte les variations de rayonnement infrarouge provoquées par un corps chaud qui passe d'une zone à l'autre.",
   "q2": "Une personne immobile ne fait plus varier l'infrarouge reçu : après la temporisation, la sortie retombe à LOW.",
   "q3": "Le dôme est une lentille de Fresnel : il concentre l'infrarouge sur le capteur et découpe l'espace en zones de détection.",
   "q4": "Tx règle la durée pendant laquelle la sortie reste à HIGH ; Sx règle la sensibilité, donc la portée."
  }
 },
 {
  "lesson": 5,
  "title": "QCM : brancher et programmer le PIR",
  "intro": "Quatre questions pour vérifier l'essentiel. Il en faut trois justes pour terminer la leçon.",
  "pass": 70,
  "questions": [
   {
    "id": "q1",
    "question": "Combien de broches a le HC-SR501, et lesquelles ?",
    "options": [
     "2 : VCC et GND",
     "3 : VCC, OUT et GND",
     "4 : VCC, TRIG, ECHO et GND",
     "5 : VCC, OUT, GND, SDA et SCL"
    ],
    "hint": "Alimentation, masse et une seule sortie."
   },
   {
    "id": "q2",
    "question": "Au démarrage, que faut-il prévoir ?",
    "options": [
     "Rien, la détection est immédiate",
     "Un temps de stabilisation d'environ une minute",
     "Brancher la broche OUT sur 12 V",
     "Appuyer deux fois sur Reset"
    ],
    "hint": "Le capteur doit d'abord « apprendre » la pièce."
   },
   {
    "id": "q3",
    "question": "Quelle instruction lit la sortie du PIR branchée sur la broche 2 ?",
    "options": [
     "analogWrite(2, HIGH)",
     "digitalRead(2)",
     "pulseIn(2)",
     "tone(2)"
    ],
    "hint": "La sortie du PIR vaut HIGH ou LOW."
   },
   {
    "id": "q4",
    "question": "En mode repeatable (H), si le mouvement continue pendant que la sortie est à HIGH :",
    "options": [
     "La durée à HIGH est prolongée",
     "La sortie passe à LOW immédiatement",
     "La carte redémarre",
     "Rien ne change"
    ],
    "hint": "Repeatable veut dire « redéclenchable »."
   }
  ],
  "answers": {
   "q1": 1,
   "q2": 1,
   "q3": 1,
   "q4": 0
  },
  "explanations": {
   "q1": "Le HC-SR501 a trois broches : VCC, OUT (la sortie numérique) et GND.",
   "q2": "Après la mise sous tension, le PIR met environ une minute à se stabiliser : les détections de ce moment ne sont pas fiables.",
   "q3": "OUT est un signal numérique : on le lit avec digitalRead(2), après pinMode(2, INPUT).",
   "q4": "En mode H, chaque nouveau mouvement relance la temporisation : la sortie reste à HIGH tant que le mouvement continue."
  }
 },
 {
  "lesson": 6,
  "title": "QCM : le capteur DHT11",
  "intro": "Quatre questions pour vérifier l'essentiel. Il en faut trois justes pour terminer la leçon.",
  "pass": 70,
  "questions": [
   {
    "id": "q1",
    "question": "Quelles grandeurs mesure le DHT11 ?",
    "options": [
     "Distance et mouvement",
     "Température et humidité",
     "Lumière et son",
     "Pression et altitude"
    ],
    "hint": "Deux grandeurs de l'air ambiant."
   },
   {
    "id": "q2",
    "question": "Quel est l'intervalle minimal conseillé entre deux lectures du DHT11 ?",
    "options": [
     "Au moins 1 à 2 secondes",
     "10 µs",
     "Aucun",
     "1 heure"
    ],
    "hint": "Le DHT11 est un capteur lent."
   },
   {
    "id": "q3",
    "question": "Que renvoie dht.readTemperature() quand la lecture échoue ?",
    "options": [
     "0",
     "-1",
     "NaN (nombre invalide)",
     "255"
    ],
    "hint": "Ce n'est pas un nombre du tout."
   },
   {
    "id": "q4",
    "question": "Que fait la fonction isnan(valeur) ?",
    "options": [
     "Elle arrondit la valeur",
     "Elle teste si la valeur n'est pas un nombre valide",
     "Elle calcule la valeur absolue",
     "Elle convertit en texte"
    ],
    "hint": "isnan = « is not a number ? »."
   }
  ],
  "answers": {
   "q1": 1,
   "q2": 0,
   "q3": 2,
   "q4": 1
  },
  "explanations": {
   "q1": "Le DHT11 mesure la température et l'humidité, et envoie les deux sous forme de trame numérique sur un seul fil.",
   "q2": "Le DHT11 a besoin d'environ 1 à 2 secondes entre deux lectures ; plus vite, il renvoie des erreurs.",
   "q3": "En cas d'échec, la bibliothèque renvoie NaN (Not a Number), qu'on détecte avec isnan().",
   "q4": "isnan(x) est vrai si x n'est pas un nombre valide : on l'utilise pour ignorer une lecture ratée."
  }
 },
 {
  "lesson": 7,
  "title": "QCM final : assistant de stationnement",
  "intro": "Cinq questions pour vérifier l'essentiel. Il en faut quatre justes pour terminer le cours.",
  "pass": 70,
  "questions": [
   {
    "id": "q1",
    "question": "Dans le projet, quel capteur mesure la distance à l'obstacle ?",
    "options": [
     "Le PIR",
     "Le HC-SR04",
     "Le DHT11",
     "Un potentiomètre"
    ],
    "hint": "Quel capteur du cours mesure une distance ?"
   },
   {
    "id": "q2",
    "question": "Quand l'obstacle est à moins de 30 cm, le système doit :",
    "options": [
     "Éteindre toutes les LED",
     "Allumer la LED rouge et faire sonner le buzzer",
     "Allumer la LED verte seule",
     "Attendre 10 secondes"
    ],
    "hint": "Sous 30 cm, c'est la zone de danger."
   },
   {
    "id": "q3",
    "question": "Quelle condition permet d'ignorer une mesure quand pulseIn() dépasse son délai ?",
    "options": [
     "duree == 0",
     "duree > 100",
     "duree < 0",
     "duree == 1"
    ],
    "hint": "Que renvoie pulseIn() quand l'écho n'arrive pas à temps ?"
   },
   {
    "id": "q4",
    "question": "Pourquoi utiliser le PIR dans ce projet ?",
    "options": [
     "Pour mesurer la distance précise",
     "Pour n'activer le système que lorsqu'une présence est détectée",
     "Pour mesurer la température",
     "Pour alimenter le buzzer"
    ],
    "hint": "Le PIR détecte une présence, pas une distance."
   },
   {
    "id": "q5",
    "question": "Quelle protection place-t-on en série avec chaque LED branchée sur une broche en 5 V ?",
    "options": [
     "Aucune",
     "Une résistance d'environ 220 Ω",
     "Une résistance de 10 MΩ en parallèle",
     "Un fil direct"
    ],
    "hint": "Leçon « LED, résistance et breadboard » du premier cours."
   }
  ],
  "answers": {
   "q1": 1,
   "q2": 1,
   "q3": 0,
   "q4": 1,
   "q5": 1
  },
  "explanations": {
   "q1": "Le HC-SR04 mesure la distance ; le PIR détecte la présence.",
   "q2": "Sous 30 cm, l'assistant alerte : LED rouge et buzzer.",
   "q3": "Quand aucun écho n'arrive avant le délai, pulseIn() renvoie 0 : on ignore la mesure avec if (duree == 0).",
   "q4": "Le PIR n'active le système que lorsqu'une présence est détectée.",
   "q5": "Chaque LED a sa résistance en série, d'environ 220 Ω, pour limiter le courant."
  }
 }
]$j$::jsonb) loop
    select id into lid from public.lessons where course_id = cid and position = (q ->> 'lesson')::int;
    if lid is null then continue; end if;
    select id into eid from public.exercises where course_id = cid and kind = 'quiz' and title = q ->> 'title';
    if eid is null then
      insert into public.exercises (course_id, lesson_id, position, kind, title, instructions_md, required, pass_score, requires_submission, quiz)
      values (cid, lid, 100 + (q ->> 'lesson')::int, 'quiz', q ->> 'title', q ->> 'intro', true, (q ->> 'pass')::int, false, q -> 'questions')
      returning id into eid;
    else
      update public.exercises
         set lesson_id = lid, position = 100 + (q ->> 'lesson')::int, instructions_md = q ->> 'intro',
             required = true, pass_score = (q ->> 'pass')::int, requires_submission = false, quiz = q -> 'questions'
       where id = eid;
    end if;
    insert into public.exercise_answers (exercise_id, answers, explanations)
    values (eid, q -> 'answers', q -> 'explanations')
    on conflict (exercise_id) do update set answers = excluded.answers, explanations = excluded.explanations;
  end loop;
end $do$;
