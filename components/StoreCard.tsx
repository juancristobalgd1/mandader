import Link from "next/link";
import { Clock, Star } from "lucide-react";
import type { Tienda } from "@/lib/types";
import Tile from "./Tile";
export default function StoreCard({ t }: { t: Tienda }) {
  return (
    <Link href={`/tienda/${t.id}/`} className="block w-[230px] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-neutral-600">
      <Tile emoji={t.emoji} color={t.color} className="h-28" size={46} />
      <div className="p-3">
        <p className="truncate font-medium text-white">{t.nombre}</p>
        <p className="mt-1 flex items-center gap-3 text-xs text-muted"><span className="flex items-center gap-1"><Star size={12} className="fill-brand text-brand" />{t.valoracion}</span><span className="flex items-center gap-1"><Clock size={12} />{t.tiempoMin} min</span><span className="truncate">{t.zona}</span></p>
      </div>
    </Link>
  );
}
