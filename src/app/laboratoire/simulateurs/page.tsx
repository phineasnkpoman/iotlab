import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { LessonWidget } from "@/components/widgets/LessonWidget";
import { PageHeader } from "@/components/layout/PageHeader";
import { LabNav } from "@/components/layout/LabNav";

export const metadata: Metadata = {
  title: "Simulateurs · Laboratoire",
  description: "Capteurs en 3D, simulateurs ultrason et PIR, exercice de câblage : les capteurs HC-SR04, HC-SR501 et DHT11 à manipuler librement.",
};

const COURSE = "/formations/capteurs-ultrason-pir-dht11/lecons";

// Chaque simulateur renvoie à la leçon qui l'explique : on manipule ici, on comprend là-bas.
const demos: { name: string; title: string; text: string; lesson: { slug: string; title: string } }[] = [
  { name: "sensor-3d", title: "Les capteurs en 3D", text: "Faites tourner le HC-SR04, le PIR et le DHT11, et repérez chaque pièce et chaque broche.",
    lesson: { slug: "quest-ce-quun-capteur", title: "Qu'est-ce qu'un capteur ?" } },
  { name: "ultrasonic-sim", title: "Ultrason : la mesure par écho", text: "Déplacez le mur, changez la température et l'inclinaison, et observez l'écho, le chronogramme et le moniteur série.",
    lesson: { slug: "principe-echo-ultrasons", title: "Le principe de l'écho" } },
  { name: "pir-sim", title: "PIR : la détection de mouvement", text: "Déplacez la personne, réglez la portée et la durée, et découvrez pourquoi une personne immobile échappe au capteur.",
    lesson: { slug: "principe-pir", title: "Le principe du capteur PIR" } },
  { name: "wiring-hcsr04", title: "À vous de câbler le HC-SR04", text: "Reliez chaque broche du capteur à la bonne broche de l'Arduino, puis vérifiez.",
    lesson: { slug: "brancher-programmer-hcsr04", title: "Brancher et programmer le HC-SR04" } },
];

export default function SimulatorsPage() {
  return (
    <>
      <PageHeader top={<LabNav />} title="Simulateurs"
        description="Des capteurs à manipuler librement, sans matériel et sans compte. Chaque simulateur est expliqué pas à pas dans une leçon de la formation « Capteurs »." />
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        {demos.map((d, i) => (
          <section key={d.name} aria-labelledby={`demo-${d.name}`} className={i > 0 ? "mt-14" : ""}>
            <p className="tabular font-mono text-xs text-copper">{String(i + 1).padStart(2, "0")}</p>
            <h2 id={`demo-${d.name}`} className="mt-1.5 text-[1.45rem] font-semibold tracking-[-0.025em]">{d.title}</h2>
            <p className="mt-1.5 max-w-2xl text-muted">{d.text}</p>
            <LessonWidget name={d.name} />
            <Link href={`${COURSE}/${d.lesson.slug}`} className="-mt-4 inline-flex items-center gap-2 text-sm text-primary-soft underline-offset-4 hover:underline">
              <BookOpen size={15} aria-hidden="true" /> Comprendre dans la leçon « {d.lesson.title} »
            </Link>
          </section>
        ))}
      </div>
    </>
  );
}
