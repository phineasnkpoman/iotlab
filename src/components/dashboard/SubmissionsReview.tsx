import Link from "next/link";
import { CircleAlert, Download, ExternalLink, Inbox } from "lucide-react";
import { REVIEW_FILTERS, type ReviewFilter, type StaffSubmission } from "@/services/submissions";
import { formatDate } from "@/utils/format";
import { ReviewForm } from "./ReviewForm";

/** Liste des soumissions à relire, avec filtres, pièces jointes et formulaire de correction. */
export function SubmissionsReview({ rows, pending, error, filter, basePath }: {
  rows: StaffSubmission[]; pending: number; error: string | null; filter: ReviewFilter; basePath: string;
}) {
  return (
    <div>
      <nav aria-label="Filtrer les soumissions" className="flex flex-wrap items-center gap-1.5">
        {REVIEW_FILTERS.map((f) => {
          const on = f.value === filter;
          return (
            <Link key={f.value} href={`${basePath}?soumissions=${f.value}#soumissions`} scroll={false} aria-current={on ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-300 ${on
                    ? "border-primary bg-primary text-white" : "border-tint/10 bg-tint/[0.04] text-muted hover:border-tint/20 hover:text-text"}`}>
              {f.label}
              {f.value === "a-corriger" && pending > 0 && (
                <span className={`tabular rounded-full px-1.5 text-[11px] font-medium ${on ? "bg-white/25" : "bg-copper/20 text-copper"}`}>{pending}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {error && (
        <p role="alert" className="mt-5 flex items-start gap-2.5 rounded-[18px] border border-signal/40 bg-signal-dim px-4 py-3 text-sm text-signal-soft">
          <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>Les soumissions n&apos;ont pas pu être chargées depuis Supabase. Détail : {error}</span>
        </p>
      )}

      {!error && rows.length === 0 && (
        <div className="glass mt-5 flex items-center gap-4 rounded-[24px] p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-tint/10 bg-tint/[0.05] text-muted"><Inbox size={19} strokeWidth={1.6} aria-hidden="true" /></span>
          <p className="text-sm text-muted">
            {filter === "a-corriger" ? "Aucune soumission en attente : tout est corrigé." : "Aucune soumission dans cette liste pour l'instant."}
          </p>
        </div>
      )}

      <ul className="mt-5 space-y-4">
        {rows.map((s) => {
          const name = s.author?.full_name?.trim() || "Apprenant sans nom";
          const where = s.exercises
            ? { kind: "Exercice", title: s.exercises.title, sub: s.exercises.courses?.title, href: s.exercises.courses ? `/formations/${s.exercises.courses.slug}` : null }
            : { kind: "Challenge", title: s.challenges?.title ?? "Challenge", sub: null, href: s.challenges ? `/challenges/${s.challenges.slug}` : null };
          const reviewed = s.status === "reviewed";
          return (
            <li key={s.id} className="glass rounded-[24px] p-5 sm:p-6">
              <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
                <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-medium text-primary-soft">
                  {name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{name}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {where.kind} : {where.href ? <Link href={where.href} className="text-text hover:text-primary-soft">{where.title}</Link> : where.title}
                    {where.sub && <> · {where.sub}</>}
                  </p>
                </div>
                <div className="text-right text-xs text-muted">
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 font-medium ${reviewed ? "border-ok/35 text-ok-soft" : "border-copper/40 text-copper"}`}>
                    {reviewed ? "Corrigée" : "À corriger"}
                  </span>
                  <p className="tabular mt-1.5">Envoyée le {formatDate(s.created_at)}</p>
                </div>
              </div>

              {(s.fileUrl || s.file_path || s.link_url) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.fileUrl ? (
                    <a href={s.fileUrl} className="inline-flex max-w-full items-center gap-2 rounded-full border border-tint/10 bg-tint/[0.05] px-3.5 py-1.5 text-[13px] transition-colors hover:border-tint/25">
                      <Download size={14} className="shrink-0 text-primary-soft" aria-hidden="true" />
                      <span className="truncate">{s.fileName}</span>
                    </a>
                  ) : s.file_path && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-signal/30 px-3.5 py-1.5 text-[13px] text-signal-soft">
                      Fichier joint inaccessible ({s.fileName})
                    </span>
                  )}
                  {s.link_url && (
                    <a href={s.link_url} target="_blank" rel="noopener noreferrer"
                       className="inline-flex max-w-full items-center gap-2 rounded-full border border-tint/10 bg-tint/[0.05] px-3.5 py-1.5 text-[13px] transition-colors hover:border-tint/25">
                      <ExternalLink size={14} className="shrink-0 text-primary-soft" aria-hidden="true" />
                      <span className="truncate">{s.link_url.replace(/^https?:\/\//, "")}</span>
                      <span className="sr-only">(nouvel onglet)</span>
                    </a>
                  )}
                </div>
              )}

              {s.content && (
                <pre className="mt-4 max-h-56 overflow-auto whitespace-pre-wrap rounded-2xl border border-tint/[0.08] bg-[#070b14] p-4 font-mono text-xs leading-relaxed text-[#e6edf7]">{s.content}</pre>
              )}

              <div className="mt-5 border-t border-tint/[0.07] pt-5">
                {reviewed && s.reviewed_at && <p className="tabular mb-3 text-xs text-muted">Corrigée le {formatDate(s.reviewed_at)}. Vous pouvez modifier la note ou le commentaire.</p>}
                <ReviewForm id={s.id} score={s.score} feedback={s.feedback} reviewed={reviewed} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
