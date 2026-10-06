"use client";
import Link from "next/link";
import { TIPOS, tiendasDeTipo } from "@/lib/data";
import { useCatalogo } from "@/lib/catalogo";

// Las cuatro secciones de la portada, como en Glovo
export default function TiposLocales() {
  useCatalogo();
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {TIPOS.map((t) => { const n = tiendasDeTipo(t.id).length; return (
        <Link key={t.id} href={`/buscar/?tipo=${t.id}`} className="panel flex items-center gap-3 p-4 transition hover:border-neutral-600">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-card text-3xl">{t.emoji}</span>
          <span className="min-w-0"><span className="block font-semibold text-white">{t.nombre}</span><span className="block text-xs text-muted">{n ? `${n} ${n === 1 ? "local" : "locales"} · ${t.desc}` : `Pronto · ${t.desc}`}</span></span>
        </Link>); })}
    </section>
  );
}
