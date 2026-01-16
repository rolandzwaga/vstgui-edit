/**
 * Color Resolution Contract
 *
 * Domain functions for resolving color references from uidesc format.
 * Location: src/domain/viewMode/colorResolution.ts
 */

import type { ColorsDefinition } from '../../types/uidesc';
import type { ResolvedColor } from '../../types/viewMode';

// =============================================================================
// Color Resolution
// =============================================================================

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
 *
 * @example
 * // Direct hex color
 * resolveColor('#FF0000FF', {}) // Returns 'rgba(255, 0, 0, 1.00)'
 *
 * // Predefined color
 * resolveColor('~ BlackCColor', {}) // Returns '#000000FF'
 *
 * // Document color reference
 * resolveColor('background', { background: '#2d2d2dff' }) // Returns 'rgba(45, 45, 45, 1.00)'
 */
export declare function resolveColor(
  colorRef: string | undefined,
  documentColors: ColorsDefinition | undefined,
  depth?: number
): ResolvedColor;

/**
 * Checks if a color reference is a direct hex color.
 *
 * @param colorRef - The color reference to check
 * @returns True if the reference is a hex color (#RGB, #RRGGBB, or #RRGGBBAA)
 */
export declare function isHexColor(colorRef: string): boolean;

/**
 * Converts an 8-digit hex color (#RRGGBBAA) to CSS rgba format.
 *
 * @param hex - The hex color string (must be #RRGGBBAA format)
 * @returns CSS rgba string
 *
 * @example
 * hexToRgba('#FF0000FF') // Returns 'rgba(255, 0, 0, 1.00)'
 * hexToRgba('#00000080') // Returns 'rgba(0, 0, 0, 0.50)'
 */
export declare function hexToRgba(hex: string): string;

/**
 * Normalizes a color reference to a standard format.
 * Handles short hex (#RGB -> #RRGGBB) and adds alpha if missing.
 *
 * @param colorRef - The color reference to normalize
 * @returns Normalized color string or original if not a hex color
 */
export declare function normalizeHexColor(colorRef: string): string;
