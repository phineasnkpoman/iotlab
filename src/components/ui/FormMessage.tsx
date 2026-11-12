import { CircleAlert, CircleCheck } from "lucide-react";

export function FormMessage({ error, message }: { error?: string; message?: string }) {
  if (!error && !message) return null;
  const Icon = error ? CircleAlert : CircleCheck;
  return (
    <p role={error ? "alert" : "status"}
       className={`flex items-start gap-2 rounded-[14px] border px-3.5 py-2.5 text-sm ${error ? "border-signal/40 bg-signal-dim text-signal-soft" : "border-ok/35 bg-ok/10 text-ok-soft"}`}>
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{error ?? message}</span>
    </p>
  );
}
