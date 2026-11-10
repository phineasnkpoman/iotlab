import Link from "next/link";
import { getProfile, homeForRole } from "@/services/auth";
import { signOut } from "@/app/actions/auth";
import { LinkButton, Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { MobileMenu, type NavItem } from "./MobileMenu";

const items: NavItem[] = [
  { href: "/", label: "Accueil" },
  { href: "/formations", label: "Formations" },
  { href: "/laboratoire", label: "Laboratoire" },
  { href: "/outils", label: "Outils" },
  { href: "/challenges", label: "Challenges" },
  { href: "/a-propos", label: "À propos" },
];

export async function Navbar() {
  const profile = await getProfile();
  const account = profile ? (
    <>
      <LinkButton href={homeForRole(profile.role)} variant="secondary">Mon espace</LinkButton>
      <form action={signOut}><Button type="submit" variant="ghost" className="w-full">Déconnexion</Button></form>
    </>
  ) : (
    <>
      <LinkButton href="/connexion" variant="secondary">Connexion</LinkButton>
      <LinkButton href="/inscription">Créer un compte</LinkButton>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-text">{i.label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">{account}</div>
        <MobileMenu items={items}>{account}</MobileMenu>
      </div>
    </header>
  );
}
