"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signUp, forgotPassword, resetPassword, type FormState } from "@/app/actions/auth";
import { Field } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormMessage } from "@/components/ui/FormMessage";

const initial: FormState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signIn, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <Field id="email" name="email" type="email" label="Adresse email" autoComplete="email" required />
      <Field id="password" name="password" type="password" label="Mot de passe" autoComplete="current-password" required />
      <FormMessage error={state.error} message={state.message} />
      <SubmitButton className="w-full" pendingText="Connexion…">Se connecter</SubmitButton>
      <p className="text-center text-sm text-muted">
        <Link href="/mot-de-passe-oublie" className="hover:text-text">Mot de passe oublié ?</Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUp, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field id="full_name" name="full_name" label="Nom complet" autoComplete="name" required />
      <Field id="email" name="email" type="email" label="Adresse email" autoComplete="email" required />
      <Field id="password" name="password" type="password" label="Mot de passe" hint="8 caractères minimum." autoComplete="new-password" required minLength={8} />
      <FormMessage error={state.error} message={state.message} />
      <SubmitButton className="w-full" pendingText="Création…">Créer mon compte</SubmitButton>
    </form>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(forgotPassword, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field id="email" name="email" type="email" label="Adresse email" autoComplete="email" required />
      <FormMessage error={state.error} message={state.message} />
      <SubmitButton className="w-full">Envoyer le lien</SubmitButton>
    </form>
  );
}

export function ResetForm() {
  const [state, action] = useActionState(resetPassword, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field id="password" name="password" type="password" label="Nouveau mot de passe" autoComplete="new-password" required minLength={8} />
      <Field id="confirm" name="confirm" type="password" label="Confirmer le mot de passe" autoComplete="new-password" required minLength={8} />
      <FormMessage error={state.error} message={state.message} />
      <SubmitButton className="w-full">Enregistrer</SubmitButton>
    </form>
  );
}
