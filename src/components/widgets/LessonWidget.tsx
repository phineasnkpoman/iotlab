"use client";

import dynamic from "next/dynamic";
import UltrasonicSim from "./UltrasonicSim";
import PirSim from "./PirSim";
import WiringCheck from "./WiringCheck";
import type { ModelKey } from "./Sensor3D";

const ALL: ModelKey[] = ["hcsr04", "pir", "dht11"];
const HCSR04: ModelKey[] = ["hcsr04"];
const PIR: ModelKey[] = ["pir"];
const DHT11: ModelKey[] = ["dht11"];

// three.js est lourd : il n'est chargé que dans les leçons qui affichent un modèle 3D, et jamais côté serveur.
const Sensor3D = dynamic(() => import("./Sensor3D"), {
  ssr: false,
  loading: () => (
    <div className="not-prose glass my-9 overflow-hidden rounded-[28px]" aria-busy="true">
      <div className="h-[62px] border-b border-tint/[0.07]" />
      <div className="p-4 sm:p-5"><div className="skeleton stage grid h-72 place-items-center rounded-[22px] text-sm text-muted sm:h-96">Chargement du modèle 3D…</div></div>
    </div>
  ),
});

export const WIDGET_NAMES = ["sensor-3d", "sensor-3d-hcsr04", "sensor-3d-pir", "sensor-3d-dht11", "ultrasonic-sim", "pir-sim", "wiring-hcsr04", "wiring-pir", "wiring-dht11"] as const;

/** Associe le nom écrit dans une leçon (ligne « @@widget nom ») au module correspondant. */
export function LessonWidget({ name }: { name: string }) {
  switch (name) {
    case "sensor-3d": return <Sensor3D models={ALL} />;
    case "sensor-3d-hcsr04": return <Sensor3D models={HCSR04} />;
    case "sensor-3d-pir": return <Sensor3D models={PIR} />;
    case "sensor-3d-dht11": return <Sensor3D models={DHT11} />;
    case "ultrasonic-sim": return <UltrasonicSim />;
    case "pir-sim": return <PirSim />;
    case "wiring-hcsr04": return <WiringCheck sensor="hcsr04" />;
    case "wiring-pir": return <WiringCheck sensor="pir" />;
    case "wiring-dht11": return <WiringCheck sensor="dht11" />;
    default:
      return <p className="not-prose my-6 rounded-[18px] border border-dashed border-tint/15 px-4 py-3 text-sm text-muted">Module interactif inconnu : « {name} ».</p>;
  }
}
