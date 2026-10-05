import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { calcular, TARIFA } from "../lib/pricing";
import { firmaValida } from "../server/index";

test("ignora productos inventados y cantidades raras", () => {
  const c = calcular([{ id: "falso-1", qty: 1 }, { id: "pizzeria-txoko-1", qty: -3 }, { id: "pizzeria-txoko-1", qty: 2.5 }]);
  assert.equal(c.lineas.length, 0); assert.equal(c.total, 0);
});
test("envío por tiendas y gratis desde el umbral", () => {
  const una = calcular([{ id: "pizzeria-txoko-1", qty: 1 }]);
  assert.equal(una.envio, TARIFA.envioBase);
  const dos = calcular([{ id: "pizzeria-txoko-1", qty: 1 }, { id: "farmacia-plaza-1", qty: 1 }]);
  assert.equal(dos.envio, Math.round((TARIFA.envioBase + TARIFA.porTiendaExtra) * 100) / 100);
  const grande = calcular([{ id: "pizzeria-txoko-2", qty: 4 }]);
  assert.equal(grande.envio, 0);
  assert.equal(grande.total, Math.round((grande.subtotal + grande.servicio) * 100) / 100);
});
test("detecta productos +18", () => { assert.ok(calcular([{ id: "bebidas-24-3", qty: 1 }]).mayorEdad); });
test("firma de webhook de Stripe", () => {
  const raw = '{"a":1}', sec = "whsec_test", t = Math.floor(Date.now() / 1000);
  const v1 = crypto.createHmac("sha256", sec).update(`${t}.${raw}`).digest("hex");
  assert.ok(firmaValida(raw, `t=${t},v1=${v1}`, sec));
  assert.ok(!firmaValida(raw + " ", `t=${t},v1=${v1}`, sec));
  assert.ok(!firmaValida(raw, `t=${t - 1000},v1=${v1}`, sec));
});
