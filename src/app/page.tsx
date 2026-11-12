import Link from "next/link";
import { ArrowRight, Cpu, Gauge, Radio, Trophy, Wrench, BookOpen, Target } from "lucide-react";
import { LinkButton, ArrowChip } from "@/components/ui/Button";
import { BoardScene } from "@/components/fx/BoardScene";
import { Tilt } from "@/components/fx/Tilt";
import { LevelBadge } from "@/components/ui/Badge";
import { CourseCard } from "@/components/courses/CourseCard";
import { listCategories, listCourses, listChallenges, listTools } from "@/services/catalog";
import { LEVEL_LABEL } from "@/utils/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Les couleurs du schéma passent par style : les attributs SVG n'acceptent pas var().
const mono = { fontFamily: "var(--font-geist-mono)" };
const C = { panel: "var(--panel)", ink: "var(--ink)", line: "var(--line-strong)", text: "var(--text)", muted: "var(--muted)", copper: "var(--copper)", signal: "var(--signal)" };

function CircuitHero() {
  return (
    <svg viewBox="4 52 400 232" className="h-auto w-full" role="img"
         aria-label="Schéma : une broche de la carte Arduino alimente une LED à travers une résistance">
      <rect x="20" y="70" width="120" height="160" rx="10" style={{ fill: "var(--well)", stroke: C.line }} strokeWidth="1.5" />
      <text x="80" y="102" textAnchor="middle" fontSize="12" letterSpacing=".5" style={{ ...mono, fill: C.muted }}>ARDUINO UNO</text>
      <circle cx="140" cy="130" r="4" style={{ fill: C.copper }} />
      <text x="124" y="134" textAnchor="end" fontSize="12" style={{ ...mono, fill: C.text }}>D8</text>
      <circle cx="140" cy="190" r="4" style={{ fill: C.copper }} />
      <text x="124" y="194" textAnchor="end" fontSize="12" style={{ ...mono, fill: C.text }}>GND</text>
      <path d="M140 130 H200" strokeWidth="2.5" fill="none" className="wire-live" style={{ stroke: C.copper }} />
      <rect x="200" y="118" width="62" height="24" rx="4" strokeWidth="1.5" style={{ fill: "var(--panel)", stroke: C.copper }} />
      <text x="231" y="134" textAnchor="middle" fontSize="12" style={{ ...mono, fill: C.text }}>220 Ω</text>
      <path d="M262 130 H320 V150" strokeWidth="2.5" fill="none" className="wire-live" style={{ stroke: C.copper }} />
      <circle cx="320" cy="162" r="30" style={{ fill: C.signal, opacity: 0.2 }} />
      <path d="M305 150 H335 L320 175 Z" strokeWidth="2" strokeLinejoin="round" style={{ fill: C.signal, stroke: C.signal }} />
      <line x1="305" y1="177" x2="335" y2="177" strokeWidth="3" style={{ stroke: C.signal }} />
      <path d="M320 177 V190 H140" strokeWidth="2.5" fill="none" className="wire-live" style={{ stroke: C.copper }} />
      <text x="352" y="166" fontSize="12" style={{ ...mono, fill: C.muted }}>LED</text>
      <text x="20" y="266" fontSize="12" style={{ ...mono, fill: C.muted }}>
        <tspan style={{ fill: C.copper }}>digitalWrite</tspan>(8, <tspan style={{ fill: C.signal }}>HIGH</tspan>);
      </text>
    </svg>
  );
}

// Le parcours d'une notion, du cours au tableau de bord.
const path = [
  ["Découvrir une notion", "Une leçon courte, avec un schéma."],
  ["Consulter le schéma", "Le câblage, broche par broche."],
  ["Reproduire le montage", "Sur Wokwi, sans matériel."],
  ["Écrire le code", "Le programme qui pilote le montage."],
  ["Répondre aux exercices", "Quiz corrigé et travaux pratiques."],
  ["Suivre sa progression", "Votre tableau de bord se met à jour."],
];

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });
const iconBox = "grid place-items-center rounded-2xl border border-tint/10 bg-tint/[0.06] shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]";

