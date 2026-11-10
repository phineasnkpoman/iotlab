import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { listTools } from "@/services/catalog";
import { EmptyState } from "@/components/ui/EmptyState";
import { safeUrl } from "@/utils/format";

export const metadata: Metadata = { title: "Outils" };

export default async function ToolsPage() {
  const tools = await listTools();
  const categories = [...new Set(tools.map((t) => t.category))];
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Outils</h1>
      <p className="mt-2 max-w-2xl text-muted">Les logiciels et plateformes utilisés dans les formations. Chaque lien ouvre le site officiel de l&apos;outil.</p>
      {tools.length === 0 && <div className="mt-8"><EmptyState title="Aucun outil publié" /></div>}
      {categories.map((cat) => (
        <section key={cat} className="mt-10">
          <h2 className="text-sm font-medium text-copper">{cat}</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {tools.filter((t) => t.category === cat).map((t) => (
              <article key={t.id} className="flex flex-col rounded-lg border border-line bg-panel p-5">
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <p className="mt-2 text-sm text-muted">{t.description}</p>
                {t.usefulness && <p className="mt-3 text-sm"><span className="font-medium">À quoi ça sert : </span><span className="text-muted">{t.usefulness}</span></p>}
                <div className="mt-auto flex flex-wrap gap-4 pt-4 text-sm">
                  <a href={safeUrl(t.official_url) ?? "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-copper">Site officiel <ExternalLink size={14} /></a>
                  {safeUrl(t.tutorial_url) && <a href={safeUrl(t.tutorial_url)!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-text">Tutoriel <ExternalLink size={14} /></a>}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
