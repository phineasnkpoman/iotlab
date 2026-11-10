import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "À propos" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">À propos d&apos;IoT LAB ESATIC</h1>
      <div className="prose-lab mt-6">
        <p>IoT LAB ESATIC est un laboratoire numérique d&apos;apprentissage de l&apos;Internet des objets, de l&apos;électronique et des systèmes embarqués. Il est né de la volonté de structurer les activités pédagogiques de la Section IoT du Club Informatique de l&apos;ESATIC.</p>
        <p>La plateforme n&apos;est pas réservée aux membres du club : elle s&apos;adresse à tous les étudiants de l&apos;ESATIC, quels que soient leur niveau et leur filière.</p>
        <h2>Notre approche</h2>
        <p>Nous ne recréons pas les simulateurs existants. Nous intégrons des outils reconnus, comme Wokwi et Tinkercad, dans un parcours pédagogique : comprendre une notion, voir le schéma, reproduire le montage, écrire le code, répondre aux exercices et mesurer sa progression.</p>
        <h2>L&apos;ESATIC</h2>
        <p>L&apos;École Supérieure Africaine des Technologies de l&apos;Information et de la Communication, basée à Abidjan, forme les ingénieurs et techniciens du numérique.</p>
      </div>
      <div className="mt-8 flex gap-3">
        <LinkButton href="/formations">Voir les formations</LinkButton>
        <LinkButton href="/inscription" variant="secondary">Créer un compte</LinkButton>
      </div>
    </div>
  );
}
