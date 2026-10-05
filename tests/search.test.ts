import test from "node:test";
import assert from "node:assert/strict";
import { buscar, interpretar } from "../lib/search";

test("entiende precio máximo y categoría", () => {
  const c = interpretar("pizza para cenar hasta 12 €");
  assert.equal(c.max, 12); assert.equal(c.categoria, "comida"); assert.deepEqual(c.terminos, ["pizza"]);
  const r = buscar(c); assert.ok(r.length > 0); assert.ok(r.every((p) => p.precio <= 12 && p.nombre.toLowerCase().includes("pizza")));
});
test("etiquetas de varias palabras", () => {
  const r = buscar("leche sin lactosa"); assert.equal(r[0].nombre, "Leche sin lactosa 1 L");
});
test("vegano barato ordena por precio", () => {
  const r = buscar("algo vegano barato"); assert.ok(r.length > 2);
  for (let i = 1; i < r.length; i++) assert.ok(r[i - 1].precio <= r[i].precio);
  assert.ok(r.every((p) => p.tags.includes("vegano")));
});
test("medicamento por síntoma", () => { const r = buscar("algo para el dolor"); assert.ok(r.some((p) => p.nombre.startsWith("Ibuprofeno") || p.nombre.startsWith("Paracetamol"))); });
test("sin resultados no inventa", () => { assert.equal(buscar("bicicleta eléctrica").length, 0); });
