/**
 * Luminance Calculation Contract
 *
 * Functions for calculating color luminance and determining adaptive overlay colors.
 * Location: src/domain/viewMode/luminance.ts
 */

import type { OverlayStyle } from '../../types/viewMode';

// =============================================================================
// Luminance Calculation
// =============================================================================

/**
 * Calculates the relative luminance of a color.
 *
 * Uses the standard W3C formula for relative luminance:
 * L = 0.299*R + 0.587*G + 0.114*B
 *
 * Where R, G, B are normalized to 0-1 range.
 *
 * @param cssColor - A CSS color value (hex, rgb, or rgba format)
 * @returns Luminance value between 0.0 (black) and 1.0 (white)
 * @returns 0.5 if color cannot be parsed (middle value for fallback)
 *
 * @example
 * calculateLuminance('#FFFFFF') // Returns 1.0 (white)
 * calculateLuminance('#000000') // Returns 0.0 (black)
 * calculateLuminance('rgba(128, 128, 128, 1)') // Returns ~0.5 (gray)
 */
export declare function calculateLuminance(cssColor: string): number;

/**
 * Determines if a color is considered "light" based on luminance.
 *
 * @param cssColor - A CSS color value
 * @param threshold - Luminance threshold (default 0.5)
 * @returns True if luminance >= threshold
 */
export declare function isLightColor(cssColor: string, threshold?: number): boolean;

/**
 * Determines if a color is considered "dark" based on luminance.
 *
 * @param cssColor - A CSS color value
 * @param threshold - Luminance threshold (default 0.5)
 * @returns True if luminance < threshold
 */
export declare function isDarkColor(cssColor: string, threshold?: number): boolean;

// =============================================================================
// Overlay Style Determination
// =============================================================================

/**
 * Gets the appropriate overlay style for a given background color.
 *
 * For light backgrounds (luminance >= 0.5): Returns dark overlay
 * For dark backgrounds (luminance < 0.5): Returns white overlay
 *
 * @param backgroundColor - The background color to analyze
 * @returns OverlayStyle with appropriate fill/stroke colors
 *
 * @example
 * // Light background -> dark overlay
 * getAdaptiveOverlayStyle('#FFFFFF')
 * // Returns { fillColor: '#000000', fillOpacity: 0.5, strokeColor: '#000000' }
 *
 * // Dark background -> white overlay
 * getAdaptiveOverlayStyle('#000000')
 * // Returns { fillColor: '#FFFFFF', fillOpacity: 0.5, strokeColor: '#FFFFFF' }
 */
export declare function getAdaptiveOverlayStyle(backgroundColor: string | null): OverlayStyle;

/**
 * Gets the default overlay style (used when no background color is available).
 *
 * @returns Default OverlayStyle using selection colors
 */
export declare function getDefaultOverlayStyle(): OverlayStyle;

// =============================================================================
// Color Parsing Utilities
// =============================================================================

/**
 * Parses a CSS color string to RGB components.
 *
 * Supports:
 * - Hex: #RGB, #RRGGBB, #RRGGBBAA
 * - RGB: rgb(r, g, b)
 * - RGBA: rgba(r, g, b, a)
 *
 * @param cssColor - The CSS color string to parse
 * @returns Object with r, g, b components (0-255) or null if unparseable
 */
export declare function parseColorToRgb(cssColor: string): { r: number; g: number; b: number } | null;
