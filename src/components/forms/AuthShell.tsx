import type { ReactNode } from "react";
import { LogoMark } from "@/components/layout/Logo";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div className="pcb-grid absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="absolute left-1/2 top-24 h-72 w-[30rem] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-md flex-col px-4 pb-16 pt-14 sm:px-6 md:pt-20">
        <div className="rise text-center">
          <span className="inline-block"><LogoMark size={44} /></span>
          <h1 className="mt-5 text-[1.9rem] font-semibold tracking-[-0.03em]">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="rise bezel mt-8 shadow-[var(--glass-shadow)]" style={{ ["--d" as string]: "90ms" }}>
          <div className="bezel-core glass p-6 sm:p-7">{children}</div>
        </div>
        {footer && <p className="mt-6 text-center text-sm text-muted">{footer}</p>}
      </div>
    </div>
  );
}
