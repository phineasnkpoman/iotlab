import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

/** En-tête commun des pages : titre, description, retour éventuel et actions. */
export function PageHeader({ title, description, back, children, narrow = false }: {
  title: ReactNode;
  description?: ReactNode;
  back?: { href: string; label: string };
  children?: ReactNode;
  narrow?: boolean;
}) {
  return (
    <header className="relative">
      <div className={`relative mx-auto px-4 pb-8 pt-12 sm:px-6 md:pb-10 md:pt-16 ${narrow ? "max-w-3xl" : "max-w-6xl"}`}>
        {back && (
          <Link href={back.href} className="group mb-7 inline-flex items-center gap-1.5 rounded-full border border-tint/10 bg-tint/[0.04] py-1.5 pl-2.5 pr-3.5 text-sm text-muted backdrop-blur transition-colors hover:bg-tint/[0.08] hover:text-text">
            <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
            {back.label}
          </Link>
        )}
        <h1 className="rise max-w-3xl text-[2.2rem] font-medium leading-[1.05] tracking-[-0.04em] sm:text-[3rem]">{title}</h1>
        {description && <div className="rise mt-5 max-w-2xl text-[17px] leading-relaxed text-muted" style={{ ["--d" as string]: "80ms" }}>{description}</div>}
        {children && <div className="rise mt-7" style={{ ["--d" as string]: "140ms" }}>{children}</div>}
      </div>
    </header>
  );
}
