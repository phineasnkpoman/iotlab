-- =====================================================================
-- IoT LAB ESATIC — Données initiales (à exécuter après les migrations)
-- Relançable : utilise "on conflict" pour ne pas dupliquer.
-- =====================================================================

-- ---------- Catégories ----------
insert into public.categories (slug, name, description, icon, position) values
 ('electronique-fondamentale','Électronique fondamentale','Tension, courant, résistances, composants de base.','Zap',1),
 ('arduino','Arduino','Programmer et câbler les cartes Arduino.','Cpu',2),
 ('capteurs-actionneurs','Capteurs et actionneurs','Mesurer le monde physique et agir dessus.','Gauge',3),
 ('esp32','ESP32','Microcontrôleur Wi-Fi/Bluetooth pour objets connectés.','Wifi',4),
 ('communication-iot','Communication IoT','Protocoles et réseaux pour objets connectés.','Radio',5),
 ('mqtt','MQTT','Publier et recevoir des messages entre objets.','MessageSquare',6),
 ('node-red','Node-RED','Programmation visuelle de flux IoT.','Workflow',7),
 ('systemes-embarques','Systèmes embarqués','Microcontrôleurs, temps réel, bas niveau.','CircuitBoard',8),
 ('projets-pratiques','Projets pratiques','Réalisations complètes de bout en bout.','Hammer',9)
on conflict (slug) do nothing;

-- ---------- Outils ----------
insert into public.tools (slug, name, description, category, official_url, usefulness, position) values
 ('wokwi','Wokwi','Simulateur en ligne pour Arduino, ESP32 et composants électroniques.','Simulation','https://wokwi.com',
  'Tester un montage et son code sans matériel, directement dans le navigateur.',1),
 ('tinkercad-circuits','Tinkercad Circuits','Simulateur de circuits électroniques très visuel, idéal pour débuter.','Simulation','https://www.tinkercad.com/circuits',
  'Comprendre un circuit en le construisant composant par composant.',2),
 ('fritzing','Fritzing','Logiciel de conception de schémas électroniques et de platines d''essai.','Conception','https://fritzing.org',
  'Dessiner proprement le schéma de câblage d''un projet pour le documenter.',3),
 ('arduino-ide','Arduino IDE','Environnement officiel pour écrire et téléverser du code sur les cartes Arduino.','Développement','https://www.arduino.cc/en/software',
  'Programmer une vraie carte Arduino et ouvrir le moniteur série.',4),
 ('node-red','Node-RED','Outil de programmation visuelle pour relier objets, API et services.','Intégration','https://nodered.org',
  'Construire des flux IoT et des tableaux de bord sans tout coder.',5),
 ('mqtt-explorer','MQTT Explorer','Client graphique pour observer et publier des messages MQTT.','Communication','https://mqtt-explorer.com',
  'Voir en direct ce que publient vos objets sur un broker MQTT.',6),
 ('vs-code','Visual Studio Code','Éditeur de code extensible, avec des extensions pour Arduino et PlatformIO.','Développement','https://code.visualstudio.com',
  'Écrire, organiser et versionner le code de vos projets.',7)
on conflict (slug) do nothing;

