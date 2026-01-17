/**
 * Color Resolution
 *
 * Domain functions for resolving color references from uidesc format.
 */

import type { ColorsDefinition } from '../../types/uidesc';
import type { ResolvedColor } from '../../types/viewMode';
import { MAX_COLOR_RESOLUTION_DEPTH } from '../../types/viewMode';
import { getPredefinedColorHex } from '../colorPicker/predefinedColors';

/**
 * Checks if a color reference is a direct hex color.
 *
 * @param colorRef - The color reference to check
 * @returns True if the reference is a hex color (#RGB, #RRGGBB, or #RRGGBBAA)
 */
export function isHexColor(colorRef: string): boolean {
  if (!colorRef || !colorRef.startsWith('#')) {
    return false;
  }
  const hex = colorRef.slice(1).toUpperCase();
  // Valid lengths: 3 (#RGB), 6 (#RRGGBB), 8 (#RRGGBBAA)
  if (hex.length !== 3 && hex.length !== 6 && hex.length !== 8) {
    return false;
  }
  return /^[0-9A-F]+$/.test(hex);
}

/**
 * Normalizes a color reference to a standard format.
 * Handles short hex (#RGB -> #RRGGBB) and adds alpha if missing.
 *
 * @param colorRef - The color reference to normalize
 * @returns Normalized color string or original if not a hex color
 */
export function normalizeHexColor(colorRef: string): string {
  if (!isHexColor(colorRef)) {
    return colorRef;
  }

  let hex = colorRef.slice(1).toUpperCase();

  // Expand 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // Add alpha if not present
  if (hex.length === 6) {
    hex = `${hex}FF`;
  }

  return `#${hex}`;
}

/**
 * Converts an 8-digit hex color (#RRGGBBAA) to CSS rgba format.
 *
 * @param hex - The hex color string (must be #RRGGBBAA format)
 * @returns CSS rgba string
 */
export function hexToRgba(hex: string): string {
  const normalized = normalizeHexColor(hex);
  const hexValue = normalized.slice(1);

  const r = Number.parseInt(hexValue.slice(0, 2), 16);
  const g = Number.parseInt(hexValue.slice(2, 4), 16);
  const b = Number.parseInt(hexValue.slice(4, 6), 16);
  const a = Number.parseInt(hexValue.slice(6, 8), 16) / 255;

  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
}

/**
 * Resolves a color reference to a CSS color value.
 *
 * Handles three types of color values:
 * 1. Direct hex colors (#RRGGBB or #RRGGBBAA)
 * 2. Predefined VSTGUI colors ("~ ColorName")
 * 3. Document color references (name lookup in colors map)
 *
 * @param colorRef - The color reference string from uidesc
 * @param documentColors - The document's colors definition map
 * @param depth - Current resolution depth (for circular reference protection)
 * @returns Resolved CSS color string or null if unresolvable
 */
export function resolveColor(
  colorRef: string | undefined,
  documentColors: ColorsDefinition | undefined,
  depth = 0
): ResolvedColor {
  // Null/empty cases
  if (!colorRef || colorRef === '') {
    return null;
  }

  // Circular reference protection
  if (depth >= MAX_COLOR_RESOLUTION_DEPTH) {
    return null;
  }

  // Direct hex color
  if (isHexColor(colorRef)) {
    return hexToRgba(colorRef);
  }

  // Predefined VSTGUI color (e.g., "~ BlackCColor")
  if (colorRef.startsWith('~ ')) {
    const predefinedHex = getPredefinedColorHex(colorRef);
    if (predefinedHex) {
      return hexToRgba(predefinedHex);
    }
    return null;
  }

  // Document color reference
  if (!documentColors) {
    return null;
  }

  const referencedValue = documentColors[colorRef];
  if (!referencedValue) {
    return null;
  }

  // Recursively resolve the referenced color
  return resolveColor(referencedValue, documentColors, depth + 1);
}
