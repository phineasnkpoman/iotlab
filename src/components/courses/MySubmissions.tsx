import { Download, ExternalLink, MessageSquareText } from "lucide-react";
import type { LearnerSubmission } from "@/services/submissions";
import { formatDate } from "@/utils/format";

/** Historique des envois de l'apprenant, avec la note et le commentaire du formateur. */
export function MySubmissions({ items, title = "Mes envois" }: { items: LearnerSubmission[]; title?: string }) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title} className="mt-8">
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="mt-3 space-y-3">
        {items.map((s) => {
          const reviewed = s.status === "reviewed";
          return (
            <li key={s.id} className="rounded-[20px] border border-tint/[0.08] bg-well p-4 text-sm">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="tabular text-muted">Envoyé le {formatDate(s.created_at)}</span>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${reviewed ? "border-ok/35 text-ok-soft" : "border-copper/40 text-copper"}`}>
                  {reviewed ? "Corrigé" : "En attente de correction"}
                </span>
                {s.score !== null && <span className="tabular ml-auto text-base font-medium">{s.score}<span className="text-xs font-normal text-muted"> / 100</span></span>}
              </div>
              {(s.fileName || s.link_url) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.fileName && (s.fileUrl
                    ? <a href={s.fileUrl} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-tint/10 px-3 py-1 text-xs hover:border-tint/25"><Download size={13} aria-hidden="true" /><span className="truncate">{s.fileName}</span></a>
                    : <span className="inline-flex items-center gap-1.5 rounded-full border border-tint/10 px-3 py-1 text-xs text-muted">{s.fileName}</span>)}
                  {s.link_url && (
                    <a href={s.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-tint/10 px-3 py-1 text-xs hover:border-tint/25">
                      <ExternalLink size={13} aria-hidden="true" /><span className="truncate">{s.link_url.replace(/^https?:\/\//, "")}</span><span className="sr-only">(nouvel onglet)</span>
                    </a>
                  )}
                </div>
              )}
              {s.feedback && (
                <div className="mt-3 flex gap-3 rounded-2xl border border-primary/20 bg-primary/[0.06] p-3.5">
                  <MessageSquareText size={16} className="mt-0.5 shrink-0 text-primary-soft" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-medium text-primary-soft">Commentaire du formateur</p>
                    <p className="mt-1 whitespace-pre-line leading-relaxed">{s.feedback}</p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
