import Image from "next/image";
import Link from "next/link";

export function LogoMark({ size = 32 }: { size?: number }) {
  return <Image src="/logo.png" alt="" width={size} height={size} priority className="rounded-lg" />;
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="IoT LAB ESATIC, accueil">
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight">IoT LAB <span className="text-muted font-normal">ESATIC</span></span>
    </Link>
  );
}
