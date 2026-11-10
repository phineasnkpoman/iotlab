export function FormMessage({ error, message }: { error?: string; message?: string }) {
  if (!error && !message) return null;
  return (
    <p role={error ? "alert" : "status"}
       className={`rounded-md border px-3 py-2 text-sm ${error ? "border-signal/50 bg-signal-dim text-[#ffb4b6]" : "border-ok/40 bg-ok/10 text-[#9fe0c2]"}`}>
      {error ?? message}
    </p>
  );
}
