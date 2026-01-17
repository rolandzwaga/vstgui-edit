/**
 * Luminance Calculation
 *
 * Functions for calculating color luminance and determining adaptive overlay colors.
 */

import type { OverlayStyle } from '../../types/viewMode';
import { LUMINANCE_THRESHOLD, OVERLAY_OPACITY } from '../../types/viewMode';

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
export function parseColorToRgb(cssColor: string): { r: number; g: number; b: number } | null {
  if (!cssColor || cssColor === '') {
    return null;
  }

  // Hex format: #RGB, #RRGGBB, #RRGGBBAA
  if (cssColor.startsWith('#')) {
    let hex = cssColor.slice(1).toUpperCase();

    // Validate hex characters
    if (!/^[0-9A-F]+$/.test(hex)) {
      return null;
    }

    // Expand 3-digit to 6-digit
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    if (hex.length !== 6 && hex.length !== 8) {
      return null;
    }

    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);

    return { r, g, b };
  }

  // RGBA format: rgba(r, g, b, a)
  const rgbaMatch = cssColor.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbaMatch) {
    return {
      r: Number.parseInt(rgbaMatch[1], 10),
      g: Number.parseInt(rgbaMatch[2], 10),
      b: Number.parseInt(rgbaMatch[3], 10),
    };
  }

  return null;
}

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
 */
export function calculateLuminance(cssColor: string): number {
  const rgb = parseColorToRgb(cssColor);

  if (!rgb) {
    return 0.5; // Middle value for fallback
  }

  // Normalize to 0-1 range
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  // Standard luminance formula
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Determines if a color is considered "light" based on luminance.
 *
 * @param cssColor - A CSS color value
 * @param threshold - Luminance threshold (default 0.5)
 * @returns True if luminance >= threshold
 */
export function isLightColor(cssColor: string, threshold = LUMINANCE_THRESHOLD): boolean {
  return calculateLuminance(cssColor) >= threshold;
}

/**
 * Determines if a color is considered "dark" based on luminance.
 *
 * @param cssColor - A CSS color value
 * @param threshold - Luminance threshold (default 0.5)
 * @returns True if luminance < threshold
 */
export function isDarkColor(cssColor: string, threshold = LUMINANCE_THRESHOLD): boolean {
  return calculateLuminance(cssColor) < threshold;
}

/**
 * Gets the default overlay style (used when no background color is available).
 *
 * @returns Default OverlayStyle using selection colors
 */
export function getDefaultOverlayStyle(): OverlayStyle {
  // Default to standard selection blue when no background is known
  return {
    fillColor: 'var(--color-selection-fill)',
    fillOpacity: OVERLAY_OPACITY,
    strokeColor: 'var(--color-selection-border)',
  };
}

/**
 * Gets the appropriate overlay style for a given background color.
 *
 * For light backgrounds (luminance >= 0.5): Returns dark overlay
 * For dark backgrounds (luminance < 0.5): Returns white overlay
 *
 * @param backgroundColor - The background color to analyze
 * @returns OverlayStyle with appropriate fill/stroke colors
 */
export function getAdaptiveOverlayStyle(backgroundColor: string | null): OverlayStyle {
  if (backgroundColor === null) {
    return getDefaultOverlayStyle();
  }

  const luminance = calculateLuminance(backgroundColor);

  if (luminance >= LUMINANCE_THRESHOLD) {
    // Light background -> dark overlay
    return {
      fillColor: '#000000',
      fillOpacity: OVERLAY_OPACITY,
      strokeColor: '#000000',
    };
  }

  // Dark background -> white overlay
  return {
    fillColor: '#FFFFFF',
    fillOpacity: OVERLAY_OPACITY,
    strokeColor: '#FFFFFF',
  };
}
