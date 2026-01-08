import type { GradientColorStop } from '../../types/uidesc';

export function normalizePosition(position: number): number {
  return Math.max(0, Math.min(1, position));
}

export function sortStops(stops: GradientColorStop[]): GradientColorStop[] {
  return [...stops].sort((a, b) => parseFloat(a.start) - parseFloat(b.start));
}

function parseHexChannel(hex: string, offset: number): number {
  return parseInt(hex.slice(offset, offset + 2), 16);
}

function toHex(value: number): string {
  return Math.round(value).toString(16).padStart(2, '0').toUpperCase();
}

export function interpolateColor(color1: string, color2: string, t: number): string {
  const clampedT = normalizePosition(t);

  const r1 = parseHexChannel(color1, 1);
  const g1 = parseHexChannel(color1, 3);
  const b1 = parseHexChannel(color1, 5);
  const a1 = parseHexChannel(color1, 7);

  const r2 = parseHexChannel(color2, 1);
  const g2 = parseHexChannel(color2, 3);
  const b2 = parseHexChannel(color2, 5);
  const a2 = parseHexChannel(color2, 7);

  const r = r1 + (r2 - r1) * clampedT;
  const g = g1 + (g2 - g1) * clampedT;
  const b = b1 + (b2 - b1) * clampedT;
  const a = a1 + (a2 - a1) * clampedT;

  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
}

export function getColorAtPosition(stops: GradientColorStop[], position: number): string {
  if (stops.length === 0) return '';
  if (stops.length === 1) return stops[0].rgba;

  const sorted = sortStops(stops);
  const pos = normalizePosition(position);

  const firstStop = sorted[0];
  const lastStop = sorted[sorted.length - 1];

  if (pos <= parseFloat(firstStop.start)) return firstStop.rgba;
  if (pos >= parseFloat(lastStop.start)) return lastStop.rgba;

  for (let i = 0; i < sorted.length - 1; i++) {
    const stop1 = sorted[i];
    const stop2 = sorted[i + 1];
    const pos1 = parseFloat(stop1.start);
    const pos2 = parseFloat(stop2.start);

    if (pos >= pos1 && pos <= pos2) {
      const t = (pos - pos1) / (pos2 - pos1);
      return interpolateColor(stop1.rgba, stop2.rgba, t);
    }
  }

  return lastStop.rgba;
}
