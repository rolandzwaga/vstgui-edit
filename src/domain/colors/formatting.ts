import type { ParsedColor } from './parsing';

export function formatAsRgba(color: ParsedColor): string {
  const alpha = color.a / 255;
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha.toFixed(2)})`;
}

export function formatAsHex(color: ParsedColor, includeAlpha = true): string {
  const r = color.r.toString(16).padStart(2, '0');
  const g = color.g.toString(16).padStart(2, '0');
  const b = color.b.toString(16).padStart(2, '0');

  if (includeAlpha) {
    const a = color.a.toString(16).padStart(2, '0');
    return `#${r}${g}${b}${a}`;
  }

  return `#${r}${g}${b}`;
}

export function truncateColorName(name: string, maxLength = 30): string {
  if (name.length <= maxLength) {
    return name;
  }
  return `${name.slice(0, maxLength - 1)}…`;
}

export function formatColorForDisplay(hex: string): string {
  return hex.toLowerCase();
}
