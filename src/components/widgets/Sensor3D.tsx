"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Box, RotateCcw, Orbit } from "lucide-react";
import { WidgetFrame, chip, well } from "./WidgetFrame";

export type ModelKey = "hcsr04" | "pir" | "dht11";

interface PartDef { id: string; label: string; desc: string; meshes: THREE.Mesh[] }
interface Built { group: THREE.Group; parts: PartDef[] }

const MM = 0.1; // 1 mm = 0,1 unité 3D
/** Couleur de surbrillance : l'azur du thème courant (clair ou sombre). */
function themeAccent() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
  return new THREE.Color(v || "#2b68ea");
}

function mat(color: string, metalness = 0.1, roughness = 0.6) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}
function box(w: number, h: number, d: number, color: string, pos: [number, number, number], m = 0.1, r = 0.6) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w * MM, h * MM, d * MM), mat(color, m, r));
  mesh.position.set(pos[0] * MM, pos[1] * MM, pos[2] * MM);
  return mesh;
}
/** Cylindre dont l'axe est dirigé selon z (vers l'observateur). */
function cyl(radius: number, length: number, color: string, pos: [number, number, number], m = 0.1, r = 0.6) {
  const geo = new THREE.CylinderGeometry(radius * MM, radius * MM, length * MM, 40);
  geo.rotateX(Math.PI / 2);
  const mesh = new THREE.Mesh(geo, mat(color, m, r));
  mesh.position.set(pos[0] * MM, pos[1] * MM, pos[2] * MM);
  return mesh;
}
function pins(group: THREE.Group, xs: number[], ids: string[], labels: string[], descs: string[], y: number, len: number, parts: PartDef[]) {
  xs.forEach((x, i) => {
    const pin = box(0.8, len, 0.8, "#d4af37", [x, y, 0], 0.9, 0.3);
    group.add(pin);
    parts.push({ id: ids[i], label: labels[i], desc: descs[i], meshes: [pin] });
  });
}

function buildHcsr04(): Built {
  const g = new THREE.Group(); const parts: PartDef[] = [];
  const pcb = box(45, 20, 1.6, "#1b6fb8", [0, 0, 0]); g.add(pcb);
  parts.push({ id: "pcb", label: "Circuit imprimé", desc: "Support bleu de 45 × 20 mm qui relie les composants.", meshes: [pcb] });
  for (const [id, x, label, desc] of [
    ["tx", -13, "Émetteur (T)", "Envoie une salve de 8 impulsions ultrasonores à 40 kHz, inaudibles pour l'humain."],
    ["rx", 13, "Récepteur (R)", "Capte l'écho renvoyé par l'obstacle."],
  ] as const) {
    const body = cyl(8, 12, "#b8bfc7", [x, 2, 6.8], 0.8, 0.35);
    const face = cyl(6.3, 0.6, "#14181b", [x, 2, 12.9], 0.2, 0.8);
    g.add(body, face);
    parts.push({ id, label, desc, meshes: [body, face] });
  }
  const ic = box(10, 5, 1.4, "#111417", [0, -4.5, 1.5]); g.add(ic);
  parts.push({ id: "ic", label: "Circuit de commande", desc: "Génère la salve, écoute l'écho et mesure le temps de vol.", meshes: [ic] });
  const xt = box(3.4, 8, 3, "#c9ced3", [0, 6, 2.3], 0.9, 0.3); g.add(xt);
  parts.push({ id: "xtal", label: "Quartz", desc: "Horloge du circuit : elle donne la précision du chronométrage.", meshes: [xt] });
  const header = box(10.4, 2.6, 2.6, "#15181b", [0, -9.4, 0]); g.add(header);
  pins(g, [-3.81, -1.27, 1.27, 3.81], ["vcc", "trig", "echo", "gnd"],
    ["Broche VCC", "Broche Trig", "Broche Echo", "Broche GND"],
    ["Alimentation 5 V.", "Entrée de déclenchement : on y envoie une impulsion HIGH de 10 µs.", "Sortie : reste à HIGH pendant le trajet aller-retour de l'onde.", "Masse (0 V) : à relier à GND d'Arduino."],
    -13.5, 8, parts);
  return { group: g, parts };
}

