import type { CourseLevel } from "@/types/db";
import { LEVEL_LABEL } from "@/utils/format";

// Le niveau s'affiche comme un indicateur de signal : 1, 2 ou 3 barres allumées.
const levelStyle: Record<CourseLevel, { text: string; bar: string; bars: number }> = {
  debutant: { text: "text-ok-soft", bar: "bg-ok", bars: 1 },
  intermediaire: { text: "text-copper", bar: "bg-copper", bars: 2 },
  avance: { text: "text-signal-soft", bar: "bg-signal", bars: 3 },
};

export function LevelBadge({ level }: { level: CourseLevel }) {
  const s = levelStyle[level];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border border-tint/10 bg-well px-2.5 py-1 text-xs font-medium backdrop-blur ${s.text}`}>
      <span className="flex h-2.5 items-end gap-[2px]" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`w-[3px] rounded-[1px] ${n <= s.bars ? s.bar : "bg-line-strong"}`} style={{ height: `${n * 33}%` }} />
        ))}
      </span>
      {LEVEL_LABEL[level]}
    </span>
  );
}

export function ProgressBar({ percent, label }: { percent: number; label?: string }) {
  return (
    <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Progression"}
         className="h-1.5 w-full overflow-hidden rounded-full bg-line">
      <div className="h-full origin-left rounded-full bg-primary transition-transform duration-700 ease-out"
           style={{ transform: `scaleX(${Math.min(100, Math.max(0, percent)) / 100})` }} />
    </div>
  );
}
