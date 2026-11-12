import { CircuitBoard, Cpu, Server, Wifi } from "lucide-react";
import type { BoardIcon as IconName } from "@/data/boards";

const ICONS = { cpu: Cpu, circuit: CircuitBoard, wifi: Wifi, server: Server } as const;

/** Pastille arrondie teintée de la couleur du circuit imprimé, avec l'icône de la carte. */
export function BoardIcon({ name, swatch, size = "md" }: { name: IconName; swatch: string; size?: "sm" | "md" }) {
  const Icon = ICONS[name];
  const box = size === "sm" ? "h-9 w-9 rounded-[11px]" : "h-11 w-11 rounded-[14px]";
  return (
    <span aria-hidden="true"
          className={`relative grid shrink-0 place-items-center text-white ring-1 ring-inset ring-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_6px_16px_-6px_rgb(0_0_0/0.45)] ${box}`}
          style={{ background: `linear-gradient(145deg, color-mix(in srgb, ${swatch} 78%, white), ${swatch} 55%, color-mix(in srgb, ${swatch} 70%, black))` }}>
      <Icon size={size === "sm" ? 16 : 19} strokeWidth={1.7} />
    </span>
  );
}
