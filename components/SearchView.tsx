"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { buscar, interpretar } from "@/lib/search";
import { CATEGORIAS, PASILLOS, PRODUCTOS, TIPOS, deTienda, deTipo, extras, nombreCategoria, tienda, tiendasDeTipo, todosProductos } from "@/lib/data";
import { esMedicamento } from "@/lib/pasillo";
import StoreCard from "./StoreCard";
import { useCatalogo } from "@/lib/catalogo";
import type { Categoria, TipoLocal } from "@/lib/types";
import { eur } from "@/lib/format";
import ProductCard from "./ProductCard";

export default function SearchView() {
  const sp = useSearchParams();
  const r = useRouter();
  const q0 = sp.get("q") || "";
  const cat0 = (sp.get("cat") || "") as Categoria | "";
  const tienda0 = sp.get("tienda") || "";
  const tipo0 = (sp.get("tipo") || "") as TipoLocal | "";
  const v = useCatalogo();
  const [q, setQ] = useState(q0);
  useEffect(() => setQ(q0), [q0]);
  const c = useMemo(() => { const x = interpretar(q0); if (cat0) x.categoria = cat0; return x; }, [q0, cat0]);
  const res = useMemo(() => {
    if (tienda0) return deTienda(tienda0);
    const base = q0 || cat0 ? buscar(c, 120) : tipo0 ? todosProductos().filter((p) => !p.agotado) : [...extras().filter((p) => !p.agotado).slice(0, 20), ...PRODUCTOS.filter((p) => p.popular)];
    return tipo0 ? deTipo(tipo0, base).slice(0, 120) : base;
  }, [c, q0, cat0, tienda0, tipo0, v]); // eslint-disable-line react-hooks/exhaustive-deps
  const locales = tipo0 && !tienda0 ? tiendasDeTipo(tipo0) : [];
  const pasillos = CATEGORIAS.filter((x) => PASILLOS[tipo0 || "super"].includes(x.id));
  const ir = (nq: string, ncat = cat0, ntipo = tipo0) => r.push(`/buscar/?${new URLSearchParams({ ...(ntipo ? { tipo: ntipo } : {}), ...(nq ? { q: nq } : {}), ...(ncat ? { cat: ncat } : {}) })}`);
  const tipoInfo = TIPOS.find((t) => t.id === tipo0);
  const chips = [c.categoria && nombreCategoria(c.categoria), c.max != null && `hasta ${eur(c.max)}`, ...c.tags, c.barato && "más baratos primero", ...c.terminos].filter(Boolean) as string[];
  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 md:px-6">
      <form onSubmit={(e) => { e.preventDefault(); ir(q.trim()); }} className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-2 pl-4">
        <Search size={18} className="text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tipo0 === "restaurante" ? "¿Qué te apetece? pizza, hamburguesa…" : "Busca lo que quieras: leche, pizza, pañales…"} className="min-w-0 flex-1 bg-transparent py-2 text-[16px] outline-none placeholder:text-muted" aria-label="Buscar" />
        {q && <button type="button" onClick={() => { setQ(""); ir(""); }} aria-label="Borrar" className="text-muted"><X size={18} /></button>}
        <button className="btn-brand !py-2">Buscar</button>
      </form>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        <button onClick={() => ir(q0, "", "")} className={`rounded-xl border px-3 py-2 text-sm ${!tipo0 ? "border-brand bg-card font-semibold" : "border-line"}`}>Todo</button>
        {TIPOS.map((t) => <button key={t.id} onClick={() => ir(q0, "", t.id)} className={`shrink-0 rounded-xl border px-3 py-2 text-sm ${tipo0 === t.id ? "border-brand bg-card font-semibold" : "border-line"}`}>{t.emoji} {t.corto}</button>)}
      </div>
      {locales.length > 0 && <div className="no-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4">{locales.map((t) => <StoreCard key={t.id} t={t} />)}</div>}
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        <button onClick={() => ir(q0, "")} className={`chip ${!cat0 ? "pill-active border-transparent font-semibold" : ""}`}>Todo</button>
        {pasillos.map((x) => <button key={x.id} onClick={() => ir(q0, x.id)} className={`chip ${cat0 === x.id ? "pill-active border-transparent font-semibold" : ""}`}>{x.emoji} {x.nombre}</button>)}
      </div>
      {q0 && chips.length > 0 && <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-soft"><Sparkles size={14} className="text-brand-400" />Entendido: {chips.map((t) => <span key={t} className="rounded-full bg-card px-2 py-0.5 text-white">{t}</span>)}</p>}
      <p className="mt-4 text-sm text-muted">{tienda0 ? `${tienda(tienda0)?.emoji ?? ""} ${tienda(tienda0)?.nombre ?? "Tienda"} · ${res.length} productos` : q0 || cat0 ? `${res.length} resultados` : tipoInfo ? `${tipoInfo.nombre} · ${locales.length} ${locales.length === 1 ? "local" : "locales"}` : "Lo más pedido"}</p>
      {q0 && esMedicamento(q0) ? (
        <div className="panel mt-4 p-8 text-center"><p className="font-medium">Los medicamentos no se venden por la app</p><p className="mt-1 text-sm text-soft">Por ley solo los vende a distancia la web de la propia farmacia.</p></div>
      ) : res.length === 0 ? (
        tipoInfo && !locales.length
          ? <div className="panel mt-4 p-8 text-center"><p className="text-3xl">{tipoInfo.emoji}</p><p className="mt-2 font-medium">Pronto: {tipoInfo.nombre.toLowerCase()} en tu zona</p><p className="mt-1 text-sm text-soft">Estamos sumando locales. ¿Tienes uno? Súbelo gratis desde el <a href="/mandader/panel/" className="text-brand-400 underline">panel de tienda</a>.</p></div>
          : <div className="panel mt-4 p-8 text-center"><p className="font-medium">No lo tenemos en el catálogo todavía</p><p className="mt-1 text-sm text-soft">Pídelo igual en las notas del pedido como «mandado libre» y el repartidor lo busca por ti.</p></div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">{res.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      )}
    </div>
  );
}
