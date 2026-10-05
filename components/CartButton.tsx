"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./useCart";
export default function CartButton() {
  const { count } = useCart();
  return (
    <Link href="/carrito/" aria-label="Carrito" className="relative grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-white">
      <ShoppingBag size={20} />
      {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-[#2a1204]">{count}</span>}
    </Link>
  );
}
