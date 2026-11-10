import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/forms/AuthShell";
import { ForgotForm } from "@/components/forms/AuthForms";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPage() {
  return (
    <AuthShell title="Mot de passe oublié" subtitle="Saisissez votre email : nous vous envoyons un lien pour choisir un nouveau mot de passe."
      footer={<Link href="/connexion" className="text-copper">Retour à la connexion</Link>}>
      <ForgotForm />
    </AuthShell>
  );
}
