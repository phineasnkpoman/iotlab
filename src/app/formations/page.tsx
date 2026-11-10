import type { Metadata } from "next";
import { Search } from "lucide-react";
import { listCategories, listCourses } from "@/services/catalog";
import { CourseCard } from "@/components/courses/CourseCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button, LinkButton } from "@/components/ui/Button";
import { LEVEL_LABEL } from "@/utils/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Formations" };

const select = "rounded-md border border-line bg-ink px-3 py-2.5 text-sm";

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ q?: string; niveau?: string; categorie?: string; tri?: string }> }) {
  const sp = await searchParams;
  const [courses, categories] = await Promise.all([
    listCourses({ q: sp.q, level: sp.niveau, category: sp.categorie, sort: sp.tri }),
    listCategories(),
  ]);
  const filtered = Boolean(sp.q || sp.niveau || sp.categorie);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Formations</h1>
      <p className="mt-2 max-w-2xl text-muted">Des parcours progressifs, du premier montage aux projets connectés.</p>

      <form method="get" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]" role="search">
        <label className="relative">
          <span className="sr-only">Rechercher une formation</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={sp.q} placeholder="Rechercher…" className={`${select} w-full pl-9`} />
        </label>
        <select name="niveau" defaultValue={sp.niveau ?? ""} aria-label="Niveau" className={select}>
          <option value="">Tous les niveaux</option>
          {Object.entries(LEVEL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select name="categorie" defaultValue={sp.categorie ?? ""} aria-label="Catégorie" className={select}>
          <option value="">Toutes les catégories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select name="tri" defaultValue={sp.tri ?? ""} aria-label="Tri" className={select}>
          <option value="">Plus récentes</option>
          <option value="duree">Durée croissante</option>
          <option value="titre">Ordre alphabétique</option>
        </select>
        <Button type="submit">Filtrer</Button>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
      {courses.length === 0 && (
        <div className="mt-8">
          <EmptyState title={filtered ? "Aucune formation ne correspond à ces critères" : "Aucune formation publiée"}>
            {filtered ? <LinkButton href="/formations" variant="secondary">Réinitialiser les filtres</LinkButton>
              : isSupabaseConfigured ? "Revenez bientôt." : "Supabase n'est pas encore configuré (voir README)."}
          </EmptyState>
        </div>
      )}
    </div>
  );
}
