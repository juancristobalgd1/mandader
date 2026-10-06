// Servidor de pedidos y cobro de mandader. Sin dependencias: solo Node 20.
// Arranque: npm run api   (lee la configuración de server/.env o del entorno)
import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { calcular, enZona } from "../lib/pricing";
import { CATEGORIAS, PASILLOS, emojiCategoria, registrarExtras, tipoDe } from "../lib/data";
import { AVISO_MEDICAMENTO, esMedicamento } from "../lib/pasillo";
import type { Categoria, Entrega, EstadoPedido, LineaPedido, Pedido, Producto, Tienda } from "../lib/types";

// --- configuración ---
const envFile = path.join(__dirname, ".env");
if (fs.existsSync(envFile)) for (const l of fs.readFileSync(envFile, "utf8").split("\n")) { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ""); }
const PORT = Number(process.env.PORT || 8787);
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WHSEC = process.env.STRIPE_WEBHOOK_SECRET || "";
const RIDER_TOKEN = process.env.RIDER_TOKEN || "";
const ORIGENES = (process.env.FRONTEND_ORIGINS || "http://localhost:3000").split(",").map((s) => s.trim());
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "", TG_CHAT = process.env.TELEGRAM_CHAT_ID || "";

// --- almacén (un fichero JSON; cámbialo por Postgres cuando crezca) ---
const DATA = process.env.MANDADER_DATA_DIR || path.join(__dirname, "data");
const DB = path.join(DATA, "pedidos.json");
fs.mkdirSync(path.dirname(DB), { recursive: true });
let pedidos: Pedido[] = fs.existsSync(DB) ? JSON.parse(fs.readFileSync(DB, "utf8")) : [];
const guardar = () => { fs.writeFileSync(DB + ".tmp", JSON.stringify(pedidos, null, 1)); fs.renameSync(DB + ".tmp", DB); };
const buscarPedido = (id: string) => pedidos.find((p) => p.id === id);
// --- tiendas y sus productos (los suben desde /panel) ---
const F_TIENDAS = path.join(DATA, "tiendas.json"), F_PROD = path.join(DATA, "productos.json"), IMG = path.join(DATA, "img");
fs.mkdirSync(IMG, { recursive: true });
type TiendaPriv = Tienda & { token: string };
const leerTiendas = (): TiendaPriv[] => (fs.existsSync(F_TIENDAS) ? JSON.parse(fs.readFileSync(F_TIENDAS, "utf8")) : []); // se relee: dar de alta no exige reiniciar
const publica = ({ token: _t, ...t }: TiendaPriv): Tienda => ({ ...t, local: true });
let productosT: Producto[] = fs.existsSync(F_PROD) ? JSON.parse(fs.readFileSync(F_PROD, "utf8")) : [];
const sincronizar = () => registrarExtras(leerTiendas().map(publica), productosT); // así el cobro usa siempre el precio actual
const guardarProd = () => { fs.writeFileSync(F_PROD + ".tmp", JSON.stringify(productosT, null, 1)); fs.renameSync(F_PROD + ".tmp", F_PROD); sincronizar(); };
sincronizar();
const tiendaDe = (req: http.IncomingMessage) => { const a = String(req.headers.authorization || ""); return a.startsWith("Bearer ") ? leerTiendas().find((t) => t.token && t.token === a.slice(7)) : undefined; };
const PUBLIC_URL = (process.env.API_PUBLIC_URL || "").replace(/\/$/, "");
function guardarFoto(id: string, data: string, req: http.IncomingMessage) {
  const m = data.match(/^data:image\/(webp|jpeg|png);base64,([A-Za-z0-9+/=]+)$/); if (!m) throw new Error("Foto no válida");
  const buf = Buffer.from(m[2], "base64"); if (buf.length > 1_500_000) throw new Error("La foto es demasiado grande");
  const nombre = `${id}-${Date.now().toString(36)}.${m[1] === "jpeg" ? "jpg" : m[1]}`;
  fs.writeFileSync(path.join(IMG, nombre), buf);
  return `${PUBLIC_URL || `https://${req.headers.host}`}/img/${nombre}`;
}
function validarProducto(t: TiendaPriv, b: Record<string, unknown>): Producto | string {
  const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const nombre = s(b.nombre, 120), precio = Math.round(Number(b.precio) * 100) / 100, categoria = s(b.categoria, 20) as Categoria;
  if (nombre.length < 2) return "Falta el nombre";
  if (!(precio > 0 && precio < 10000)) return "Precio no válido";
  if (!CATEGORIAS.some((c) => c.id === categoria) || !PASILLOS[tipoDe(t)].includes(categoria)) return "Pasillo no válido";
  if (esMedicamento(nombre)) return AVISO_MEDICAMENTO;
  const id = typeof b.id === "string" && b.id.startsWith(`${t.id}-`) && /^[a-z0-9-]{3,80}$/.test(b.id) ? b.id : `${t.id}-${crypto.randomBytes(4).toString("hex")}`;
  const prev = productosT.find((p) => p.id === id);
  if (prev && prev.tiendaId !== t.id) return "No es tuyo";
  const imagen = typeof b.imagen === "string" && /^https?:\/\//.test(b.imagen) ? b.imagen : prev?.imagen;
  return { id, tiendaId: t.id, nombre, precio, categoria, emoji: emojiCategoria(categoria), desc: s(b.desc, 300), marca: s(b.marca, 60) || undefined, tags: prev?.tags ?? [], agotado: b.agotado === true, imagen, local: true };
}

