/**
 * VSTGUI Predefined Colors
 * The 10 built-in system colors available in VSTGUI
 */

import type { PredefinedColor } from '../../types/colorPicker';

/**
 * VSTGUI predefined colors.
 * These are the 10 built-in system colors available in VSTGUI.
 * When selected, they output in "~ ColorName" format.
 */
export const VSTGUI_PREDEFINED_COLORS: readonly PredefinedColor[] = [
  { name: 'BlackCColor', value: '#000000FF', displayName: 'Black' },
  { name: 'WhiteCColor', value: '#FFFFFFFF', displayName: 'White' },
  { name: 'GreyCColor', value: '#808080FF', displayName: 'Grey' },
  { name: 'RedCColor', value: '#FF0000FF', displayName: 'Red' },
  { name: 'GreenCColor', value: '#00FF00FF', displayName: 'Green' },
  { name: 'BlueCColor', value: '#0000FFFF', displayName: 'Blue' },
  { name: 'YellowCColor', value: '#FFFF00FF', displayName: 'Yellow' },
  { name: 'CyanCColor', value: '#00FFFFFF', displayName: 'Cyan' },
  { name: 'MagentaCColor', value: '#FF00FFFF', displayName: 'Magenta' },
  { name: 'TransparentCColor', value: '#00000000', displayName: 'Transparent' },
] as const;

/**
 * Get a predefined color by its name.
 *
 * @param name - Color name (e.g., 'BlackCColor')
 * @returns The predefined color or undefined if not found
 */
export function getPredefinedColor(name: string): PredefinedColor | undefined {
  return VSTGUI_PREDEFINED_COLORS.find((color) => color.name === name);
}

/**
 * Get the hex value for a predefined color reference.
 *
 * @param colorRef - Color reference in "~ ColorName" format
 * @returns Hex value or null if not a valid predefined color
 */
export function getPredefinedColorHex(colorRef: string): string | null {
  if (!colorRef.startsWith('~ ')) {
    return null;
  }
  const name = colorRef.slice(2);
  const color = getPredefinedColor(name);
  return color?.value ?? null;
}

/**
 * Check if a color reference is a predefined color.
 *
 * @param colorRef - Color reference to check
 * @returns True if the reference is a predefined color
 */
export function isPredefinedColorRef(colorRef: string): boolean {
  return colorRef.startsWith('~ ') && getPredefinedColorHex(colorRef) !== null;
}

/**
 * Format a predefined color name as a reference.
 *
 * @param name - Color name (e.g., 'BlackCColor')
 * @returns Reference string (e.g., '~ BlackCColor')
 */
export function formatPredefinedColorRef(name: string): string {
  return `~ ${name}`;
}
