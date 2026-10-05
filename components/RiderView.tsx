"use client";
import { useCatalogo } from "@/lib/catalogo";
import { useCallback, useEffect, useState } from "react";
import { MapPin, Phone, RefreshCw } from "lucide-react";
import { cambiarEstado, modoDemo, pedidosRepartidor } from "@/lib/api";
import { calcular, ZONAS } from "@/lib/pricing";
import type { EstadoPedido, Pedido } from "@/lib/types";
import { eur } from "@/lib/format";
import { useLocal } from "./useLocal";
import { ETIQUETA } from "./OrderView";

const SIGUIENTE: Partial<Record<EstadoPedido, [EstadoPedido, string]>> = { pagado: ["comprando", "Voy a comprar"], comprando: ["en_camino", "Salgo hacia la casa"], en_camino: ["entregado", "Entregado"] };

export default function RiderView() {
  useCatalogo();
  const [token, setToken] = useLocal<string>("mandader:rider-token", "");
  const [clave, setClave] = useState("");
  const [xs, setXs] = useState<Pedido[]>([]), [err, setErr] = useState(""), [verTodos, setVerTodos] = useState(false);
  const cargar = useCallback(() => { if (!modoDemo && !token) return; pedidosRepartidor(token).then((r) => { setXs(r); setErr(""); }).catch((e) => setErr(e.message)); }, [token]);
  useEffect(() => { cargar(); const t = setInterval(cargar, 15_000); return () => clearInterval(t); }, [cargar]);
  if (!modoDemo && !token) return (
    <div className="mx-auto max-w-sm px-5 py-16"><h1 className="h-section">Panel de repartidor</h1>
      <form onSubmit={(e) => { e.preventDefault(); setToken(clave.trim()); }} className="mt-6 space-y-3"><input className="input" type="password" placeholder="Clave de repartidor" value={clave} onChange={(e) => setClave(e.target.value)} /><button className="btn-brand w-full">Entrar</button></form></div>
  );
  const activos = xs.filter((p) => verTodos || !["entregado", "cancelado", "pendiente_pago"].includes(p.estado));
  return (
    <div className="mx-auto max-w-3xl px-4 pt-4 md:px-6">
      <div className="flex items-center justify-between"><h1 className="h-section">Pedidos para repartir</h1><button onClick={cargar} aria-label="Actualizar" className="btn-ghost"><RefreshCw size={16} /></button></div>
      {modoDemo && <p className="mt-2 text-xs text-muted">Modo demo: ves los pedidos de prueba hechos desde este móvil.</p>}
      {err && <p className="mt-3 text-sm text-[#ff7a7a]">{err} <button className="underline" onClick={() => setToken("")}>Cambiar clave</button></p>}
      <label className="mt-3 flex items-center gap-2 text-sm text-soft"><input type="checkbox" checked={verTodos} onChange={(e) => setVerTodos(e.target.checked)} />Ver también entregados</label>
      {activos.length === 0 && <p className="panel mt-4 p-6 text-center text-soft">No hay pedidos pendientes.</p>}
      <div className="mt-4 space-y-4">{activos.map((p) => {
        const c = calcular(p.items), sig = SIGUIENTE[p.estado];
        const dir = `${p.entrega.direccion}, ${p.entrega.cp} ${ZONAS[p.entrega.cp] ?? ""}`;
        return (
          <div key={p.id} className="panel p-4">
            <div className="flex items-center justify-between"><p className="font-semibold">{p.id} · {eur(p.total)}</p><span className="rounded-full bg-brand/20 px-2.5 py-1 text-xs text-brand-400">{ETIQUETA[p.estado]}</span></div>
            <p className="mt-1 text-sm text-soft">{p.entrega.nombre} · {p.entrega.cuando === "ya" ? "lo antes posible" : p.entrega.cuando}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a className="chip" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dir)}`} target="_blank" rel="noreferrer"><MapPin size={14} />{p.entrega.direccion}{p.entrega.piso ? `, ${p.entrega.piso}` : ""}</a>
              <a className="chip" href={`tel:${p.entrega.telefono.replace(/\s/g, "")}`}><Phone size={14} />{p.entrega.telefono}</a>
            </div>
            {c.tiendas.map((tid) => { const ls = c.lineas.filter((l) => l.tienda.id === tid); return (
              <div key={tid} className="mt-3 rounded-xl bg-card p-3 text-sm"><p className="font-medium">{ls[0].tienda.emoji} {ls[0].tienda.nombre} <span className="text-xs text-muted">({ls[0].tienda.zona})</span></p>
                <ul className="mt-1 text-soft">{ls.map((l) => <li key={l.id}>{l.qty} × {l.producto.nombre}</li>)}</ul></div>); })}
            {p.entrega.notas && <p className="mt-3 rounded-xl border border-brand/30 bg-brand/10 p-3 text-sm">📝 {p.entrega.notas}</p>}
            {sig && <button onClick={() => cambiarEstado(token, p.id, sig[0]).then(cargar).catch((e) => setErr(e.message))} className="btn-brand mt-4 w-full py-3">{sig[1]}</button>}
          </div>
        );
      })}</div>
    </div>
  );
}
