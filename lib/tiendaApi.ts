import { API, modoDemo } from "./api";
import { emojiCategoria } from "./data";
import type { Categoria, Producto, Tienda } from "./types";

export const DEMO_KEY = "mandader:tienda-demo";
const SES_KEY = "mandader:panel-sesion";
export interface Sesion { tienda: Tienda; token: string }
export interface Borrador { id?: string; nombre: string; precio: number; categoria: Categoria; marca?: string; desc?: string; agotado?: boolean; imagen?: string }
interface Demo { tienda: Tienda; productos: Producto[] }

const leerDemo = (): Demo | null => { try { return JSON.parse(localStorage.getItem(DEMO_KEY) || "null"); } catch { return null; } };
function guardarDemo(d: Demo) {
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(d)); }
  catch { throw new Error("En modo prueba el móvil ya no tiene sitio para más fotos. Sube este producto sin foto."); }
}
const rid = () => Math.random().toString(36).slice(2, 8);

export const sesionGuardada = (): Sesion | null => { try { return JSON.parse(localStorage.getItem(SES_KEY) || "null"); } catch { return null; } };
export const salir = () => localStorage.removeItem(SES_KEY);

const COLORES = ["#ff8a3d", "#3dbb7a", "#3d8bff", "#e0457b", "#c9a227", "#8a5cf6"];
export function crearTiendaDemo(nombre: string, emoji: string): Sesion {
  const previa = leerDemo();
  const tienda: Tienda = { id: `local-${rid()}`, nombre: nombre.trim().slice(0, 60), emoji, color: COLORES[Math.floor(Math.random() * COLORES.length)], categoria: "despensa", zona: "Elgoibar", tiempoMin: 30, abre: "09:00", cierra: "21:00", valoracion: 5, local: true };
  guardarDemo({ tienda, productos: previa?.productos.map((p) => ({ ...p, tiendaId: tienda.id })) ?? [] });
  const s = { tienda, token: "demo" }; localStorage.setItem(SES_KEY, JSON.stringify(s)); return s;
}

export async function entrar(codigo: string): Promise<Sesion> {
  const r = await fetch(`${API}/api/tienda/entrar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ codigo: codigo.trim() }) });
  if (!r.ok) throw new Error("Ese código no es de ninguna tienda");
  const j = await r.json(); const s = { tienda: j.tienda as Tienda, token: codigo.trim() };
  localStorage.setItem(SES_KEY, JSON.stringify(s)); return s;
}

const auth = (s: Sesion) => ({ Authorization: `Bearer ${s.token}`, "Content-Type": "application/json" });

export async function misProductos(s: Sesion): Promise<Producto[]> {
  if (modoDemo) return leerDemo()?.productos ?? [];
  const r = await fetch(`${API}/api/tienda/productos`, { headers: auth(s), cache: "no-store" });
  if (r.status === 401) throw new Error("Tu código ya no vale; vuelve a entrar");
  if (!r.ok) throw new Error("No se pudieron cargar tus productos");
  return r.json();
}

// Crea o actualiza. imagenNueva es una foto recién hecha (data URL ya reducida).
export async function guardarProducto(s: Sesion, b: Borrador, imagenNueva?: string): Promise<Producto> {
  if (modoDemo) {
    const d = leerDemo(); if (!d) throw new Error("Crea tu tienda primero");
    const prev = b.id ? d.productos.find((p) => p.id === b.id) : undefined;
    const p: Producto = { ...(prev ?? {}), id: b.id ?? `${d.tienda.id}-${rid()}`, tiendaId: d.tienda.id, nombre: b.nombre, precio: b.precio, categoria: b.categoria, emoji: emojiCategoria(b.categoria), marca: b.marca || undefined, desc: b.desc || "", tags: prev?.tags ?? [], agotado: !!b.agotado, imagen: imagenNueva ?? b.imagen ?? prev?.imagen, local: true };
    guardarDemo({ ...d, productos: prev ? d.productos.map((x) => (x.id === p.id ? p : x)) : [p, ...d.productos] });
    return p;
  }
  const r = await fetch(`${API}/api/tienda/productos`, { method: "POST", headers: auth(s), body: JSON.stringify({ producto: b, imagenData: imagenNueva }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "No se pudo guardar");
  return j;
}

export async function borrarProducto(s: Sesion, id: string) {
  if (modoDemo) { const d = leerDemo(); if (d) guardarDemo({ ...d, productos: d.productos.filter((p) => p.id !== id) }); return; }
  const r = await fetch(`${API}/api/tienda/productos/${encodeURIComponent(id)}/borrar`, { method: "POST", headers: auth(s) });
  if (!r.ok) throw new Error("No se pudo quitar");
}

// Reduce la foto en el móvil antes de subirla: sube rápido aunque haya poca cobertura.
export async function reducirFoto(file: File, max = modoDemo ? 480 : 800): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ko(new Error("No se pudo leer la foto")); i.src = url; });
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    const ctx = c.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
    const webp = c.toDataURL("image/webp", 0.8);
    return webp.startsWith("data:image/webp") ? webp : c.toDataURL("image/jpeg", 0.8);
  } finally { URL.revokeObjectURL(url); }
}
