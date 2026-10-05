import { producto, tienda } from "./data";
import type { LineaPedido } from "./types";

// Tarifas (cámbialas aquí: las usa la web y el servidor de cobro)
export const TARIFA = {
  envioBase: 2.99,        // primera tienda
  porTiendaExtra: 1.5,    // cada tienda adicional en el mismo mandado
  gratisDesde: 40,        // envío gratis a partir de este subtotal (solo 1 tienda)
  servicioPct: 0.05,      // gastos de gestión
  servicioMax: 2,
  minimo: 8,              // pedido mínimo
};
// Códigos postales donde repartimos
export const ZONAS: Record<string, string> = {
  "20870": "Elgoibar", "20600": "Eibar", "20820": "Deba", "20590": "Soraluze", "20830": "Mutriku", "20850": "Mendaro",
};

const r2 = (n: number) => Math.round(n * 100) / 100;

export function calcular(items: LineaPedido[]) {
  const lineas = items
    .map((i) => ({ ...i, p: producto(i.id) }))
    .filter((l): l is { id: string; qty: number; p: NonNullable<ReturnType<typeof producto>> } => !!l.p && !l.p.agotado && Number.isInteger(l.qty) && l.qty > 0 && l.qty <= 50)
    .map((l) => ({ id: l.id, qty: l.qty, producto: l.p, tienda: tienda(l.p.tiendaId)!, importe: r2(l.p.precio * l.qty) }));
  const tiendas = Array.from(new Set(lineas.map((l) => l.tienda.id)));
  const subtotal = r2(lineas.reduce((s, l) => s + l.importe, 0));
  let envio = tiendas.length ? TARIFA.envioBase + (tiendas.length - 1) * TARIFA.porTiendaExtra : 0;
  if (tiendas.length === 1 && subtotal >= TARIFA.gratisDesde) envio = 0;
  const servicio = r2(Math.min(TARIFA.servicioMax, subtotal * TARIFA.servicioPct));
  envio = r2(envio);
  const total = r2(subtotal + envio + servicio);
  const faltaMinimo = r2(Math.max(0, TARIFA.minimo - subtotal));
  const mayorEdad = lineas.some((l) => l.producto.tags.includes("+18"));
  return { lineas, tiendas, subtotal, envio, servicio, total, faltaMinimo, mayorEdad };
}
export const enZona = (cp: string) => ZONAS[cp.trim()] ?? null;
