import type { ComponentProps } from "react";

export const inputClass =
  "w-full rounded-[14px] border border-tint/10 bg-well px-3.5 py-2.5 text-sm text-text placeholder:text-muted/80 shadow-[inset_0_1px_2px_var(--inset-shadow)] " +
  "transition-[border-color,box-shadow] duration-200 hover:border-tint/20 " +
  "focus:border-copper focus:outline-none focus:ring-4 focus:ring-copper/15";

export function Field({ label, hint, id, ...props }: ComponentProps<"input"> & { label: string; hint?: string; id: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} aria-describedby={hint ? `${id}-hint` : undefined} {...props} className={inputClass} />
      {hint && <p id={`${id}-hint`} className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function TextArea({ label, id, ...props }: ComponentProps<"textarea"> & { label: string; id: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <textarea id={id} {...props} className={`${inputClass} min-h-24 leading-relaxed`} />
    </div>
  );
}
