import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/forms/AuthShell";
import { LoginForm } from "@/components/forms/AuthForms";
import { FormMessage } from "@/components/ui/FormMessage";
import { getProfile, getUser, homeForRole } from "@/services/auth";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { safeNext } from "@/utils/format";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirection?: string; erreur?: string }> }) {
  const sp = await searchParams;
  const profile = await getProfile();
  if (profile) redirect(safeNext(sp.redirection, homeForRole(profile.role)));
  if (sp.erreur === "profil" && (await getUser())) {
    return (
      <AuthShell title="Profil introuvable" subtitle="Vous êtes connecté, mais votre profil n'a pas pu être chargé.">
        <FormMessage error="Les migrations Supabase (0001 et 0002) ne sont probablement pas toutes exécutées, ou la table profiles est inaccessible. Consultez le terminal du serveur pour le détail." />
        <form action={signOut} className="mt-4"><Button type="submit" variant="secondary" className="w-full">Se déconnecter</Button></form>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="Connexion" subtitle="Retrouvez votre progression et vos soumissions."
      footer={<>Pas encore de compte ? <Link href="/inscription" className="text-copper">Créer un compte</Link></>}>
      {sp.erreur === "config" && <div className="mb-4"><FormMessage error="Supabase n'est pas configuré : renseignez .env.local (voir README)." /></div>}
      {sp.erreur === "lien" && <div className="mb-4"><FormMessage error="Lien invalide ou expiré. Reconnectez-vous ou redemandez un lien." /></div>}
      <LoginForm next={sp.redirection} />
    </AuthShell>
  );
}
