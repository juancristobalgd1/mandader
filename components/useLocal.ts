"use client";
import { useEffect, useState } from "react";
// Pequeño almacén en localStorage con aviso entre componentes
export function useLocal<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  useEffect(() => {
    const read = () => { try { const s = localStorage.getItem(key); if (s) setV(JSON.parse(s)); } catch {} };
    read(); const h = (e: Event) => { if ((e as CustomEvent).detail === key) read(); };
    window.addEventListener("mandader:local", h); return () => window.removeEventListener("mandader:local", h);
  }, [key]);
  const set = (nv: T) => { localStorage.setItem(key, JSON.stringify(nv)); setV(nv); window.dispatchEvent(new CustomEvent("mandader:local", { detail: key })); };
  return [v, set] as const;
}
