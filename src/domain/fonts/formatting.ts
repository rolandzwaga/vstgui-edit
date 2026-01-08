import type { FontDefinition } from '../../types/uidesc';

export function truncateFontName(name: string, maxLength = 30): string {
  if (name.length <= maxLength) {
    return name;
  }
  return `${name.slice(0, maxLength - 1)}…`;
}

export function formatFontSize(size: string): string {
  return `${size}pt`;
}

export function summarizeFontProperties(font: FontDefinition): string {
  const parts: string[] = [font['font-name'], formatFontSize(font.size)];

  if (font.bold === 'true') {
    parts.push('B');
  }
  if (font.italic === 'true') {
    parts.push('I');
  }
  if (font.underline === 'true') {
    parts.push('U');
  }
  if (font['strike-through'] === 'true') {
    parts.push('S');
  }

  return parts.join(' ');
}
