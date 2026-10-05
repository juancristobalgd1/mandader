import { notFound } from "next/navigation";
import { Clock, MapPin } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import Carousel from "@/components/Carousel";
import { CATEGORIAS, TIENDAS, deTienda, tienda } from "@/lib/data";
export const generateStaticParams = () => TIENDAS.map((t) => ({ id: t.id }));
export function generateMetadata({ params }: { params: { id: string } }) { return { title: tienda(params.id)?.nombre ?? "Tienda" }; }
export default function Page({ params }: { params: { id: string } }) {
  const t = tienda(params.id); if (!t) notFound();
  const ps = deTienda(t.id);
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 pt-4 md:px-6">
      <div><h1 className="h-section">{t.emoji} {t.nombre}</h1>
        <p className="mt-2 flex flex-wrap gap-4 text-sm text-soft"><span className="flex items-center gap-1"><Clock size={14} />{t.tiempoMin} min</span><span className="flex items-center gap-1"><MapPin size={14} />{t.zona}</span><span>{ps.length} productos</span></p></div>
      {CATEGORIAS.map((c) => { const xs = ps.filter((p) => p.categoria === c.id); if (!xs.length) return null; return (
        <section key={c.id}><SectionHeader eyebrow={`${xs.length} productos`} title={`${c.emoji} ${c.nombre}`} href={`/buscar/?cat=${c.id}`} />
          <Carousel>{xs.slice(0, 14).map((p) => <div key={p.id} className="w-[160px] shrink-0 snap-start md:w-[190px]"><ProductCard p={p} /></div>)}</Carousel></section>); })}
    </div>
  );
}
