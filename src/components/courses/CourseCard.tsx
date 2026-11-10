import Link from "next/link";
import { Clock, BookOpen } from "lucide-react";
import type { Course } from "@/types/db";
import { formatDuration } from "@/utils/format";
import { LevelBadge } from "@/components/ui/Badge";

export function CourseCard({ course }: { course: Course }) {
  const lessons = course.lessons?.[0]?.count ?? 0;
  return (
    <Link href={`/formations/${course.slug}`}
          className="group flex flex-col rounded-lg border border-line bg-panel p-5 transition-colors hover:border-copper/60">
      <div className="flex items-center justify-between gap-2">
        <LevelBadge level={course.level} />
        {course.categories?.name && <span className="text-xs text-muted">{course.categories.name}</span>}
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-snug group-hover:text-white">{course.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted">{course.description}</p>
      <div className="mt-auto flex items-center gap-4 pt-5 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5"><Clock size={14} />{formatDuration(course.duration_minutes)}</span>
        <span className="inline-flex items-center gap-1.5"><BookOpen size={14} />{lessons} leçon{lessons > 1 ? "s" : ""}</span>
      </div>
    </Link>
  );
}
