"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CreditCard, Lock } from "lucide-react";
import { calcular, enZona, ZONAS } from "@/lib/pricing";
import { crearPedido, modoDemo } from "@/lib/api";
import type { Entrega } from "@/lib/types";
import { eur } from "@/lib/format";
import { useCart } from "./useCart";
import { useLocal } from "./useLocal";
import { Fila } from "./CartView";

const VACIA: Entrega = { nombre: "", telefono: "", direccion: "", piso: "", cp: "20870", notas: "", cuando: "ya" };

export default function CheckoutView() {
  const { items, clear } = useCart();
  const [perfil, setPerfil] = useLocal<Entrega>("mandader:entrega", VACIA);
  const [e, setE] = useState<Entrega>(VACIA);
  const [edad, setEdad] = useState(false);
  const [err, setErr] = useState(""), [enviando, setEnviando] = useState(false);
  const r = useRouter();
  useEffect(() => { if (perfil.nombre || perfil.direccion) setE({ ...VACIA, ...perfil, notas: "" }); }, [perfil]);
  const c = calcular(items);
  const zona = enZona(e.cp);
  const set = (k: keyof Entrega) => (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setE({ ...e, [k]: ev.target.value });
  const valido = e.nombre.trim() && /^[+0-9 ]{9,15}$/.test(e.telefono.trim()) && e.direccion.trim().length > 4 && zona && c.lineas.length && !c.faltaMinimo && (!c.mayorEdad || edad);

  const pagar = async () => {
    if (!valido) return;
    setErr(""); setEnviando(true);
    try {
      setPerfil({ ...e, notas: "" });
      const res = await crearPedido(items, e);
      if (res.pagoUrl) { location.href = res.pagoUrl; return; }
      clear(); r.push(`/pedido/?id=${res.id}`);
    } catch (x) { setErr((x as Error).message); setEnviando(false); }
  };

  if (!c.lineas.length) return <div className="mx-auto max-w-md px-5 py-20 text-center"><p className="text-soft">No hay nada que pagar.</p><Link href="/buscar/" className="btn-brand mt-4 inline-block">Buscar productos</Link></div>;
  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-4 md:px-6">
      <Link href="/carrito/" className="mb-3 inline-flex items-center gap-1 text-sm text-soft"><ArrowLeft size={16} />Carrito</Link>
      <h1 className="h-section">¿Dónde te lo llevamos?</h1>
      <div className="panel mt-4 grid gap-3 p-4 md:grid-cols-2">
        <label className="text-xs text-muted">Nombre<input className="input mt-1" value={e.nombre} onChange={set("nombre")} autoComplete="name" /></label>
        <label className="text-xs text-muted">Teléfono<input className="input mt-1" value={e.telefono} onChange={set("telefono")} inputMode="tel" autoComplete="tel" placeholder="6XX XXX XXX" /></label>
        <label className="text-xs text-muted md:col-span-2">Calle y número<input className="input mt-1" value={e.direccion} onChange={set("direccion")} autoComplete="street-address" /></label>
        <label className="text-xs text-muted">Piso, puerta<input className="input mt-1" value={e.piso} onChange={set("piso")} /></label>
        <label className="text-xs text-muted">Código postal
          <select className="input mt-1" value={e.cp} onChange={set("cp")}>{Object.entries(ZONAS).map(([cp, n]) => <option key={cp} value={cp}>{cp} · {n}</option>)}</select>
        </label>
        <label className="text-xs text-muted">¿Cuándo?
          <select className="input mt-1" value={e.cuando} onChange={set("cuando")}><option value="ya">Lo antes posible</option><option value="mediodia">Hoy a mediodía (13:00-15:00)</option><option value="tarde">Hoy por la tarde (18:00-20:00)</option><option value="noche">Hoy por la noche (20:00-22:00)</option></select>
        </label>
        <label className="text-xs text-muted md:col-span-2">Notas para el repartidor o mandado libre<textarea className="input mt-1 min-h-20" value={e.notas} onChange={set("notas")} placeholder="Ej.: llamar al timbre 3B. Si no hay leche sin lactosa, trae la normal." /></label>
      </div>
      {c.mayorEdad && <label className="mt-3 flex items-start gap-2 text-sm text-soft"><input type="checkbox" checked={edad} onChange={(x) => setEdad(x.target.checked)} className="mt-1" />Tu pedido lleva alcohol: confirmo que soy mayor de 18 y enseñaré el DNI al recibirlo.</label>}
      <div className="panel mt-4 space-y-2 p-4 text-sm">
        <Fila t={`Productos (${c.lineas.reduce((s, l) => s + l.qty, 0)})`} v={eur(c.subtotal)} />
        <Fila t="Envío" v={c.envio ? eur(c.envio) : "Gratis"} />
        <Fila t="Gestión" v={eur(c.servicio)} />
        <div className="border-t border-line pt-2"><Fila t="Total" v={eur(c.total)} strong /></div>
      </div>
      {err && <p className="mt-3 text-sm text-[#ff7a7a]">{err}</p>}
      <button onClick={pagar} disabled={!valido || enviando} className="btn-brand mt-4 flex w-full items-center justify-center gap-2 py-3.5 text-base">
        <CreditCard size={18} />{enviando ? "Un momento…" : modoDemo ? `Pagar ${eur(c.total)} (demo)` : `Pagar ${eur(c.total)} con tarjeta`}
      </button>
      <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted"><Lock size={12} />{modoDemo ? "Modo demo: no se cobra nada." : "Pago seguro con Stripe. No guardamos tu tarjeta."}</p>
    </div>
  );
}
