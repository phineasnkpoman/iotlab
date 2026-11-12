import Image from "next/image";
import Link from "next/link";

export function LogoMark({ size = 32 }: { size?: number }) {
  return <Image src="/logo.png" alt="" width={size} height={size} priority className="rounded-full ring-1 ring-tint/15" />;
}

export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-full" aria-label="IoT LAB ESATIC, accueil">
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-[-0.01em]">IoT LAB <span className="font-normal text-muted">ESATIC</span></span>
    </Link>
  );
}
