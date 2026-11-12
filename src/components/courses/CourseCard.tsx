import Link from "next/link";
import { Clock, BookOpen, ArrowUpRight } from "lucide-react";
import type { Course } from "@/types/db";
import { formatDuration } from "@/utils/format";
import { LevelBadge } from "@/components/ui/Badge";
import { Tilt } from "@/components/fx/Tilt";

export function CourseCard({ course }: { course: Course }) {
  const lessons = course.lessons?.[0]?.count ?? 0;
  return (
    <Tilt className="glass group h-full overflow-hidden rounded-[24px] transition-[border-color,box-shadow] duration-500 hover:border-tint/20">
      {/* Piste cuivre qui s'allume au survol */}
      <span className="absolute inset-x-8 top-0 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-copper to-transparent transition-transform duration-700 ease-[var(--ease-spring)] group-hover:scale-x-100" aria-hidden="true" />
      <Link href={`/formations/${course.slug}`} className="relative flex h-full flex-col rounded-[24px] p-6">
        <div className="flex items-center justify-between gap-2">
          <LevelBadge level={course.level} />
          {course.categories?.name && <span className="truncate text-xs text-muted">{course.categories.name}</span>}
        </div>
        <h3 className="mt-6 text-[1.15rem] font-medium leading-snug tracking-[-0.02em]">{course.title}</h3>
        <p className="mb-7 mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{course.description}</p>
        <div className="mt-auto flex items-center gap-4 border-t border-tint/[0.07] pt-4 text-xs text-muted">
          <span className="tabular inline-flex items-center gap-1.5"><Clock size={14} aria-hidden="true" />{formatDuration(course.duration_minutes)}</span>
          <span className="tabular inline-flex items-center gap-1.5"><BookOpen size={14} aria-hidden="true" />{lessons} leçon{lessons > 1 ? "s" : ""}</span>
          <span className="ml-auto grid h-8 w-8 place-items-center rounded-full border border-tint/10 bg-tint/[0.04] text-muted transition-[transform,color,background-color] duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-tint/10 group-hover:text-text" aria-hidden="true">
            <ArrowUpRight size={15} />
          </span>
        </div>
      </Link>
    </Tilt>
  );
}
