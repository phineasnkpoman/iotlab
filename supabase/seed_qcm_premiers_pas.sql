-- =====================================================================
-- IoT LAB ESATIC — QCM de fin de leçon : « Premiers pas avec Arduino »
-- À exécuter APRÈS 0005_quiz_gating.sql et seed.sql. Relançable sans doublon.
--
-- Chaque leçon reçoit un petit QCM obligatoire (4 questions, 75 % pour valider,
-- soit 3 bonnes réponses). Le quiz de validation existant devient le QCM de la
-- dernière leçon (5 questions, 80 %). Chaque question a un indice (montré après
-- une erreur) et une explication (montrée une fois le QCM réussi).
-- =====================================================================

-- QCM de fin de leçon
-- Questions et indices : lisibles par tous. Bonnes réponses et explications : table
-- exercise_answers, jamais lisible par les apprenants (renvoyées par grade_quiz après réussite).
-- Relançable : un QCM existant (même titre) est mis à jour, sans doublon.
do $do$
declare cid uuid; q jsonb; lid uuid; eid uuid;
begin
  select id into cid from public.courses where slug = 'premiers-pas-avec-arduino';
  if cid is null then return; end if;

  for q in select * from jsonb_array_elements($j$[
 {
  "lesson": 1,
  "title": "QCM : découvrir Arduino",
  "intro": "Quatre questions pour vérifier l'essentiel. Il en faut trois justes pour terminer la leçon.",
  "pass": 75,
  "questions": [
   {
    "id": "q1",
    "question": "Qu'est-ce qu'un microcontrôleur ?",
    "options": [
     "Un écran qui affiche les résultats du programme",
     "Une puce qui réunit un processeur, de la mémoire et des broches",
     "Un câble qui relie la carte à l'ordinateur",
     "Un logiciel pour écrire du code"
    ],
    "hint": "Relisez « Un petit ordinateur dédié à une tâche »."
   },
   {
    "id": "q2",
    "question": "Une fois la carte alimentée, que fait le microcontrôleur ?",
    "options": [
     "Il attend qu'on lui envoie chaque instruction",
     "Il exécute le programme une fois puis s'arrête",
     "Il exécute votre programme en boucle",
     "Il lance plusieurs programmes à la fois"
    ],
    "hint": "Contrairement à un ordinateur, il ne fait qu'une seule chose."
   },
   {
    "id": "q3",
    "question": "Arduino, c'est :",
    "options": [
     "Une carte, un langage dérivé du C/C++ et un logiciel gratuit",
     "Uniquement un langage de programmation",
     "Un système d'exploitation pour ordinateur",
     "Une marque de capteurs"
    ],
    "hint": "Arduino est une plateforme : elle réunit plusieurs éléments."
   },
   {
    "id": "q4",
    "question": "Pour savoir si un bouton est appuyé, la broche doit être configurée :",
    "options": [
     "En sortie",
     "En alimentation (5V)",
     "En masse (GND)",
     "En entrée"
    ],
    "hint": "Une sortie envoie un signal ; pour en lire un, il faut l'inverse."
   }
  ],
  "answers": {
   "q1": 1,
   "q2": 2,
   "q3": 0,
   "q4": 3
  },
  "explanations": {
   "q1": "Un microcontrôleur est un petit ordinateur complet sur une seule puce : processeur, mémoire et broches pour communiquer avec l'extérieur.",
   "q2": "Dès qu'il est alimenté, le microcontrôleur exécute votre unique programme, en boucle, sans s'arrêter.",
   "q3": "Arduino réunit une carte prête à l'emploi, un langage simple basé sur le C/C++ et un logiciel gratuit pour programmer la carte.",
   "q4": "Une broche en entrée lit un signal (le bouton) ; une broche en sortie en envoie un (la LED)."
  }
 },
 {
  "lesson": 2,
  "title": "QCM : la carte Arduino Uno",
  "intro": "Quatre questions pour vérifier l'essentiel. Il en faut trois justes pour terminer la leçon.",
  "pass": 75,
  "questions": [
   {
    "id": "q1",
    "question": "Combien d'états une broche numérique peut-elle prendre ?",
    "options": [
     "Deux : HIGH (5 V) ou LOW (0 V)",
     "Trois : HIGH, LOW et MOYEN",
     "1 024 valeurs différentes",
     "Autant que la tension le permet"
    ],
    "hint": "Numérique veut dire « tout ou rien »."
   },
   {
    "id": "q2",
    "question": "Sur quelles broches lit-on une tension variable venant d'un capteur ?",
    "options": [
     "0 et 1",
     "2 à 13",
     "A0 à A5",
     "5V et GND"
    ],
    "hint": "Ce sont les broches analogiques, repérées par une lettre."
   },
   {
    "id": "q3",
    "question": "Pourquoi éviter les broches 0 et 1 dans vos premiers montages ?",
    "options": [
     "Elles sont trop faibles pour une LED",
     "Elles servent à la communication série avec l'ordinateur",
     "Elles sont réservées aux capteurs analogiques",
     "Elles ne fournissent que 3,3 V"
    ],
    "hint": "Elles sont déjà utilisées par le dialogue avec l'ordinateur."
   },
   {
    "id": "q4",
    "question": "À quoi sert la broche GND ?",
    "options": [
     "Elle redémarre le programme en cours",
     "Elle fournit 5 volts aux composants",
     "Elle reçoit le programme envoyé par USB",
     "C'est la masse : le retour du courant (0 V)"
    ],
    "hint": "Sans elle, le courant ne peut pas revenir à la carte."
   }
  ],
  "answers": {
   "q1": 0,
   "q2": 2,
   "q3": 1,
   "q4": 3
  },
  "explanations": {
   "q1": "Une broche numérique ne connaît que HIGH (5 V) et LOW (0 V). Les tensions variables se lisent sur les broches analogiques.",
   "q2": "Les broches A0 à A5 mesurent une tension qui varie : c'est là qu'on branche les capteurs analogiques.",
   "q3": "Les broches 0 et 1 transportent la communication série avec l'ordinateur : les occuper peut gêner le téléversement. Utilisez 2 à 13.",
   "q4": "GND est la masse (0 V). Tout circuit doit y être relié pour que le courant puisse revenir : sans GND, rien ne fonctionne."
  }
 },
 {
  "lesson": 3,
  "title": "QCM : l'environnement Arduino IDE",
  "intro": "Quatre questions pour vérifier l'essentiel. Il en faut trois justes pour terminer la leçon.",
  "pass": 75,
  "questions": [
   {
    "id": "q1",
    "question": "Quel bouton compile le code et signale les erreurs, sans rien envoyer à la carte ?",
    "options": [
     "Téléverser (→)",
     "Moniteur série (loupe)",
     "Vérifier (✓)",
     "Nouveau croquis"
    ],
    "hint": "Un seul bouton ne touche pas à la carte."
   },
   {
    "id": "q2",
    "question": "Avant de téléverser, quels réglages faut-il choisir dans le menu Outils ?",
    "options": [
     "Le type de carte et le port",
     "La couleur et la police",
     "La vitesse du processeur et la mémoire",
     "La langue et le thème"
    ],
    "hint": "L'IDE doit savoir quelle carte il programme, et par où la joindre."
   },
   {
    "id": "q3",
    "question": "Aucun port n'apparaît dans Outils > Port. Que tester en premier ?",
    "options": [
     "Réinstaller Windows",
     "Un autre câble USB : certains ne font que charger",
     "Changer de carte Arduino",
     "Ajouter des delay() au programme"
    ],
    "hint": "Relisez « En cas de problème »."
   },
   {
    "id": "q4",
    "question": "Vous téléversez l'exemple Blink. Que se passe-t-il ?",
    "options": [
     "L'écran de l'ordinateur clignote",
     "Le moniteur série affiche « Blink »",
     "Rien tant qu'aucune LED externe n'est branchée",
     "La petite LED « L » de la carte clignote"
    ],
    "hint": "Blink utilise une LED déjà présente sur la carte."
   }
  ],
  "answers": {
   "q1": 2,
   "q2": 0,
   "q3": 1,
   "q4": 3
  },
  "explanations": {
   "q1": "Vérifier compile le programme et affiche les erreurs de syntaxe ; Téléverser compile puis envoie le programme sur la carte.",
   "q2": "Outils > Type de carte (Arduino Uno) et Outils > Port (par exemple COM3) : sans ces deux réglages, le téléversement échoue.",
   "q3": "Beaucoup de câbles USB ne transportent que le courant, pas les données. Essayez d'abord un autre câble.",
   "q4": "Blink fait clignoter la LED intégrée « L », reliée à la broche 13 : aucun composant externe n'est nécessaire."
  }
 },
 {
  "lesson": 4,
  "title": "QCM : LED, résistance et breadboard",
  "intro": "Quatre questions pour vérifier l'essentiel. Il en faut trois justes pour terminer la leçon.",
  "pass": 75,
  "questions": [
   {
    "id": "q1",
    "question": "Comment reconnaître l'anode (+) d'une LED ?",
    "options": [
     "C'est la patte la plus longue",
     "C'est la patte du côté du méplat",
     "C'est la patte la plus courte",
     "Les deux pattes sont identiques"
    ],
    "hint": "Le méplat du boîtier repère l'autre patte, la cathode."
   },
   {
    "id": "q2",
    "question": "Une LED est branchée sur 5 V sans résistance. Que risque-t-il de se passer ?",
    "options": [
     "Elle brille moins fort",
     "Rien : la carte limite le courant",
     "Elle laisse passer trop de courant et grille",
     "Elle change de couleur"
    ],
    "hint": "La résistance limite quelque chose."
   },
   {
    "id": "q3",
    "question": "Alimentation 5 V, LED d'environ 2 V, courant de 15 mA : quelle résistance choisir ?",
    "options": [
     "22 Ω",
     "220 Ω",
     "2 200 Ω",
     "22 000 Ω"
    ],
    "hint": "R = (U alimentation − U LED) / I, avec I en ampères (15 mA = 0,015 A)."
   },
   {
    "id": "q4",
    "question": "Sur une breadboard, quels trous sont reliés entre eux ?",
    "options": [
     "Tous les trous de la platine",
     "Une rangée entière, d'un bord à l'autre",
     "Aucun : chaque trou est isolé",
     "Les 5 trous d'une même colonne"
    ],
    "hint": "Relisez « La breadboard »."
   }
  ],
  "answers": {
   "q1": 0,
   "q2": 2,
   "q3": 1,
   "q4": 3
  },
  "explanations": {
   "q1": "L'anode (+) est la patte la plus longue. La cathode (−) est la plus courte, du côté du méplat.",
   "q2": "Sans résistance, le courant n'est pas limité : la LED (et parfois la broche) est endommagée. Toujours une résistance en série.",
   "q3": "R = (5 − 2) / 0,015 = 200 Ω. On prend la valeur courante juste au-dessus : 220 Ω.",
   "q4": "Les 5 trous d'une même colonne sont reliés ; les rails latéraux (+ et −) sont reliés sur toute leur longueur."
  }
 },
 {
  "lesson": 5,
  "title": "QCM : bouton poussoir et sécurité",
  "intro": "Quatre questions pour vérifier l'essentiel. Il en faut trois justes pour terminer la leçon.",
  "pass": 75,
  "questions": [
   {
    "id": "q1",
    "question": "Où placer un bouton poussoir à quatre pattes sur la breadboard ?",
    "options": [
     "Sur un rail d'alimentation",
     "À cheval sur la rainure centrale",
     "Dans une seule colonne",
     "N'importe où, cela ne change rien"
    ],
    "hint": "Au repos, ses deux côtés ne doivent pas être reliés."
   },
   {
    "id": "q2",
    "question": "Quelle couleur de câble réserve-t-on habituellement à GND ?",
    "options": [
     "Rouge",
     "Jaune",
     "Noir",
     "Vert"
    ],
    "hint": "Le rouge est déjà pris par le 5 V."
   },
   {
    "id": "q3",
    "question": "Que faire avant de modifier le câblage ?",
    "options": [
     "Débrancher le câble USB",
     "Appuyer sur Reset",
     "Téléverser un programme vide",
     "Rien : on peut câbler sous tension"
    ],
    "hint": "C'est la première règle de sécurité de la leçon."
   },
   {
    "id": "q4",
    "question": "Pourquoi ne faut-il jamais relier 5V directement à GND ?",
    "options": [
     "Cela inverse HIGH et LOW",
     "Cela efface le programme",
     "Cela éteint la LED « L »",
     "C'est un court-circuit"
    ],
    "hint": "Rien ne limite alors le courant."
   }
  ],
  "answers": {
   "q1": 1,
   "q2": 2,
   "q3": 0,
   "q4": 3
  },
  "explanations": {
   "q1": "À cheval sur la rainure centrale, les deux côtés du bouton ne sont reliés que lorsqu'on appuie.",
   "q2": "Code couleur : rouge pour 5 V, noir pour GND, les autres couleurs pour les signaux.",
   "q3": "On câble toujours hors tension : débranchez l'USB, modifiez, vérifiez, puis rebranchez.",
   "q4": "Relier 5V à GND sans composant entre les deux crée un court-circuit : le courant devient énorme et peut endommager la carte ou l'USB."
  }
 },
 {
  "lesson": 6,
  "title": "QCM : structure d'un programme",
  "intro": "Quatre questions pour vérifier l'essentiel. Il en faut trois justes pour terminer la leçon.",
  "pass": 75,
  "questions": [
   {
    "id": "q1",
    "question": "Combien de fois s'exécute le contenu de loop() ?",
    "options": [
     "Une seule fois, au démarrage",
     "Deux fois",
     "Indéfiniment, tant que la carte est alimentée",
     "Seulement après un appui sur Reset"
    ],
    "hint": "Son nom est un indice."
   },
   {
    "id": "q2",
    "question": "Où règle-t-on les broches en sortie, une fois pour toutes ?",
    "options": [
     "Dans loop()",
     "Dans setup()",
     "Dans un commentaire",
     "Avant chaque instruction"
    ],
    "hint": "C'est la fonction de préparation."
   },
   {
    "id": "q3",
    "question": "Ce programme refuse de compiler. Pourquoi ?",
    "options": [
     "Il manque le point-virgule après pinMode(8, OUTPUT)",
     "La broche 8 n'existe pas",
     "setup() doit s'écrire Setup()",
     "OUTPUT doit être entre guillemets"
    ],
    "hint": "Regardez la fin de chaque instruction.",
    "code": "void setup() {\n  pinMode(8, OUTPUT)\n}\n\nvoid loop() {\n}"
   },
   {
    "id": "q4",
    "question": "Le compilateur affiche : 'Delay' was not declared. Quelle est la cause ?",
    "options": [
     "Il manque une accolade",
     "delay() ne marche que dans setup()",
     "La durée est trop longue",
     "La casse : il faut écrire delay en minuscules"
    ],
    "hint": "Majuscules et minuscules comptent."
   }
  ],
  "answers": {
   "q1": 2,
   "q2": 1,
   "q3": 0,
   "q4": 3
  },
  "explanations": {
   "q1": "loop() s'exécute en boucle, sans fin, tant que la carte est alimentée. C'est setup() qui ne s'exécute qu'une fois.",
   "q2": "setup() prépare la carte au démarrage : c'est là qu'on écrit les pinMode().",
   "q3": "Chaque instruction se termine par un point-virgule : pinMode(8, OUTPUT); corrige l'erreur.",
   "q4": "Le compilateur distingue les majuscules : Delay n'existe pas, delay oui."
  }
 },
 {
  "lesson": 7,
  "title": "QCM : pinMode(), digitalWrite() et delay()",
  "intro": "Quatre questions pour vérifier l'essentiel. Il en faut trois justes pour terminer la leçon.",
  "pass": 75,
  "questions": [
   {
    "id": "q1",
    "question": "Quelle instruction prépare la broche 8 pour commander une LED ?",
    "options": [
     "digitalWrite(8, OUTPUT);",
     "pinMode(8, OUTPUT);",
     "pinMode(8, INPUT);",
     "delay(8);"
    ],
    "hint": "On dit d'abord à la broche si elle envoie ou lit un signal."
   },
   {
    "id": "q2",
    "question": "Que fait digitalWrite(8, LOW); ?",
    "options": [
     "Il met la broche 8 à 0 V : la LED s'éteint",
     "Il lit l'état de la broche 8",
     "Il met la broche 8 à 5 V",
     "Il configure la broche 8 en entrée"
    ],
    "hint": "HIGH = 5 V, LOW = …"
   },
   {
    "id": "q3",
    "question": "Combien de temps dure delay(250) ?",
    "options": [
     "250 secondes",
     "2,5 secondes",
     "Un quart de seconde",
     "250 microsecondes"
    ],
    "hint": "delay() compte en millisecondes (1 000 ms = 1 s)."
   },
   {
    "id": "q4",
    "question": "Avec ce loop(), combien de fois la LED s'allume-t-elle par minute ?",
    "options": [
     "60",
     "120",
     "1",
     "30"
    ],
    "hint": "Additionnez les deux pauses pour obtenir la durée d'un cycle.",
    "code": "void loop() {\n  digitalWrite(8, HIGH);\n  delay(1000);\n  digitalWrite(8, LOW);\n  delay(1000);\n}"
   }
  ],
  "answers": {
   "q1": 1,
   "q2": 0,
   "q3": 2,
   "q4": 3
  },
  "explanations": {
   "q1": "pinMode(8, OUTPUT); configure la broche 8 en sortie. digitalWrite() sert ensuite à l'allumer ou l'éteindre.",
   "q2": "LOW met la sortie à 0 V : plus de courant dans la LED, elle s'éteint.",
   "q3": "250 ms = 0,25 s, soit un quart de seconde.",
   "q4": "Un cycle dure 1 s allumée + 1 s éteinte = 2 s. En 60 s : 60 / 2 = 30 allumages."
  }
 },
 {
  "lesson": 8,
  "title": "QCM : faire clignoter une LED",
  "intro": "Quatre questions pour vérifier l'essentiel. Il en faut trois justes pour terminer la leçon.",
  "pass": 75,
  "questions": [
   {
    "id": "q1",
    "question": "Dans le montage de la leçon, dans quel ordre circule le courant ?",
    "options": [
     "GND, LED, résistance, broche 8",
     "Broche 8, résistance, LED, GND",
     "Broche 8, GND, LED, résistance",
     "Résistance, broche 8, GND, LED"
    ],
    "hint": "Le courant part de la broche qui est à HIGH."
   },
   {
    "id": "q2",
    "question": "À quoi sert la ligne const int PIN_LED = 8; ?",
    "options": [
     "Elle allume la LED",
     "Elle rend le programme plus rapide",
     "Pour changer de broche, une seule ligne à modifier",
     "Elle est obligatoire pour compiler"
    ],
    "hint": "Elle donne un nom à un numéro."
   },
   {
    "id": "q3",
    "question": "Quelles pauses donnent un bref flash de 100 ms toutes les secondes ?",
    "options": [
     "delay(900) après HIGH, delay(100) après LOW",
     "delay(100) après HIGH et après LOW",
     "delay(1000) après HIGH seulement",
     "delay(100) après HIGH, delay(900) après LOW"
    ],
    "hint": "La pause après HIGH, c'est le temps où la LED est allumée."
   },
   {
    "id": "q4",
    "question": "La LED ne s'allume jamais, alors que le programme est correct. Que vérifier en premier ?",
    "options": [
     "Le sens de la LED et le fil de la cathode vers GND",
     "La vitesse du processeur",
     "La version d'Arduino IDE",
     "La valeur des delay()"
    ],
    "hint": "Relisez « Si ça ne marche pas »."
   }
  ],
  "answers": {
   "q1": 1,
   "q2": 2,
   "q3": 3,
   "q4": 0
  },
  "explanations": {
   "q1": "Broche 8 → résistance 220 Ω → LED (anode puis cathode) → GND.",
   "q2": "La constante nomme la broche : si la LED change de broche, on ne modifie que cette ligne.",
   "q3": "100 ms allumée (après HIGH) + 900 ms éteinte (après LOW) = un cycle d'une seconde avec un flash bref.",
   "q4": "Une LED montée à l'envers ou une cathode non reliée à GND : ce sont les deux causes les plus fréquentes."
  }
 },
 {
  "lesson": 9,
  "title": "QCM : commander une LED avec un bouton",
  "intro": "Quatre questions pour vérifier l'essentiel. Il en faut trois justes pour terminer la leçon.",
  "pass": 75,
  "questions": [
   {
    "id": "q1",
    "question": "Pourquoi active-t-on INPUT_PULLUP sur la broche du bouton ?",
    "options": [
     "Pour faire briller la LED plus fort",
     "Pour éviter une entrée flottante qui lit au hasard",
     "Pour transformer la broche en sortie",
     "Pour accélérer digitalRead()"
    ],
    "hint": "Que lit une entrée reliée à rien ?"
   },
   {
    "id": "q2",
    "question": "Avec INPUT_PULLUP, ce code allume la LED quand :",
    "options": [
     "Le bouton est appuyé",
     "Jamais",
     "Le bouton est relâché",
     "Une fois sur deux"
    ],
    "hint": "Avec INPUT_PULLUP, que lit la broche au repos ?",
    "code": "if (digitalRead(PIN_BOUTON) == HIGH) {\n  digitalWrite(PIN_LED, HIGH);\n} else {\n  digitalWrite(PIN_LED, LOW);\n}"
   },
   {
    "id": "q3",
    "question": "Comment câbler le bouton avec INPUT_PULLUP ?",
    "options": [
     "Une patte sur la broche 2, l'autre sur GND, sans résistance",
     "Une patte sur la broche 2, l'autre sur 5V",
     "Les deux pattes sur la broche 2",
     "Une patte sur 5V, l'autre sur GND"
    ],
    "hint": "La résistance interne tire déjà la broche vers 5 V."
   },
   {
    "id": "q4",
    "question": "Le code pilote la broche 8, mais la LED est branchée sur la 9. Que se passe-t-il ?",
    "options": [
     "La LED s'allume quand même",
     "La carte détecte l'erreur et corrige",
     "La LED reste allumée en permanence",
     "La LED ne réagit jamais au bouton"
    ],
    "hint": "Le programme commande une broche où il n'y a rien."
   }
  ],
  "answers": {
   "q1": 1,
   "q2": 2,
   "q3": 0,
   "q4": 3
  },
  "explanations": {
   "q1": "Sans résistance de tirage, une entrée « flotte » et lit des valeurs aléatoires. INPUT_PULLUP active la résistance interne qui la maintient à HIGH.",
   "q2": "Relâché = HIGH, appuyé = LOW. La condition « == HIGH » est donc vraie bouton relâché : c'est l'erreur de logique inversée.",
   "q3": "Le bouton relie la broche 2 à GND quand on appuie ; la résistance interne fait le reste, pas besoin de résistance externe.",
   "q4": "Le programme allume la broche 8, qui n'est reliée à rien : la LED, sur la 9, ne reçoit jamais de signal."
  }
 },
 {
  "lesson": 10,
  "title": "Quiz de validation : Premiers pas avec Arduino",
  "intro": "Cinq questions sur tout le cours. Il en faut quatre justes pour le terminer.",
  "pass": 80,
  "questions": [
   {
    "id": "q1",
    "question": "Que fait la fonction setup() ?",
    "options": [
     "Elle s'exécute en boucle",
     "Elle s'exécute une seule fois au démarrage",
     "Elle éteint la carte",
     "Elle téléverse le programme"
    ],
    "hint": "Leçon 6 : les deux fonctions obligatoires."
   },
   {
    "id": "q2",
    "question": "Quelle patte d'une LED est l'anode (+) ?",
    "options": [
     "La plus courte",
     "Celle du côté du méplat",
     "La plus longue",
     "Peu importe"
    ],
    "hint": "Leçon 4 : la LED."
   },
   {
    "id": "q3",
    "question": "Pourquoi place-t-on une résistance en série avec une LED ?",
    "options": [
     "Pour la faire briller plus fort",
     "Pour limiter le courant et éviter de la détruire",
     "Pour changer sa couleur",
     "Pour réduire la tension de la carte"
    ],
    "hint": "Leçon 4 : la résistance."
   },
   {
    "id": "q4",
    "question": "Avec INPUT_PULLUP, que lit digitalRead() quand le bouton est appuyé ?",
    "options": [
     "HIGH",
     "LOW",
     "Une valeur aléatoire",
     "Rien"
    ],
    "hint": "Leçon 9 : au repos la broche lit HIGH."
   },
   {
    "id": "q5",
    "question": "delay(2000) met le programme en pause pendant :",
    "options": [
     "2 millisecondes",
     "20 secondes",
     "2 secondes",
     "2 minutes"
    ],
    "hint": "Leçon 7 : delay() compte en millisecondes."
   }
  ],
  "answers": {
   "q1": 1,
   "q2": 2,
   "q3": 1,
   "q4": 1,
   "q5": 2
  },
  "explanations": {
   "q1": "setup() s'exécute une seule fois, au démarrage ; loop() tourne ensuite en boucle.",
   "q2": "L'anode (+) est la patte la plus longue ; la cathode, plus courte, est du côté du méplat.",
   "q3": "La résistance limite le courant : sans elle, la LED grille.",
   "q4": "Avec INPUT_PULLUP, relâché = HIGH et appuyé = LOW, car le bouton relie la broche à GND.",
   "q5": "2 000 ms = 2 s."
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
