// Importa productos reales de supermercados cuyo robots.txt y aviso legal lo permiten.
// Uso: npm run ingest -- [maxProductos]   →  escribe data/catalog.json
// Educado: respeta robots.txt, se identifica, 1 petición cada ~1 s, solo páginas públicas de producto del sitemap.
import fs from "node:fs";
import path from "node:path";
import { cargarRobots } from "./robots";
import type { Categoria, Producto, Tienda } from "../lib/types";

const UA = "mandader-bot/0.1 (+https://github.com/juancristobalgd1/mandader)";
const PAUSA_MS = 1000;
const MAX = Number(process.argv[2] || 600);
const SOLO_BASICOS = process.argv.includes("--basicos"); // añade básicos al catálogo existente sin rehacerlo
// Básicos que no pueden faltar en un súper: se buscan por el nombre en la URL de la ficha (máx. 4 de cada)
const BASICOS = ["leche-.*sin-lactosa", "leche-.*(entera|semidesnatada|desnatada)", "huevos", "barra|pan-de-molde", "aceite-de-oliva", "aceite-de-girasol", "agua-mineral", "platano", "manzana", "naranja", "tomate", "patata", "cebolla", "lechuga", "pechuga|pollo", "carne-picada", "salmon|merluza", "atun", "arroz", "macarrones|espaguetis", "garbanzos|lentejas", "cafe-molido", "galletas", "cereales", "yogur", "queso", "mantequilla", "azucar", "sal-", "harina", "papel-higienico", "detergente", "lavavajillas", "gel-de-ducha|champu", "pasta-de-dientes|dentifrico", "panales", "cerveza", "vino-tinto", "refresco|coca-cola"];
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function get(url: string, intentos = 3): Promise<string | null> {
  for (let i = 0; i < intentos; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html,application/xml" } });
      if (r.status === 404) return null;
      if (r.status === 429 || r.status >= 500) { await dormir(5000 * (i + 1)); continue; }
      return await r.text();
    } catch { await dormir(3000); }
  }
  return null;
}

// Categorías de mandader a partir de las migas de pan del súper
const MAPA: [RegExp, Categoria][] = [
  [/mascota|perro|gato/i, "mascotas"], [/beb[eé]|infantil|pañal/i, "bebe"],
  [/drogu|limpieza|hogar|detergente|lavavajillas|papel/i, "limpieza"], [/perfumer|higiene|cuidado|cosm[eé]tic|belleza|parafarmacia/i, "higiene"],
  [/congelad/i, "congelados"], [/bebida|agua|refresco|zumo|cerveza|vino|licor|cava|sidra/i, "bebidas"],
  [/l[aá]cteo|leche|yogur|huevo|queso|mantequilla/i, "lacteos"], [/panader|boller|pan /i, "panaderia"],
  [/fruta|verdura|carne|pescado|marisco|charcuter|fresco/i, "frescos"], [/alimentaci|despensa|conserva|arroz|pasta|aceite|cacao|caf[eé]|dulce|aperitivo|desayuno|salsa/i, "despensa"],
];
const ALCOHOL = /cerveza|vino|licor|ginebra|whisky|ron |vodka|sidra|cava|vermut|tequila|champ[aá]n/i;
const EMOJI: Record<Categoria, string> = { frescos: "🥬", lacteos: "🥛", despensa: "🥫", panaderia: "🥖", bebidas: "🥤", congelados: "🧊", limpieza: "🧽", higiene: "🧴", bebe: "👶", mascotas: "🐾" };
const POPULARES = /^(leche|huevos|pan |barra|aceite de oliva|agua mineral|pl[aá]tano|tomate|patata|caf[eé] molido|arroz|papel higi[eé]nico|yogur|pollo|manzana)/i;

function etiquetas(nombre: string, migas: string[]) {
  const t = (nombre + " " + migas.join(" ")).toLowerCase();
  const tags = new Set<string>();
  for (const [re, tag] of [[/sin gluten/, "sin gluten"], [/sin lactosa/, "sin lactosa"], [/sin az[uú]car|0% az/, "sin azucar"], [/vegan|vegetal/, "vegano"], [/ecol[oó]gic|\bbio\b/, "ecologico"], [/integral/, "integral"], [/desnatad/, "desnatado"]] as [RegExp, string][]) if (re.test(t)) tags.add(tag);
  if (ALCOHOL.test(t) && !/sin alcohol|0,0|0\.0/.test(t)) tags.add("+18");
  for (const m of migas.slice(1)) tags.add(m.toLowerCase());
  return Array.from(tags).slice(0, 8);
}

