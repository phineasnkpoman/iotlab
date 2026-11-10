import Link from "next/link";
import { ArrowRight, Cpu, FlaskConical, Trophy, Wrench, BookOpen, Target } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { CourseCard } from "@/components/courses/CourseCard";
import { listCategories, listCourses, listChallenges, listTools } from "@/services/catalog";
import { LEVEL_LABEL } from "@/utils/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function CircuitHero() {
  return (
    <svg viewBox="0 0 420 300" className="h-auto w-full" role="img"
         aria-label="Schéma : une broche de la carte Arduino alimente une LED à travers une résistance">
      <rect x="20" y="70" width="120" height="160" rx="6" fill="#141a1f" stroke="#27323b" strokeWidth="2" />
      <text x="80" y="102" textAnchor="middle" fill="#8d9ba6" fontSize="13" fontFamily="var(--font-geist-mono)">ARDUINO UNO</text>
      <circle cx="140" cy="130" r="4" fill="#d9a441" /><text x="124" y="134" textAnchor="end" fill="#e8ecee" fontSize="12" fontFamily="var(--font-geist-mono)">D8</text>
      <circle cx="140" cy="190" r="4" fill="#d9a441" /><text x="124" y="194" textAnchor="end" fill="#e8ecee" fontSize="12" fontFamily="var(--font-geist-mono)">GND</text>
      <path d="M140 130 H200" stroke="#d9a441" strokeWidth="2.5" fill="none" className="wire-live" />
      <rect x="200" y="118" width="62" height="24" rx="3" fill="#0d1114" stroke="#d9a441" strokeWidth="2" />
      <text x="231" y="134" textAnchor="middle" fill="#e8ecee" fontSize="12" fontFamily="var(--font-geist-mono)">220 Ω</text>
      <path d="M262 130 H320 V150" stroke="#d9a441" strokeWidth="2.5" fill="none" className="wire-live" />
      <path d="M305 150 H335 L320 175 Z" fill="#e5383b" stroke="#e5383b" strokeWidth="2" strokeLinejoin="round" />
      <line x1="305" y1="177" x2="335" y2="177" stroke="#e5383b" strokeWidth="3" />
      <circle cx="320" cy="162" r="26" fill="#e5383b" opacity=".18" />
      <path d="M320 177 V190 H140" stroke="#d9a441" strokeWidth="2.5" fill="none" className="wire-live" />
      <text x="350" y="166" fill="#8d9ba6" fontSize="12" fontFamily="var(--font-geist-mono)">LED</text>
      <text x="20" y="262" fill="#8d9ba6" fontSize="12" fontFamily="var(--font-geist-mono)">digitalWrite(8, HIGH);</text>
    </svg>
  );
}

const domains = [
  { icon: Cpu, title: "Électronique et Arduino", text: "Composants, câblage et programmation des cartes." },
  { icon: Wrench, title: "Capteurs et actionneurs", text: "Mesurer le monde réel et agir dessus." },
  { icon: FlaskConical, title: "Communication IoT", text: "ESP32, MQTT et Node-RED pour connecter les objets." },
];

export default async function Home() {
  const [courses, tools, challenges, categories] = await Promise.all([
    listCourses({ sort: "recent" }), listTools(), listChallenges(), listCategories(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pcb-grid absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Apprends. Expérimente. Construis le futur connecté.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Une plateforme d&apos;apprentissage pratique dédiée à l&apos;IoT, à l&apos;électronique et aux systèmes embarqués, accessible à toute la communauté ESATIC.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/formations">Explorer les formations <ArrowRight size={16} /></LinkButton>
              <LinkButton href="/inscription" variant="secondary">Rejoindre le laboratoire</LinkButton>
            </div>
          </div>
          <div className="rounded-lg border border-line bg-panel/80 p-4"><CircuitHero /></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">Une plateforme pour passer de la théorie au montage</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Découvrez une notion, consultez le schéma, reproduisez le montage sur un simulateur, écrivez le code, répondez aux exercices et suivez votre progression.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {domains.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-lg border border-line bg-panel p-5">
              <Icon className="text-copper" size={22} />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
        {categories.length > 0 && (
          <p className="mt-6 text-sm text-muted">
            Catégories : {categories.map((c) => c.name).join(", ")}.
          </p>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Formations</h2>
          <Link href="/formations" className="text-sm text-muted hover:text-text">Tout le catalogue</Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 3).map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
        {courses.length === 0 && (
          <EmptyState title="Aucune formation publiée pour l'instant">
            {isSupabaseConfigured ? "Les formations apparaîtront ici dès leur publication." : "Connectez Supabase et exécutez seed.sql (voir README) pour afficher la formation pilote."}
          </EmptyState>
        )}
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-panel p-6">
          <Wrench className="text-copper" size={22} />
          <h2 className="mt-4 text-xl font-semibold">Outils</h2>
          <p className="mt-2 text-sm text-muted">
            {tools.length > 0 ? `${tools.length} outils officiels sélectionnés : ${tools.slice(0, 4).map((t) => t.name).join(", ")}…` : "Les outils recommandés seront listés ici."}
          </p>
          <Link href="/outils" className="mt-4 inline-flex items-center gap-1.5 text-sm text-copper">Voir les outils <ArrowRight size={14} /></Link>
        </div>
        <div className="rounded-lg border border-line bg-panel p-6">
          <Trophy className="text-copper" size={22} />
          <h2 className="mt-4 text-xl font-semibold">Challenges</h2>
          <p className="mt-2 text-sm text-muted">
            {challenges.length > 0 ? `${challenges.length} défi${challenges.length > 1 ? "s" : ""} ouvert${challenges.length > 1 ? "s" : ""}, du niveau ${LEVEL_LABEL[challenges[0].level].toLowerCase()} et au-delà.` : "Aucun challenge ouvert pour le moment."}
          </p>
          <Link href="/challenges" className="mt-4 inline-flex items-center gap-1.5 text-sm text-copper">Relever un défi <ArrowRight size={14} /></Link>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">Pourquoi rejoindre IoT LAB ESATIC ?</h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            [BookOpen, "Apprendre à son rythme", "Des leçons progressives, avec code et schémas, pour les débutants comme pour les confirmés."],
            [Target, "Pratiquer pour de vrai", "Chaque notion est associée à un montage et à une simulation Wokwi."],
            [Trophy, "Montrer ce que l'on sait", "Soumettez vos réalisations et recevez les commentaires des formateurs."],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof BookOpen;
            return (
              <li key={t as string} className="flex gap-3">
                <I className="mt-0.5 shrink-0 text-signal" size={20} />
                <div><p className="font-medium">{t as string}</p><p className="mt-1 text-sm text-muted">{d as string}</p></div>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
