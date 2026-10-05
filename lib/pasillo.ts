import type { Categoria } from "./types";
import { norm } from "./norm";

// Palabras que delatan el pasillo. La primera que aparezca gana; si no, «despensa».
const REGLAS: [Categoria, string[]][] = [
  ["bebe", ["panal", "potito", "toallita", "biberon", "chupete", "papilla", "leche de continuacion", "leche crecimiento"]],
  ["mascotas", ["pienso", "perro", "gato", "arena gato", "snack perro", "mascota"]],
  ["higiene", ["papel higienico", "champu", "gel", "desodorante", "dentifrico", "pasta de dientes", "cepillo de dientes", "compresa", "tampon", "maquinilla", "crema", "colonia", "jabon de manos", "algodon"]],
  ["limpieza", ["detergente", "suavizante", "lejia", "friegasuelos", "lavavajillas", "limpiador", "amoniaco", "estropajo", "bayeta", "papel de cocina", "bolsas de basura", "servilleta", "insecticida", "ambientador", "fregona"]],
  ["congelados", ["congelad", "helado", "hielo", "pizza", "croqueta", "varitas", "nuggets"]],
  ["bebidas", ["agua", "cerveza", "vino", "refresco", "coca", "fanta", "zumo", "sidra", "txakoli", "chacoli", "cava", "whisky", "ron", "ginebra", "vermut", "batido", "bebida", "kas", "tonica", "red bull", "monster", "aquarius", "nestea"]],
  ["lacteos", ["leche", "yogur", "queso", "huevo", "mantequilla", "nata", "kefir", "cuajada", "flan", "natillas", "requeson", "margarina"]],
  ["panaderia", ["pan", "barra", "baguette", "croissant", "magdalena", "bollo", "napolitana", "rosquilla", "donut", "bizcocho", "tostada", "chapata", "hogaza", "talo"]],
  ["frescos", ["manzana", "platano", "naranja", "pera", "uva", "fresa", "melon", "sandia", "kiwi", "limon", "mandarina", "tomate", "lechuga", "patata", "cebolla", "ajo", "pimiento", "zanahoria", "calabacin", "berenjena", "pepino", "puerro", "fruta", "verdura", "pollo", "pechuga", "ternera", "cerdo", "carne", "chuleta", "lomo", "filete", "hamburguesa", "salchicha", "chorizo", "jamon", "pescado", "merluza", "salmon", "bacalao", "gamba", "mejillon", "chipiron", "txistorra", "morcilla", "embutido", "fiambre"]],
];
export function adivinarPasillo(nombre: string): Categoria {
  const n = ` ${norm(nombre)} `;
  for (const [cat, palabras] of REGLAS) if (palabras.some((p) => n.includes(` ${p}`))) return cat;
  return "despensa";
}

// "1,29", "1.29 €", "2€" -> número; null si no es un precio válido
export function leerPrecio(s: string): number | null {
  const m = s.trim().replace(/\s*(€|eur|euros)$/i, "").match(/^(\d{1,4})(?:[.,](\d{1,2}))?$/);
  if (!m) return null;
  const v = Number(`${m[1]}.${(m[2] ?? "0").padEnd(2, "0")}`);
  return v > 0 ? v : null;
}

// Lista pegada (WhatsApp, Excel, CSV): una línea por producto, el precio al final.
export function leerLista(texto: string): { ok: { nombre: string; precio: number; categoria: Categoria }[]; malas: string[] } {
  const ok: { nombre: string; precio: number; categoria: Categoria }[] = [], malas: string[] = [];
  for (const bruta of texto.split(/\r?\n/)) {
    const linea = bruta.trim().replace(/^[-•*·]\s*/, "");
    if (!linea) continue;
    let nombre = "", precio: number | null = null;
    const partes = linea.split(/\t|;|\|/).map((x) => x.trim()).filter(Boolean);
    if (partes.length >= 2 && leerPrecio(partes[partes.length - 1]) != null) { precio = leerPrecio(partes.pop()!); nombre = partes.join(" "); }
    else { const m = linea.match(/(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:€|eur|euros)?\s*$/i); if (m) { precio = leerPrecio(m[1]); nombre = linea.slice(0, m.index).trim(); } }
    nombre = nombre.replace(/[\s,:=\-–]+$/, "").replace(/^"|"$/g, "").trim();
    if (precio == null || nombre.length < 2) { malas.push(linea); continue; }
    ok.push({ nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1), precio, categoria: adivinarPasillo(nombre) });
  }
  return { ok, malas };
}
