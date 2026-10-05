"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock } from "lucide-react";
import AddButton from "./AddButton";
import Tile from "./Tile";
import { enlaceTienda, producto, tienda } from "@/lib/data";
import { useCatalogo } from "@/lib/catalogo";
import { eur } from "@/lib/format";

export default function ProductoVivo() {
  const v = useCatalogo();
  const id = useSearchParams().get("id") || "";
  const p = producto(id); const t = p && tienda(p.tiendaId);
  if (!p || !t) return <div className="mx-auto max-w-md px-5 py-20 text-center text-soft">{v ? "Este producto ya no está disponible." : "Cargando…"}<div className="mt-4"><Link href="/buscar/" className="btn-brand">Buscar productos</Link></div></div>;
  return (
    <div className="mx-auto max-w-5xl px-4 pt-4 md:px-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Tile emoji={p.emoji} color={t.color} imagen={p.imagen} alt={p.nombre} className="aspect-square overflow-hidden rounded-3xl" size={140} />
        <div className="flex flex-col">
          <Link href={enlaceTienda(t)} className="text-sm text-brand-400">{t.emoji} {t.nombre}</Link>
          <h1 className="mt-2 font-serif text-3xl font-semibold">{p.nombre}</h1>
          <p className="mt-2 text-2xl font-bold">{eur(p.precio)}</p>
          {p.marca && <p className="mt-1 text-sm text-muted">{p.marca}</p>}
          {p.desc && <p className="mt-3 text-soft">{p.desc}</p>}
          <p className="mt-3 flex items-center gap-1 text-sm text-muted"><Clock size={14} />Te lo llevamos en unos {t.tiempoMin} min</p>
          <div className="mt-6 md:mt-auto"><AddButton id={p.id} big /></div>
          <Link href="/carrito/" className="btn-ghost mt-3 text-center">Ver carrito</Link>
        </div>
      </div>
    </div>
  );
}
