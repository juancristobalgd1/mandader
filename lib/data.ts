import catalog from "../data/catalog.json";
import type { Categoria, Producto, Tienda } from "./types";

export const TIENDAS = catalog.tiendas as Tienda[];
export const PRODUCTOS = catalog.productos as Producto[];
export const ACTUALIZADO: string | undefined = (catalog as { actualizado?: string }).actualizado;
export const tienda = (id: string) => TIENDAS.find((t) => t.id === id);
export const producto = (id: string) => PRODUCTOS.find((p) => p.id === id);
export const deTienda = (id: string) => PRODUCTOS.filter((p) => p.tiendaId === id);
export const deCategoria = (c: Categoria) => PRODUCTOS.filter((p) => p.categoria === c);

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
