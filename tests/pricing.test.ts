import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { calcular, TARIFA } from "../lib/pricing";
import { PRODUCTOS } from "../lib/data";
import { firmaValida } from "../server/index";

const barato = [...PRODUCTOS].sort((a, b) => a.precio - b.precio)[0];
const caro = [...PRODUCTOS].filter((p) => !p.tags.includes("+18")).sort((a, b) => b.precio - a.precio)[0];

test("ignora productos inventados y cantidades raras", () => {
  const c = calcular([{ id: "falso-1", qty: 1 }, { id: barato.id, qty: -3 }, { id: barato.id, qty: 2.5 }]);
  assert.equal(c.lineas.length, 0); assert.equal(c.total, 0);
});
test("precio siempre del catálogo y envío gratis desde el umbral", () => {
  const una = calcular([{ id: barato.id, qty: 1 }]);
  assert.equal(una.subtotal, barato.precio); assert.equal(una.envio, TARIFA.envioBase);
  const qty = Math.min(50, Math.ceil(TARIFA.gratisDesde / caro.precio));
  const grande = calcular([{ id: caro.id, qty }]);
  if (grande.subtotal >= TARIFA.gratisDesde) assert.equal(grande.envio, 0);
  assert.equal(grande.total, Math.round((grande.subtotal + grande.envio + grande.servicio) * 100) / 100);
});
test("detecta productos +18 si los hay", () => {
  const alc = PRODUCTOS.find((p) => p.tags.includes("+18"));
  if (alc) assert.ok(calcular([{ id: alc.id, qty: 1 }]).mayorEdad);
});
test("firma de webhook de Stripe", () => {
  const raw = '{"a":1}', sec = "whsec_test", t = Math.floor(Date.now() / 1000);
  const v1 = crypto.createHmac("sha256", sec).update(`${t}.${raw}`).digest("hex");
  assert.ok(firmaValida(raw, `t=${t},v1=${v1}`, sec));
  assert.ok(!firmaValida(raw + " ", `t=${t},v1=${v1}`, sec));
  assert.ok(!firmaValida(raw, `t=${t - 1000},v1=${v1}`, sec));
});