-- ---------- Challenges (sans dates : ouverts en permanence) ----------
insert into public.challenges (slug, title, description, level, objectives, instructions_md, resources, status) values
 ('led-clignotante','Réaliser une LED clignotante','Premier défi : faire clignoter une LED à une cadence que vous choisissez.','debutant',
  array['Câbler une LED avec sa résistance','Écrire un programme avec setup() et loop()'],
  $md$Réalisez un montage où une LED clignote. Choisissez une cadence différente de 1 seconde (par exemple 300 ms allumée, 700 ms éteinte).

Dans votre soumission, indiquez : le lien de votre simulation Wokwi, la valeur de la résistance utilisée et une phrase expliquant votre choix de cadence.$md$,
  '[{"label":"Nouveau projet Arduino Uno sur Wokwi","url":"https://wokwi.com/projects/new/arduino-uno"}]','published'),
 ('feu-tricolore','Concevoir un feu tricolore','Simuler un feu de circulation avec trois LED et un cycle temporisé.','debutant',
  array['Piloter plusieurs sorties','Organiser un cycle dans loop()'],
  $md$Concevez un feu tricolore (rouge, orange, vert) avec une carte Arduino Uno. Le cycle doit être respecté : vert, orange, rouge, puis retour au vert.

Soumettez le lien Wokwi et le code commenté.$md$,
  '[{"label":"Nouveau projet Arduino Uno sur Wokwi","url":"https://wokwi.com/projects/new/arduino-uno"}]','published'),
 ('distance-ultrason','Mesurer une distance avec un capteur ultrason','Lire un capteur HC-SR04 et afficher la distance dans le moniteur série.','intermediaire',
  array['Lire un capteur ultrason','Convertir un temps en distance'],
  $md$Utilisez un capteur ultrason HC-SR04 pour mesurer la distance à un obstacle et l'afficher en centimètres dans le moniteur série.

Soumettez le lien de votre simulation et une capture du moniteur série.$md$,
  '[{"label":"Nouveau projet Arduino Uno sur Wokwi","url":"https://wokwi.com/projects/new/arduino-uno"}]','published'),
 ('surveillance-temperature','Créer un système de surveillance de température','Mesurer une température et déclencher une alerte au-delà d''un seuil.','intermediaire',
  array['Lire un capteur de température','Déclencher une alerte sur seuil'],
  $md$Réalisez un système qui mesure la température et allume une LED ou un buzzer au-delà d'un seuil que vous définissez.$md$,
  '[]','draft'),
 ('publier-mqtt','Publier des données avec MQTT','Envoyer une mesure vers un broker MQTT depuis un ESP32.','avance',
  array['Se connecter à un broker','Publier sur un topic'],
  $md$Publiez une mesure sur un topic MQTT depuis un ESP32 et visualisez-la avec MQTT Explorer.$md$,
  '[]','draft')
on conflict (slug) do nothing;

-- ---------- Formation pilote : Premiers pas avec Arduino ----------
insert into public.courses (slug, title, description, level, category_id, duration_minutes, skills, prerequisites, status)
select 'premiers-pas-avec-arduino',
  'Premiers pas avec Arduino',
  'Aucune expérience requise : découvrez la carte Arduino Uno, apprenez à câbler une LED et un bouton, écrivez vos premiers programmes et terminez par un feu tricolore.',
  'debutant', c.id, 150,
  array['Lire le brochage d''une carte Arduino Uno','Câbler une LED et un bouton sur une breadboard','Écrire un programme avec setup() et loop()','Simuler un montage sur Wokwi'],
  'Aucun. Il suffit de savoir utiliser un navigateur web.',
  'published'
from public.categories c where c.slug = 'arduino'
on conflict (slug) do nothing;

