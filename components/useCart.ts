"use client";
import { useLocal } from "./useLocal";
export type Carrito = Record<string, number>;
const KEY = "mandader:carrito";
const leer = (): Carrito => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
export function useCart() {
  const [c, setC] = useLocal<Carrito>(KEY, {});
  // Lee siempre lo último guardado para no pisar cambios de otro componente
  const add = (id: string, n = 1) => { const cur = leer(); const q = (cur[id] || 0) + n; if (q <= 0) delete cur[id]; else cur[id] = Math.min(50, q); setC({ ...cur }); };
  const items = Object.entries(c).map(([id, qty]) => ({ id, qty }));
  return { carrito: c, add, clear: () => setC({}), items, count: items.reduce((s, i) => s + i.qty, 0), qty: (id: string) => c[id] || 0 };
}