function buildPir(): Built {
  const g = new THREE.Group(); const parts: PartDef[] = [];
  const pcb = box(32, 24, 1.6, "#2f8a57", [0, 0, 0]); g.add(pcb);
  parts.push({ id: "pcb", label: "Circuit imprimé", desc: "Support vert du module HC-SR501 (32 × 24 mm).", meshes: [pcb] });
  const can = cyl(10, 3.2, "#c7ccd1", [0, 2, 2.4], 0.9, 0.35); g.add(can);
  parts.push({ id: "sensor", label: "Capteur pyroélectrique", desc: "Sous le dôme : il détecte les variations de rayonnement infrarouge.", meshes: [can] });
  const geo = new THREE.SphereGeometry(11 * MM, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  geo.rotateX(Math.PI / 2);
  const domeMat = new THREE.MeshStandardMaterial({ color: "#f4f4ef", roughness: 0.55, flatShading: true, side: THREE.DoubleSide });
  const dome = new THREE.Mesh(geo, domeMat); dome.position.set(0, 2 * MM, 4 * MM); g.add(dome);
  parts.push({ id: "dome", label: "Dôme de Fresnel", desc: "Lentille qui découpe l'espace en zones et concentre l'infrarouge sur le capteur (angle d'environ 110°).", meshes: [dome] });
  const sx = cyl(3.6, 5, "#e08a1f", [-9, -8.5, 3.3]); const sxSlot = box(0.8, 4.4, 0.5, "#1b1b1b", [-9, -8.5, 6]);
  const tx = cyl(3.6, 5, "#e08a1f", [9, -8.5, 3.3]); const txSlot = box(0.8, 4.4, 0.5, "#1b1b1b", [9, -8.5, 6]);
  g.add(sx, sxSlot, tx, txSlot);
  parts.push({ id: "sx", label: "Potentiomètre Sx", desc: "Règle la sensibilité, donc la portée (environ 3 à 7 m). Sa position varie selon les modèles.", meshes: [sx, sxSlot] });
  parts.push({ id: "tx", label: "Potentiomètre Tx", desc: "Règle la durée pendant laquelle la sortie reste à HIGH (de 0,3 s à plusieurs minutes).", meshes: [tx, txSlot] });
  const hd = box(8, 2.6, 2.6, "#15181b", [10, 10, 1.4]); const cap = box(5.4, 2.8, 2.8, "#e5c100", [10.8, 10, 2.1]); g.add(hd, cap);
  parts.push({ id: "jumper", label: "Cavalier H / L", desc: "Mode de déclenchement : H (repeatable) prolonge la sortie tant qu'il y a du mouvement, L (single) non.", meshes: [hd, cap] });
  pins(g, [-2.54, 0, 2.54], ["vcc", "out", "gnd"], ["Broche VCC", "Broche OUT", "Broche GND"],
    ["Alimentation 5 V à 20 V (vérifiez la sérigraphie de votre carte).", "Sortie numérique : HIGH (3,3 V) quand un mouvement est détecté.", "Masse (0 V)."],
    -15, 6, parts);
  return { group: g, parts };
}

function buildDht11(): Built {
  const g = new THREE.Group(); const parts: PartDef[] = [];
  const body = box(12, 15.5, 5.5, "#2b6fd6", [0, 0, 0], 0.05, 0.7); g.add(body);
  parts.push({ id: "body", label: "Boîtier", desc: "Boîtier en plastique bleu qui contient l'élément d'humidité et la thermistance.", meshes: [body] });
  const slits: THREE.Mesh[] = [];
  for (let i = 0; i < 7; i++) slits.push(box(8, 0.7, 0.4, "#0e2a55", [0, 5.5 - i * 1.6, 2.8]));
  slits.forEach((s) => g.add(s));
  parts.push({ id: "grille", label: "Grille d'aération", desc: "Laisse circuler l'air vers les capteurs d'humidité et de température.", meshes: slits });
  const ic = box(5, 3.5, 0.6, "#101214", [0, -6, 2.9]); g.add(ic);
  parts.push({ id: "ic", label: "Puce de traitement", desc: "Convertit les mesures en trame numérique envoyée sur le fil DATA.", meshes: [ic] });
  pins(g, [-3.81, -1.27, 1.27, 3.81], ["vcc", "data", "nc", "gnd"],
    ["Broche VCC", "Broche DATA", "Broche NC", "Broche GND"],
    ["Alimentation 3,3 V à 5 V.", "Sortie : trame numérique sur un seul fil (une lecture toutes les 2 s environ).", "Non connectée : on ne la branche pas.", "Masse (0 V)."],
    -12.5, 10, parts);
  return { group: g, parts };
}

const MODELS: Record<ModelKey, { name: string; build: () => Built }> = {
  hcsr04: { name: "HC-SR04 (ultrason)", build: buildHcsr04 },
  pir: { name: "HC-SR501 (PIR)", build: buildPir },
  dht11: { name: "DHT11", build: buildDht11 },
};

function disposeGroup(group: THREE.Group) {
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
    }
  });
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
}

