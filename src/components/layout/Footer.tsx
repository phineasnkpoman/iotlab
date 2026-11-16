import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";

const link = "block w-fit text-muted transition-colors duration-200 hover:text-text";

// Le pied de page reprend les espaces de la navigation, avec les rubriques du Laboratoire.
const COLUMNS: { title: string; links: [string, string][] }[] = [
  { title: "Parcours", links: [["/formations", "Formations"], ["/laboratoire", "Laboratoire"], ["/challenges", "Challenges"], ["/dashboard", "Mon espace"]] },
  { title: "Laboratoire", links: [["/laboratoire", "Montages 3D"], ["/laboratoire/simulateurs", "Simulateurs"], ["/laboratoire/cartes", "Cartes"], ["/laboratoire/outils", "Outils"]] },
];

export function Footer() {
  return (
    <footer className="relative mt-36 border-t border-tint/[0.07] bg-well backdrop-blur-xl">
      {/* Une piste de cuivre court le long du bord supérieur */}
      <div className="absolute inset-x-0 -top-px mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-copper/50 to-transparent" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Plateforme d&apos;apprentissage pratique de l&apos;IoT, de l&apos;électronique et des systèmes embarqués pour toute la communauté de l&apos;ESATIC.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title} className="space-y-2.5 text-sm">
            <p className="mb-3 font-medium">{col.title}</p>
            {col.links.map(([h, l]) => <Link key={h} href={h} className={link}>{l}</Link>)}
          </nav>
        ))}
        <nav aria-label="Informations" className="space-y-2.5 text-sm">
          <p className="mb-3 font-medium">Informations</p>
          <Link href="/a-propos" className={link}>À propos</Link>
          <a href="https://www.esatic.ci" target="_blank" rel="noopener noreferrer" className={`${link} inline-flex items-center gap-1`}>
            Site de l&apos;ESATIC <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </nav>
      </div>
      <div className="border-t border-tint/[0.07]">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted sm:px-6">
          © {new Date().getFullYear()} IoT LAB ESATIC. Section IoT du Club Informatique.
        </p>
      </div>
    </footer>
  );
}