-- Leçons (dollar-quoting $md$ pour pouvoir écrire du Markdown et du code librement)
insert into public.lessons (course_id, module_position, module_title, position, slug, title, intro, objectives, content_md, wokwi_url, duration_minutes)
select c.id, v.mp, v.mt, v.pos, v.slug, v.title, v.intro, v.obj, v.body, v.wokwi, v.dur
from public.courses c,
(values
 (1,'Découvrir Arduino',1,'quest-ce-quarduino','Qu''est-ce qu''Arduino ?',
  'Avant de câbler quoi que ce soit, comprenons ce qu''est Arduino et pourquoi tant d''étudiants commencent par là.',
  array['Définir ce qu''est un microcontrôleur','Expliquer ce qu''est une carte Arduino','Citer des exemples d''objets que l''on peut construire'],
  $md$## Un petit ordinateur dédié à une tâche

Un **microcontrôleur** est une puce qui contient un processeur, de la mémoire et des broches pour communiquer avec l'extérieur. Contrairement à votre ordinateur, il ne fait qu'une chose : exécuter *votre* programme, en boucle, dès qu'il est alimenté.

**Arduino** est une plateforme libre qui rend les microcontrôleurs accessibles : une carte électronique prête à l'emploi, un langage simple (basé sur le C/C++) et un logiciel gratuit pour programmer la carte.

## Ce qu'on peut construire

- Une LED qui s'allume quand on appuie sur un bouton.
- Un arrosage automatique qui lit l'humidité de la terre.
- Une station météo qui envoie ses mesures sur Internet.

Ces exemples montrent le principe de l'IoT : **mesurer** (capteur), **décider** (programme), **agir** (actionneur).

## Entrées et sorties

Une carte Arduino communique avec le monde par ses **broches** :

- une broche en **sortie** envoie un signal (allumer une LED) ;
- une broche en **entrée** lit un signal (savoir si un bouton est appuyé).

> Retenez cette idée : tout le cours consiste à lire des entrées et à commander des sorties.

## À retenir

- Un microcontrôleur exécute un seul programme, en boucle.
- Arduino = carte + langage + logiciel, tous accessibles aux débutants.
- Les broches servent d'entrées ou de sorties.$md$, null, 10),
 (1,'Découvrir Arduino',2,'la-carte-arduino-uno','La carte Arduino Uno',
  'Faisons le tour de la carte Arduino Uno : où brancher quoi, et ce que chaque zone fait.',
  array['Repérer les broches numériques, analogiques et d''alimentation','Identifier le port USB et le bouton reset','Distinguer 5V, 3.3V et GND'],
  $md$## Vue d'ensemble

La carte **Arduino Uno** est la plus répandue pour débuter. Elle se repère à ses quatre zones :

1. **Le port USB** : alimente la carte et sert à envoyer votre programme depuis l'ordinateur.
2. **Les broches numériques (0 à 13)** : elles ne connaissent que deux états, `HIGH` (5 V) ou `LOW` (0 V).
3. **Les broches analogiques (A0 à A5)** : elles mesurent une tension variable, utile pour les capteurs.
4. **Les broches d'alimentation** : `5V`, `3.3V` et `GND` (la masse, 0 V).

## Les broches à connaître en priorité

| Broche | Rôle |
|---|---|
| 13 | Sortie numérique, reliée à une petite LED intégrée à la carte (marquée « L ») |
| 5V | Fournit 5 volts aux composants |
| GND | Retour du courant, à relier à tous les circuits |
| RESET | Redémarre le programme |

## Les broches 0 et 1

Elles servent à la communication série avec l'ordinateur. Pour vos premiers montages, **évitez-les** : utilisez plutôt les broches 2 à 13.

## À retenir

- Numérique : 2 états seulement (HIGH ou LOW).
- Analogique : une valeur qui varie, lue sur A0 à A5.
- GND est indispensable : sans retour de courant, rien ne fonctionne.$md$, null, 12),
 (1,'Découvrir Arduino',3,'arduino-ide','L''environnement Arduino IDE',
  'Installons et visitons le logiciel qui permet d''écrire du code et de l''envoyer sur la carte.',
  array['Télécharger et installer Arduino IDE','Choisir la carte et le port','Compiler et téléverser un programme'],
  $md$## Installer le logiciel

Téléchargez Arduino IDE depuis le site officiel arduino.cc (page *Software*), puis installez-le comme n'importe quel programme Windows. Acceptez l'installation des pilotes USB proposée.

## Les boutons essentiels

- **Vérifier** (✓) : compile le code et signale les erreurs de syntaxe, sans toucher à la carte.
- **Téléverser** (→) : compile puis envoie le programme sur la carte.
- **Moniteur série** (loupe) : affiche les messages envoyés par la carte.

## Préparer la carte

1. Branchez l'Arduino Uno avec le câble USB.
2. Menu **Outils > Type de carte** : choisissez *Arduino Uno*.
3. Menu **Outils > Port** : choisissez le port où la carte apparaît (par exemple COM3 sous Windows).

## Votre premier test

Ouvrez **Fichier > Exemples > 01.Basics > Blink**, cliquez sur Téléverser. La petite LED « L » de la carte se met à clignoter.

> Pas de carte sous la main ? Utilisez la simulation Wokwi liée à cette leçon : même code, même résultat.

## En cas de problème

- *Aucun port n'apparaît* : essayez un autre câble USB (certains ne font que charger).
- *Erreur de téléversement* : vérifiez le type de carte et le port.$md$, 'https://wokwi.com/projects/new/arduino-uno', 12),
 (2,'Découvrir les composants',4,'led-resistance-breadboard','LED, résistance et breadboard',
  'Trois composants que vous utiliserez dans presque tous vos montages.',
  array['Reconnaître l''anode et la cathode d''une LED','Expliquer pourquoi une LED a besoin d''une résistance','Lire les lignes d''une breadboard'],
  $md$## La LED

Une **LED** (diode électroluminescente) émet de la lumière quand elle est traversée par un courant, **dans un seul sens**.

- La patte la plus longue est l'**anode (+)**.
- La patte la plus courte est la **cathode (−)**, côté méplat du boîtier.

## La résistance

Sans protection, une LED laisse passer trop de courant et grille. La **résistance** limite ce courant.

Pour une LED avec une alimentation de 5 V, une résistance de **220 Ω** à **330 Ω** convient dans la grande majorité des cas.

Le calcul : R = (U alimentation − U LED) / I. Avec 5 V, environ 2 V pour la LED et 15 mA : R = (5 − 2) / 0,015 = 200 Ω, on prend donc 220 Ω.

## La breadboard

La platine d'essai permet de câbler sans souder.

- Les trous d'une **même colonne** (5 trous) sont reliés entre eux.
- Les **rails** latéraux (+ et −) sont reliés sur toute la longueur : on y branche 5V et GND.

## À retenir

- LED : le sens compte (longue patte = +).
- Toujours une résistance en série avec la LED.
- Colonnes de 5 trous reliés, rails d'alimentation sur les côtés.$md$, null, 12),
 (2,'Découvrir les composants',5,'bouton-cables-securite','Bouton poussoir, câbles et sécurité',
  'Le bouton poussoir et les bonnes habitudes de câblage pour ne rien abîmer.',
  array['Câbler un bouton poussoir','Choisir des câbles de couleur cohérents','Appliquer les règles de sécurité électrique de base'],
  $md$## Le bouton poussoir

Un bouton poussoir à quatre pattes relie deux côtés quand on appuie. Placez-le **à cheval sur la rainure centrale** de la breadboard : ainsi, ses deux côtés ne sont pas reliés au repos.

## Les câbles

Adoptez un code couleur et gardez-le :

- **Rouge** : 5 V.
- **Noir** : GND.
- Autres couleurs : signaux vers les broches numériques.

Un montage lisible se dépanne dix fois plus vite.

## Sécurité et bonnes pratiques

- **Débranchez l'USB avant de modifier le câblage.**
- Ne reliez jamais 5V directement à GND : c'est un court-circuit.
- Ne dépassez pas 20 mA par broche : une LED toujours avec sa résistance.
- Ne câblez pas de composants sous tension secteur (220 V) : ce cours n'en a jamais besoin.

## À retenir

- Bouton à cheval sur la rainure centrale.
- Rouge = 5V, noir = GND.
- Toujours hors tension quand on câble.$md$, null, 10),
 (3,'Première programmation',6,'structure-programme','Structure d''un programme Arduino',
  'Tout programme Arduino repose sur deux fonctions : setup() et loop().',
  array['Distinguer setup() et loop()','Écrire un programme minimal valide','Utiliser les commentaires'],
  $md$## Les deux fonctions obligatoires

```cpp
void setup() {
  // s'exécute UNE fois, au démarrage
}

void loop() {
  // s'exécute en BOUCLE, indéfiniment
}
```

- **setup()** : on y prépare la carte (par exemple, dire quelles broches sont des sorties).
- **loop()** : on y met ce que la carte doit faire en permanence.

## Les commentaires

Tout ce qui suit `//` est ignoré par la carte. Commentez votre code pour vous relire facilement.

## Les règles de syntaxe

- Chaque instruction se termine par un point-virgule `;`.
- Les accolades `{ }` délimitent les blocs : toute accolade ouverte doit être fermée.
- Majuscules et minuscules comptent : `delay` n'est pas `Delay`.

## À retenir

- setup() une fois, loop() sans fin.
- Point-virgule à chaque instruction.
- Le compilateur est strict sur la casse.$md$, null, 10),
 (3,'Première programmation',7,'pinmode-digitalwrite-delay','pinMode(), digitalWrite() et delay()',
  'Les trois instructions qui suffisent à commander une LED.',
  array['Configurer une broche avec pinMode()','Allumer et éteindre une sortie avec digitalWrite()','Temporiser avec delay()'],
  $md$## pinMode(broche, mode)

Indique si une broche est une sortie ou une entrée.

```cpp
pinMode(8, OUTPUT);   // la broche 8 envoie un signal
pinMode(2, INPUT);    // la broche 2 lit un signal
```

## digitalWrite(broche, état)

Met une sortie à `HIGH` (5 V) ou `LOW` (0 V).

```cpp
digitalWrite(8, HIGH); // LED allumée
digitalWrite(8, LOW);  // LED éteinte
```

## delay(durée)

Met le programme en pause pendant la durée donnée **en millisecondes** (1000 ms = 1 s).

```cpp
delay(500); // pause d'une demi-seconde
```

## Assembler le tout

```cpp
void setup() {
  pinMode(8, OUTPUT);
}

void loop() {
  digitalWrite(8, HIGH);
  delay(1000);
  digitalWrite(8, LOW);
  delay(1000);
}
```

Ce programme fait clignoter une LED branchée sur la broche 8 : une seconde allumée, une seconde éteinte.

## À retenir

- pinMode une seule fois, dans setup().
- HIGH = 5 V, LOW = 0 V.
- delay() prend des millisecondes.$md$, 'https://wokwi.com/projects/new/arduino-uno', 12),
 (4,'Premiers montages',8,'allumer-faire-clignoter-led','Allumer et faire clignoter une LED',
  'Premier vrai montage : câblez une LED, puis faites-la clignoter.',
  array['Câbler une LED avec sa résistance sur la broche 8','Téléverser le programme de clignotement','Modifier la cadence'],
  $md$## Matériel

- 1 carte Arduino Uno
- 1 LED
- 1 résistance de 220 Ω
- 1 breadboard et 2 câbles

## Câblage

1. Câble de la broche **8** vers une colonne de la breadboard.
2. Résistance 220 Ω entre cette colonne et une colonne voisine.
3. Anode (longue patte) de la LED dans la colonne de la résistance, cathode (courte patte) dans une autre colonne.
4. Câble de la cathode vers **GND**.

Le courant suit ce chemin : broche 8, résistance, LED, GND.

## Programme

```cpp
const int PIN_LED = 8;

void setup() {
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  digitalWrite(PIN_LED, HIGH);
  delay(500);
  digitalWrite(PIN_LED, LOW);
  delay(500);
}
```

`const int PIN_LED = 8;` donne un nom à la broche : si vous changez de broche, une seule ligne à modifier.

## Pour aller plus loin

Changez les deux `delay` pour obtenir un clignotement rapide (100 ms) puis une impulsion brève (100 ms allumée, 900 ms éteinte).

## Si ça ne marche pas

- LED dans le mauvais sens : tournez-la.
- Rien ne s'allume : vérifiez que la cathode va bien à GND.$md$, 'https://wokwi.com/projects/new/arduino-uno', 15),
 (4,'Premiers montages',9,'led-bouton-erreurs','Commander une LED avec un bouton',
  'Lisez un bouton et réagissez : le premier montage interactif.',
  array['Lire une entrée avec digitalRead()','Utiliser INPUT_PULLUP','Identifier les erreurs de câblage fréquentes'],
  $md$## Le principe

On lit l'état d'un bouton avec `digitalRead()`. Pour éviter une entrée « flottante » (valeur aléatoire quand le bouton est relâché), on active la résistance interne de l'Arduino avec `INPUT_PULLUP`.

Conséquence : au repos la broche lit `HIGH`, **appuyé elle lit `LOW`**.

## Câblage du bouton

Une patte du bouton sur la broche **2**, l'autre sur **GND**. Pas de résistance externe nécessaire.

## Programme

```cpp
const int PIN_BOUTON = 2;
const int PIN_LED = 8;

void setup() {
  pinMode(PIN_BOUTON, INPUT_PULLUP);
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  if (digitalRead(PIN_BOUTON) == LOW) {   // bouton appuyé
    digitalWrite(PIN_LED, HIGH);
  } else {
    digitalWrite(PIN_LED, LOW);
  }
}
```

## Les erreurs de câblage les plus fréquentes

- **Bouton mal placé** : s'il n'est pas à cheval sur la rainure, il est toujours fermé ou jamais fermé.
- **LED à l'envers** : elle ne s'allume jamais.
- **GND oublié** : le circuit n'est pas fermé.
- **Mauvaise broche dans le code** : le code pilote la 8 mais la LED est sur la 9.
- **Logique inversée** : avec INPUT_PULLUP, appuyé = LOW, pas HIGH.

## À retenir

- INPUT_PULLUP : relâché = HIGH, appuyé = LOW.
- if / else pour réagir à une entrée.
- Face à un bug, vérifier dans l'ordre : câblage, broches, sens des composants.$md$, 'https://wokwi.com/projects/new/arduino-uno', 15),
 (5,'Mini-projet',10,'mini-projet-feu-tricolore','Mini-projet : un feu tricolore',
  'Réunissez tout ce que vous avez appris dans un feu de circulation.',
  array['Piloter trois LED','Organiser un cycle temporisé','Documenter son montage'],
  $md$## Cahier des charges

Réalisez un feu tricolore avec une carte Arduino Uno :

- une LED **rouge** (broche 10), une **orange** (broche 9), une **verte** (broche 8) ;
- cycle : vert 5 s, orange 2 s, rouge 5 s, puis on recommence.

## Matériel

1 Arduino Uno, 3 LED (rouge, orange, verte), 3 résistances de 220 Ω, 1 breadboard, câbles.

## Câblage

Chaque LED a sa propre résistance en série. Les trois cathodes vont au rail GND.

## Programme de départ

```cpp
const int ROUGE = 10;
const int ORANGE = 9;
const int VERT = 8;

void setup() {
  pinMode(ROUGE, OUTPUT);
  pinMode(ORANGE, OUTPUT);
  pinMode(VERT, OUTPUT);
}

void loop() {
  digitalWrite(VERT, HIGH);
  delay(5000);
  digitalWrite(VERT, LOW);

  // À vous : orange 2 s, puis rouge 5 s
}
```

Complétez le cycle.

## Pour aller plus loin

- Ajoutez un bouton « piéton » qui déclenche le passage au rouge.
- Faites clignoter l'orange trois fois avant le rouge.

## Rendu

Dans l'exercice associé, soumettez le lien de votre simulation Wokwi et votre code.$md$, 'https://wokwi.com/projects/new/arduino-uno', 25)
) as v(mp, mt, pos, slug, title, intro, obj, body, wokwi, dur)
where c.slug = 'premiers-pas-avec-arduino'
on conflict (course_id, slug) do nothing;

-- Exercices pratiques
insert into public.exercises (course_id, lesson_id, position, kind, title, instructions_md, components, wiring_md, starter_code, wokwi_url)
select c.id, l.id, v.pos, 'practice', v.title, v.instr, v.comp, v.wiring, v.code, 'https://wokwi.com/projects/new/arduino-uno'
from public.courses c
join (values
 (8,1,'Exercice : LED clignotante à votre rythme',
  $md$Faites clignoter une LED avec une cadence **différente** de 500 ms. Dans votre soumission, indiquez le lien Wokwi, les durées choisies et ce que vous observez.$md$,
  array['Arduino Uno','LED','Résistance 220 Ω','Breadboard'],
  $md$Broche 8 → résistance 220 Ω → anode de la LED ; cathode de la LED → GND.$md$,
  $md$const int PIN_LED = 8;

void setup() {
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  // À compléter
}$md$),
 (9,2,'Exercice : LED commandée par un bouton',
  $md$Modifiez le programme de la leçon pour que la LED reste allumée après un appui bref, et s'éteigne au second appui. Soumettez votre lien Wokwi et décrivez le problème rencontré.$md$,
  array['Arduino Uno','LED','Résistance 220 Ω','Bouton poussoir','Breadboard'],
  $md$Bouton : broche 2 et GND. LED : broche 8 → résistance → anode, cathode → GND.$md$, null),
 (10,3,'Exercice : feu tricolore complet',
  $md$Réalisez le cycle complet vert 5 s, orange 2 s, rouge 5 s. Soumettez votre lien Wokwi et votre code.$md$,
  array['Arduino Uno','3 LED (rouge, orange, verte)','3 résistances 220 Ω','Breadboard'],
  $md$Rouge : broche 10, orange : 9, vert : 8, chacune via une résistance 220 Ω, cathodes au rail GND.$md$, null)
) as v(lesson_pos, pos, title, instr, comp, wiring, code) on true
join public.lessons l on l.course_id = c.id and l.position = v.lesson_pos
where c.slug = 'premiers-pas-avec-arduino'
  and not exists (select 1 from public.exercises e where e.course_id = c.id and e.title = v.title);

-- Quiz de validation (questions sans réponses) + réponses dans la table protégée
with q as (
  insert into public.exercises (course_id, position, kind, title, instructions_md, requires_submission, quiz)
  select c.id, 4, 'quiz', 'Quiz de validation : Premiers pas avec Arduino',
    'Répondez aux cinq questions. Votre note est calculée côté serveur et enregistrée dans votre progression.', false,
    $json$[
      {"id":"q1","question":"Que fait la fonction setup() ?","options":["Elle s'exécute en boucle","Elle s'exécute une seule fois au démarrage","Elle éteint la carte","Elle téléverse le programme"]},
      {"id":"q2","question":"Quelle patte d'une LED est l'anode (+) ?","options":["La plus courte","Celle du côté du méplat","La plus longue","Peu importe"]},
      {"id":"q3","question":"Pourquoi place-t-on une résistance en série avec une LED ?","options":["Pour la faire briller plus fort","Pour limiter le courant et éviter de la détruire","Pour changer sa couleur","Pour réduire la tension de la carte"]},
      {"id":"q4","question":"Avec INPUT_PULLUP, que lit digitalRead() quand le bouton est appuyé ?","options":["HIGH","LOW","Une valeur aléatoire","Rien"]},
      {"id":"q5","question":"delay(2000) met le programme en pause pendant :","options":["2 millisecondes","20 secondes","2 secondes","2 minutes"]}
    ]$json$::jsonb
  from public.courses c
  where c.slug = 'premiers-pas-avec-arduino'
    and not exists (select 1 from public.exercises e where e.course_id = c.id and e.kind = 'quiz')
  returning id
)
insert into public.exercise_answers (exercise_id, answers)
select id, '{"q1":1,"q2":2,"q3":1,"q4":1,"q5":2}'::jsonb from q
on conflict (exercise_id) do nothing;