export default async function Home() {
  const [courses, tools, challenges, categories] = await Promise.all([
    listCourses({ sort: "recent" }), listTools(), listChallenges(), listCategories(),
  ]);

  return (
    <>
      {/* ---------- Hero : titre + vue éclatée 3D ---------- */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 md:pt-20">
          <h1 className="rise max-w-5xl text-[clamp(2.5rem,5.6vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.045em]">
            Apprends. Expérimente. <span className="bg-gradient-to-b from-tint/60 to-tint/30 bg-clip-text text-transparent">Construis le futur connecté.</span>
          </h1>
          <div className="grid items-center gap-6 md:mt-10 md:grid-cols-[1fr_1.25fr] md:gap-10">
            <div className="pt-8 md:pt-0">
              <p className="rise max-w-[30rem] text-lg leading-relaxed text-muted" style={delay(100)}>
                Une plateforme d&apos;apprentissage pratique dédiée à l&apos;IoT, à l&apos;électronique et aux systèmes embarqués, accessible à toute la communauté ESATIC.
              </p>
              <div className="rise mt-9 flex flex-wrap items-center gap-3" style={delay(180)}>
                <LinkButton href="/formations" className="py-3 pl-6 pr-3.5">
                  Explorer les formations <ArrowChip><ArrowRight size={15} aria-hidden="true" /></ArrowChip>
                </LinkButton>
                <LinkButton href="/inscription" variant="secondary" className="px-6 py-3">Créer un compte</LinkButton>
              </div>
            </div>
            <BoardScene />
          </div>
        </div>
      </section>

      {/* ---------- Parcours : de la théorie au montage ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 md:pt-16">
        <h2 className="reveal max-w-2xl text-[2rem] font-medium leading-[1.1] tracking-[-0.035em] sm:text-[2.6rem]">
          Une plateforme pour passer de la théorie au montage
        </h2>
        <div className="reveal glass mt-10 rounded-[28px] p-7 sm:p-9">
          <ol className="relative grid gap-8 md:grid-cols-6 md:gap-5">
            {/* La piste : verticale sur mobile, horizontale sur grand écran */}
            <span className="absolute bottom-2 left-[5px] top-2 w-px bg-gradient-to-b from-copper/80 via-copper/40 to-primary md:hidden" aria-hidden="true" />
            <span className="absolute left-2 right-2 top-[5px] hidden h-px bg-gradient-to-r from-copper/80 via-copper/40 to-primary md:block" aria-hidden="true" />
            {path.map(([title, text], i) => {
              const last = i === path.length - 1;
              return (
                <li key={title} className="relative pl-8 md:pl-0 md:pr-2">
                  <span className={`absolute left-0 top-0 h-[11px] w-[11px] rounded-full border-2 ${last ? "border-primary bg-primary shadow-[0_0_18px_rgb(var(--primary-rgb)/0.9)]" : "border-copper bg-ink"}`} aria-hidden="true" />
                  <p className="font-medium md:mt-7">{title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ---------- Domaines : grille asymétrique de verre ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-28 sm:px-6 md:pt-36">
        <h2 className="reveal text-[2rem] font-medium tracking-[-0.035em] sm:text-[2.6rem]">Ce que vous allez apprendre</h2>
        {categories.length > 0 && (
          <ul className="reveal mt-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/formations?categorie=${c.slug}`} className="inline-block rounded-full border border-tint/10 bg-tint/[0.04] px-3.5 py-1.5 text-[13px] text-text/85 backdrop-blur transition-[background-color,border-color,color] duration-300 hover:border-copper/50 hover:bg-copper/10 hover:text-copper">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-10 grid gap-4 lg:grid-cols-12 lg:grid-rows-2">
          <Tilt max={4} className="reveal glass flex min-h-80 flex-col overflow-hidden rounded-[28px] p-7 lg:col-span-7 lg:row-span-2">
            <span className={`${iconBox} h-12 w-12 text-copper`}><Cpu size={22} strokeWidth={1.6} aria-hidden="true" /></span>
            <h3 className="mt-6 text-2xl font-medium tracking-[-0.025em]">Électronique et Arduino</h3>
            <p className="mt-2 max-w-sm text-muted">Composants, câblage et programmation des cartes.</p>
            <div className="mt-auto pt-8"><div className="rounded-[20px] border border-tint/[0.07] bg-well p-4 sm:p-5"><CircuitHero /></div></div>
          </Tilt>
          <Tilt max={6} className="reveal glass relative overflow-hidden rounded-[28px] p-7 lg:col-span-5">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
            <span className={`${iconBox} relative h-11 w-11 text-primary-soft`}><Gauge size={21} strokeWidth={1.6} aria-hidden="true" /></span>
            <h3 className="relative mt-6 text-xl font-medium tracking-[-0.02em]">Capteurs et actionneurs</h3>
            <p className="relative mt-1.5 text-sm text-muted">Mesurer le monde réel et agir dessus.</p>
          </Tilt>
          <Tilt max={6} className="reveal glass relative overflow-hidden rounded-[28px] p-7 lg:col-span-5">
            <div className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-copper/20 blur-3xl light:bg-sky-400/15" aria-hidden="true" />
            <span className={`${iconBox} relative h-11 w-11 text-text`}><Radio size={21} strokeWidth={1.6} aria-hidden="true" /></span>
            <h3 className="relative mt-6 text-xl font-medium tracking-[-0.02em]">Communication IoT</h3>
            <p className="relative mt-1.5 text-sm text-muted">ESP32, MQTT et Node-RED pour connecter les objets.</p>
          </Tilt>
        </div>
      </section>

      {/* ---------- Formations ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-28 sm:px-6 md:pt-36">
        <div className="flex items-end justify-between gap-4">
          <h2 className="reveal text-[2rem] font-medium tracking-[-0.035em] sm:text-[2.6rem]">Formations</h2>
          <Link href="/formations" className="group inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-tint/[0.05] hover:text-text">
            Tout le catalogue <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="reveal mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 3).map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
        {courses.length === 0 && (
          <EmptyState title="Aucune formation publiée pour l'instant">
            {isSupabaseConfigured ? "Les formations apparaîtront ici dès leur publication." : "Connectez Supabase et exécutez seed.sql (voir README) pour afficher la formation pilote."}
          </EmptyState>
        )}
      </section>

      {/* ---------- Challenges et outils ---------- */}
      <section className="mx-auto grid max-w-6xl gap-4 px-4 pt-28 sm:px-6 md:pt-36 lg:grid-cols-12">
        <div className="reveal glass relative overflow-hidden rounded-[28px] p-7 sm:p-8 lg:col-span-7">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
          <span className={`${iconBox} relative h-11 w-11 text-primary-soft`}><Trophy size={20} strokeWidth={1.6} aria-hidden="true" /></span>
          <h2 className="relative mt-6 text-2xl font-medium tracking-[-0.025em]">Challenges</h2>
          <p className="relative mt-2 text-sm text-muted">
            {challenges.length > 0 ? `${challenges.length} défi${challenges.length > 1 ? "s" : ""} ouvert${challenges.length > 1 ? "s" : ""}, du niveau ${LEVEL_LABEL[challenges[0].level].toLowerCase()} et au-delà.` : "Aucun challenge ouvert pour le moment."}
          </p>
          {challenges.length > 0 && (
            <ul className="relative mt-6 space-y-2">
              {challenges.slice(0, 3).map((c) => (
                <li key={c.id}>
                  <Link href={`/challenges/${c.slug}`} className="group flex items-center gap-3 rounded-2xl border border-tint/[0.07] bg-well px-4 py-3 text-sm transition-[background-color,border-color] duration-300 hover:border-tint/15 hover:bg-tint/[0.05]">
                    <span className="flex-1 truncate">{c.title}</span>
                    <LevelBadge level={c.level} />
                    <ArrowRight size={15} className="text-muted transition-[transform,color] duration-300 group-hover:translate-x-0.5 group-hover:text-text" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/challenges" className="group relative mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary-soft">
            Relever un défi <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="reveal glass relative flex flex-col overflow-hidden rounded-[28px] p-7 sm:p-8 lg:col-span-5">
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-copper/15 blur-3xl light:bg-sky-400/15" aria-hidden="true" />
          <span className={`${iconBox} relative h-11 w-11 text-copper`}><Wrench size={20} strokeWidth={1.6} aria-hidden="true" /></span>
          <h2 className="relative mt-6 text-2xl font-medium tracking-[-0.025em]">Outils</h2>
          <p className="relative mt-2 text-sm text-muted">
            {tools.length > 0 ? `${tools.length} outils officiels sélectionnés pour les formations.` : "Les outils recommandés seront listés ici."}
          </p>
          {tools.length > 0 && (
            <ul className="relative mt-6 flex flex-wrap gap-2">
              {tools.slice(0, 8).map((t) => (
                <li key={t.id} className="rounded-full border border-tint/10 bg-well px-3 py-1.5 font-mono text-xs text-text/85">{t.name}</li>
              ))}
            </ul>
          )}
          <Link href="/outils" className="group relative mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-copper">
            Voir les outils <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ---------- Pourquoi rejoindre + appel à l'action ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-28 sm:px-6 md:pt-36">
        <div className="reveal bezel">
          <div className="bezel-core glass relative grid gap-12 overflow-hidden p-7 sm:p-11 md:grid-cols-[1.3fr_1fr] md:gap-16">
            <div className="absolute -right-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <h2 className="text-[1.9rem] font-medium leading-tight tracking-[-0.035em] sm:text-4xl">Pourquoi rejoindre IoT LAB ESATIC ?</h2>
              <ul className="mt-9 space-y-6">
                {[
                  [BookOpen, "Apprendre à son rythme", "Des leçons progressives, avec code et schémas, pour les débutants comme pour les confirmés."],
                  [Target, "Pratiquer pour de vrai", "Chaque notion est associée à un montage et à une simulation Wokwi."],
                  [Trophy, "Montrer ce que l'on sait", "Soumettez vos réalisations et recevez les commentaires des formateurs."],
                ].map(([Icon, t, d]) => {
                  const I = Icon as typeof BookOpen;
                  return (
                    <li key={t as string} className="flex gap-4">
                      <span className={`${iconBox} h-10 w-10 shrink-0 text-primary-soft`}><I size={18} strokeWidth={1.6} aria-hidden="true" /></span>
                      <div><p className="font-medium">{t as string}</p><p className="mt-1 text-sm leading-relaxed text-muted">{d as string}</p></div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="relative flex flex-col justify-center gap-6 border-t border-tint/10 pt-9 md:border-l md:border-t-0 md:pl-12 md:pt-0">
              <p className="text-xl font-medium leading-snug tracking-[-0.02em]">Ouvert à tous les étudiants de l&apos;ESATIC, quels que soient le niveau et la filière.</p>
              <div className="flex flex-wrap gap-3">
                <LinkButton href="/inscription" className="py-3 pl-6 pr-3.5">Créer un compte <ArrowChip><ArrowRight size={15} aria-hidden="true" /></ArrowChip></LinkButton>
                <LinkButton href="/connexion" variant="ghost" className="px-5 py-3">Se connecter</LinkButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
