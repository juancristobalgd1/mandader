import type { Entrega, EstadoPedido, LineaPedido, Pedido } from "./types";
import { calcular } from "./pricing";

// Si NEXT_PUBLIC_API_URL está vacío la web funciona en modo demo: pedidos y pagos simulados en el móvil.
export const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
export const modoDemo = !API;

const LS = "mandader:pedidos-demo";
const leerDemo = (): Pedido[] => { try { return JSON.parse(localStorage.getItem(LS) || "[]"); } catch { return []; } };
const guardarDemo = (xs: Pedido[]) => localStorage.setItem(LS, JSON.stringify(xs.slice(0, 100)));
const nuevoId = () => Math.random().toString(36).slice(2, 8).toUpperCase() + Date.now().toString(36).slice(-4).toUpperCase();

export function recordarPedido(id: string) {
  try { const s: string[] = JSON.parse(localStorage.getItem("mandader:mis-pedidos") || "[]"); if (!s.includes(id)) localStorage.setItem("mandader:mis-pedidos", JSON.stringify([id, ...s].slice(0, 50))); } catch {}
}
export const misPedidos = (): string[] => { try { return JSON.parse(localStorage.getItem("mandader:mis-pedidos") || "[]"); } catch { return []; } };

// Crea el pedido. Con servidor devuelve la URL de pago de Stripe; en demo, el id del pedido ya «pagado».
export async function crearPedido(items: LineaPedido[], entrega: Entrega): Promise<{ id: string; pagoUrl?: string }> {
  if (!modoDemo) {
    const r = await fetch(`${API}/api/checkout`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, entrega, origen: location.origin + (process.env.NEXT_PUBLIC_BASE_PATH ?? "") }) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "No se pudo crear el pedido");
    recordarPedido(j.id);
    return { id: j.id, pagoUrl: j.url };
  }
  const c = calcular(items);
  const ahora = Date.now();
  const p: Pedido = { id: nuevoId(), creado: ahora, estado: "pagado", items, entrega, subtotal: c.subtotal, envio: c.envio, servicio: c.servicio, total: c.total, historial: [{ estado: "pagado", t: ahora }], demo: true };
  guardarDemo([p, ...leerDemo()]);
  recordarPedido(p.id);
  return { id: p.id };
}

// En demo el pedido avanza solo con el tiempo, salvo que el panel de repartidor lo mueva a mano.
const PASOS: [EstadoPedido, number][] = [["pagado", 0], ["comprando", 60_000], ["en_camino", 4 * 60_000], ["entregado", 12 * 60_000]];
function avanceDemo(p: Pedido): Pedido {
  if (p.historial.some((h) => h.t < 0) || p.estado === "cancelado") return p; // control manual
  const dt = Date.now() - p.creado;
  const hist = PASOS.filter(([, ms]) => dt >= ms).map(([estado, ms]) => ({ estado, t: p.creado + ms }));
  return { ...p, estado: hist[hist.length - 1].estado, historial: hist };
}

export async function obtenerPedido(id: string): Promise<Pedido | null> {
  if (!modoDemo) { const r = await fetch(`${API}/api/pedidos/${encodeURIComponent(id)}`); return r.ok ? r.json() : null; }
  const p = leerDemo().find((x) => x.id === id);
  return p ? avanceDemo(p) : null;
}

// ---- Repartidor ----
export async function pedidosRepartidor(token: string): Promise<Pedido[]> {
  if (!modoDemo) {
    const r = await fetch(`${API}/api/repartidor/pedidos`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.status === 401) throw new Error("Clave de repartidor incorrecta");
    return r.json();
  }
  return leerDemo().map(avanceDemo);
}
export async function cambiarEstado(token: string, id: string, estado: EstadoPedido) {
  if (!modoDemo) {
    const r = await fetch(`${API}/api/repartidor/pedidos/${encodeURIComponent(id)}/estado`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ estado }) });
    if (!r.ok) throw new Error("No se pudo actualizar");
    return;
  }
  const xs = leerDemo().map((p) => p.id === id ? { ...avanceDemo(p), estado, historial: [...avanceDemo(p).historial, { estado, t: -Date.now() }] } : p);
  guardarDemo(xs);
}
