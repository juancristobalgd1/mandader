import catalog from "../data/catalog.json";
import type { Categoria, Producto, Tienda, TipoLocal } from "./types";

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
  { id: "platos", nombre: "Platos y menús", emoji: "🍽️" },
  { id: "postres", nombre: "Postres", emoji: "🍰" },
];

// Tipos de local (secciones de la portada) y los pasillos que tiene cada uno
export const TIPOS: { id: TipoLocal; nombre: string; corto: string; emoji: string; desc: string }[] = [
  { id: "super", nombre: "Súper y mercados", corto: "Súper", emoji: "🛒", desc: "La compra de la semana" },
  { id: "restaurante", nombre: "Restaurantes", corto: "Comida", emoji: "🍔", desc: "Comida hecha, caliente a casa" },
  { id: "tienda", nombre: "Tiendas del pueblo", corto: "Tiendas", emoji: "🏪", desc: "Frutería, carnicería, panadería…" },
];
export const PASILLOS: Record<TipoLocal, Categoria[]> = {
  super: ["frescos", "lacteos", "despensa", "panaderia", "bebidas", "congelados", "limpieza", "higiene", "bebe", "mascotas"],
  restaurante: ["platos", "postres", "bebidas"],
  tienda: ["frescos", "panaderia", "lacteos", "despensa", "bebidas", "limpieza", "higiene", "mascotas"],
};
export const tipoDe = (t?: Tienda) => t?.tipo ?? "super";
export const nombreTipo = (x: TipoLocal) => TIPOS.find((t) => t.id === x)?.nombre ?? x;
export const tiendasDeTipo = (x: TipoLocal) => todasTiendas().filter((t) => tipoDe(t) === x);
export const deTipo = (x: TipoLocal, ps: Producto[]) => ps.filter((p) => tipoDe(tienda(p.tiendaId)) === x);
export const nombreCategoria = (c: Categoria) => CATEGORIAS.find((x) => x.id === c)?.nombre ?? c;
export const emojiCategoria = (c: Categoria) => CATEGORIAS.find((x) => x.id === c)?.emoji ?? "🛒";
