// Squelette affiché pendant le chargement d'une page (données Supabase).
export default function Loading() {
  return (
    <div role="status" aria-label="Chargement de la page">
      <div>
        <div className="mx-auto max-w-6xl space-y-4 px-4 pb-12 pt-16 sm:px-6">
          <div className="skeleton h-10 w-72 max-w-full rounded-lg" />
          <div className="skeleton h-4 w-[28rem] max-w-full rounded" />
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-4 glass rounded-[24px] p-6">
            <div className="skeleton h-6 w-24 rounded-md" />
            <div className="skeleton h-5 w-3/4 rounded" />
            <div className="space-y-2"><div className="skeleton h-3.5 rounded" /><div className="skeleton h-3.5 w-5/6 rounded" /></div>
          </div>
        ))}
      </div>
      <span className="sr-only">Chargement…</span>
    </div>
  );
}
