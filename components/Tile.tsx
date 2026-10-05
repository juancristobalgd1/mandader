// Foto del producto; si no hay o falla, cuadro de color con emoji
"use client";
import { useState } from "react";
export default function Tile({ emoji, color, imagen, alt = "", className = "", size = 56 }: { emoji: string; color: string; imagen?: string; alt?: string; className?: string; size?: number }) {
  const [roto, setRoto] = useState(false);
  if (imagen && !roto) return (
    <div className={`grid place-items-center bg-white ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imagen} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setRoto(true)} className="h-full w-full object-contain p-2" />
    </div>
  );
  return (
    <div className={`grid place-items-center ${className}`} style={{ background: `radial-gradient(circle at 30% 25%, ${color}cc, ${color}55 60%, #1b1714 100%)` }}>
      <span style={{ fontSize: size, lineHeight: 1 }} className="drop-shadow-[0_6px_14px_rgba(0,0,0,.45)]">{emoji}</span>
    </div>
  );
}
