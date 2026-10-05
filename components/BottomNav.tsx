"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Home, Receipt, Search, UserRound } from "lucide-react";
const ITEMS = [
  { href: "/", t: "Inicio", I: Home, match: (p: string) => p === "/" },
  { href: "/buscar/", t: "Buscar", I: Search, match: (p: string) => p.startsWith("/buscar") || p.startsWith("/producto") || p.startsWith("/tienda") },
  { href: "/flechazo/", t: "Flechazo", I: Flame, match: (p: string) => p.startsWith("/flechazo") },
  { href: "/pedidos/", t: "Pedidos", I: Receipt, match: (p: string) => p.startsWith("/pedido") },
  { href: "/perfil/", t: "Perfil", I: UserRound, match: (p: string) => p.startsWith("/perfil") || p.startsWith("/repartidor") },
];
export default function BottomNav() {
  const p = usePathname() || "/";
  if (p.startsWith("/pagar")) return null;
  return (
    <nav className="fixed inset-x-0 bottom-4 z-40 flex justify-center md:hidden" aria-label="Navegación principal">
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#231e1a]/95 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,.6)] backdrop-blur">
        {ITEMS.map(({ href, t, I, match }) => {
          const on = match(p);
          return (
            <Link key={t} href={href} aria-label={t} className={`flex h-11 items-center gap-2 rounded-full transition ${on ? "pill-active px-4 font-semibold" : "px-3.5 text-soft"}`}>
              <I size={21} strokeWidth={on ? 2.2 : 1.8} />{on && <span className="text-[14px]">{t}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
