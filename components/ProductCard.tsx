import Link from "next/link";
import type { Producto } from "@/lib/types";
import { enlaceProducto, tienda } from "@/lib/data";
import { eur } from "@/lib/format";
import AddButton from "./AddButton";
import Tile from "./Tile";
export default function ProductCard({ p }: { p: Producto }) {
  const t = tienda(p.tiendaId)!;
  return (
    <Link href={enlaceProducto(p)} className="group block overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-neutral-600">
      <Tile emoji={p.emoji} color={t.color} imagen={p.imagen} alt={p.nombre} className="aspect-square" />
      <div className="flex items-end justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="line-clamp-2 min-h-[2.5em] text-[14px] font-medium leading-tight text-white">{p.nombre}</p>
          <p className="mt-0.5 truncate text-xs text-muted">{p.marca || t.nombre}</p>
          <p className="mt-1 font-semibold">{eur(p.precio)}</p>
        </div>
        <AddButton id={p.id} />
      </div>
    </Link>
  );
}
