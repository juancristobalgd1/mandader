"use client";
import StoreCard from "./StoreCard";
import { todasTiendas } from "@/lib/data";
import { useCatalogo } from "@/lib/catalogo";
export default function TiendasView() {
  useCatalogo();
  return <div className="mt-4 flex flex-wrap gap-3">{todasTiendas().map((t) => <StoreCard key={t.id} t={t} />)}</div>;
}
