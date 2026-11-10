import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm text-muted">
            Plateforme d&apos;apprentissage pratique de l&apos;IoT, de l&apos;électronique et des systèmes embarqués pour toute la communauté de l&apos;ESATIC.
          </p>
        </div>
        <nav aria-label="Plateforme" className="space-y-2 text-sm">
          <p className="font-medium">Plateforme</p>
          {[["/formations", "Formations"], ["/laboratoire", "Laboratoire"], ["/outils", "Outils"], ["/challenges", "Challenges"]].map(([h, l]) => (
            <Link key={h} href={h} className="block text-muted hover:text-text">{l}</Link>
          ))}
        </nav>
        <nav aria-label="Informations" className="space-y-2 text-sm">
          <p className="font-medium">Informations</p>
          <Link href="/a-propos" className="block text-muted hover:text-text">À propos</Link>
          <a href="https://www.esatic.ci" target="_blank" rel="noopener noreferrer" className="block text-muted hover:text-text">Site de l&apos;ESATIC</a>
          <Link href="/connexion" className="block text-muted hover:text-text">Connexion</Link>
        </nav>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} IoT LAB ESATIC · Section IoT du Club Informatique
      </div>
    </footer>
  );
}
