import catalog from "../data/catalog.json";
import type { Categoria, Producto, Tienda } from "./types";

// Catálogo fijo (el que se genera al publicar la web)
export const TIENDAS = catalog.tiendas as Tienda[];
export const PRODUCTOS = catalog.productos as Producto[];
export const ACTUALIZADO: string | undefined = (catalog as { actualizado?: string }).actualizado;

// Tiendas y productos que suben los comercios desde el panel (llegan del servidor o, en demo, del móvil)
let EXTRA_T: Tienda[] = [];
let EXTRA_P: Producto[] = [];
export function registrarExtras(tiendas: Tienda[], productos: Producto[]) {
  EXTRA_T = tiendas.map((t) => ({ ...t, local: true }));
  EXTRA_P = productos.map((p) => ({ ...p, local: true }));
}
export const extras = () => EXTRA_P;
export const todasTiendas = () => [...EXTRA_T, ...TIENDAS];
export const todosProductos = () => [...EXTRA_P, ...PRODUCTOS];

export const tienda = (id: string) => TIENDAS.find((t) => t.id === id) ?? EXTRA_T.find((t) => t.id === id);
export const producto = (id: string) => PRODUCTOS.find((p) => p.id === id) ?? EXTRA_P.find((p) => p.id === id);
export const deTienda = (id: string) => todosProductos().filter((p) => p.tiendaId === id && !p.agotado);
export const deCategoria = (c: Categoria) => todosProductos().filter((p) => p.categoria === c && !p.agotado);
export const enlaceProducto = (p: Producto) => (p.local ? `/p/?id=${encodeURIComponent(p.id)}` : `/producto/${p.id}/`);
export const enlaceTienda = (t: Tienda) => (t.local ? `/buscar/?tienda=${encodeURIComponent(t.id)}` : `/tienda/${t.id}/`);

// Pasillos del súper
export const CATEGORIAS: { id: Categoria; nombre: string; emoji: string }[] = [
  { id: "frescos", nombre: "Frescos", emoji: "🥬" },
  { id: "lacteos", nombre: "Lácteos y huevos", emoji: "🥛" },
  { id: "despensa", nombre: "Despensa", emoji: "🥫" },
  { id: "panaderia", nombre: "Panadería", emoji: "🥖" },
  { id: "bebidas", nombre: "Bebidas", emoji: "🥤" },
  { id: "congelados", nombre: "Congelados", emoji: "🧊" },
  { id: "limpieza", nombre: "Limpieza y hogar", emoji: "🧽" },
  { id: "higiene", nombre: "Higiene", emoji: "🧴" },
  { id: "bebe", nombre: "Bebé", emoji: "👶" },
  { id: "mascotas", nombre: "Mascotas", emoji: "🐾" },
];
export const nombreCategoria = (c: Categoria) => CATEGORIAS.find((x) => x.id === c)?.nombre ?? c;
export const emojiCategoria = (c: Categoria) => CATEGORIAS.find((x) => x.id === c)?.emoji ?? "🛒";
