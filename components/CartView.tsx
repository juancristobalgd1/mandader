"use client";
import { useCatalogo } from "@/lib/catalogo";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { calcular, TARIFA } from "@/lib/pricing";
import { eur } from "@/lib/format";
import { useCart } from "./useCart";
import AddButton from "./AddButton";
import Tile from "./Tile";

export default function CartView() {
  useCatalogo();
  const { items, clear } = useCart();
  const c = calcular(items);
  if (!c.lineas.length) return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      <ShoppingBag size={42} className="mx-auto text-muted" />
      <p className="mt-4 text-xl font-semibold">Tu carrito está vacío</p>
      <p className="mt-1 text-soft">Busca lo que necesites o recorre los pasillos.</p>
      <div className="mt-6 flex justify-center gap-3"><Link href="/buscar/" className="btn-brand">Buscar</Link><Link href="/" className="btn-ghost">Ver pasillos</Link></div>
    </div>
  );
  return (
    <div className="mx-auto max-w-2xl px-4 pt-4 md:px-6">
      <div className="flex items-center justify-between"><h1 className="h-section">Tu mandado</h1><button onClick={clear} className="flex items-center gap-1 text-sm text-muted hover:text-white"><Trash2 size={15} />Vaciar</button></div>
      {c.tiendas.map((tid) => {
        const ls = c.lineas.filter((l) => l.tienda.id === tid);
        return (
          <section key={tid} className="panel mt-4 p-4">
            <p className="mb-3 text-sm font-semibold">{ls[0].tienda.emoji} {ls[0].tienda.nombre}</p>
            <div className="space-y-3">{ls.map((l) => (
              <div key={l.id} className="flex items-center gap-3">
                <Tile emoji={l.producto.emoji} color={l.tienda.color} imagen={l.producto.imagen} alt={l.producto.nombre} className="h-14 w-14 shrink-0 overflow-hidden rounded-xl" size={28} />
                <div className="min-w-0 flex-1"><p className="truncate text-sm">{l.producto.nombre}</p><p className="text-xs text-muted">{eur(l.producto.precio)} · {eur(l.importe)}</p></div>
                <div className="w-28"><AddButton id={l.id} /></div>
              </div>))}</div>
          </section>
        );
      })}
      <div className="panel mt-4 space-y-2 p-4 text-sm">
        <Fila t="Productos" v={eur(c.subtotal)} />
        <Fila t={`Envío${c.tiendas.length > 1 ? ` (${c.tiendas.length} tiendas)` : ""}`} v={c.envio ? eur(c.envio) : "Gratis"} />
        <Fila t="Gestión" v={eur(c.servicio)} />
        <div className="border-t border-line pt-2"><Fila t="Total" v={eur(c.total)} strong /></div>
        {c.tiendas.length === 1 && c.envio > 0 && <p className="text-xs text-muted">Envío gratis a partir de {eur(TARIFA.gratisDesde)} en una sola tienda.</p>}
      </div>
      {c.faltaMinimo > 0 ? <p className="mt-4 text-center text-sm text-soft">Añade {eur(c.faltaMinimo)} más para llegar al pedido mínimo de {eur(TARIFA.minimo)}.</p>
        : <Link href="/pagar/" className="btn-brand mt-4 block w-full py-3.5 text-center text-base">Continuar · {eur(c.total)}</Link>}
    </div>
  );
}
export function Fila({ t, v, strong = false }: { t: string; v: string; strong?: boolean }) {
  return <div className={`flex justify-between ${strong ? "text-base font-semibold text-white" : "text-soft"}`}><span>{t}</span><span>{v}</span></div>;
}
