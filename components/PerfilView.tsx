"use client";
import Link from "next/link";
import { Bike, PackagePlus, Receipt, Store } from "lucide-react";
import { useLocal } from "./useLocal";
import type { Entrega } from "@/lib/types";
import { ZONAS } from "@/lib/pricing";

export default function PerfilView() {
  const [e, setE] = useLocal<Partial<Entrega>>("mandader:entrega", {});
  return (
    <div className="mx-auto max-w-xl px-4 pt-4 md:px-6">
      <h1 className="h-section">Tu perfil</h1>
      <div className="panel mt-4 space-y-3 p-4">
        <p className="text-sm font-medium">Dirección por defecto</p>
        <input className="input" placeholder="Nombre" value={e.nombre ?? ""} onChange={(x) => setE({ ...e, nombre: x.target.value })} />
        <input className="input" placeholder="Teléfono" value={e.telefono ?? ""} onChange={(x) => setE({ ...e, telefono: x.target.value })} />
        <input className="input" placeholder="Calle y número" value={e.direccion ?? ""} onChange={(x) => setE({ ...e, direccion: x.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Piso, puerta" value={e.piso ?? ""} onChange={(x) => setE({ ...e, piso: x.target.value })} />
          <select className="input" value={e.cp ?? "20870"} onChange={(x) => setE({ ...e, cp: x.target.value })}>{Object.entries(ZONAS).map(([cp, n]) => <option key={cp} value={cp}>{cp} · {n}</option>)}</select>
        </div>
        <p className="text-xs text-muted">Se guarda solo en este móvil.</p>
      </div>
      <div className="mt-4 grid gap-3">
        <Link href="/pedidos/" className="panel flex items-center gap-3 p-4"><Receipt size={18} className="text-brand-400" />Mis pedidos</Link>
        <Link href="/panel/" className="panel flex items-center gap-3 p-4"><PackagePlus size={18} className="text-brand-400" />¿Tienes una tienda? Sube tus productos</Link>
        <Link href="/repartidor/" className="panel flex items-center gap-3 p-4"><Bike size={18} className="text-brand-400" />Panel de repartidor</Link>
        <Link href="/tiendas/" className="panel flex items-center gap-3 p-4"><Store size={18} className="text-brand-400" />Todas las tiendas</Link>
      </div>
    </div>
  );
}
