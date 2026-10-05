import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import AddButton from "@/components/AddButton";
import ProductCard from "@/components/ProductCard";
import Tile from "@/components/Tile";
import { PRODUCTOS, deTienda, producto, tienda } from "@/lib/data";
import { eur } from "@/lib/format";
export const generateStaticParams = () => PRODUCTOS.map((p) => ({ id: p.id }));
export function generateMetadata({ params }: { params: { id: string } }) { return { title: producto(params.id)?.nombre ?? "Producto" }; }
export default function Page({ params }: { params: { id: string } }) {
  const p = producto(params.id); if (!p) notFound();
  const t = tienda(p.tiendaId)!;
  const mas = deTienda(t.id).filter((x) => x.id !== p.id && x.categoria === p.categoria).slice(0, 5);
  return (
    <div className="mx-auto max-w-5xl px-4 pt-4 md:px-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Tile emoji={p.emoji} color={t.color} imagen={p.imagen} alt={p.nombre} className="aspect-square overflow-hidden rounded-3xl" size={140} />
        <div className="flex flex-col">
          <Link href={`/tienda/${t.id}/`} className="text-sm text-brand-400">{t.emoji} {t.nombre}</Link>
          <h1 className="mt-2 font-serif text-3xl font-semibold">{p.nombre}</h1>
          <p className="mt-2 text-2xl font-bold">{eur(p.precio)}</p>
          {p.marca && <p className="mt-1 text-sm text-muted">{p.marca}</p>}
          <p className="mt-3 text-soft">{p.desc}</p>
          <p className="mt-2 text-xs text-muted">Precio de referencia de {t.nombre} online; en tienda puede variar.</p>
          <p className="mt-3 flex items-center gap-1 text-sm text-muted"><Clock size={14} />Te lo llevamos en unos {t.tiempoMin} min</p>
          <div className="mt-4 flex flex-wrap gap-2">{p.tags.filter((x) => x !== "+18").slice(0, 5).map((x) => <span key={x} className="chip">{x}</span>)}</div>
          <div className="mt-6 md:mt-auto"><AddButton id={p.id} big /></div>
          <Link href="/carrito/" className="btn-ghost mt-3 text-center">Ver carrito</Link>
        </div>
      </div>
      {mas.length > 0 && <><h2 className="mt-12 text-lg font-semibold">En el mismo pasillo</h2><div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">{mas.map((x) => <ProductCard key={x.id} p={x} />)}</div></>}
    </div>
  );
}