function setEstado(p: Pedido, estado: EstadoPedido) { if (p.estado === estado) return; p.estado = estado; p.historial.push({ estado, t: Date.now() }); guardar(); }

// --- utilidades http ---
function cors(req: http.IncomingMessage, res: http.ServerResponse) {
  const o = req.headers.origin || "";
  if (ORIGENES.includes(o) || ORIGENES.includes("*")) res.setHeader("Access-Control-Allow-Origin", o || "*");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}
const json = (res: http.ServerResponse, code: number, body: unknown) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(body)); };
const leerCuerpo = (req: http.IncomingMessage, max = 100_000) => new Promise<string>((ok, ko) => { let d = ""; req.on("data", (c) => { d += c; if (d.length > max) { ko(new Error("demasiado grande")); req.destroy(); } }); req.on("end", () => ok(d)); req.on("error", ko); });
const esRider = (req: http.IncomingMessage) => !!RIDER_TOKEN && req.headers.authorization === `Bearer ${RIDER_TOKEN}`;

// --- Stripe (API REST directa) ---
async function stripe(ruta: string, params: Record<string, string>) {
  const r = await fetch(`https://api.stripe.com/v1/${ruta}`, { method: "POST", headers: { Authorization: `Bearer ${STRIPE_KEY}`, "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(params) });
  const j = await r.json(); if (!r.ok) throw new Error(j?.error?.message || "Error de Stripe"); return j;
}
export function firmaValida(raw: string, cabecera: string, secreto: string, ahora = Date.now()) {
  const partes = Object.fromEntries(cabecera.split(",").map((x) => x.split("=") as [string, string]).filter((x) => x.length === 2));
  const t = Number(partes.t); if (!t || Math.abs(ahora / 1000 - t) > 300) return false;
  const esperado = crypto.createHmac("sha256", secreto).update(`${t}.${raw}`).digest("hex");
  const firmas = cabecera.split(",").filter((x) => x.startsWith("v1=")).map((x) => x.slice(3));
  return firmas.some((f) => f.length === esperado.length && crypto.timingSafeEqual(Buffer.from(f), Buffer.from(esperado)));
}

async function avisarRepartidor(p: Pedido) {
  if (!TG_TOKEN || !TG_CHAT) return;
  const c = calcular(p.items);
  const lineas = c.tiendas.map((tid) => { const ls = c.lineas.filter((l) => l.tienda.id === tid); return `*${ls[0].tienda.nombre}*\n` + ls.map((l) => `  ${l.qty} × ${l.producto.nombre}`).join("\n"); }).join("\n");
  const dir = `${p.entrega.direccion}${p.entrega.piso ? ", " + p.entrega.piso : ""}, ${p.entrega.cp} ${enZona(p.entrega.cp) ?? ""}`;
  const texto = `🛵 Nuevo mandado ${p.id} · ${p.total.toFixed(2)} €\n${lineas}\n\n📍 ${dir}\n📞 ${p.entrega.nombre} ${p.entrega.telefono}\n⏰ ${p.entrega.cuando}${p.entrega.notas ? "\n📝 " + p.entrega.notas : ""}\nhttps://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dir)}`;
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: TG_CHAT, text: texto, parse_mode: "Markdown" }) }).catch(() => {});
}

