-- =====================================================================
-- IoT LAB ESATIC — Plus de challenges et d'exercices pratiques
-- À exécuter APRÈS seed.sql et seed_capteurs.sql. Relançable sans doublon.
--
-- 1. Huit nouveaux challenges, publiés directement, du niveau débutant au niveau avancé.
-- 2. Les deux challenges restés en brouillon (« surveillance-temperature » et
--    « publier-mqtt ») reçoivent des consignes complètes et sont publiés.
-- 3. Douze exercices pratiques, rattachés aux leçons qui n'en avaient pas
--    (ou qui méritaient un deuxième exercice), dans les deux formations.
-- Les ressources commençant par « / » renvoient aux montages 3D du Laboratoire.
-- =====================================================================

-- ---------- 1. Nouveaux challenges ----------
insert into public.challenges (slug, title, description, level, objectives, instructions_md, resources, status) values

 ('chenillard-led', 'Chenillard à quatre LED',
  'Quatre LED qui s''allument l''une après l''autre, puis repartent en sens inverse.', 'debutant',
  array['Piloter plusieurs sorties numériques','Utiliser une boucle for','Organiser un effet lumineux dans le temps'],
  $md$## Cahier des charges

Quatre LED sont alignées sur la breadboard. Une seule est allumée à la fois : la lumière avance de la première à la quatrième, puis revient vers la première, sans s'arrêter (effet « K2000 »).

## Matériel

- 1 carte Arduino Uno
- 4 LED et 4 résistances de 220 Ω
- 1 breadboard et des câbles

## Pistes

- Branchez les LED sur les broches **2, 3, 4 et 5** : une boucle `for (int b = 2; b <= 5; b++)` les parcourt toutes.
- Une pause de 100 à 150 ms entre deux LED donne un effet fluide.

## À soumettre

Le lien de votre simulation Wokwi et votre code commenté.

## Bonus

Ajoutez un potentiomètre sur A0 pour régler la vitesse du chenillard avec `analogRead()`.$md$,
  '[{"label":"Nouveau projet Arduino Uno sur Wokwi","url":"https://wokwi.com/projects/new/arduino-uno"},{"label":"Montage 3D : faire clignoter une LED","url":"/laboratoire/montages/led-clignotante"}]',
  'published'),

 ('de-electronique', 'Dé électronique',
  'Un appui sur le bouton tire un nombre de 1 à 6, affiché avec des LED.', 'debutant',
  array['Lire un bouton avec INPUT_PULLUP','Tirer un nombre au hasard avec random()','Afficher un résultat avec plusieurs LED'],
  $md$## Cahier des charges

Quand on appuie sur le bouton, le dé « roule » une demi-seconde (les LED clignotent), puis affiche un nombre de 1 à 6 : autant de LED allumées que la valeur tirée. Le résultat reste affiché jusqu'au prochain appui.

## Matériel

- 1 carte Arduino Uno
- 6 LED et 6 résistances de 220 Ω
- 1 bouton poussoir
- 1 breadboard et des câbles

## Pistes

- `random(1, 7)` renvoie un nombre entre 1 et 6.
- Dans `setup()`, `randomSeed(analogRead(A0));` évite d'obtenir la même suite de nombres à chaque démarrage.
- Avec `INPUT_PULLUP`, le bouton lit `LOW` quand il est appuyé.

## À soumettre

Le lien Wokwi, votre code, et le résultat de dix lancers notés dans votre soumission.

## Bonus

Disposez les LED comme les points d'un vrai dé (7 LED : une au centre et trois paires).$md$,
  '[{"label":"Nouveau projet Arduino Uno sur Wokwi","url":"https://wokwi.com/projects/new/arduino-uno"},{"label":"Montage 3D : allumer une LED avec un bouton","url":"/laboratoire/montages/bouton-led"}]',
  'published'),

 ('veilleuse-automatique', 'Veilleuse automatique',
  'Une LED qui s''allume toute seule quand la pièce devient sombre.', 'debutant',
  array['Lire un capteur analogique avec analogRead()','Comparer une mesure à un seuil','Éviter le clignotement autour du seuil'],
  $md$## Cahier des charges

Une photorésistance mesure la lumière. Quand il fait sombre, la LED s'allume ; quand il fait clair, elle s'éteint. Autour du seuil, la LED ne doit pas clignoter.

## Matériel

- 1 carte Arduino Uno
- 1 module photorésistance (ou une photorésistance et une résistance de 10 kΩ)
- 1 LED et 1 résistance de 220 Ω

## Pistes

- Affichez d'abord la valeur de `analogRead(A0)` dans le moniteur série, de jour puis « de nuit », pour choisir votre seuil.
- Pour éviter le clignotement, utilisez **deux seuils** : on allume sous le premier, on éteint au-dessus du second (c'est une hystérésis).

## À soumettre

Le lien Wokwi, les deux seuils choisis et la façon dont vous les avez trouvés.

## Bonus

Faites varier la luminosité de la LED avec `analogWrite()` sur une broche marquée « ~ » : plus il fait sombre, plus elle éclaire.$md$,
  '[{"label":"Nouveau projet Arduino Uno sur Wokwi","url":"https://wokwi.com/projects/new/arduino-uno"},{"label":"Montage 3D : alarme de luminosité","url":"/laboratoire/montages/alarme-lumiere"}]',
  'published'),

 ('radar-de-recul', 'Radar de recul sonore',
  'Comme dans une voiture : des bips de plus en plus rapides à l''approche d''un obstacle.', 'intermediaire',
  array['Mesurer une distance avec le HC-SR04','Transformer une distance en durée avec map()','Produire un son avec tone()'],
  $md$## Cahier des charges

Le capteur ultrason mesure la distance à l'obstacle :

| Distance | Comportement du buzzer |
|---|---|
| plus de 100 cm | silence |
| de 10 à 100 cm | bips de plus en plus rapides quand l'obstacle approche |
| moins de 10 cm | son continu |

## Matériel

- 1 carte Arduino Uno
- 1 capteur HC-SR04
- 1 buzzer (passif de préférence)

## Pistes

- `map(distance, 10, 100, 80, 600)` transforme la distance en pause entre deux bips (en millisecondes).
- `tone(BUZZER, 1000, 60)` produit un bip de 60 ms à 1 000 Hz.
- Ignorez les mesures à 0 : elles signifient « pas d'écho ».

## À soumettre

Le lien Wokwi et une courte vidéo ou description du comportement à 120, 50 et 5 cm.

## Bonus

Ajoutez trois LED (verte, orange, rouge) qui indiquent la zone.$md$,
  '[{"label":"Nouveau projet Arduino Uno sur Wokwi","url":"https://wokwi.com/projects/new/arduino-uno"},{"label":"Montage 3D : mesurer une distance aux ultrasons","url":"/laboratoire/montages/ultrasons-hc-sr04"}]',
  'published'),

 ('barriere-parking', 'Barrière de parking automatique',
  'Un servomoteur lève la barrière quand une voiture approche, puis la referme.', 'intermediaire',
  array['Commander un servomoteur avec la bibliothèque Servo','Combiner un capteur et un actionneur','Gérer un délai sans bloquer la mesure'],
  $md$## Cahier des charges

- Barrière fermée au repos (servo à 0°).
- Quand un véhicule arrive à moins de 20 cm du capteur, la barrière se lève (90°).
- Trois secondes après le départ du véhicule, la barrière se referme.
- Une LED verte est allumée quand la barrière est levée, une LED rouge quand elle est fermée.

## Matériel

- 1 carte Arduino Uno
- 1 servomoteur SG90
- 1 capteur HC-SR04
- 2 LED (verte, rouge) et 2 résistances de 220 Ω

## Pistes

- `#include <Servo.h>`, puis `barriere.attach(6);` et `barriere.write(90);`.
- Pour attendre trois secondes sans arrêter les mesures, mémorisez l'instant du départ avec `millis()` au lieu d'utiliser `delay(3000)`.

## À soumettre

Le lien Wokwi et votre code commenté. Expliquez en une phrase pourquoi `millis()` est préférable à `delay()` ici.$md$,
  '[{"label":"Nouveau projet Arduino Uno sur Wokwi","url":"https://wokwi.com/projects/new/arduino-uno"},{"label":"Montage 3D : piloter un servomoteur","url":"/laboratoire/montages/servo-potentiometre"},{"label":"Montage 3D : capteur ultrason","url":"/laboratoire/montages/ultrasons-hc-sr04"}]',
  'published'),

 ('thermometre-lcd', 'Thermomètre sur écran LCD',
  'Afficher la température, l''humidité et les records du jour sur un écran LCD.', 'intermediaire',
  array['Lire un capteur DHT avec sa bibliothèque','Écrire sur un écran LCD I2C','Mémoriser un minimum et un maximum'],
  $md$## Cahier des charges

L'écran LCD 16 × 2 affiche, mises à jour toutes les deux secondes :

- ligne 1 : la température et l'humidité, par exemple `T:27.4C H:65%` ;
- ligne 2 : la température minimale et maximale mesurées depuis le démarrage.

Si la lecture du capteur échoue, l'écran affiche `Erreur capteur` au lieu de valeurs fausses.

## Matériel

- 1 carte Arduino Uno
- 1 capteur DHT11 ou DHT22 (Wokwi simule le DHT22)
- 1 écran LCD 16 × 2 avec module I2C

## Pistes

- Bibliothèques : **DHT sensor library** (Adafruit) et **LiquidCrystal I2C**.
- Sur l'Uno, l'écran I2C se branche sur **A4 (SDA)** et **A5 (SCL)**.
- Testez une lecture ratée avec `isnan()`.

## À soumettre

Le lien Wokwi et une capture de l'écran.$md$,
  '[{"label":"Nouveau projet Arduino Uno sur Wokwi","url":"https://wokwi.com/projects/new/arduino-uno"},{"label":"Montage 3D : écran LCD I2C","url":"/laboratoire/montages/ecran-lcd-i2c"},{"label":"Montage 3D : station météo sur LCD","url":"/laboratoire/montages/station-meteo-mega"}]',
  'published'),

 ('alarme-intrusion', 'Alarme anti-intrusion',
  'Un détecteur de mouvement, une sirène et un bouton pour armer ou désarmer l''alarme.', 'intermediaire',
  array['Lire un capteur PIR','Programmer une machine à états (désarmée, armement, armée, alarme)','Donner un retour visuel et sonore'],
  $md$## Cahier des charges

L'alarme a quatre états :

1. **Désarmée** : LED verte allumée, aucune détection.
2. **Armement** : après un appui sur le bouton, la LED orange clignote pendant 10 secondes pour laisser le temps de sortir.
3. **Armée** : LED rouge allumée ; le PIR surveille la pièce.
4. **Alarme** : un mouvement déclenche la sirène (buzzer) et le clignotement de la LED rouge. Un appui sur le bouton désarme tout.

## Matériel

- 1 carte Arduino Uno (ou ESP32)
- 1 capteur PIR HC-SR501
- 1 buzzer, 1 bouton poussoir
- 3 LED (verte, orange, rouge) et 3 résistances de 220 Ω

## Pistes

- Une variable `etat` (0, 1, 2 ou 3) et un `switch` dans `loop()` rendent le programme lisible.
- Pensez au temps de stabilisation du PIR au démarrage.

## À soumettre

Le lien Wokwi, votre code commenté et un petit schéma (même dessiné à la main) des quatre états et de ce qui fait passer de l'un à l'autre.$md$,
  '[{"label":"Nouveau projet Arduino Uno sur Wokwi","url":"https://wokwi.com/projects/new/arduino-uno"},{"label":"Montage 3D : détecteur de mouvement PIR","url":"/laboratoire/montages/esp32-detecteur-pir"}]',
  'published'),

 ('serre-connectee', 'Mini-serre connectée',
  'Un ESP32 surveille une serre et affiche ses mesures sur une page web accessible en Wi-Fi.', 'avance',
  array['Connecter un ESP32 au Wi-Fi','Servir une page web depuis l''ESP32','Déclencher une action selon un seuil'],
  $md$## Cahier des charges

- L'ESP32 mesure la température et l'humidité toutes les cinq secondes.
- Il héberge une petite page web qui affiche les dernières mesures et l'état du « ventilateur ».
- Le ventilateur (une LED dans la simulation) s'allume au-dessus de 30 °C et s'éteint sous 28 °C.

## Matériel

- 1 carte ESP32
- 1 capteur DHT22
- 1 LED et 1 résistance de 220 Ω

## Pistes

- Bibliothèques : `WiFi.h` et `WebServer.h` (fournies avec l'ESP32), et **DHT sensor library**.
- Dans Wokwi, le réseau s'appelle `Wokwi-GUEST`, sans mot de passe.
- Alimentez le DHT22 en **3,3 V** : les broches de l'ESP32 ne supportent pas le 5 V.

## À soumettre

Le lien Wokwi, votre code, et une capture de la page web (ou du moniteur série si la page n'est pas accessible depuis la simulation).

## Bonus

Publiez aussi les mesures en MQTT (voir le challenge « Publier des données avec MQTT »).$md$,
  '[{"label":"Nouveau projet ESP32 sur Wokwi","url":"https://wokwi.com/projects/new/esp32"},{"label":"Montage 3D : DHT22 en Wi-Fi","url":"/laboratoire/montages/esp32-dht22-wifi"}]',
  'published')

on conflict (slug) do nothing;

-- ---------- 2. Les deux brouillons, complétés et publiés ----------
update public.challenges set
  description = 'Mesurer une température et déclencher une alerte au-delà d''un seuil.',
  level = 'intermediaire',
  objectives = array['Lire un capteur de température','Déclencher une alerte sur seuil','Signaler une panne de capteur'],
  instructions_md = $md$## Cahier des charges

Réalisez un système qui surveille la température d'un local technique :

- une LED verte reste allumée tant que la température est normale ;
- au-delà du seuil que vous choisissez (par exemple 30 °C), la LED rouge s'allume et le buzzer sonne par intermittence ;
- si le capteur ne répond plus, la LED orange clignote et le moniteur série affiche « Capteur absent ».

## Matériel

- 1 carte Arduino Uno
- 1 capteur DHT11 ou DHT22 (Wokwi simule le DHT22)
- 3 LED (verte, orange, rouge), 3 résistances de 220 Ω, 1 buzzer

## Pistes

- Une lecture toutes les deux secondes suffit : le DHT est un capteur lent.
- Testez la panne avec `isnan()`.

## À soumettre

Le lien Wokwi, le seuil choisi et pourquoi, et votre code commenté.$md$,
  resources = '[{"label":"Nouveau projet Arduino Uno sur Wokwi","url":"https://wokwi.com/projects/new/arduino-uno"},{"label":"Montage 3D : station météo sur LCD","url":"/laboratoire/montages/station-meteo-mega"}]',
  status = 'published'
where slug = 'surveillance-temperature';

update public.challenges set
  description = 'Envoyer une mesure vers un broker MQTT depuis un ESP32.',
  level = 'avance',
  objectives = array['Se connecter à un broker MQTT','Publier sur un topic','Observer les messages avec MQTT Explorer'],
  instructions_md = $md$## Cahier des charges

- Un ESP32 lit une mesure (température d'un DHT22, ou valeur d'un potentiomètre) toutes les dix secondes.
- Il la publie au format JSON sur un topic qui vous est propre, par exemple `esatic/iotlab/votre-nom/mesures`.
- Vous observez les messages arriver avec **MQTT Explorer** connecté au même broker.

## Matériel

- 1 carte ESP32
- 1 capteur DHT22 ou 1 potentiomètre

## Pistes

- Bibliothèque **PubSubClient** ; broker public `broker.hivemq.com`, port `1883`.
- Dans Wokwi, connectez-vous au réseau `Wokwi-GUEST`, sans mot de passe.
- Un broker public est visible par tous : n'y publiez jamais de données personnelles.

## À soumettre

Le lien Wokwi, le nom de votre topic et une capture de MQTT Explorer montrant vos messages.

## Bonus

Abonnez l'ESP32 à un second topic pour allumer une LED à distance depuis MQTT Explorer.$md$,
  resources = '[{"label":"Nouveau projet ESP32 sur Wokwi","url":"https://wokwi.com/projects/new/esp32"},{"label":"Montage 3D : DHT22 en Wi-Fi vers MQTT","url":"/laboratoire/montages/esp32-dht22-wifi"},{"label":"MQTT Explorer","url":"https://mqtt-explorer.com"}]',
  status = 'published'
where slug = 'publier-mqtt';

-- ---------- 3. Exercices pratiques : « Premiers pas avec Arduino » ----------
insert into public.exercises (course_id, lesson_id, position, kind, title, instructions_md, components, wiring_md, starter_code, wokwi_url)
select c.id, l.id, v.pos, 'practice', v.title, v.instr, v.comp, v.wiring, v.code, v.wokwi
from public.courses c
join (values
 (3, 21, 'Exercice : modifier l''exemple Blink',
  $md$Ouvrez l'exemple **Blink** (dans Arduino IDE ou dans un nouveau projet Wokwi) et modifiez-le pour que la LED intégrée clignote **trois fois plus vite**. Téléversez, observez, puis soumettez votre lien Wokwi et les deux valeurs de `delay()` que vous avez choisies.$md$,
  array['Arduino Uno'], null,
  $md$void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}$md$, 'https://wokwi.com/projects/new/arduino-uno'),
 (4, 22, 'Exercice : calculer et câbler la bonne résistance',
  $md$1. Calculez la résistance à placer avec une alimentation de 5 V et un courant de 15 mA pour une **LED rouge** (environ 2 V), puis pour une **LED blanche** (environ 3 V). Choisissez à chaque fois la valeur courante juste au-dessus du résultat.
2. Sur Wokwi, câblez la LED rouge avec sa résistance entre **5V** et **GND** : elle doit s'allumer sans aucun programme.

Soumettez vos deux calculs détaillés et le lien Wokwi.$md$,
  array['Arduino Uno','LED rouge','Résistance','Breadboard'],
  $md$5V → résistance → anode (patte longue) de la LED ; cathode → GND.$md$, null, 'https://wokwi.com/projects/new/arduino-uno'),
 (5, 23, 'Exercice : une LED commandée sans programme',
  $md$Sans écrire une ligne de code, réalisez un circuit où la LED s'allume **seulement pendant l'appui** sur le bouton. Placez le bouton à cheval sur la rainure centrale et respectez le code couleur des câbles (rouge pour 5V, noir pour GND).

Soumettez le lien Wokwi et expliquez en deux phrases le chemin du courant quand le bouton est appuyé.$md$,
  array['Arduino Uno','Bouton poussoir','LED','Résistance 220 Ω','Breadboard'],
  $md$5V → bouton → résistance 220 Ω → anode de la LED ; cathode → GND.$md$, null, 'https://wokwi.com/projects/new/arduino-uno'),
 (6, 24, 'Exercice : corriger un programme',
  $md$Le programme ci-dessous contient **quatre erreurs** et refuse de compiler. Copiez-le dans Wokwi ou Arduino IDE, utilisez le bouton **Vérifier** pour repérer les erreurs, et corrigez-les une à une.

Soumettez le lien de votre version corrigée et, pour chaque erreur, une phrase qui explique la correction.$md$,
  array['Arduino Uno'], null,
  $md$// Fait clignoter la LED de la broche 8
void setup() {
  pinmode(8, OUTPUT);
}

void loop() {
  digitalWrite(8, HIGH)
  Delay(500);
  digitalWrite(8, LOW);
  delay(500);
$md$, 'https://wokwi.com/projects/new/arduino-uno'),
 (7, 25, 'Exercice : un signal SOS en morse',
  $md$Faites clignoter la LED de la broche 8 en morse : **SOS**, soit trois signaux courts, trois longs, trois courts, puis une pause de deux secondes avant de recommencer.

- signal court : 200 ms allumée ;
- signal long : 600 ms allumée ;
- entre deux signaux : 200 ms éteinte.

Soumettez le lien Wokwi et votre code.$md$,
  array['Arduino Uno','LED','Résistance 220 Ω'],
  $md$Broche 8 → résistance 220 Ω → anode ; cathode → GND.$md$,
  $md$const int PIN_LED = 8;

void setup() {
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  // S : trois signaux courts

  // O : trois signaux longs

  // S : trois signaux courts

  delay(2000);
}$md$, 'https://wokwi.com/projects/new/arduino-uno'),
 (8, 26, 'Exercice : deux LED en alternance',
  $md$Branchez une deuxième LED sur la broche 9. Quand la LED de la broche 8 est allumée, celle de la broche 9 est éteinte, et inversement, toutes les 400 ms (comme les feux d'un passage à niveau).

Soumettez le lien Wokwi et votre code.$md$,
  array['Arduino Uno','2 LED','2 résistances 220 Ω','Breadboard'],
  $md$Broche 8 → résistance → LED 1 → GND ; broche 9 → résistance → LED 2 → GND.$md$, null, 'https://wokwi.com/projects/new/arduino-uno'),
 (9, 27, 'Exercice : un bouton qui éteint',
  $md$Inversez le comportement du montage de la leçon : la LED est **allumée au repos** et **s'éteint pendant l'appui** sur le bouton. Gardez `INPUT_PULLUP`.

Soumettez le lien Wokwi et expliquez en une phrase ce que vous avez changé dans la condition.$md$,
  array['Arduino Uno','LED','Résistance 220 Ω','Bouton poussoir'],
  $md$Bouton : broche 2 et GND. LED : broche 8 → résistance → anode, cathode → GND.$md$, null, 'https://wokwi.com/projects/new/arduino-uno'),
 (10, 28, 'Exercice : le bouton piéton',
  $md$Ajoutez au feu tricolore un bouton « piéton » sur la broche 2. Quand un piéton appuie pendant que le feu est vert, le feu passe à l'orange puis au rouge **sans attendre la fin des 5 secondes**, et reste rouge 5 secondes avant de reprendre son cycle.

Soumettez le lien Wokwi et votre code commenté.$md$,
  array['Arduino Uno','3 LED (rouge, orange, verte)','3 résistances 220 Ω','Bouton poussoir'],
  $md$Rouge : broche 10, orange : 9, vert : 8 (chacune via 220 Ω). Bouton : broche 2 et GND, avec INPUT_PULLUP.$md$, null, 'https://wokwi.com/projects/new/arduino-uno')
) as v(lesson_pos, pos, title, instr, comp, wiring, code, wokwi) on true
join public.lessons l on l.course_id = c.id and l.position = v.lesson_pos
where c.slug = 'premiers-pas-avec-arduino'
  and not exists (select 1 from public.exercises e where e.course_id = c.id and e.title = v.title);

-- ---------- 4. Exercices pratiques : « Capteurs » ----------
insert into public.exercises (course_id, lesson_id, position, kind, title, instructions_md, components, wiring_md, starter_code, wokwi_url)
select c.id, l.id, v.pos, 'practice', v.title, v.instr, v.comp, v.wiring, v.code, v.wokwi
from public.courses c
join (values
 (1, 5, 'Exercice : la fiche d''identité d''un capteur',
  $md$Choisissez un capteur du kit **qui n'est pas étudié dans ce cours** (photorésistance, capteur d'humidité du sol, capteur de son, potentiomètre…) et remplissez sa fiche :

- grandeur mesurée ;
- tension d'alimentation ;
- type de sortie (numérique, analogique ou trame) ;
- plage de mesure et précision ;
- nom et rôle de chaque broche.

Indiquez vos sources (fiche technique, site du fabricant) dans votre soumission.$md$,
  array['Un capteur du kit'], null, null, null),
 (2, 15, 'Exercice : l''effet de la température sur la mesure',
  $md$Avec le simulateur ci-dessus, placez le mur à **150 cm**, puis relevez la durée de l'écho et la distance lue par Arduino à **0 °C**, **20 °C** et **40 °C**.

Présentez vos résultats dans un tableau, calculez l'erreur à chaque température, et expliquez en deux phrases d'où elle vient.$md$,
  array['Simulateur de la leçon'], null, null, null),
 (4, 25, 'Exercice : régler le PIR avec le simulateur',
  $md$Avec le simulateur du PIR :

1. Réglez la durée Tx sur 3 secondes, faites marcher la personne, puis arrêtez-la : combien de temps la sortie reste-t-elle à HIGH ?
2. Comparez le mode **H** et le mode **L** pendant que la personne marche.
3. Placez la personne au centre, immobile : que se passe-t-il, et pourquoi ?

Soumettez vos observations et une réponse argumentée à chaque question.$md$,
  array['Simulateur de la leçon'], null, null, null),
 (6, 35, 'Exercice : une alerte de température',
  $md$Câblez un capteur DHT et une LED. Le programme affiche la température et l'humidité toutes les deux secondes, allume la LED au-dessus de **30 °C**, et affiche « Lecture impossible » quand la mesure échoue.

Dans Wokwi, ajoutez la bibliothèque **DHT sensor library** (onglet *Library Manager*) et utilisez le modèle **DHT22**, celui que Wokwi simule. Soumettez le lien Wokwi et votre code.$md$,
  array['Arduino Uno','DHT11 ou DHT22','LED','Résistance 220 Ω'],
  $md$DHT : VCC → 5V, DATA → D2, GND → GND. LED : D8 → résistance 220 Ω → anode, cathode → GND.$md$,
  $md$#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT22   // DHT11 sur le vrai capteur du kit
const int PIN_LED = 8;

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  pinMode(PIN_LED, OUTPUT);
  dht.begin();
}

void loop() {
  delay(2000);
  // À compléter : lecture, test isnan(), affichage, LED au-dessus de 30 °C
}$md$, 'https://wokwi.com/projects/new/arduino-uno')
) as v(lesson_pos, pos, title, instr, comp, wiring, code, wokwi) on true
join public.lessons l on l.course_id = c.id and l.position = v.lesson_pos
where c.slug = 'capteurs-ultrason-pir-dht11'
  and not exists (select 1 from public.exercises e where e.course_id = c.id and e.title = v.title);
