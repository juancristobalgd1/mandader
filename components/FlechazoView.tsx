"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Clock, Info, RotateCcw, ShoppingBag, X } from "lucide-react";
import { CATEGORIAS, PRODUCTOS, tienda } from "@/lib/data";
import type { Categoria, Producto } from "@/lib/types";
import { eur } from "@/lib/format";
import { useCart } from "./useCart";
import { useLocal } from "./useLocal";
import Tile from "./Tile";

const UMBRAL = 110;
function barajar<T extends { id: string }>(xs: T[]) {
  const h = (s: string) => { let x = 2166136261; for (const c of s) x = Math.imul(x ^ c.charCodeAt(0), 16777619); return x >>> 0; };
  return [...xs].sort((a, b) => h(a.id) - h(b.id));
}

export default function FlechazoView() {
  const [cat, setCat] = useLocal<Categoria | "">("mandader:flechazo-cat", "comida");
  const [vistos, setVistos] = useLocal<string[]>("mandader:flechazo-vistos", []);
  const [hist, setHist] = useState<{ id: string; like: boolean }[]>([]);
  const { add, count } = useCart();
  const mazo = useMemo(() => barajar(PRODUCTOS.filter((p) => (!cat || p.categoria === cat) && !vistos.includes(p.id))), [cat, vistos]);
  const top = mazo[0], next = mazo[1];
  const [dx, setDx] = useState(0), [dy, setDy] = useState(0), [saliendo, setSaliendo] = useState<0 | 1 | -1>(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => { setDx(0); setDy(0); setSaliendo(0); }, [top?.id]);

  const decidir = (like: boolean) => {
    if (!top || saliendo) return;
    setSaliendo(like ? 1 : -1);
    setTimeout(() => { if (like) add(top.id); setHist((h) => [{ id: top.id, like }, ...h].slice(0, 20)); setVistos([...vistos, top.id]); }, 220);
  };
  const deshacer = () => { const u = hist[0]; if (!u) return; if (u.like) add(u.id, -1); setVistos(vistos.filter((x) => x !== u.id)); setHist((h) => h.slice(1)); };
  const onDown = (e: React.PointerEvent) => { start.current = { x: e.clientX, y: e.clientY }; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); };
  const onMove = (e: React.PointerEvent) => { if (!start.current) return; setDx(e.clientX - start.current.x); setDy((e.clientY - start.current.y) * 0.3); };
  const onUp = () => { if (!start.current) return; start.current = null; if (dx > UMBRAL) return decidir(true); if (dx < -UMBRAL) return decidir(false); setDx(0); setDy(0); };
  const tx = saliendo ? saliendo * 600 : dx;
  const like = Math.max(0, Math.min(1, tx / UMBRAL)), nope = Math.max(0, Math.min(1, -tx / UMBRAL));

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-4 pb-28 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <Link href="/" aria-label="Volver" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5"><ArrowLeft size={18} /></Link>
        <h1 className="font-serif text-[24px] leading-none">Modo flechazo</h1>
        <Link href="/carrito/" className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm"><ShoppingBag size={15} className="text-brand" />{count}</Link>
      </div>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        <button onClick={() => setCat("")} className={`chip ${cat === "" ? "pill-active border-transparent font-semibold" : ""}`}>Todo</button>
        {CATEGORIAS.map((c) => <button key={c.id} onClick={() => setCat(c.id)} className={`chip ${cat === c.id ? "pill-active border-transparent font-semibold" : ""}`}>{c.emoji} {c.nombre}</button>)}
      </div>
      <div className="relative flex-1" style={{ minHeight: 440 }}>
        {!top && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[28px] border border-white/10 bg-card p-8 text-center">
            <p className="mb-2 text-xl font-semibold">Has visto todo</p>
            <p className="mb-6 text-soft">Cambia de categoría o vuelve a empezar.</p>
            <button onClick={() => { setVistos([]); setHist([]); }} className="btn-brand">Empezar de nuevo</button>
          </div>
        )}
        {next && <Tarjeta p={next} className="scale-[.95] opacity-70" />}
        {top && (
          <div className="absolute inset-0 touch-none select-none" style={{ transform: `translate(${tx}px, ${dy}px) rotate(${tx / 18}deg)`, transition: start.current ? "none" : "transform .22s ease-out" }}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            <Tarjeta p={top} />
            <span className="pointer-events-none absolute left-5 top-6 -rotate-12 rounded-xl border-4 border-[#3ddc97] px-3 py-1 text-3xl font-black text-[#3ddc97]" style={{ opacity: like }}>¡AL CARRITO!</span>
            <span className="pointer-events-none absolute right-5 top-6 rotate-12 rounded-xl border-4 border-[#ff5a6e] px-3 py-1 text-3xl font-black text-[#ff5a6e]" style={{ opacity: nope }}>PASO</span>
          </div>
        )}
      </div>
      <div className="mt-5 flex items-center justify-center gap-5">
        <button onClick={deshacer} disabled={!hist.length} aria-label="Deshacer" className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-soft disabled:opacity-30"><RotateCcw size={20} /></button>
        <button onClick={() => decidir(false)} disabled={!top} aria-label="Paso" className="grid h-16 w-16 place-items-center rounded-full border-2 border-[#ff5a6e]/60 bg-[#ff5a6e]/10 text-[#ff5a6e] active:scale-95"><X size={30} strokeWidth={2.6} /></button>
        <button onClick={() => decidir(true)} disabled={!top} aria-label="Al carrito" className="grid h-16 w-16 place-items-center rounded-full border-2 border-[#3ddc97]/60 bg-[#3ddc97]/10 text-[#3ddc97] active:scale-95"><ShoppingBag size={28} strokeWidth={2.4} /></button>
        {top ? <Link href={`/producto/${top.id}/`} aria-label="Ver ficha" className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-soft"><Info size={20} /></Link> : <span className="h-12 w-12" />}
      </div>
      <p className="mt-3 text-center text-[13px] text-soft">Desliza a la derecha y va directo al <Link href="/carrito/" className="underline">carrito</Link>, a la izquierda para pasar.</p>
    </main>
  );
}

function Tarjeta({ p, className = "" }: { p: Producto; className?: string }) {
  const t = tienda(p.tiendaId)!;
  return (
    <div className={`absolute inset-0 overflow-hidden rounded-[28px] bg-card shadow-[0_20px_60px_rgba(0,0,0,.55)] ${className}`}>
      <Tile emoji={p.emoji} color={t.color} className="h-full w-full" size={150} />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5 pt-24">
        <p className="text-[30px] font-bold leading-none tracking-tight">{eur(p.precio)}</p>
        <p className="mt-2 text-xl font-semibold">{p.nombre}</p>
        <p className="mt-1 text-sm text-white/75">{p.desc}</p>
        <p className="mt-2 flex items-center gap-3 text-sm text-white/80"><span>{t.emoji} {t.nombre}</span><span className="flex items-center gap-1"><Clock size={14} />{t.tiempoMin} min</span></p>
      </div>
    </div>
  );
}
