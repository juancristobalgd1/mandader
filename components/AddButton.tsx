"use client";
import { Minus, Plus } from "lucide-react";
import { useCart } from "./useCart";
export default function AddButton({ id, big = false }: { id: string; big?: boolean }) {
  const { qty, add } = useCart();
  const q = qty(id);
  const h = big ? "h-12" : "h-9";
  if (!q) return (
    <button onClick={(e) => { e.preventDefault(); add(id); }} aria-label="Añadir al carrito" className={`${h} ${big ? "btn-brand w-full text-base" : "grid w-9 place-items-center rounded-full bg-brand text-[#2a1204]"}`}>
      {big ? "Añadir al carrito" : <Plus size={18} strokeWidth={2.6} />}
    </button>
  );
  return (
    <div onClick={(e) => e.preventDefault()} className={`${h} flex items-center justify-between gap-2 rounded-full bg-brand px-1 font-semibold text-[#2a1204] ${big ? "w-full text-base" : ""}`}>
      <button onClick={() => add(id, -1)} aria-label="Quitar uno" className="grid h-7 w-7 place-items-center rounded-full bg-black/10"><Minus size={16} strokeWidth={2.6} /></button>
      <span className="min-w-4 text-center text-sm">{q}</span>
      <button onClick={() => add(id, 1)} aria-label="Añadir uno" className="grid h-7 w-7 place-items-center rounded-full bg-black/10"><Plus size={16} strokeWidth={2.6} /></button>
    </div>
  );
}
