import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/forms/AuthShell";
import { SignUpForm } from "@/components/forms/AuthForms";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignUpPage() {
  return (
    <AuthShell title="Créer un compte" subtitle="Ouvert à tous les étudiants de l'ESATIC."
      footer={<>Déjà inscrit ? <Link href="/connexion" className="text-copper">Se connecter</Link></>}>
      <SignUpForm />
    </AuthShell>
  );
}
