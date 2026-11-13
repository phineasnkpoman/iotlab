import { getProfile, homeForRole } from "@/services/auth";
import { signOut } from "@/app/actions/auth";
import { LinkButton, Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { MobileMenu, type NavItem } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { ThemeMenu } from "@/components/theme/ThemeMenu";

const items: NavItem[] = [
  { href: "/", label: "Accueil", wideOnly: true },
  { href: "/formations", label: "Formations" },
  { href: "/cartes", label: "Cartes" },
  { href: "/cablages", label: "Câblages 3D", mobileOnly: true },
  { href: "/laboratoire", label: "Laboratoire" },
  { href: "/outils", label: "Outils" },
  { href: "/challenges", label: "Challenges" },
  { href: "/a-propos", label: "À propos" },
];

export async function Navbar() {
  const profile = await getProfile();
  const account = profile ? (
    <>
      <LinkButton href={homeForRole(profile.role)} variant="secondary" className="!py-2">Mon espace</LinkButton>
      <form action={signOut}><Button type="submit" variant="ghost" className="w-full !py-2">Déconnexion</Button></form>
    </>
  ) : (
    <>
      <LinkButton href="/connexion" variant="ghost" className="!px-4 !py-2">Connexion</LinkButton>
      <LinkButton href="/inscription" className="!py-2">Créer un compte</LinkButton>
    </>
  );

  // Îlot de verre flottant, détaché du haut de la page ; le contenu défile dessous.
  return (
    <header className="pointer-events-none sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div className="glass-strong pointer-events-auto relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 rounded-full pl-2.5 pr-2 sm:pl-3">
        <Logo />
        <NavLinks items={items} />
        <div className="flex items-center gap-1">
          <ThemeMenu />
          <div className="hidden items-center gap-1 lg:flex">{account}</div>
          <MobileMenu items={items}>{account}</MobileMenu>
        </div>
      </div>
    </header>
  );
}