export default function Sensor3D({ models }: { models: ModelKey[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<ModelKey>(models[0]);
  const [selected, setSelected] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [failed] = useState(() => !hasWebGL());
  const [parts, setParts] = useState<PartDef[]>([]);

  const partsRef = useRef<PartDef[]>([]);
  const selectedRef = useRef<string | null>(null);
  const apiRef = useRef<{ setModel: (k: ModelKey) => void; resetView: () => void; setAuto: (v: boolean) => void; paint: () => void } | null>(null);

  const select = useCallback((id: string | null) => { selectedRef.current = id; setSelected(id); apiRef.current?.paint(); }, []);

  const firstModel = models[0];
  useEffect(() => {
    const host = hostRef.current;
    if (!host || failed) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // WebGL indisponible : la liste des pièces reste utilisable
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);
    // Taille affichée = taille du cadre (sinon, sur écran haute densité, le canevas déborde et seul un quart est visible).
    Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%" });
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.setAttribute("aria-label", "Modèle 3D du capteur : faites glisser pour le faire tourner");

    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 5, 7); scene.add(key);
    const fill = new THREE.DirectionalLight(0x9fb7ff, 0.9); fill.position.set(-5, -2, 3); scene.add(fill);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.08; controls.enablePan = false;
    controls.minDistance = 2; controls.maxDistance = 14; controls.autoRotateSpeed = 2;
    controls.autoRotate = false; // la rotation automatique reste un choix de l'utilisateur (accessibilité)

    let group: THREE.Group | null = null;
    let home = { pos: new THREE.Vector3(), target: new THREE.Vector3() };

    const paint = () => {
      const accent = themeAccent();
      const anySelected = selectedRef.current !== null;
      for (const p of partsRef.current) {
        const on = p.id === selectedRef.current;
        for (const m of p.meshes) {
          const mm = m.material as THREE.MeshStandardMaterial;
          mm.emissive.copy(on ? accent : new THREE.Color(0x000000));
          mm.emissiveIntensity = on ? 0.9 : 0;
          // Les autres pièces s'estompent légèrement pour faire ressortir la pièce choisie.
          mm.transparent = anySelected && !on;
          mm.opacity = anySelected && !on ? 0.55 : 1;
        }
      }
    };
    const frame = () => {
      if (!group) return;
      const box3 = new THREE.Box3().setFromObject(group);
      const center = box3.getCenter(new THREE.Vector3());
      const size = box3.getSize(new THREE.Vector3()).length();
      group.position.sub(center);
      const dist = size * 1.35;
      home = { pos: new THREE.Vector3(0.35, 0.28, 1).normalize().multiplyScalar(dist), target: new THREE.Vector3(0, 0, 0) };
      camera.position.copy(home.pos); controls.target.copy(home.target); controls.update();
    };
    const setModel = (k: ModelKey) => {
      if (group) { scene.remove(group); disposeGroup(group); }
      const built = MODELS[k].build();
      group = built.group; scene.add(group);
      partsRef.current = built.parts; setParts(built.parts);
      selectedRef.current = null; setSelected(null);
      frame(); paint();
    };
    apiRef.current = {
      setModel, paint,
      resetView: () => { camera.position.copy(home.pos); controls.target.copy(home.target); controls.update(); },
      setAuto: (v) => { controls.autoRotate = v; },
    };
    setModel(firstModel);

    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize); ro.observe(host); resize();

    const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2();
    // Survol : curseur « main » au-dessus d'une pièce cliquable
    const onHover = (e: PointerEvent) => {
      if (e.buttons || !group) return;
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      renderer.domElement.style.cursor = ray.intersectObject(group, true).length ? "pointer" : "grab";
    };
    // Clic sur une pièce (un glisser pour tourner ne compte pas comme un clic)
    let down = { x: 0, y: 0 };
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5 || !group) return;
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObject(group, true)[0];
      const part = hit && partsRef.current.find((p) => p.meshes.includes(hit.object as THREE.Mesh));
      selectedRef.current = part ? part.id : null; setSelected(selectedRef.current); paint();
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointermove", onHover);

    // Changement de thème clair/sombre : la surbrillance reprend l'azur du nouveau thème.
    const mo = new MutationObserver(paint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.05 });
    io.observe(host);
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      controls.update(); renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); mo.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointermove", onHover);
      controls.dispose();
      if (group) disposeGroup(group);
      renderer.dispose();
      renderer.domElement.remove();
      apiRef.current = null;
    };
  }, [firstModel, failed]);

  const chooseModel = (k: ModelKey) => { setCurrent(k); apiRef.current?.setModel(k); };
  const toggleAuto = () => { const v = !autoRotate; setAutoRotate(v); apiRef.current?.setAuto(v); };
  const active = parts.find((p) => p.id === selected);

  return (
    <WidgetFrame icon={<Box size={17} strokeWidth={1.75} />}
                 title={models.length > 1 ? "Explorer les capteurs en 3D" : `Modèle 3D : ${MODELS[models[0]].name}`}
                 hint="Glissez pour faire tourner, molette ou deux doigts pour zoomer, et touchez une pièce pour la repérer. Modèle simplifié : l'aspect réel varie selon les fabricants.">
      {models.length > 1 && (
        <div role="tablist" aria-label="Choix du capteur" className="mb-4 flex flex-wrap gap-2">
          {models.map((k) => (
            <button key={k} type="button" role="tab" aria-selected={current === k} onClick={() => chooseModel(k)} className={chip(current === k)}>
              {MODELS[k].name}
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[1fr_250px]">
        <div className="min-w-0">
          <div ref={hostRef} className="stage relative h-72 w-full cursor-grab overflow-hidden rounded-[22px] border border-tint/[0.08] active:cursor-grabbing sm:h-80 lg:h-[400px]">
            {failed && <p className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted">Le rendu 3D n&apos;est pas disponible sur cet appareil (WebGL désactivé). La liste des pièces reste consultable.</p>}
            {active && (
              <p className="pointer-events-none absolute left-3 top-3 rounded-full border border-primary/30 bg-[var(--glass-strong-top)] px-3 py-1 text-xs font-medium text-primary-soft backdrop-blur-xl">{active.label}</p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={toggleAuto} aria-pressed={autoRotate} className={chip(autoRotate)}>
              <Orbit size={15} aria-hidden="true" /> Rotation automatique
            </button>
            <button type="button" onClick={() => apiRef.current?.resetView()} className={chip(false)}>
              <RotateCcw size={15} aria-hidden="true" /> Recentrer
            </button>
          </div>
        </div>
        <div className="flex min-w-0 flex-col">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-muted">Pièces</p>
          <ul className="flex flex-wrap gap-1.5 lg:max-h-[262px] lg:flex-col lg:flex-nowrap lg:overflow-auto lg:pr-1">
            {parts.map((p, i) => (
              <li key={p.id}>
                <button type="button" onClick={() => select(selected === p.id ? null : p.id)} aria-pressed={selected === p.id}
                        className={`${chip(selected === p.id)} w-full justify-start text-left`}>
                  <span className="tabular w-4 shrink-0 font-mono text-[11px] opacity-70" aria-hidden="true">{i + 1}</span>{p.label}
                </button>
              </li>
            ))}
          </ul>
          <div aria-live="polite" className={`${well} mt-3 min-h-24 flex-1 px-3.5 py-3 text-sm leading-relaxed text-muted`}>
            {active ? <><p className="font-medium text-text">{active.label}</p><p className="mt-1">{active.desc}</p></> : "Choisissez une pièce, sur le modèle ou dans la liste, pour savoir à quoi elle sert."}
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}
