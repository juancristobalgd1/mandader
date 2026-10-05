import test from "node:test";
import assert from "node:assert/strict";
import { buscar, interpretar } from "../lib/search";
import { PRODUCTOS } from "../lib/data";

test("el catálogo tiene productos reales con precio", () => {
  assert.ok(PRODUCTOS.length >= 50);
  assert.ok(PRODUCTOS.every((p) => p.precio > 0 && p.nombre.length > 2));
});
test("entiende precio máximo y categoría", () => {
  const c = interpretar("bebidas hasta 2 €");
  assert.equal(c.max, 2); assert.equal(c.categoria, "bebidas");
  assert.ok(buscar(c).every((p) => p.precio <= 2 && p.categoria === "bebidas"));
});
test("etiquetas de varias palabras", () => {
  const c = interpretar("galletas sin gluten");
  assert.deepEqual(c.tags, ["sin gluten"]); assert.deepEqual(c.terminos, ["galleta"]);
  assert.ok(buscar(c).every((p) => p.tags.includes("sin gluten")));
});
test("barato ordena por precio", () => {
  const r = buscar("leche barata");
  for (let i = 1; i < r.length; i++) assert.ok(r[i - 1].precio <= r[i].precio);
});
test("encuentra por nombre", () => {
  const p = PRODUCTOS[0]; const palabra = p.nombre.split(" ").find((x) => x.length > 4) || p.nombre;
  assert.ok(buscar(palabra).some((x) => x.id === p.id));
});
test("sin resultados no inventa", () => { assert.equal(buscar("bicicleta eléctrica plegable").length, 0); });
