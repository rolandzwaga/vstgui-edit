export interface ParsedColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function parseHexColor(hex: string): ParsedColor | null {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;

  if (normalized.length === 3) {
    const r = Number.parseInt(normalized[0] + normalized[0], 16);
    const g = Number.parseInt(normalized[1] + normalized[1], 16);
    const b = Number.parseInt(normalized[2] + normalized[2], 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return { r, g, b, a: 255 };
  }

  if (normalized.length === 6) {
    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return { r, g, b, a: 255 };
  }

  if (normalized.length === 8) {
    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);
    const a = Number.parseInt(normalized.slice(6, 8), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) || Number.isNaN(a)) return null;
    return { r, g, b, a };
  }

  return null;
}

export function isPredefinedColor(colorRef: string): boolean {
  return colorRef.startsWith('~ ');
}

export function getPredefinedColorValue(colorName: string): string | null {
  const predefined: Record<string, string> = {
    '~ BlackCColor': '#000000ff',
    '~ WhiteCColor': '#ffffffff',
    '~ GreyCColor': '#808080ff',
    '~ RedCColor': '#ff0000ff',
    '~ GreenCColor': '#00ff00ff',
    '~ BlueCColor': '#0000ffff',
    '~ YellowCColor': '#ffff00ff',
    '~ CyanCColor': '#00ffffff',
    '~ MagentaCColor': '#ff00ffff',
    '~ TransparentCColor': '#00000000',
  };
  return predefined[colorName] ?? null;
}
