"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
const IDEAS = ["leche sin lactosa", "pizza", "protector solar", "aceite de oliva barato", "pañales", "detergente hasta 6 €"];
export default function HeroSearch() {
  const [q, setQ] = useState("");
  const r = useRouter();
  const ir = (t: string) => t.trim() && r.push(`/buscar/?q=${encodeURIComponent(t.trim())}`);
  return (
    <div className="mx-auto w-full max-w-2xl">
      <form onSubmit={(e) => { e.preventDefault(); ir(q); }} className="flex items-center gap-2 rounded-[28px] border border-white/15 bg-black/45 p-2 pl-5 shadow-2xl backdrop-blur">
        <Sparkles size={18} className="shrink-0 text-brand-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="¿Qué te traemos hoy?" className="min-w-0 flex-1 bg-transparent py-2.5 text-[16px] text-white outline-none placeholder:text-white/55" aria-label="Qué quieres pedir" />
        <button aria-label="Buscar" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-[#2a1204]"><ArrowUp size={20} strokeWidth={2.6} /></button>
      </form>
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:justify-center">
        {IDEAS.map((i) => <button key={i} onClick={() => ir(i)} className="chip border-white/15 bg-black/35 backdrop-blur">{i}</button>)}
      </div>
    </div>
  );
}
