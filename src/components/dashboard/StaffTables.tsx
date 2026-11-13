import { setCourseStatus, setChallengeStatus, setToolPublished, setUserRole } from "@/app/actions/staff";
import { Button } from "@/components/ui/Button";

const STATUS_FR: Record<string, string> = { draft: "Brouillon", published: "Publié", archived: "Archivé", closed: "Clôturé", hidden: "Masqué" };

function StatusPill({ status }: { status: string }) {
  const tone = status === "published" ? "border-ok/35 text-ok-soft" : status === "closed" || status === "archived" ? "border-line-strong text-muted" : "border-copper/35 text-copper";
  return <span className={`rounded-md border px-2 py-0.5 text-xs ${tone}`}>{STATUS_FR[status] ?? status}</span>;
}

export function CourseStatusTable({ courses }: { courses: { id: string; title: string; status: string }[] }) {
  return (
    <ul className="glass divide-y divide-tint/[0.07] overflow-hidden rounded-[24px]">
      {courses.map((c) => (
        <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="flex-1 text-sm font-medium">{c.title}</span>
          <StatusPill status={c.status} />
          {c.status !== "published"
            ? <form action={setCourseStatus.bind(null, c.id, "published")}><Button type="submit" variant="secondary" className="!py-1.5">Publier</Button></form>
            : <form action={setCourseStatus.bind(null, c.id, "draft")}><Button type="submit" variant="secondary" className="!py-1.5">Dépublier</Button></form>}
        </li>
      ))}
      {courses.length === 0 && <li className="px-4 py-3 text-sm text-muted">Aucune formation.</li>}
    </ul>
  );
}

export function ChallengeStatusTable({ items }: { items: { id: string; title: string; status: string }[] }) {
  return (
    <ul className="glass divide-y divide-tint/[0.07] overflow-hidden rounded-[24px]">
      {items.map((c) => (
        <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="flex-1 text-sm font-medium">{c.title}</span>
          <StatusPill status={c.status} />
          {(["draft", "published", "closed"] as const).filter((s) => s !== c.status).map((s) => (
            <form key={s} action={setChallengeStatus.bind(null, c.id, s)}><Button type="submit" variant="secondary" className="!py-1.5">{s === "published" ? "Publier" : s === "closed" ? "Clôturer" : "Brouillon"}</Button></form>
          ))}
        </li>
      ))}
    </ul>
  );
}

export function ToolsTable({ tools }: { tools: { id: string; name: string; published: boolean }[] }) {
  return (
    <ul className="glass divide-y divide-tint/[0.07] overflow-hidden rounded-[24px]">
      {tools.map((t) => (
        <li key={t.id} className="flex items-center gap-3 px-4 py-3">
          <span className="flex-1 text-sm font-medium">{t.name}</span>
          <StatusPill status={t.published ? "published" : "hidden"} />
          <form action={setToolPublished.bind(null, t.id, !t.published)}><Button type="submit" variant="secondary" className="!py-1.5">{t.published ? "Masquer" : "Publier"}</Button></form>
        </li>
      ))}
    </ul>
  );
}

export function UsersTable({ users, me }: { users: { id: string; full_name: string | null; role: string }[]; me: string }) {
  return (
    <ul className="glass divide-y divide-tint/[0.07] overflow-hidden rounded-[24px]">
      {users.map((u) => (
        <li key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="flex-1 text-sm font-medium">{u.full_name || "(sans nom)"}{u.id === me && <span className="ml-2 text-xs text-muted">vous</span>}</span>
          <form action={async (fd: FormData) => { "use server"; await setUserRole(u.id, String(fd.get("role"))); }} className="flex items-center gap-2">
            <label className="sr-only" htmlFor={`role-${u.id}`}>Rôle de {u.full_name}</label>
            <select id={`role-${u.id}`} name="role" defaultValue={u.role} disabled={u.id === me} className="rounded-full border border-tint/10 bg-well px-3 py-1.5 text-sm transition-colors hover:border-line-strong disabled:opacity-60">
              <option value="student">Étudiant</option><option value="trainer">Formateur</option><option value="admin">Administrateur</option>
            </select>
            {u.id !== me && <Button type="submit" variant="secondary" className="!py-1.5">Appliquer</Button>}
          </form>
        </li>
      ))}
    </ul>
  );
}
