import test from "node:test";
import assert from "node:assert/strict";
import { adivinarPasillo, esMedicamento, leerLista, leerPrecio } from "../lib/pasillo";
import { deTipo, tipoDe } from "../lib/data";
import { producto, registrarExtras } from "../lib/data";
import { calcular } from "../lib/pricing";
import { buscar } from "../lib/search";
import type { Producto, Tienda } from "../lib/types";

test("adivina el pasillo por el nombre", () => {
  assert.equal(adivinarPasillo("Leche entera Kaiku 1 l"), "lacteos");
  assert.equal(adivinarPasillo("Pan de barra"), "panaderia");
  assert.equal(adivinarPasillo("Tomate pera kg"), "frescos");
  assert.equal(adivinarPasillo("Detergente Ariel 30 lavados"), "limpieza");
  assert.equal(adivinarPasillo("Papel higiénico 12 rollos"), "higiene");
  assert.equal(adivinarPasillo("Cerveza Keler pack 6"), "bebidas");
  assert.equal(adivinarPasillo("Pienso perro adulto 4kg"), "mascotas");
  assert.equal(adivinarPasillo("Garbanzos cocidos"), "despensa");
});
test("entiende precios escritos a mano", () => {
  assert.equal(leerPrecio("1,29"), 1.29); assert.equal(leerPrecio("2 €"), 2); assert.equal(leerPrecio("0.9"), 0.9);
  assert.equal(leerPrecio("abc"), null); assert.equal(leerPrecio("0"), null);
});
test("lee una lista pegada de WhatsApp o Excel", () => {
  const r = leerLista("Leche entera Kaiku 1 l  1,15\n- Pan de barra 0,90€\nTomate pera kg\t2,49\nnombre;precio\nHuevos L docena; 2,95\nSin precio aquí");
  assert.deepEqual(r.ok.map((x) => [x.nombre, x.precio]), [["Leche entera Kaiku 1 l", 1.15], ["Pan de barra", 0.9], ["Tomate pera kg", 2.49], ["Huevos L docena", 2.95]]);
  assert.equal(r.malas.length, 2);
});
test("los productos de una tienda se buscan y se cobran; agotados no", () => {
  const t: Tienda = { id: "frut-x", nombre: "Frutería X", categoria: "frescos", emoji: "🍎", color: "#3dbb7a", zona: "Elgoibar", tiempoMin: 20, abre: "09:00", cierra: "20:00", valoracion: 5 };
  const ps: Producto[] = [
    { id: "frut-x-1", tiendaId: "frut-x", nombre: "Txakoli Getaria botella", desc: "", precio: 9.5, emoji: "🍷", categoria: "bebidas", tags: [] },
    { id: "frut-x-2", tiendaId: "frut-x", nombre: "Pimientos de Gernika", desc: "", precio: 3, emoji: "🫑", categoria: "frescos", tags: [], agotado: true },
  ];
  registrarExtras([t], ps);
  assert.ok(buscar("txakoli").some((p) => p.id === "frut-x-1"));
  assert.ok(!buscar("pimientos de gernika").some((p) => p.id === "frut-x-2"));
  const c = calcular([{ id: "frut-x-1", qty: 1 }, { id: "frut-x-2", qty: 1 }]);
  assert.equal(c.subtotal, 9.5); assert.equal(c.lineas.length, 1);
  assert.equal(producto("frut-x-1")?.local, true);
  registrarExtras([], []);
});

test("el pasillo depende del tipo de local", () => {
  assert.equal(adivinarPasillo("Hamburguesa completa", "restaurante"), "platos");
  assert.equal(adivinarPasillo("Tarta de queso", "restaurante"), "postres");
  assert.equal(adivinarPasillo("Coca-Cola lata", "restaurante"), "bebidas");
  assert.equal(adivinarPasillo("Protector solar SPF 50", "farmacia"), "salud");
  assert.equal(adivinarPasillo("Pañales talla 4", "farmacia"), "bebe");
  assert.equal(adivinarPasillo("Champú anticaspa", "farmacia"), "higiene");
});
test("los medicamentos no entran", () => {
  assert.ok(esMedicamento("Ibuprofeno 600 mg 40 comprimidos"));
  assert.ok(esMedicamento("Frenadol complex"));
  assert.ok(!esMedicamento("Protector solar SPF 50"));
  assert.ok(!esMedicamento("Jarabe de arce"));
  const r = leerLista("Paracetamol 1g 2,50\nTiritas 3,10", "farmacia");
  assert.deepEqual(r.ok.map((x) => x.nombre), ["Tiritas"]); assert.equal(r.medicamentos.length, 1);
});
test("filtra por tipo de local", () => {
  const f: Tienda = { id: "farm-x", nombre: "Farmacia X", categoria: "salud", tipo: "farmacia", emoji: "💊", color: "#3dbb7a", zona: "Elgoibar", tiempoMin: 20, abre: "09:00", cierra: "20:00", valoracion: 5 };
  const p: Producto = { id: "farm-x-1", tiendaId: "farm-x", nombre: "Tiritas", desc: "", precio: 3.1, emoji: "🩹", categoria: "salud", tags: [] };
  registrarExtras([f], [p]);
  assert.equal(tipoDe(f), "farmacia"); assert.equal(tipoDe({ ...f, tipo: undefined }), "super");
  assert.deepEqual(deTipo("farmacia", [p]).map((x) => x.id), ["farm-x-1"]);
  assert.equal(deTipo("super", [p]).length, 0);
  registrarExtras([], []);
});
