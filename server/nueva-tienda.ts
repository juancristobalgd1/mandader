// Da de alta una tienda y le da su código para entrar en /panel.
// Uso: npm run tienda -- "Frutería Baserri" 🍎
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
const DATA = process.env.MANDADER_DATA_DIR || path.join(__dirname, "data");
const F = path.join(DATA, "tiendas.json");
const [nombre, emoji = "🛒", zona = "Elgoibar"] = process.argv.slice(2);
if (!nombre) { console.error('Uso: npm run tienda -- "Nombre de la tienda" [emoji] [pueblo]'); process.exit(1); }
fs.mkdirSync(DATA, { recursive: true });
const tiendas = fs.existsSync(F) ? JSON.parse(fs.readFileSync(F, "utf8")) : [];
const base = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "tienda";
let id = base, n = 2; while (tiendas.some((t: { id: string }) => t.id === id)) id = `${base}-${n++}`;
const token = crypto.randomBytes(6).toString("hex").toUpperCase(); // 12 caracteres, fácil de dictar
tiendas.push({ id, nombre, emoji, color: "#ff8a3d", categoria: "despensa", zona, tiempoMin: 30, abre: "09:00", cierra: "21:00", valoracion: 5, token });
fs.writeFileSync(F, JSON.stringify(tiendas, null, 1));
console.log(`Tienda "${nombre}" creada (${id}).\nCódigo para entrar en /panel: ${token}`);
