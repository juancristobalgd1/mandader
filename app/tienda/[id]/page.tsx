import { notFound } from "next/navigation";
import { Clock, MapPin, Star } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Tile from "@/components/Tile";
import { TIENDAS, deTienda, tienda } from "@/lib/data";
export const generateStaticParams = () => TIENDAS.map((t) => ({ id: t.id }));
export function generateMetadata({ params }: { params: { id: string } }) { return { title: tienda(params.id)?.nombre ?? "Tienda" }; }
export default function Page({ params }: { params: { id: string } }) {
  const t = tienda(params.id); if (!t) notFound();
  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 md:px-6">
      <Tile emoji={t.emoji} color={t.color} className="h-40 rounded-3xl" size={70} />
      <h1 className="h-section mt-4">{t.nombre}</h1>
      <p className="mt-2 flex flex-wrap gap-4 text-sm text-soft"><span className="flex items-center gap-1"><Star size={14} className="fill-brand text-brand" />{t.valoracion}</span><span className="flex items-center gap-1"><Clock size={14} />{t.tiempoMin} min · abre {t.abre}-{t.cierra}</span><span className="flex items-center gap-1"><MapPin size={14} />{t.zona}</span></p>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">{deTienda(t.id).map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </div>
  );
}
