"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Receipt } from "lucide-react";
import { misPedidos, obtenerPedido } from "@/lib/api";
import type { Pedido } from "@/lib/types";
import { eur } from "@/lib/format";
import { ETIQUETA } from "./OrderView";

export default function OrdersView() {
  const [xs, setXs] = useState<Pedido[] | null>(null);
  useEffect(() => { Promise.all(misPedidos().map((id) => obtenerPedido(id).catch(() => null))).then((r) => setXs(r.filter(Boolean) as Pedido[])); }, []);
  return (
    <div className="mx-auto max-w-2xl px-4 pt-4 md:px-6">
      <h1 className="h-section">Mis pedidos</h1>
      {xs === null ? <p className="mt-6 text-soft">Cargando…</p> : xs.length === 0 ? (
        <div className="panel mt-6 p-8 text-center"><Receipt className="mx-auto text-muted" /><p className="mt-3">Aún no has pedido nada</p><Link href="/buscar/" className="btn-brand mt-4 inline-block">Hacer un mandado</Link></div>
      ) : (
        <div className="mt-4 space-y-3">{xs.map((p) => (
          <Link key={p.id} href={`/pedido/?id=${p.id}`} className="panel flex items-center gap-3 p-4 hover:border-neutral-600">
            <div className="flex-1"><p className="font-medium">Pedido {p.id}</p><p className="text-xs text-muted">{new Date(p.creado).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })} · {eur(p.total)}</p></div>
            <span className={`rounded-full px-2.5 py-1 text-xs ${p.estado === "entregado" ? "bg-card text-soft" : "bg-brand/20 text-brand-400"}`}>{ETIQUETA[p.estado]}</span><ChevronRight size={16} className="text-muted" />
          </Link>))}</div>
      )}
    </div>
  );
}
