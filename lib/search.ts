import { PRODUCTOS, tienda } from "./data";
import type { Categoria, Producto } from "./types";

export const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Palabras que apuntan a una categoría
const CAT: Record<string, Categoria> = {
  fresco: "frescos", frescos: "frescos", fruta: "frescos", verdura: "frescos", carne: "frescos", pescado: "frescos", charcuteria: "frescos",
  lacteos: "lacteos", lacteo: "lacteos",
  despensa: "despensa", conservas: "despensa",
  panaderia: "panaderia", bolleria: "panaderia",
  bebida: "bebidas", bebidas: "bebidas",
  congelado: "congelados", congelados: "congelados",
  limpieza: "limpieza", hogar: "limpieza", drogueria: "limpieza",
  higiene: "higiene", perfumeria: "higiene",
  bebe: "bebe", mascota: "mascotas", mascotas: "mascotas", perro: "mascotas", gato: "mascotas",
};
// Etiquetas de varias palabras
const TAGS = ["sin gluten", "sin lactosa", "sin azucar", "vegano", "ecologico", "integral", "desnatado"];
const STOP = new Set(["de", "la", "el", "los", "las", "un", "una", "algo", "para", "con", "y", "o", "me", "quiero", "traeme", "trae", "busco", "por", "favor", "en", "a", "que", "mas", "barato", "barata", "baratos", "hoy", "ahora", "casa", "mi"]);

export interface Consulta { texto: string; terminos: string[]; max?: number; categoria?: Categoria; tags: string[]; barato: boolean }

export function interpretar(q: string): Consulta {
  let t = norm(q);
  const c: Consulta = { texto: q, terminos: [], tags: [], barato: /\bbarat[oa]s?\b|economic/.test(t) };
  const m = t.match(/(?:hasta|menos de|max(?:imo)?|por debajo de|no mas de)\s*(\d+(?:[.,]\d+)?)\s*(?:€|eur|euros)?/) || t.match(/(\d+(?:[.,]\d+)?)\s*(?:€|eur|euros)\s*(?:max|como mucho)?/);
  if (m) { c.max = parseFloat(m[1].replace(",", ".")); t = t.replace(m[0], " "); }
  for (const tag of TAGS) if (t.includes(tag)) { c.tags.push(tag); t = t.replace(tag, " "); }
  if (/\\becologic/.test(t) || /\\bbio\\b/.test(t)) { if (!c.tags.includes("ecologico")) c.tags.push("ecologico"); t = t.replace(/ecologic[oa]s?|\\bbio\\b/g, " "); }
  for (const w of t.split(/[^a-z0-9+]+/).filter(Boolean)) {
    if (CAT[w] && !c.categoria) { c.categoria = CAT[w]; if (!["fruta", "verdura", "carne", "pescado", "perro", "gato"].includes(w)) continue; }
    if (!STOP.has(w) && w.length > 1) c.terminos.push(w.replace(/s$/, ""));
  }
  return c;
}

function puntuar(p: Producto, c: Consulta) {
  const t = tienda(p.tiendaId);
  const campos = norm([p.nombre, p.desc, p.marca ?? "", p.tags.join(" "), t?.nombre ?? ""].join(" "));
  let s = 0;
  for (const w of c.terminos) {
    if (norm(p.nombre).includes(w)) s += 5;
    else if (p.tags.some((tg) => norm(tg).includes(w))) s += 4;
    else if (campos.includes(w)) s += 2;
    else return -1;
  }
  if (p.popular) s += 0.5;
  return s;
}

export function buscar(q: string | Consulta, limite = 60): Producto[] {
  const c = typeof q === "string" ? interpretar(q) : q;
  let xs = PRODUCTOS.filter((p) => (!c.categoria || p.categoria === c.categoria || c.terminos.length > 0) && (c.max == null || p.precio <= c.max) && c.tags.every((tg) => p.tags.includes(tg)));
  const puntos = new Map(xs.map((p) => [p.id, puntuar(p, c)]));
  xs = xs.filter((p) => puntos.get(p.id)! >= 0);
  if (c.categoria && c.terminos.length) xs.sort((a, b) => Number(b.categoria === c.categoria) - Number(a.categoria === c.categoria));
  xs.sort((a, b) => (c.barato ? a.precio - b.precio : puntos.get(b.id)! - puntos.get(a.id)!));
  return xs.slice(0, limite);
}
