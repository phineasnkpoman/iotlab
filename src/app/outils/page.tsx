import type { Metadata } from "next";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { listTools } from "@/services/catalog";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { safeUrl } from "@/utils/format";

export const metadata: Metadata = { title: "Outils" };

export default async function ToolsPage() {
  const tools = await listTools();
  const categories = [...new Set(tools.map((t) => t.category))];
  return (
    <>
      <PageHeader title="Outils" description="Les logiciels et plateformes utilisés dans les formations. Chaque lien ouvre le site officiel de l'outil." />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {tools.length === 0 && <EmptyState title="Aucun outil publié" />}
        <div className="space-y-12">
          {categories.map((cat) => (
            <section key={cat} className="grid gap-4 md:grid-cols-[200px_1fr] md:gap-8">
              <h2 className="text-sm font-medium text-copper md:sticky md:top-24 md:h-fit md:pt-5">{cat}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {tools.filter((t) => t.category === cat).map((t) => {
                  const official = safeUrl(t.official_url);
                  const tutorial = safeUrl(t.tutorial_url);
                  return (
                    <article key={t.id} className="group relative flex flex-col glass rounded-[24px] p-6 transition-[border-color] duration-300 hover:border-tint/20">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold tracking-[-0.01em]">{t.name}</h3>
                        <ArrowUpRight size={18} className="text-muted transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-copper" aria-hidden="true" />
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{t.description}</p>
                      {t.usefulness && (
                        <p className="mt-4 rounded-2xl border border-tint/[0.07] bg-well px-3 py-2.5 text-sm">
                          <span className="font-medium">À quoi ça sert : </span><span className="text-muted">{t.usefulness}</span>
                        </p>
                      )}
                      <div className="mt-auto flex flex-wrap gap-4 pt-5 text-sm">
                        {/* Le lien principal couvre toute la carte */}
                        {official && (
                          <a href={official} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-copper after:absolute after:inset-0 after:rounded-[14px]">
                            Site officiel <ExternalLink size={14} aria-hidden="true" />
                          </a>
                        )}
                        {tutorial && (
                          <a href={tutorial} target="_blank" rel="noopener noreferrer" className="relative z-10 inline-flex items-center gap-1.5 text-muted hover:text-text">
                            Tutoriel <ExternalLink size={14} aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
