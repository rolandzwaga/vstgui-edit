/**
 * Color Validation Functions
 *
 * Validation functions for hex, RGB, and HSL color inputs.
 * Returns validation results with error messages for invalid inputs.
 */

import type { ColorValidationResult } from '../../types/colorPicker';
import { parseHexToRgba, rgbaToHex } from './colorConversion';

// =============================================================================
// Hex Validation
// =============================================================================

/**
 * Validate and normalize hex color input.
 *
 * - Accepts 3, 6, or 8 digit hex values
 * - Auto-adds # prefix if missing
 * - Normalizes to uppercase 8-digit format
 *
 * @param value - Hex color string to validate
 * @returns Validation result with normalized 8-digit hex if valid
 */
export function validateHexInput(value: string): ColorValidationResult {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      valid: false,
      error: 'Color value is required',
    };
  }

  // Auto-add # prefix if missing
  let hex = trimmed;
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }

  // Check length (including #)
  const hexValue = hex.slice(1);
  if (![3, 6, 8].includes(hexValue.length)) {
    return {
      valid: false,
      error: 'Hex color must be 3, 6, or 8 characters (e.g., #F00, #FF0000, #FF0000FF)',
    };
  }

  // Check for valid hex characters
  if (!/^[0-9A-Fa-f]+$/.test(hexValue)) {
    return {
      valid: false,
      error: 'Hex color contains invalid characters. Use only 0-9 and A-F.',
    };
  }

  // Parse and normalize to 8-digit uppercase
  const parsed = parseHexToRgba(hex);
  if (!parsed) {
    return {
      valid: false,
      error: 'Invalid hex color format',
    };
  }

  const normalized = rgbaToHex(parsed.r, parsed.g, parsed.b, parsed.a);

  return {
    valid: true,
    normalized,
  };
}

// =============================================================================
// RGB Validation
// =============================================================================

/**
 * Check if a value is a valid integer.
 */
function isInteger(value: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value);
}

/**
 * Validate RGB color input.
 *
 * @param r - Red component (must be integer 0-255)
 * @param g - Green component (must be integer 0-255)
 * @param b - Blue component (must be integer 0-255)
 * @param a - Alpha component (must be integer 0-255)
 * @returns Validation result
 */
export function validateRgbInput(
  r: number,
  g: number,
  b: number,
  a: number
): ColorValidationResult {
  // Check for NaN or non-integer values
  if (!isInteger(r)) {
    return {
      valid: false,
      error: 'Red must be a whole number',
    };
  }
  if (!isInteger(g)) {
    return {
      valid: false,
      error: 'Green must be a whole number',
    };
  }
  if (!isInteger(b)) {
    return {
      valid: false,
      error: 'Blue must be a whole number',
    };
  }
  if (!isInteger(a)) {
    return {
      valid: false,
      error: 'Alpha must be a whole number',
    };
  }

  // Validate ranges
  if (r < 0 || r > 255) {
    return {
      valid: false,
      error: 'Red must be between 0 and 255',
    };
  }
  if (g < 0 || g > 255) {
    return {
      valid: false,
      error: 'Green must be between 0 and 255',
    };
  }
  if (b < 0 || b > 255) {
    return {
      valid: false,
      error: 'Blue must be between 0 and 255',
    };
  }
  if (a < 0 || a > 255) {
    return {
      valid: false,
      error: 'Alpha must be between 0 and 255',
    };
  }

  return { valid: true };
}

// =============================================================================
// HSL Validation
// =============================================================================

/**
 * Validate HSL color input.
 *
 * @param h - Hue (must be integer 0-360)
 * @param s - Saturation (must be integer 0-100)
 * @param l - Lightness (must be integer 0-100)
 * @param a - Alpha (must be integer 0-100)
 * @returns Validation result
 */
export function validateHslInput(
  h: number,
  s: number,
  l: number,
  a: number
): ColorValidationResult {
  // Check for NaN or non-integer values
  if (!isInteger(h)) {
    return {
      valid: false,
      error: 'Hue must be a whole number',
    };
  }
  if (!isInteger(s)) {
    return {
      valid: false,
      error: 'Saturation must be a whole number',
    };
  }
  if (!isInteger(l)) {
    return {
      valid: false,
      error: 'Lightness must be a whole number',
    };
  }
  if (!isInteger(a)) {
    return {
      valid: false,
      error: 'Alpha must be a whole number',
    };
  }

  // Validate ranges
  if (h < 0 || h > 360) {
    return {
      valid: false,
      error: 'Hue must be between 0 and 360',
    };
  }
  if (s < 0 || s > 100) {
    return {
      valid: false,
      error: 'Saturation must be between 0 and 100',
    };
  }
  if (l < 0 || l > 100) {
    return {
      valid: false,
      error: 'Lightness must be between 0 and 100',
    };
  }
  if (a < 0 || a > 100) {
    return {
      valid: false,
      error: 'Alpha must be between 0 and 100',
    };
  }

  return { valid: true };
}
