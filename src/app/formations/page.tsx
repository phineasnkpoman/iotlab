import type { Metadata } from "next";
import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import { listCategories, listCourses } from "@/services/catalog";
import { CourseCard } from "@/components/courses/CourseCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button, LinkButton } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { inputClass } from "@/components/ui/Field";
import { LEVEL_LABEL } from "@/utils/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Formations" };

const select = `${inputClass} !rounded-full appearance-none pr-9 cursor-pointer`;

function Select({ children, ...props }: React.ComponentProps<"select">) {
  return (
    <span className="relative">
      <select {...props} className={select}>{children}</select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
    </span>
  );
}

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ q?: string; niveau?: string; categorie?: string; tri?: string }> }) {
  const sp = await searchParams;
  const [courses, categories] = await Promise.all([
    listCourses({ q: sp.q, level: sp.niveau, category: sp.categorie, sort: sp.tri }),
    listCategories(),
  ]);
  const filtered = Boolean(sp.q || sp.niveau || sp.categorie);

  return (
    <>
      <PageHeader title="Formations" description="Des parcours progressifs, du premier montage aux projets connectés.">
        <form method="get" className="grid gap-2.5 glass-strong rounded-[28px] p-2.5 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]" role="search">
          <label className="relative">
            <span className="sr-only">Rechercher une formation</span>
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input name="q" type="search" defaultValue={sp.q} placeholder="Rechercher une formation…" className={`${inputClass} !rounded-full pl-10`} />
          </label>
          <Select name="niveau" defaultValue={sp.niveau ?? ""} aria-label="Niveau">
            <option value="">Tous les niveaux</option>
            {Object.entries(LEVEL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <Select name="categorie" defaultValue={sp.categorie ?? ""} aria-label="Catégorie">
            <option value="">Toutes les catégories</option>
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </Select>
          <Select name="tri" defaultValue={sp.tri ?? ""} aria-label="Tri">
            <option value="">Plus récentes</option>
            <option value="duree">Durée croissante</option>
            <option value="titre">Ordre alphabétique</option>
          </Select>
          <Button type="submit">Filtrer</Button>
        </form>
      </PageHeader>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {courses.length > 0 && (
          <p className="tabular mb-5 text-sm text-muted" aria-live="polite">
            {courses.length} formation{courses.length > 1 ? "s" : ""}{filtered && " correspondant à votre recherche"}
            {filtered && <> · <Link href="/formations" className="text-copper hover:underline">effacer les filtres</Link></>}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
        {courses.length === 0 && (
          <EmptyState title={filtered ? "Aucune formation ne correspond à ces critères" : "Aucune formation publiée"}>
            {filtered ? <LinkButton href="/formations" variant="secondary">Réinitialiser les filtres</LinkButton>
              : isSupabaseConfigured ? "Revenez bientôt." : "Supabase n'est pas encore configuré (voir README)."}
          </EmptyState>
        )}
      </div>
    </>
  );
}
