import { setCourseStatus, setChallengeStatus, setToolPublished, setUserRole } from "@/app/actions/staff";
import { Button } from "@/components/ui/Button";
import { ReviewForm } from "./ReviewForm";
import { formatDate } from "@/utils/format";

export interface SubmissionRow {
  id: string; content: string | null; link_url: string | null; status: string; score: number | null;
  feedback: string | null; created_at: string;
  profiles: { full_name: string | null } | null;
  exercises: { title: string } | null; challenges: { title: string } | null;
}

export function SubmissionsList({ rows }: { rows: SubmissionRow[] }) {
  if (rows.length === 0) return <p className="text-sm text-muted">Aucune soumission à afficher.</p>;
  return (
    <ul className="space-y-4">
      {rows.map((s) => (
        <li key={s.id} className="rounded-lg border border-line bg-panel p-5">
          <p className="font-medium">{s.exercises?.title ?? s.challenges?.title}</p>
          <p className="text-sm text-muted">{s.profiles?.full_name || "Étudiant"} · {formatDate(s.created_at)} · {s.status === "reviewed" ? "corrigée" : "à corriger"}</p>
          {s.link_url && <p className="mt-2 break-all text-sm"><a href={s.link_url} target="_blank" rel="noopener noreferrer" className="text-copper">{s.link_url}</a></p>}
          {s.content && <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-ink p-3 text-xs">{s.content}</pre>}
          <ReviewForm id={s.id} score={s.score} feedback={s.feedback} />
        </li>
      ))}
    </ul>
  );
}

const STATUS_FR: Record<string, string> = { draft: "Brouillon", published: "Publié", archived: "Archivé", closed: "Clôturé" };

export function CourseStatusTable({ courses }: { courses: { id: string; title: string; status: string }[] }) {
  return (
    <ul className="divide-y divide-line rounded-lg border border-line bg-panel">
      {courses.map((c) => (
        <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="flex-1 text-sm font-medium">{c.title}</span>
          <span className="text-xs text-muted">{STATUS_FR[c.status]}</span>
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
    <ul className="divide-y divide-line rounded-lg border border-line bg-panel">
      {items.map((c) => (
        <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="flex-1 text-sm font-medium">{c.title}</span>
          <span className="text-xs text-muted">{STATUS_FR[c.status]}</span>
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
    <ul className="divide-y divide-line rounded-lg border border-line bg-panel">
      {tools.map((t) => (
        <li key={t.id} className="flex items-center gap-3 px-4 py-3">
          <span className="flex-1 text-sm font-medium">{t.name}</span>
          <span className="text-xs text-muted">{t.published ? "Publié" : "Masqué"}</span>
          <form action={setToolPublished.bind(null, t.id, !t.published)}><Button type="submit" variant="secondary" className="!py-1.5">{t.published ? "Masquer" : "Publier"}</Button></form>
        </li>
      ))}
    </ul>
  );
}

export function UsersTable({ users, me }: { users: { id: string; full_name: string | null; role: string }[]; me: string }) {
  return (
    <ul className="divide-y divide-line rounded-lg border border-line bg-panel">
      {users.map((u) => (
        <li key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="flex-1 text-sm font-medium">{u.full_name || "(sans nom)"}{u.id === me && <span className="ml-2 text-xs text-muted">vous</span>}</span>
          <form action={async (fd: FormData) => { "use server"; await setUserRole(u.id, String(fd.get("role"))); }} className="flex items-center gap-2">
            <label className="sr-only" htmlFor={`role-${u.id}`}>Rôle de {u.full_name}</label>
            <select id={`role-${u.id}`} name="role" defaultValue={u.role} disabled={u.id === me} className="rounded-md border border-line bg-ink px-2 py-1.5 text-sm">
              <option value="student">Étudiant</option><option value="trainer">Formateur</option><option value="admin">Administrateur</option>
            </select>
            {u.id !== me && <Button type="submit" variant="secondary" className="!py-1.5">Appliquer</Button>}
          </form>
        </li>
      ))}
    </ul>
  );
}
