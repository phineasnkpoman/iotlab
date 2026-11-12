import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      <div className="pcb-grid absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6 md:py-32">
        {/* Un circuit ouvert : le courant ne passe plus */}
        <div className="flex w-56 items-center" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-copper" />
          <span className="h-px flex-1 bg-copper/70" />
          <span className="mx-3 h-px w-6 -rotate-[25deg] bg-copper/70" />
          <span className="h-px flex-1 border-t border-dashed border-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
        </div>
        <p className="tabular mt-8 font-mono text-sm text-copper">Erreur 404</p>
        <h1 className="mt-3 text-[2.2rem] font-semibold tracking-[-0.03em]">Page introuvable</h1>
        <p className="mt-3 max-w-sm text-muted">Le lien est peut-être incorrect, ou cette page a été déplacée.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/">Retour à l&apos;accueil</LinkButton>
          <LinkButton href="/formations" variant="secondary">Voir les formations</LinkButton>
        </div>
      </div>
    </div>
  );
}