function jsonLd(html: string): any[] {
  return Array.from(html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)).flatMap((m) => { try { const j = JSON.parse(m[1]); return Array.isArray(j) ? j : [j]; } catch { return []; } });
}
const limpiar = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;|&amp;/g, (x) => (x === "&amp;" ? "&" : " ")).replace(/\s+/g, " ").trim();
const titulo = (s: string) => { const t = limpiar(s); return t === t.toUpperCase() ? t.charAt(0) + t.slice(1).toLowerCase() : t; };

// ---------- Ahorramas: robots.txt permite las fichas de producto; el aviso legal no prohíbe la extracción ----------
let YA = new Set<string>();
async function ahorramas(): Promise<{ tienda: Tienda; productos: Producto[] }> {
  const base = "https://www.ahorramas.com";
  const permitido = await cargarRobots(base, UA);
  const xml = (await get(`${base}/sitemap_0-product.xml`)) || "";
  const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]).filter(permitido);
  const paso = Math.max(1, Math.floor(urls.length / MAX));
  const basicos = BASICOS.flatMap((b) => urls.filter((u) => new RegExp(`/[^/]*(${b})[^/]*$`).test(u)).slice(0, 4));
  const muestra = Array.from(new Set(SOLO_BASICOS ? basicos : [...basicos, ...urls.filter((_, i) => i % paso === 0).slice(0, MAX)]))
    .filter((u) => !YA.has(u));
  console.log(`Ahorramas: ${urls.length} fichas permitidas, leo ${muestra.length}`);
  const productos: Producto[] = [];
  for (const [i, url] of muestra.entries()) {
    const html = await get(url); await dormir(PAUSA_MS);
    if (!html) continue;
    const ld = jsonLd(html);
    const p = ld.find((x) => x["@type"] === "Product"), bc = ld.find((x) => x["@type"] === "BreadcrumbList");
    const precio = Number(p?.offers?.price);
    if (!p?.name || !precio || p.offers?.availability?.includes("OutOfStock")) continue;
    const migas: string[] = (bc?.itemListElement || []).map((e: any) => e.item?.name).filter(Boolean);
    const cat = MAPA.find(([re]) => re.test(migas.join(" ") + " " + p.name))?.[1];
    if (!cat) continue;
    const imgs: string[] = (Array.isArray(p.image) ? p.image : [p.image]).filter(Boolean).map((s: string) => (s.startsWith("http") ? s : base + s));
    const img = imgs.find((s) => s.includes("/dw/image/")) || imgs[0];
    const nombre = titulo(p.name);
    productos.push({
      id: `ahorramas-${p.sku || i}`, tiendaId: "ahorramas", nombre, desc: limpiar(p.description || nombre).slice(0, 220),
      precio: Math.round(precio * 100) / 100, emoji: EMOJI[cat], categoria: cat, tags: etiquetas(nombre, migas),
      popular: POPULARES.test(nombre) || undefined, imagen: img, marca: p.brand?.name, fuente: url,
    });
    if (i % 50 === 0) console.log(`  ${i}/${muestra.length} · ${productos.length} válidos`);
  }
  return {
    tienda: { id: "ahorramas", nombre: "Ahorramas", categoria: "despensa", emoji: "🛒", color: "#d7262e", zona: "Precios de su tienda online", tiempoMin: 45, abre: "09:00", cierra: "21:30", valoracion: 4.4 },
    productos,
  };
}

async function main() {
  const destino = path.join(__dirname, "..", "data", "catalog.json");
  const previo = SOLO_BASICOS ? JSON.parse(fs.readFileSync(destino, "utf8")) : null;
  if (previo) YA = new Set(previo.productos.map((p: Producto) => p.fuente));
  const fuentes = [await ahorramas()];
  const nuevos = fuentes.flatMap((f) => f.productos);
  const productos = previo ? [...previo.productos, ...nuevos.filter((n) => !previo.productos.some((p: Producto) => p.id === n.id))] : nuevos;
  const catalogo = { actualizado: new Date().toISOString(), tiendas: fuentes.map((f) => f.tienda), productos };
  if (catalogo.productos.length < 50) throw new Error(`Solo ${catalogo.productos.length} productos: no sobrescribo el catálogo`);
  fs.writeFileSync(destino, JSON.stringify(catalogo, null, 1));
  console.log(`Guardados ${catalogo.productos.length} productos en data/catalog.json`);
}
main().catch((e) => { console.error(e); process.exit(1); });
