import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { ZONAS } from "@/lib/pricing";
export default function Footer() {
  return (
    <footer className="mx-auto mt-24 max-w-7xl border-t border-line px-5 py-10 text-sm text-muted md:px-6">
      <div className="flex flex-col justify-between gap-6 md:flex-row">
        <div><p className="font-semibold text-white">{BRAND.name}</p><p className="mt-1">{BRAND.tagline}. Repartimos en {Object.values(ZONAS).join(", ")}.</p></div>
        <div className="flex flex-wrap gap-4"><Link href="/repartidor/" className="hover:text-white">Panel de repartidor</Link><Link href="/tiendas/" className="hover:text-white">Tiendas</Link><a href={`mailto:${BRAND.email}`} className="hover:text-white">{BRAND.email}</a></div>
      </div>
    </footer>
  );
}
