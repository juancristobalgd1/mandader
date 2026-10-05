"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import CartButton from "./CartButton";
import { BRAND } from "@/lib/brand";

export default function Header() {
  const path = usePathname() || "/";
  const isHome = path === "/";
  if (path.startsWith("/flechazo")) return null;
  return (
    <header className={`${isHome ? "absolute inset-x-0 top-0 bg-transparent" : "sticky top-0 bg-bg/95 backdrop-blur"} z-40`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-6">
        <Logo big />
        <nav className="hidden items-center gap-6 text-sm text-soft md:flex">
          <Link href="/buscar/" className="hover:text-white">Buscar</Link>
          <Link href="/flechazo/" className="hover:text-white">Modo flechazo</Link>
          <Link href="/pedidos/" className="hover:text-white">Mis pedidos</Link>
          <Link href="/repartidor/" className="hover:text-white">Repartidor</Link>
        </nav>
        <div className="flex items-center gap-3"><span className="hidden text-xs text-muted lg:block">{BRAND.city}</span><CartButton /></div>
      </div>
    </header>
  );
}