function validarEntrega(e: Partial<Entrega>): Entrega | string {
  const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const x: Entrega = { nombre: s(e.nombre, 80), telefono: s(e.telefono, 20), direccion: s(e.direccion, 160), piso: s(e.piso, 40), cp: s(e.cp, 5), notas: s(e.notas, 500), cuando: s(e.cuando, 20) || "ya" };
  if (!x.nombre) return "Falta el nombre";
  if (!/^[+0-9 ]{9,15}$/.test(x.telefono)) return "Teléfono no válido";
  if (x.direccion.length < 5) return "Falta la dirección";
  if (!enZona(x.cp)) return "Todavía no repartimos en ese código postal";
  return x;
}

// --- rutas ---
const server = http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  const url = new URL(req.url || "/", "http://x");
  try {
    if (req.method === "GET" && url.pathname === "/api/health") return json(res, 200, { ok: true, stripe: !!STRIPE_KEY, pedidos: pedidos.length });

    // catálogo público de las tiendas dadas de alta
    if (req.method === "GET" && url.pathname === "/api/catalogo") return json(res, 200, { tiendas: leerTiendas().map(publica), productos: productosT.filter((p) => !p.agotado) });
    const mImg = url.pathname.match(/^\/img\/([a-z0-9-]+\.(webp|jpg|png))$/);
    if (req.method === "GET" && mImg) {
      const f = path.join(IMG, mImg[1]); if (!fs.existsSync(f)) return json(res, 404, { error: "no existe" });
      res.writeHead(200, { "Content-Type": mImg[2] === "jpg" ? "image/jpeg" : `image/${mImg[2]}`, "Cache-Control": "public, max-age=31536000, immutable" }); return fs.createReadStream(f).pipe(res);
    }
    // panel de tienda
    if (req.method === "POST" && url.pathname === "/api/tienda/entrar") {
      const { codigo } = JSON.parse(await leerCuerpo(req));
      const t = leerTiendas().find((x) => x.token && x.token === String(codigo || "").trim());
      return t ? json(res, 200, { tienda: publica(t) }) : json(res, 401, { error: "código" });
    }
    if (url.pathname.startsWith("/api/tienda/")) {
      const t = tiendaDe(req); if (!t) return json(res, 401, { error: "clave" });
      if (req.method === "GET" && url.pathname === "/api/tienda/productos") return json(res, 200, productosT.filter((p) => p.tiendaId === t.id));
      if (req.method === "POST" && url.pathname === "/api/tienda/productos") {
        const body = JSON.parse(await leerCuerpo(req, 3_000_000));
        const p = validarProducto(t, body.producto || {}); if (typeof p === "string") return json(res, 400, { error: p });
        if (typeof body.imagenData === "string" && body.imagenData) p.imagen = guardarFoto(p.id, body.imagenData, req);
        const i = productosT.findIndex((x) => x.id === p.id);
        if (i >= 0) productosT[i] = p; else productosT.unshift(p);
        guardarProd(); return json(res, 200, p);
      }
      const mB = url.pathname.match(/^\/api\/tienda\/productos\/([a-z0-9-]+)\/borrar$/);
      if (req.method === "POST" && mB) { productosT = productosT.filter((p) => !(p.id === mB[1] && p.tiendaId === t.id)); guardarProd(); return json(res, 200, { ok: true }); }
    }

    if (req.method === "POST" && url.pathname === "/api/checkout") {
      if (!STRIPE_KEY) return json(res, 503, { error: "El cobro con tarjeta aún no está configurado" });
      const body = JSON.parse(await leerCuerpo(req));
      const items: LineaPedido[] = Array.isArray(body.items) ? body.items.map((i: LineaPedido) => ({ id: String(i.id), qty: Number(i.qty) })) : [];
      sincronizar();
      const c = calcular(items); // precios SIEMPRE del catálogo del servidor, nunca del navegador
      if (!c.lineas.length) return json(res, 400, { error: "El carrito está vacío" });
      if (c.faltaMinimo > 0) return json(res, 400, { error: "No llega al pedido mínimo" });
      const entrega = validarEntrega(body.entrega || {});
      if (typeof entrega === "string") return json(res, 400, { error: entrega });
      const origen = ORIGENES.find((o) => typeof body.origen === "string" && body.origen.startsWith(o)) ? String(body.origen).replace(/\/$/, "") : ORIGENES[0];
      const id = crypto.randomBytes(6).toString("base64url").toUpperCase().replace(/[-_]/g, "X");
      const p: Pedido = { id, creado: Date.now(), estado: "pendiente_pago", items: c.lineas.map((l) => ({ id: l.id, qty: l.qty })), entrega, subtotal: c.subtotal, envio: c.envio, servicio: c.servicio, total: c.total, historial: [{ estado: "pendiente_pago", t: Date.now() }] };
      const params: Record<string, string> = { mode: "payment", locale: "es", success_url: `${origen}/pedido/?id=${id}&pago=ok`, cancel_url: `${origen}/carrito/`, "metadata[pedido_id]": id, "payment_intent_data[metadata][pedido_id]": id, client_reference_id: id };
      const extra = [...c.lineas.map((l) => ({ n: l.producto.nombre, a: Math.round(l.producto.precio * 100), q: l.qty })), ...(c.envio ? [{ n: "Envío", a: Math.round(c.envio * 100), q: 1 }] : []), ...(c.servicio ? [{ n: "Gastos de gestión", a: Math.round(c.servicio * 100), q: 1 }] : [])];
      extra.forEach((x, i) => { params[`line_items[${i}][price_data][currency]`] = "eur"; params[`line_items[${i}][price_data][product_data][name]`] = x.n; params[`line_items[${i}][price_data][unit_amount]`] = String(x.a); params[`line_items[${i}][quantity]`] = String(x.q); });
      const s = await stripe("checkout/sessions", params);
      pedidos.unshift(p); guardar();
      return json(res, 200, { id, url: s.url });
    }

    if (req.method === "POST" && url.pathname === "/api/stripe/webhook") {
      const raw = await leerCuerpo(req, 1_000_000);
      if (!STRIPE_WHSEC || !firmaValida(raw, String(req.headers["stripe-signature"] || ""), STRIPE_WHSEC)) return json(res, 400, { error: "firma" });
      const ev = JSON.parse(raw);
      if (ev.type === "checkout.session.completed" && ev.data?.object?.payment_status === "paid") {
        const p = buscarPedido(ev.data.object.metadata?.pedido_id);
        if (p && p.estado === "pendiente_pago") { setEstado(p, "pagado"); await avisarRepartidor(p); }
      }
      return json(res, 200, { recibido: true });
    }

    const mPed = url.pathname.match(/^\/api\/pedidos\/([A-Za-z0-9]+)$/);
    if (req.method === "GET" && mPed) { const p = buscarPedido(mPed[1]); return p ? json(res, 200, p) : json(res, 404, { error: "no existe" }); }

    if (url.pathname.startsWith("/api/repartidor/")) {
      if (!esRider(req)) return json(res, 401, { error: "clave" });
      if (req.method === "GET" && url.pathname === "/api/repartidor/pedidos") return json(res, 200, pedidos.filter((p) => p.estado !== "pendiente_pago").slice(0, 200));
      const m = url.pathname.match(/^\/api\/repartidor\/pedidos\/([A-Za-z0-9]+)\/estado$/);
      if (req.method === "POST" && m) {
        const p = buscarPedido(m[1]); if (!p) return json(res, 404, { error: "no existe" });
        const { estado } = JSON.parse(await leerCuerpo(req));
        if (!["comprando", "en_camino", "entregado", "cancelado"].includes(estado)) return json(res, 400, { error: "estado" });
        setEstado(p, estado); return json(res, 200, p);
      }
    }
    json(res, 404, { error: "ruta" });
  } catch (e) { json(res, 500, { error: (e as Error).message }); }
});
if (require.main === module) server.listen(PORT, () => console.log(`mandader API en :${PORT} (stripe ${STRIPE_KEY ? "sí" : "no"}, telegram ${TG_TOKEN ? "sí" : "no"})`));
export default server;
