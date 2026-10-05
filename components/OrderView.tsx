"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Bike, Check, CreditCard, PackageCheck, ShoppingBasket } from "lucide-react";
import { obtenerPedido, recordarPedido } from "@/lib/api";
import { calcular, ZONAS } from "@/lib/pricing";
import type { EstadoPedido, Pedido } from "@/lib/types";
import { eur } from "@/lib/format";
import { useCart } from "./useCart";

export const PASOS: { e: EstadoPedido; t: string; d: string; I: typeof Check }[] = [
  { e: "pagado", t: "Pagado", d: "Hemos recibido tu pedido", I: CreditCard },
  { e: "comprando", t: "Comprando", d: "Tu repartidor está en la tienda", I: ShoppingBasket },
  { e: "en_camino", t: "En camino", d: "Va hacia tu casa", I: Bike },
  { e: "entregado", t: "Entregado", d: "¡Que aproveche!", I: PackageCheck },
];
export const ETIQUETA: Record<EstadoPedido, string> = { pendiente_pago: "Pendiente de pago", pagado: "Pagado", comprando: "Comprando", en_camino: "En camino", entregado: "Entregado", cancelado: "Cancelado" };

export default function OrderView() {
  const id = useSearchParams().get("id") || "";
  const pagoOk = useSearchParams().get("pago") === "ok";
  const [p, setP] = useState<Pedido | null | undefined>(undefined);
  const { clear } = useCart();
  useEffect(() => { if (pagoOk) clear(); if (id) recordarPedido(id); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id, pagoOk]);
  useEffect(() => {
    if (!id) return setP(null);
    let vivo = true;
    const cargar = () => obtenerPedido(id).then((x) => vivo && setP(x)).catch(() => vivo && setP(null));
    cargar(); const t = setInterval(cargar, 10_000);
    return () => { vivo = false; clearInterval(t); };
  }, [id]);
  if (p === undefined) return <p className="py-20 text-center text-soft">Cargando pedido…</p>;
  if (!p) return <div className="py-20 text-center"><p className="text-soft">No encontramos ese pedido.</p><Link href="/pedidos/" className="btn-ghost mt-4 inline-block">Mis pedidos</Link></div>;
  const idx = PASOS.findIndex((s) => s.e === p.estado);
  const c = calcular(p.items);
  return (
    <div className="mx-auto max-w-2xl px-4 pt-4 md:px-6">
      <p className="eyebrow">Pedido {p.id}{p.demo ? " · demo" : ""}</p>
      <h1 className="h-section mt-1">{p.estado === "pendiente_pago" ? "Esperando el pago" : p.estado === "cancelado" ? "Pedido cancelado" : PASOS[idx]?.d}</h1>
      <ol className="panel mt-5 space-y-4 p-5">
        {PASOS.map((s, i) => {
          const hecho = i <= idx, h = p.historial.find((x) => x.estado === s.e);
          return (
            <li key={s.e} className="flex items-center gap-3">
              <span className={`grid h-10 w-10 place-items-center rounded-full ${hecho ? "bg-brand text-[#2a1204]" : "bg-card text-muted"}`}><s.I size={18} /></span>
              <div className="flex-1"><p className={hecho ? "font-medium" : "text-muted"}>{s.t}</p>{h && <p className="text-xs text-muted">{new Date(Math.abs(h.t)).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</p>}</div>
              {i === idx && p.estado !== "entregado" && <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />}
            </li>
          );
        })}
      </ol>
      <div className="panel mt-4 p-4 text-sm">
        <p className="font-medium">Entrega</p>
        <p className="mt-1 text-soft">{p.entrega.direccion}{p.entrega.piso ? `, ${p.entrega.piso}` : ""} · {ZONAS[p.entrega.cp] ?? p.entrega.cp}</p>
        {p.entrega.notas && <p className="mt-1 text-muted">«{p.entrega.notas}»</p>}
      </div>
      <div className="panel mt-4 space-y-1.5 p-4 text-sm">
        {c.lineas.map((l) => <div key={l.id} className="flex justify-between text-soft"><span>{l.qty} × {l.producto.nombre}</span><span>{eur(l.importe)}</span></div>)}
        <div className="flex justify-between border-t border-line pt-2 font-semibold"><span>Total</span><span>{eur(p.total)}</span></div>
      </div>
    </div>
  );
}
