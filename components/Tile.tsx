// Cuadro de color con emoji en lugar de foto (cámbialo por <img> cuando haya fotos reales)
export default function Tile({ emoji, color, className = "", size = 56 }: { emoji: string; color: string; className?: string; size?: number }) {
  return (
    <div className={`grid place-items-center ${className}`} style={{ background: `radial-gradient(circle at 30% 25%, ${color}cc, ${color}55 60%, #1b1714 100%)` }}>
      <span style={{ fontSize: size, lineHeight: 1 }} className="drop-shadow-[0_6px_14px_rgba(0,0,0,.45)]">{emoji}</span>
    </div>
  );
}
