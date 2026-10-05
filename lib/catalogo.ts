"use client";
import { useEffect, useState } from "react";
import { API, modoDemo } from "./api";
import { registrarExtras } from "./data";
import { DEMO_KEY } from "./tiendaApi";

let cargado = false;
let cargando: Promise<void> | null = null;

// Trae los productos que han subido las tiendas y avisa a la pantalla para que se repinte.
export async function refrescarCatalogo() {
  try {
    if (!modoDemo) {
      const r = await fetch(`${API}/api/catalogo`, { cache: "no-store" });
      if (r.ok) { const j = await r.json(); registrarExtras(j.tiendas || [], j.productos || []); }
    } else {
      const d = JSON.parse(localStorage.getItem(DEMO_KEY) || "null");
      registrarExtras(d ? [d.tienda] : [], d ? d.productos.filter((p: { agotado?: boolean }) => !p.agotado) : []);
    }
  } catch { /* sin conexión: seguimos con el catálogo fijo */ }
  cargado = true;
  window.dispatchEvent(new Event("mandader:catalogo"));
}

export function useCatalogo() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const h = () => setV((x) => x + 1);
    window.addEventListener("mandader:catalogo", h);
    if (cargado) h(); else if (!cargando) cargando = refrescarCatalogo();
    return () => window.removeEventListener("mandader:catalogo", h);
  }, []);
  return v;
}
