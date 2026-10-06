import Link from "next/link";
import { Bike, CreditCard, Search } from "lucide-react";
import HeroSearch from "@/components/HeroSearch";
import SectionHeader from "@/components/SectionHeader";
import Carousel from "@/components/Carousel";
import ProductCard from "@/components/ProductCard";
import Faq from "@/components/Faq";
import TiposLocales from "@/components/TiposLocales";
import { CATEGORIAS, PRODUCTOS, TIENDAS, deCategoria } from "@/lib/data";
import { TARIFA, ZONAS } from "@/lib/pricing";
import { BRAND } from "@/lib/brand";
import { eur } from "@/lib/format";

export default function Home() {
  const basicos = PRODUCTOS.filter((p) => p.popular).slice(0, 16);
  const faq = [
    { q: `¿Qué es ${BRAND.name}?`, a: "Pides del súper, de un restaurante, de la farmacia o de las tiendas del pueblo, pagas en la app y un repartidor te lo lleva a casa." },
    { q: "¿Puedo pedir medicamentos?", a: "No. Por ley los medicamentos solo los vende a distancia la web de la propia farmacia. Sí puedes pedir parafarmacia, higiene y productos de bebé." },
    { q: "¿Dónde repartís?", a: `Ahora mismo en ${Object.values(ZONAS).join(", ")}.` },
    { q: "¿Cuánto cuesta el envío?", a: `${eur(TARIFA.envioBase)} por pedido. Gratis a partir de ${eur(TARIFA.gratisDesde)}.` },
    { q: "¿Los precios son los de la tienda?", a: `Son los precios de referencia de la tienda online de ${TIENDAS.map((t) => t.nombre).join(", ")}. Si en tienda cambian, te avisamos antes de comprar.` },
    { q: "¿Y si lo que quiero no está?", a: "Escríbelo en las notas del pedido y el repartidor lo busca por ti." },
  ];
  return (
    <>
      <section className="relative isolate flex min-h-[78svh] flex-col overflow-hidden px-5 pb-12 pt-28 md:min-h-[560px] md:pt-36">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,#5a2a10_0%,#2a160b_40%,#14110f_75%)]" />
        <h1 className="mx-auto max-w-3xl text-center font-serif text-[40px] font-bold leading-[1.06] text-white md:text-7xl">Súper, comida y farmacia,<br /><em className="font-semibold italic text-brand-400">en la puerta de casa</em></h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-soft">{PRODUCTOS.length} productos del súper, restaurantes, farmacia y tiendas del pueblo. Pagas en la app y te lo llevamos en {Object.values(ZONAS).slice(0, 3).join(", ")} y alrededores.</p>
        <div className="mt-8"><HeroSearch /></div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 md:px-6">
        <TiposLocales />
        <section className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-5 md:px-0">
          {CATEGORIAS.filter((c) => deCategoria(c.id).length).map((c) => (
            <Link key={c.id} href={`/buscar/?cat=${c.id}`} className="panel flex w-28 shrink-0 flex-col items-center gap-2 px-2 py-4 text-center transition hover:border-neutral-600 md:w-auto">
              <span className="text-3xl">{c.emoji}</span><span className="text-xs text-soft">{c.nombre}</span>
            </Link>))}
        </section>

        {basicos.length > 0 && <section><SectionHeader eyebrow="Lo de siempre" title="Básicos de la compra" href="/buscar/" />
          <Carousel>{basicos.map((p) => <div key={p.id} className="w-[160px] shrink-0 snap-start md:w-[190px]"><ProductCard p={p} /></div>)}</Carousel>
        </section>}

        {CATEGORIAS.map((c) => { const xs = deCategoria(c.id); if (!xs.length) return null; return (
          <section key={c.id}><SectionHeader eyebrow={`${xs.length} productos`} title={`${c.emoji} ${c.nombre}`} href={`/buscar/?cat=${c.id}`} />
            <Carousel>{xs.slice(0, 12).map((p) => <div key={p.id} className="w-[160px] shrink-0 snap-start md:w-[190px]"><ProductCard p={p} /></div>)}</Carousel>
          </section>); })}

        <section className="text-center">
          <h2 className="h-section">Así de fácil</h2>
          <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
            {[{ I: Search, t: "Llena el carrito", d: "Busca como hablas: «leche sin lactosa» o «detergente hasta 6 €»." },
              { I: CreditCard, t: "Paga en la app", d: "Tarjeta con pago seguro. Ves el total con envío antes de pagar." },
              { I: Bike, t: "Te lo llevamos", d: "Tu repartidor hace la compra y la lleva a tu casa. La sigues en directo." }].map(({ I, t, d }) => (
              <div key={t} className="panel p-5"><I size={20} className="text-brand-400" /><p className="mt-3 font-medium">{t}</p><p className="mt-1 text-sm text-soft">{d}</p></div>))}
          </div>
        </section>

        <section id="faq" className="grid gap-10 md:grid-cols-2">
          <div><p className="eyebrow">Preguntas frecuentes</p><h2 className="h-section mt-2">¿Cómo funciona {BRAND.name}?</h2><p className="mt-4 text-soft">Tú eliges, nosotros hacemos la compra.</p></div>
          <Faq items={faq} />
        </section>
      </div>
    </>
  );
}
