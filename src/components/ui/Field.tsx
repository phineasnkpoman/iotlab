import type { ComponentProps } from "react";

const inputClass =
  "w-full rounded-md border border-line bg-ink px-3 py-2.5 text-sm text-text placeholder:text-muted/70 focus:border-copper";

export function Field({ label, hint, id, ...props }: ComponentProps<"input"> & { label: string; hint?: string; id: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} {...props} className={inputClass} />
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function TextArea({ label, id, ...props }: ComponentProps<"textarea"> & { label: string; id: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <textarea id={id} {...props} className={inputClass} />
    </div>
  );
}
