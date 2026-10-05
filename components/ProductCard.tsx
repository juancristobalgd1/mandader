import Link from "next/link";
import type { Producto } from "@/lib/types";
import { tienda } from "@/lib/data";
import { eur } from "@/lib/format";
import AddButton from "./AddButton";
import Tile from "./Tile";
export default function ProductCard({ p }: { p: Producto }) {
  const t = tienda(p.tiendaId)!;
  return (
    <Link href={`/producto/${p.id}/`} className="group block overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-neutral-600">
      <Tile emoji={p.emoji} color={t.color} className="aspect-[4/3]" />
      <div className="flex items-end justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium text-white">{p.nombre}</p>
          <p className="truncate text-xs text-muted">{t.nombre} · {t.tiempoMin} min</p>
          <p className="mt-1 font-semibold">{eur(p.precio)}</p>
        </div>
        <AddButton id={p.id} />
      </div>
    </Link>
  );
}
