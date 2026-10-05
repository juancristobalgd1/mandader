import Link from "next/link";
import { ArrowRight, Bike, CreditCard, Flame, Search } from "lucide-react";
import HeroSearch from "@/components/HeroSearch";
import SectionHeader from "@/components/SectionHeader";
import Carousel from "@/components/Carousel";
import ProductCard from "@/components/ProductCard";
import StoreCard from "@/components/StoreCard";
import Faq from "@/components/Faq";
import { CATEGORIAS, PRODUCTOS, TIENDAS, deTienda } from "@/lib/data";
import { TARIFA, ZONAS } from "@/lib/pricing";
import { BRAND } from "@/lib/brand";
import { eur } from "@/lib/format";

export default function Home() {
  const populares = PRODUCTOS.filter((p) => p.popular);
  const faq = [
    { q: `¿Qué es ${BRAND.name}?`, a: `Una app de mandados: buscas cualquier producto (comida, súper, farmacia, pan, bebidas o cosas de casa), pagas y un repartidor lo compra y te lo lleva a casa.` },
    { q: "¿Dónde repartís?", a: `Ahora mismo en ${Object.values(ZONAS).join(", ")}.` },
    { q: "¿Cuánto cuesta el envío?", a: `${eur(TARIFA.envioBase)} por mandado y ${eur(TARIFA.porTiendaExtra)} por cada tienda extra. Gratis a partir de ${eur(TARIFA.gratisDesde)} en una sola tienda.` },
    { q: "¿Y si lo que quiero no está en la app?", a: "Escríbelo en las notas del pedido como «mandado libre» y el repartidor lo busca por ti." },
    { q: "¿Cómo pago?", a: "Con tarjeta, de forma segura con Stripe, antes de que el repartidor salga a comprar." },
  ];
  return (
    <>
      <section className="relative isolate flex min-h-[88svh] flex-col overflow-hidden px-5 pb-16 pt-28 md:min-h-[620px] md:pt-36">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,#5a2a10_0%,#2a160b_40%,#14110f_75%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-24 -z-10 flex justify-center gap-6 text-5xl opacity-20 md:text-7xl">🍕🥖💊🛒🍣🥑</div>
        <h1 className="mx-auto max-w-3xl text-center font-serif text-[40px] font-bold leading-[1.06] text-white md:text-7xl">Lo que quieras,<br /><em className="font-semibold italic text-brand-400">a tu puerta</em></h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-soft">Comida, súper, farmacia o cualquier mandado. Pagas en la app y te lo llevamos en {Object.values(ZONAS).slice(0, 3).join(", ")} y alrededores.</p>
        <div className="mt-8"><HeroSearch /></div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 md:px-6">
        <section className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-7 md:px-0">
          {CATEGORIAS.map((c) => (
            <Link key={c.id} href={`/buscar/?cat=${c.id}`} className="panel flex w-24 shrink-0 flex-col items-center gap-2 py-4 transition hover:border-neutral-600 md:w-auto">
              <span className="text-3xl">{c.emoji}</span><span className="text-xs text-soft">{c.nombre}</span>
            </Link>))}
        </section>

        <Link href="/flechazo/" className="flex items-center gap-4 rounded-3xl border border-brand/30 bg-gradient-to-r from-[#3a1c0b] to-[#231e1a] p-5 transition hover:border-brand/60">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-[#2a1204]"><Flame size={24} /></span>
          <span className="flex-1"><span className="block font-semibold">¿No sabes qué cenar? Modo flechazo</span><span className="text-sm text-soft">Desliza platos: derecha y va al carrito.</span></span>
          <ArrowRight className="text-brand-400" />
        </Link>

        <section><SectionHeader eyebrow="Lo más pedido" title="Favoritos de la zona" href="/buscar/" />
          <Carousel>{populares.map((p) => <div key={p.id} className="w-[170px] shrink-0 snap-start md:w-[210px]"><ProductCard p={p} /></div>)}</Carousel>
        </section>

        <section><SectionHeader eyebrow={`${TIENDAS.length} tiendas`} title="Tiendas cerca de ti" href="/tiendas/" />
          <Carousel>{TIENDAS.map((t) => <StoreCard key={t.id} t={t} />)}</Carousel>
        </section>

        {TIENDAS.filter((t) => t.categoria === "comida").map((t) => (
          <section key={t.id}><SectionHeader eyebrow={`${t.tiempoMin} min · ${t.zona}`} title={`${t.emoji} ${t.nombre}`} href={`/tienda/${t.id}/`} />
            <Carousel>{deTienda(t.id).map((p) => <div key={p.id} className="w-[170px] shrink-0 snap-start md:w-[210px]"><ProductCard p={p} /></div>)}</Carousel>
          </section>
        ))}

        <section className="text-center">
          <h2 className="h-section">Así de fácil</h2>
          <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
            {[{ I: Search, t: "Busca lo que sea", d: "Escribe «pizza para cenar hasta 15 €» o «leche sin lactosa» y lo entendemos." },
              { I: CreditCard, t: "Paga en la app", d: "Tarjeta con pago seguro. Ves el total con envío antes de pagar." },
              { I: Bike, t: "Te lo llevamos", d: "Tu repartidor compra en la tienda y lo lleva a tu casa. Lo sigues en directo." }].map(({ I, t, d }) => (
              <div key={t} className="panel p-5"><I size={20} className="text-brand-400" /><p className="mt-3 font-medium">{t}</p><p className="mt-1 text-sm text-soft">{d}</p></div>))}
          </div>
        </section>

        <section id="faq" className="grid gap-10 md:grid-cols-2">
          <div><p className="eyebrow">Preguntas frecuentes</p><h2 className="h-section mt-2">¿Cómo funciona {BRAND.name}?</h2><p className="mt-4 text-soft">Tú pides, nosotros hacemos el mandado.</p></div>
          <Faq items={faq} />
        </section>
      </div>
    </>
  );
}
