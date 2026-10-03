import { useMemo } from 'react';
import { qrMatrix } from '../lib/qrcode.js';

// QR code dessiné en SVG (encodeur local, aucun script externe). Marge de 4 modules exigée par la norme.
export default function QrCode({ value, label, size = 192 }) {
  const { path, dimension } = useMemo(() => {
    const matrix = qrMatrix(value);
    let d = '';
    matrix.forEach((row, y) =>
      row.forEach((dark, x) => {
        if (dark) d += `M${x + 4} ${y + 4}h1v1h-1z`;
      }),
    );
    return { path: d, dimension: matrix.length + 8 };
  }, [value]);

  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox={`0 0 ${dimension} ${dimension}`}
      shapeRendering="crispEdges"
      className="rounded-control"
    >
      <rect width={dimension} height={dimension} className="fill-surface" />
      <path d={path} className="fill-ink" />
    </svg>
  );
}
