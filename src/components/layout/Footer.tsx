import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";

const link = "block w-fit text-muted transition-colors duration-200 hover:text-text";

export function Footer() {
  return (
    <footer className="relative mt-36 border-t border-tint/[0.07] bg-well backdrop-blur-xl">
      {/* Une piste de cuivre court le long du bord supérieur */}
      <div className="absolute inset-x-0 -top-px mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-copper/50 to-transparent" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Plateforme d&apos;apprentissage pratique de l&apos;IoT, de l&apos;électronique et des systèmes embarqués pour toute la communauté de l&apos;ESATIC.
          </p>
        </div>
        <nav aria-label="Plateforme" className="space-y-2.5 text-sm">
          <p className="mb-3 font-medium">Plateforme</p>
          {[["/formations", "Formations"], ["/cartes", "Catalogue des cartes"], ["/cablages", "Câblages en 3D"], ["/laboratoire", "Laboratoire"], ["/outils", "Outils"], ["/challenges", "Challenges"]].map(([h, l]) => (
            <Link key={h} href={h} className={link}>{l}</Link>
          ))}
        </nav>
        <nav aria-label="Informations" className="space-y-2.5 text-sm">
          <p className="mb-3 font-medium">Informations</p>
          <Link href="/a-propos" className={link}>À propos</Link>
          <a href="https://www.esatic.ci" target="_blank" rel="noopener noreferrer" className={`${link} inline-flex items-center gap-1`}>
            Site de l&apos;ESATIC <ArrowUpRight size={13} aria-hidden="true" />
          </a>
          <Link href="/connexion" className={link}>Connexion</Link>
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
