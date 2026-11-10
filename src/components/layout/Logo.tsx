import Link from "next/link";

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="7" y="7" width="18" height="18" rx="2" fill="none" stroke="#e5383b" strokeWidth="2" />
      <circle cx="16" cy="16" r="3" fill="#e5383b" />
      {[11, 16, 21].map((p) => (
        <g key={p} stroke="#d9a441" strokeWidth="2" strokeLinecap="round">
          <line x1={p} y1="7" x2={p} y2="3" /><line x1={p} y1="25" x2={p} y2="29" />
          <line x1="7" y1={p} x2="3" y2={p} /><line x1="25" y1={p} x2="29" y2={p} />
        </g>
      ))}
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="IoT LAB ESATIC, accueil">
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight">IoT LAB <span className="text-muted font-normal">ESATIC</span></span>
    </Link>
  );
}
