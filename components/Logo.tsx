import Link from "next/link";
import { BRAND } from "@/lib/brand";
export default function Logo({ big = false }: { big?: boolean }) {
  const s = big ? 32 : 24;
  return (
    <Link href="/" className="flex items-center gap-2 text-white" aria-label={`${BRAND.name}, inicio`}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M5 8h14l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3L5 8Z" fill="#ff8a3d" />
        <path d="M9 10V7a3 3 0 0 1 6 0v3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className={`${big ? "text-[26px]" : "text-xl"} font-bold tracking-tight text-[#ffd9b8]`}>{BRAND.name}</span>
    </Link>
  );
}
