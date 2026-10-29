import Image from "next/image";
import Link from "next/link";

export function Logo({ href = "/", light = false, compact = false }: { href?: string; light?: boolean; compact?: boolean }) {
  const size = compact ? 28 : 36;
  return (
    <Link href={href} className={`site-logo${light ? " is-light" : ""}${compact ? " is-compact" : ""}`} aria-label="O Destaque">
      <Image
        src="/logo-globe.png"
        alt=""
        width={size}
        height={size}
        className="site-logo__globe"
        priority
      />
      <span className="site-logo__o">O</span>
      <span className="site-logo__name">DESTAQUE</span>
    </Link>
  );
}
