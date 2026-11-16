import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, FlaskConical, Trophy, LayoutDashboard } from "lucide-react";
import { LinkButton, ArrowChip } from "@/components/ui/Button";
import { BoardScene } from "@/components/fx/BoardScene";
import { CourseCard } from "@/components/courses/CourseCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { listCourses, listChallenges } from "@/services/catalog";
import { getProfile, homeForRole } from "@/services/auth";
import { MONTAGES } from "@/data/montages";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });
const iconBox = "grid place-items-center rounded-2xl border border-tint/10 bg-tint/[0.06] shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]";
const RANK: Record<string, number> = { debutant: 0, intermediaire: 1, avance: 2 };

export default async function Home() {
  const [courses, challenges, profile] = await Promise.all([listCourses({ sort: "recent" }), listChallenges(), getProfile()]);
  const open = challenges.filter((c) => c.status !== "closed");
  // La formation par laquelle commencer : la plus accessible.
  const ordered = [...courses].sort((a, b) => RANK[a.level] - RANK[b.level]);
  const first = ordered[0];

  // Le parcours tient en trois espaces, chacun avec une seule page d'entrée.
  const spaces = [
    {
      n: "01", verb: "Apprendre", title: "Formations", href: "/formations", icon: BookOpen, tone: "text-copper",
      text: "Des leçons courtes avec un schéma, le code et un exercice. Un petit QCM à la fin de chaque leçon valide ce que vous avez compris.",
      stat: courses.length ? `${courses.length} formation${courses.length > 1 ? "s" : ""}` : null,
    },
    {
      n: "02", verb: "Pratiquer", title: "Laboratoire", href: "/laboratoire", icon: FlaskConical, tone: "text-primary-soft",
      text: "Refaites les montages en 3D, manipulez les simulateurs, puis reproduisez tout sur Wokwi. Les cartes et les outils sont rangés au même endroit.",
      stat: `${MONTAGES.length} montages en 3D`,
    },
    {
      n: "03", verb: "Se tester", title: "Challenges", href: "/challenges", icon: Trophy, tone: "text-ok-soft",
      text: "Des défis du niveau débutant au niveau avancé. Vous rendez votre travail, un formateur le note et le commente.",
      stat: open.length ? `${open.length} défi${open.length > 1 ? "s" : ""} ouvert${open.length > 1 ? "s" : ""}` : null,
    },
  ];

  return (
    <>
      {/* ---------- Hero ---------- */}
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
                {profile ? (
                  <LinkButton href={homeForRole(profile.role)} className="py-3 pl-6 pr-3.5">
                    Reprendre où j&apos;en étais <ArrowChip><ArrowRight size={15} aria-hidden="true" /></ArrowChip>
                  </LinkButton>
                ) : (
                  <>
                    <LinkButton href={first ? `/formations/${first.slug}` : "/formations"} className="py-3 pl-6 pr-3.5">
                      Commencer à apprendre <ArrowChip><ArrowRight size={15} aria-hidden="true" /></ArrowChip>
                    </LinkButton>
                    <LinkButton href="/inscription" variant="secondary" className="px-6 py-3">Créer un compte</LinkButton>
                  </>
                )}
              </div>
            </div>
            <BoardScene />
          </div>
        </div>
      </section>

      {/* ---------- Le parcours : trois espaces, une page chacun ---------- */}
      <section aria-labelledby="parcours" className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 md:pt-24">
        <h2 id="parcours" className="reveal max-w-2xl text-[2rem] font-medium leading-[1.1] tracking-[-0.035em] sm:text-[2.6rem]">
          Trois espaces, dans l&apos;ordre où vous en avez besoin
        </h2>
        <ol className="relative mt-10 grid gap-4 lg:grid-cols-3">
          {spaces.map(({ n, verb, title, href, icon: Icon, tone, text, stat }) => (
            <li key={href} className="reveal">
              <Link href={href} className="glass group relative flex h-full flex-col rounded-[28px] p-7 outline-none transition-[border-color,transform] duration-500 ease-[var(--ease-spring)] hover:-translate-y-0.5 hover:border-tint/20 focus-visible:ring-2 focus-visible:ring-primary/60">
                <div className="flex items-center justify-between">
                  <span className={`${iconBox} h-12 w-12 ${tone}`}><Icon size={21} strokeWidth={1.6} aria-hidden="true" /></span>
                  <span className="tabular font-mono text-sm text-muted">{n}</span>
                </div>
                <p className={`mt-7 font-mono text-xs uppercase tracking-[0.14em] ${tone}`}>{verb}</p>
                <h3 className="mt-1.5 text-2xl font-medium tracking-[-0.025em]">{title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{text}</p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-7">
                  <span className="tabular text-sm text-muted">{stat}</span>
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-tint/10 bg-tint/[0.04] text-muted transition-[transform,color,background-color] duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-tint/10 group-hover:text-text" aria-hidden="true">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
        <p className="reveal mt-5 flex items-center gap-2.5 text-sm text-muted">
          <LayoutDashboard size={16} className="shrink-0 text-primary-soft" aria-hidden="true" />
          <span>Votre progression, vos QCM et les corrections des formateurs sont regroupés dans <Link href="/dashboard" className="text-text underline-offset-4 hover:underline">Mon espace</Link>.</span>
        </p>
      </section>

      {/* ---------- Par où commencer ---------- */}
      <section aria-labelledby="commencer" className="mx-auto max-w-6xl px-4 pt-28 sm:px-6 md:pt-36">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="commencer" className="reveal text-[2rem] font-medium tracking-[-0.035em] sm:text-[2.6rem]">Par où commencer</h2>
            <p className="reveal mt-2 text-muted">Les formations, de la plus accessible à la plus avancée.</p>
          </div>
          <Link href="/formations" className="group inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-tint/[0.05] hover:text-text">
            Toutes les formations <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="reveal mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.slice(0, 3).map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
        {courses.length === 0 && (
          <EmptyState title="Aucune formation publiée pour l'instant">
            {isSupabaseConfigured ? "Les formations apparaîtront ici dès leur publication." : "Connectez Supabase et exécutez seed.sql (voir README) pour afficher la formation pilote."}
          </EmptyState>
        )}
      </section>

      {/* ---------- Inscription (visiteurs seulement) ---------- */}
      {!profile && (
        <section className="mx-auto max-w-6xl px-4 pt-28 sm:px-6 md:pt-36">
          <div className="reveal bezel">
            <div className="bezel-core glass relative flex flex-wrap items-center justify-between gap-8 overflow-hidden p-7 sm:p-11">
              <div className="absolute -right-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
              <div className="relative max-w-xl">
                <h2 className="text-[1.9rem] font-medium leading-tight tracking-[-0.035em] sm:text-4xl">Gardez la trace de votre progression</h2>
                <p className="mt-3 leading-relaxed text-muted">Un compte gratuit enregistre vos leçons terminées et vos QCM, et permet de rendre vos exercices et vos challenges. Ouvert à tous les étudiants de l&apos;ESATIC.</p>
              </div>
              <div className="relative flex flex-wrap gap-3">
                <LinkButton href="/inscription" className="py-3 pl-6 pr-3.5">Créer un compte <ArrowChip><ArrowRight size={15} aria-hidden="true" /></ArrowChip></LinkButton>
                <LinkButton href="/connexion" variant="ghost" className="px-5 py-3">Se connecter</LinkButton>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
