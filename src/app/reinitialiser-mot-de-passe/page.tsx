import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/forms/AuthShell";
import { ResetForm } from "@/components/forms/AuthForms";
import { getUser } from "@/services/auth";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default async function ResetPage() {
  // La session de récupération est créée par /auth/callback à partir du lien reçu par email.
  const user = await getUser();
  if (!user) redirect("/connexion?erreur=lien");
  return (
    <AuthShell title="Nouveau mot de passe">
      <ResetForm />
    </AuthShell>
  );
}
