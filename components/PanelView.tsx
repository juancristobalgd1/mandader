"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, ClipboardList, ImagePlus, LogOut, Plus, Search, Trash2, X } from "lucide-react";
import { CATEGORIAS, nombreCategoria } from "@/lib/data";
import type { Categoria, Producto } from "@/lib/types";
import { eur } from "@/lib/format";
import { modoDemo } from "@/lib/api";
import { adivinarPasillo, leerLista, leerPrecio } from "@/lib/pasillo";
import { refrescarCatalogo } from "@/lib/catalogo";
import { borrarProducto, crearTiendaDemo, entrar, guardarProducto, misProductos, reducirFoto, salir, sesionGuardada, type Borrador, type Sesion } from "@/lib/tiendaApi";
import Tile from "./Tile";

type Aviso = { texto: string; deshacer?: () => void } | null;

export default function PanelView() {
  const [s, setS] = useState<Sesion | null>(null);
  const [listo, setListo] = useState(false);
  useEffect(() => { setS(sesionGuardada()); setListo(true); }, []);
  if (!listo) return null;
  return s ? <Gestion s={s} onSalir={() => { salir(); setS(null); }} /> : <Entrada onOk={setS} />;
}

// ---------- entrar o crear tienda ----------
const EMOJIS = ["🛒", "🍎", "🥖", "🥩", "🐟", "🧀", "💊", "🍷", "🌸", "🏪"];
function Entrada({ onOk }: { onOk: (s: Sesion) => void }) {
  const [codigo, setCodigo] = useState(""), [nombre, setNombre] = useState(""), [emoji, setEmoji] = useState("🛒");
  const [err, setErr] = useState(""), [cargando, setCargando] = useState(false);
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    if (modoDemo) { if (nombre.trim().length < 2) return setErr("Pon el nombre de tu tienda"); return onOk(crearTiendaDemo(nombre, emoji)); }
    setCargando(true);
    try { onOk(await entrar(codigo)); } catch (x) { setErr((x as Error).message); setCargando(false); }
  };
  return (
    <form onSubmit={enviar} className="mx-auto max-w-md px-5 pt-8">
      <h1 className="h-section">Panel de tienda</h1>
      <p className="mt-2 text-soft">Sube tus productos con una foto y un precio. Salen al momento en la app.</p>
      {modoDemo ? (
        <div className="panel mt-6 space-y-4 p-4">
          <label className="block text-xs text-muted">Nombre de tu tienda<input autoFocus className="input mt-1 !text-base" value={nombre} onChange={(x) => setNombre(x.target.value)} placeholder="Frutería Baserri" /></label>
          <div><p className="text-xs text-muted">Icono</p><div className="mt-2 flex flex-wrap gap-2">{EMOJIS.map((x) => <button type="button" key={x} onClick={() => setEmoji(x)} className={`grid h-11 w-11 place-items-center rounded-xl border text-xl ${emoji === x ? "border-brand bg-card" : "border-line"}`}>{x}</button>)}</div></div>
          <p className="text-xs text-muted">Modo prueba: lo que subas se guarda en este móvil y se ve en la app de este móvil.</p>
        </div>
      ) : (
        <div className="panel mt-6 p-4">
          <label className="block text-xs text-muted">Código de tu tienda<input autoFocus className="input mt-1 !text-base tracking-widest" value={codigo} onChange={(x) => setCodigo(x.target.value)} autoComplete="one-time-code" placeholder="Te lo damos al darte de alta" /></label>
        </div>
      )}
      {err && <p className="mt-3 text-sm text-[#ff7a7a]">{err}</p>}
      <button disabled={cargando} className="btn-brand mt-4 w-full py-3.5 text-base">{modoDemo ? "Crear mi tienda" : cargando ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}

// ---------- gestión de productos ----------
function Gestion({ s, onSalir }: { s: Sesion; onSalir: () => void }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true), [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [editando, setEditando] = useState<Producto | "nuevo" | null>(null);
  const [lista, setLista] = useState(false);
  const [aviso, setAviso] = useState<Aviso>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const avisar = (a: Aviso) => { setAviso(a); clearTimeout(timer.current); timer.current = setTimeout(() => setAviso(null), 5000); };
  const recargar = async () => { try { setProductos(await misProductos(s)); setErr(""); } catch (x) { setErr((x as Error).message); } setCargando(false); };
  useEffect(() => { recargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const tras = async () => { await recargar(); refrescarCatalogo(); };

  const guardar = async (b: Borrador, foto?: string) => { const p = await guardarProducto(s, b, foto); await tras(); return p; };
  const cambiar = async (p: Producto, cambio: Partial<Borrador>) => {
    setProductos((xs) => xs.map((x) => (x.id === p.id ? { ...x, ...cambio } as Producto : x)));
    try { await guardar({ ...aBorrador(p), ...cambio }); } catch (x) { avisar({ texto: (x as Error).message }); recargar(); }
  };
  const quitar = async (p: Producto) => {
    setProductos((xs) => xs.filter((x) => x.id !== p.id));
    try { await borrarProducto(s, p.id); refrescarCatalogo(); avisar({ texto: `Quitado: ${p.nombre}`, deshacer: async () => { setAviso(null); await guardar(aBorrador(p)); } }); }
    catch (x) { avisar({ texto: (x as Error).message }); recargar(); }
  };

  const filtrados = useMemo(() => { const n = q.trim().toLowerCase(); return n ? productos.filter((p) => p.nombre.toLowerCase().includes(n)) : productos; }, [productos, q]);
  const agotados = productos.filter((p) => p.agotado).length;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-40 pt-4">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-card text-2xl">{s.tienda.emoji}</span>
        <div className="min-w-0 flex-1"><h1 className="truncate text-xl font-semibold">{s.tienda.nombre}</h1><p className="text-xs text-muted">{productos.length} productos{agotados ? ` · ${agotados} agotados` : ""}{modoDemo ? " · modo prueba" : ""}</p></div>
        <button onClick={onSalir} aria-label="Salir" className="btn-ghost !px-3"><LogOut size={16} /></button>
      </div>
      {productos.length > 5 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-surface px-3"><Search size={16} className="text-muted" /><input value={q} onChange={(x) => setQ(x.target.value)} placeholder="Buscar en mis productos" className="min-w-0 flex-1 bg-transparent py-2.5 text-[16px] outline-none" /></div>
      )}
      {err && <p className="mt-3 text-sm text-[#ff7a7a]">{err}</p>}
      {!cargando && productos.length === 0 ? (
        <div className="panel mt-6 p-6 text-center">
          <p className="text-lg font-semibold">Todavía no tienes productos</p>
          <p className="mt-1 text-sm text-soft">Haz una foto, pon el precio y listo. Si ya tienes una lista en el móvil o en Excel, pégala entera.</p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {filtrados.map((p) => <Fila key={p.id} p={p} color={s.tienda.color} onAbrir={() => setEditando(p)} onPrecio={(precio) => cambiar(p, { precio })} onAgotado={() => cambiar(p, { agotado: !p.agotado })} onQuitar={() => quitar(p)} />)}
        </ul>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[#14110f]/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-2">
          <button onClick={() => setEditando("nuevo")} className="btn-brand flex flex-1 items-center justify-center gap-2 py-3.5 text-base"><Plus size={20} />Añadir producto</button>
          <button onClick={() => setLista(true)} className="btn-ghost flex items-center gap-2 !py-3.5"><ClipboardList size={18} />Pegar lista</button>
        </div>
      </div>
      {aviso && <div className="fixed inset-x-3 bottom-24 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm text-black shadow-xl"><span className="truncate">{aviso.texto}</span>{aviso.deshacer && <button onClick={aviso.deshacer} className="shrink-0 font-semibold text-[#c2410c]">Deshacer</button>}</div>}
      {editando && <Editor p={editando === "nuevo" ? null : editando} color={s.tienda.color} onCerrar={() => setEditando(null)} onGuardar={guardar} onQuitar={(p) => { setEditando(null); quitar(p); }} avisar={avisar} />}
      {lista && <Lista onCerrar={() => setLista(false)} onAñadir={async (xs) => { for (const x of xs) await guardarProducto(s, x); await tras(); setLista(false); avisar({ texto: `Añadidos ${xs.length} productos` }); }} />}
    </div>
  );
}

const aBorrador = (p: Producto): Borrador => ({ id: p.id, nombre: p.nombre, precio: p.precio, categoria: p.categoria, marca: p.marca, desc: p.desc, agotado: p.agotado, imagen: p.imagen });

function Fila({ p, color, onAbrir, onPrecio, onAgotado, onQuitar }: { p: Producto; color: string; onAbrir: () => void; onPrecio: (n: number) => void; onAgotado: () => void; onQuitar: () => void }) {
  const [precio, setPrecio] = useState<string | null>(null);
  const fijar = () => { const n = precio == null ? null : leerPrecio(precio); if (n != null && n !== p.precio) onPrecio(n); setPrecio(null); };
  return (
    <li className={`flex items-center gap-3 p-3 ${p.agotado ? "opacity-60" : ""}`}>
      <button onClick={onAbrir} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <Tile emoji={p.emoji} color={color} imagen={p.imagen} alt={p.nombre} className="h-14 w-14 shrink-0 overflow-hidden rounded-xl" size={26} />
        <span className="min-w-0"><span className="line-clamp-2 text-[15px] leading-tight">{p.nombre}</span><span className="text-xs text-muted">{nombreCategoria(p.categoria)}{p.agotado ? " · agotado" : ""}</span></span>
      </button>
      {precio == null
        ? <button onClick={() => setPrecio(p.precio.toFixed(2).replace(".", ","))} className="rounded-lg border border-line px-2 py-1.5 text-sm font-semibold" aria-label="Cambiar precio">{eur(p.precio)}</button>
        : <input autoFocus inputMode="decimal" value={precio} onChange={(x) => setPrecio(x.target.value)} onBlur={fijar} onKeyDown={(x) => { if (x.key === "Enter") (x.target as HTMLInputElement).blur(); if (x.key === "Escape") setPrecio(null); }} className="input w-20 !px-2 !py-1.5 text-right !text-[16px]" />}
      <button onClick={onAgotado} role="switch" aria-checked={!p.agotado} aria-label={p.agotado ? "Marcar que hay" : "Marcar agotado"} className={`relative h-7 w-12 shrink-0 rounded-full transition ${p.agotado ? "bg-neutral-700" : "bg-[#3dbb7a]"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${p.agotado ? "left-1" : "left-6"}`} /></button>
      <button onClick={onQuitar} aria-label="Quitar" className="p-1 text-muted hover:text-white"><Trash2 size={18} /></button>
    </li>
  );
}

// ---------- añadir / editar ----------
function Editor({ p, color, onCerrar, onGuardar, onQuitar, avisar }: { p: Producto | null; color: string; onCerrar: () => void; onGuardar: (b: Borrador, foto?: string) => Promise<Producto>; onQuitar: (p: Producto) => void; avisar: (a: Aviso) => void }) {
  const vacio = { nombre: "", precio: "", categoria: "despensa" as Categoria, marca: "", desc: "", agotado: false };
  const [f, setF] = useState(p ? { nombre: p.nombre, precio: p.precio.toFixed(2).replace(".", ","), categoria: p.categoria, marca: p.marca ?? "", desc: p.desc ?? "", agotado: !!p.agotado } : vacio);
  const [pasilloTocado, setPasilloTocado] = useState(!!p);
  const [foto, setFoto] = useState<string | undefined>(), [mas, setMas] = useState(!!(p?.marca || p?.desc));
  const [err, setErr] = useState(""), [guardando, setGuardando] = useState(false);
  const nombreRef = useRef<HTMLInputElement>(null), camara = useRef<HTMLInputElement>(null), galeria = useRef<HTMLInputElement>(null);

  const elegirFoto = async (file?: File) => { if (!file) return; try { setFoto(await reducirFoto(file)); } catch (x) { setErr((x as Error).message); } };
  const enviar = async (otro: boolean) => {
    const precio = leerPrecio(f.precio);
    if (f.nombre.trim().length < 2) return setErr("Pon el nombre del producto");
    if (precio == null) return setErr("Pon un precio válido, por ejemplo 1,99");
    setErr(""); setGuardando(true);
    try {
      await onGuardar({ id: p?.id, nombre: f.nombre.trim(), precio, categoria: f.categoria, marca: f.marca.trim(), desc: f.desc.trim(), agotado: f.agotado, imagen: p?.imagen }, foto);
      if (otro) { avisar({ texto: `Guardado: ${f.nombre.trim()}` }); setF(vacio); setFoto(undefined); setPasilloTocado(false); setGuardando(false); nombreRef.current?.focus(); }
      else onCerrar();
    } catch (x) { setErr((x as Error).message); setGuardando(false); }
  };
  const nuevo = !p;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center" onClick={onCerrar}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-[#1b1714] p-4 pb-6 md:rounded-3xl">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{nuevo ? "Nuevo producto" : "Editar producto"}</h2><button onClick={onCerrar} aria-label="Cerrar" className="p-1 text-muted"><X size={22} /></button></div>
        <div className="mt-3 flex gap-3">
          <button type="button" onClick={() => camara.current?.click()} className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-dashed border-line">
            {foto || p?.imagen ? <Tile emoji="📦" color={color} imagen={foto ?? p?.imagen} className="h-full w-full" /> : <span className="grid h-full w-full place-items-center text-muted"><Camera size={30} /></span>}
          </button>
          <div className="flex flex-1 flex-col justify-center gap-2">
            <button type="button" onClick={() => camara.current?.click()} className="btn-ghost flex items-center justify-center gap-2"><Camera size={16} />Hacer foto</button>
            <button type="button" onClick={() => galeria.current?.click()} className="btn-ghost flex items-center justify-center gap-2"><ImagePlus size={16} />Elegir de la galería</button>
          </div>
          <input ref={camara} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { elegirFoto(e.target.files?.[0]); e.target.value = ""; }} />
          <input ref={galeria} type="file" accept="image/*" hidden onChange={(e) => { elegirFoto(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
        <label className="mt-4 block text-xs text-muted">Nombre<input ref={nombreRef} autoFocus={nuevo} className="input mt-1 !text-[16px]" value={f.nombre} placeholder="Leche entera Kaiku 1 l" onChange={(e) => setF({ ...f, nombre: e.target.value, categoria: pasilloTocado ? f.categoria : adivinarPasillo(e.target.value) })} /></label>
        <label className="mt-3 block text-xs text-muted">Precio
          <div className="relative mt-1"><input inputMode="decimal" className="input !pr-8 !text-[16px]" value={f.precio} placeholder="1,99" onChange={(e) => setF({ ...f, precio: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") enviar(nuevo); }} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">€</span></div>
        </label>
        <p className="mt-3 text-xs text-muted">Pasillo</p>
        <div className="mt-2 flex flex-wrap gap-2">{CATEGORIAS.map((c) => <button type="button" key={c.id} onClick={() => { setF({ ...f, categoria: c.id }); setPasilloTocado(true); }} className={`chip !py-2 ${f.categoria === c.id ? "pill-active border-transparent font-semibold" : ""}`}>{c.emoji} {c.nombre}</button>)}</div>
        <label className="mt-4 flex items-center justify-between rounded-xl border border-line px-3 py-2.5 text-sm"><span>Hay existencias</span><input type="checkbox" checked={!f.agotado} onChange={(e) => setF({ ...f, agotado: !e.target.checked })} className="h-5 w-5 accent-[#3dbb7a]" /></label>
        {mas ? (
          <div className="mt-3 space-y-3">
            <label className="block text-xs text-muted">Marca (opcional)<input className="input mt-1 !text-[16px]" value={f.marca} onChange={(e) => setF({ ...f, marca: e.target.value })} /></label>
            <label className="block text-xs text-muted">Descripción (opcional)<textarea className="input mt-1 min-h-16 !text-[16px]" value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} /></label>
          </div>
        ) : <button type="button" onClick={() => setMas(true)} className="mt-3 text-sm text-brand-400">+ Marca y descripción</button>}
        {err && <p className="mt-3 text-sm text-[#ff7a7a]">{err}</p>}
        <div className="mt-5 flex gap-2">
          {nuevo
            ? <><button disabled={guardando} onClick={() => enviar(true)} className="btn-brand flex-1 py-3.5 text-base">{guardando ? "Guardando…" : "Guardar y añadir otro"}</button><button disabled={guardando} onClick={() => enviar(false)} className="btn-ghost !py-3.5">Guardar</button></>
            : <><button disabled={guardando} onClick={() => enviar(false)} className="btn-brand flex-1 py-3.5 text-base">{guardando ? "Guardando…" : "Guardar cambios"}</button><button onClick={() => onQuitar(p!)} className="btn-ghost flex items-center gap-1 !py-3.5"><Trash2 size={16} />Quitar</button></>}
        </div>
      </div>
    </div>
  );
}

// ---------- pegar lista ----------
function Lista({ onCerrar, onAñadir }: { onCerrar: () => void; onAñadir: (xs: Borrador[]) => Promise<void> }) {
  const [texto, setTexto] = useState(""), [enviando, setEnviando] = useState(false), [err, setErr] = useState("");
  const r = useMemo(() => leerLista(texto), [texto]);
  const archivo = async (file?: File) => { if (file) setTexto(await file.text()); };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center" onClick={onCerrar}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-[#1b1714] p-4 pb-6 md:rounded-3xl">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Pegar una lista</h2><button onClick={onCerrar} aria-label="Cerrar" className="p-1 text-muted"><X size={22} /></button></div>
        <p className="mt-1 text-sm text-soft">Un producto por línea con el precio al final. Vale copiar de WhatsApp, notas o Excel.</p>
        <textarea autoFocus value={texto} onChange={(e) => setTexto(e.target.value)} className="input mt-3 min-h-40 font-mono !text-[15px]" placeholder={"Leche entera Kaiku 1 l  1,15\nPan de barra 0,90\nTomate pera kg 2,49"} />
        <label className="mt-2 inline-block cursor-pointer text-sm text-brand-400">o sube un archivo CSV<input type="file" accept=".csv,.txt,text/csv,text/plain" hidden onChange={(e) => archivo(e.target.files?.[0])} /></label>
        {r.ok.length > 0 && (
          <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-line p-2 text-sm">
            {r.ok.map((x, i) => <li key={i} className="flex justify-between gap-2"><span className="truncate">{x.nombre}</span><span className="shrink-0 text-muted">{nombreCategoria(x.categoria)} · <span className="text-white">{eur(x.precio)}</span></span></li>)}
          </ul>
        )}
        {r.malas.length > 0 && <p className="mt-2 text-xs text-[#ffb27a]">{r.malas.length} {r.malas.length === 1 ? "línea sin precio no se añadirá" : "líneas sin precio no se añadirán"}: {r.malas.slice(0, 2).join(" · ")}{r.malas.length > 2 ? "…" : ""}</p>}
        {err && <p className="mt-2 text-sm text-[#ff7a7a]">{err}</p>}
        <button disabled={!r.ok.length || enviando} onClick={async () => { setEnviando(true); setErr(""); try { await onAñadir(r.ok); } catch (x) { setErr((x as Error).message); setEnviando(false); } }} className="btn-brand mt-4 w-full py-3.5 text-base">{enviando ? "Añadiendo…" : r.ok.length ? `Añadir ${r.ok.length} productos` : "Pega tu lista arriba"}</button>
        <p className="mt-2 text-center text-xs text-muted">Luego puedes ponerles foto tocando cada uno.</p>
      </div>
    </div>
  );
}
