import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="glass relative overflow-hidden rounded-[24px] px-6 py-14 text-center">
      <div className="pcb-grid absolute inset-0 opacity-25" aria-hidden="true" />
      <div className="relative">
        <span className="mx-auto mb-4 flex h-2 w-16 items-center" aria-hidden="true">
          <span className="h-px flex-1 bg-line-strong" />
          <span className="mx-1.5 h-2 w-2 rounded-full border border-copper" />
          <span className="h-px flex-1 border-t border-dashed border-line-strong" />
        </span>
        <p className="font-medium">{title}</p>
        {children && <div className="mx-auto mt-2 flex max-w-md flex-col items-center gap-4 text-sm text-muted">{children}</div>}
      </div>
    </div>
  );
}
