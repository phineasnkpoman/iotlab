import type { CourseLevel } from "@/types/db";
import { LEVEL_LABEL } from "@/utils/format";

const levelColor: Record<CourseLevel, string> = {
  debutant: "border-ok/50 text-[#8fd9b8]",
  intermediaire: "border-copper/60 text-copper",
  avance: "border-signal/60 text-[#ff9a9c]",
};

export function LevelBadge({ level }: { level: CourseLevel }) {
  return <span className={`rounded border px-2 py-0.5 text-xs font-medium ${levelColor[level]}`}>{LEVEL_LABEL[level]}</span>;
}

export function ProgressBar({ percent, label }: { percent: number; label?: string }) {
  return (
    <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Progression"}
         className="h-1.5 w-full overflow-hidden rounded-full bg-line">
      <div className="h-full rounded-full bg-signal" style={{ width: `${percent}%` }} />
    </div>
  );
}
