import catalog from "../data/catalog.json";
import type { Categoria, Producto, Tienda } from "./types";

export const TIENDAS = catalog.tiendas as Tienda[];
export const PRODUCTOS = catalog.productos as Producto[];
export const tienda = (id: string) => TIENDAS.find((t) => t.id === id);
export const producto = (id: string) => PRODUCTOS.find((p) => p.id === id);
export const deTienda = (id: string) => PRODUCTOS.filter((p) => p.tiendaId === id);

export const CATEGORIAS: { id: Categoria; nombre: string; emoji: string }[] = [
  { id: "comida", nombre: "Comida", emoji: "🍕" },
  { id: "super", nombre: "Súper", emoji: "🛒" },
  { id: "farmacia", nombre: "Farmacia", emoji: "💊" },
  { id: "panaderia", nombre: "Panadería", emoji: "🥖" },
  { id: "fruteria", nombre: "Frutería", emoji: "🍎" },
  { id: "bebidas", nombre: "Bebidas", emoji: "🥤" },
  { id: "hogar", nombre: "Hogar", emoji: "🧰" },
];
export const nombreCategoria = (c: Categoria) => CATEGORIAS.find((x) => x.id === c)?.nombre ?? c;

// ¿Abierta ahora? (hora de Madrid)
export function abierta(t: Tienda, ahora = new Date()) {
  const hm = new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hour12: false }).format(ahora);
  return hm >= t.abre && hm <= t.cierra;
}
