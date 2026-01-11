/**
 * Color Conversion Functions
 *
 * Pure functions for converting between color formats.
 * All functions are stateless and can be tested in isolation.
 */

import type { ColorValue } from '../../types/colorPicker';

// =============================================================================
// Types
// =============================================================================

/** RGB color with 0-255 components */
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/** RGBA color with 0-255 components */
export interface RgbaColor extends RgbColor {
  a: number;
}

/** HSV/HSB color (Hue 0-360, Saturation 0-100, Value 0-100) */
export interface HsvColor {
  h: number;
  s: number;
  v: number;
}

/** HSL color (Hue 0-360, Saturation 0-100, Lightness 0-100) */
export interface HslColor {
  h: number;
  s: number;
  l: number;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Clamp a value between min and max.
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round a number to a specified precision.
 *
 * @param value - Value to round
 * @param decimals - Number of decimal places (default: 0)
 * @returns Rounded value
 */
export function roundTo(value: number, decimals: number = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Check if a hex color string is valid.
 *
 * @param hex - String to validate
 * @returns True if valid hex color
 */
export function isValidHex(hex: string): boolean {
  if (!hex.startsWith('#')) {
    return false;
  }
  const value = hex.slice(1);
  if (![3, 6, 8].includes(value.length)) {
    return false;
  }
  return /^[0-9A-Fa-f]+$/.test(value);
}

// =============================================================================
// RGB <-> HSV Conversion
// =============================================================================

/**
 * Convert RGB to HSV color space.
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns HSV color with H: 0-360, S: 0-100, V: 0-100
 */
export function rgbToHsv(r: number, g: number, b: number): HsvColor {
  // Normalize RGB to 0-1 range
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  // Calculate value (brightness)
  const v = max * 100;

  // Calculate saturation
  const s = max === 0 ? 0 : (delta / max) * 100;

  // Calculate hue
  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = roundTo(h * 60);
    if (h < 0) {
      h += 360;
    }
  }

  return {
    h: roundTo(h),
    s: roundTo(s),
    v: roundTo(v),
  };
}

/**
 * Convert HSV to RGB color space.
 *
 * @param h - Hue (0-360 degrees)
 * @param s - Saturation (0-100 percent)
 * @param v - Value/Brightness (0-100 percent)
 * @returns RGB color with R, G, B: 0-255
 */
export function hsvToRgb(h: number, s: number, v: number): RgbColor {
  // Normalize to 0-1 range
  const sNorm = s / 100;
  const vNorm = v / 100;

  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vNorm - c;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c;
    gPrime = x;
    bPrime = 0;
  } else if (h >= 60 && h < 120) {
    rPrime = x;
    gPrime = c;
    bPrime = 0;
  } else if (h >= 120 && h < 180) {
    rPrime = 0;
    gPrime = c;
    bPrime = x;
  } else if (h >= 180 && h < 240) {
    rPrime = 0;
    gPrime = x;
    bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x;
    gPrime = 0;
    bPrime = c;
  } else {
    rPrime = c;
    gPrime = 0;
    bPrime = x;
  }

  return {
    r: roundTo((rPrime + m) * 255),
    g: roundTo((gPrime + m) * 255),
    b: roundTo((bPrime + m) * 255),
  };
}

// =============================================================================
// RGB <-> HSL Conversion
// =============================================================================

/**
 * Convert RGB to HSL color space.
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns HSL color with H: 0-360, S: 0-100, L: 0-100
 */
export function rgbToHsl(r: number, g: number, b: number): HslColor {
  // Normalize RGB to 0-1 range
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  // Calculate lightness
  const l = ((max + min) / 2) * 100;

  // Calculate saturation
  let s = 0;
  if (delta !== 0) {
    s = (delta / (1 - Math.abs((2 * (max + min)) / 2 - 1))) * 100;
  }

  // Calculate hue (same as HSV)
  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = roundTo(h * 60);
    if (h < 0) {
      h += 360;
    }
  }

  return {
    h: roundTo(h),
    s: roundTo(s),
    l: roundTo(l),
  };
}

/**
 * Convert HSL to RGB color space.
 *
 * @param h - Hue (0-360 degrees)
 * @param s - Saturation (0-100 percent)
 * @param l - Lightness (0-100 percent)
 * @returns RGB color with R, G, B: 0-255
 */
export function hslToRgb(h: number, s: number, l: number): RgbColor {
  // Normalize to 0-1 range
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c;
    gPrime = x;
    bPrime = 0;
  } else if (h >= 60 && h < 120) {
    rPrime = x;
    gPrime = c;
    bPrime = 0;
  } else if (h >= 120 && h < 180) {
    rPrime = 0;
    gPrime = c;
    bPrime = x;
  } else if (h >= 180 && h < 240) {
    rPrime = 0;
    gPrime = x;
    bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x;
    gPrime = 0;
    bPrime = c;
  } else {
    rPrime = c;
    gPrime = 0;
    bPrime = x;
  }

  return {
    r: roundTo((rPrime + m) * 255),
    g: roundTo((gPrime + m) * 255),
    b: roundTo((bPrime + m) * 255),
  };
}

// =============================================================================
// Hex Conversion
// =============================================================================

/**
 * Parse a hex color string to RGBA components.
 *
 * @param hex - Hex color string (#RGB, #RRGGBB, or #RRGGBBAA)
 * @returns RGBA color or null if invalid
 */
export function parseHexToRgba(hex: string): RgbaColor | null {
  if (!isValidHex(hex)) {
    return null;
  }

  let normalized = hex.slice(1);

  // Expand 3-digit shorthand to 6-digit
  if (normalized.length === 3) {
    normalized =
      normalized[0] + normalized[0] + normalized[1] + normalized[1] + normalized[2] + normalized[2];
  }

  // Parse RRGGBB or RRGGBBAA
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const a = normalized.length === 8 ? Number.parseInt(normalized.slice(6, 8), 16) : 255;

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) || Number.isNaN(a)) {
    return null;
  }

  return { r, g, b, a };
}

/**
 * Format RGBA components to a hex string.
 * Always outputs 8-digit uppercase hex (#RRGGBBAA).
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @param a - Alpha component (0-255, optional, defaults to 255)
 * @returns Uppercase 8-digit hex string (#RRGGBBAA)
 */
export function rgbaToHex(r: number, g: number, b: number, a: number = 255): string {
  const toHex = (n: number): string => {
    const clamped = clamp(Math.round(n), 0, 255);
    return clamped.toString(16).toUpperCase().padStart(2, '0');
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
}

// =============================================================================
// ColorValue Factory
// =============================================================================

/**
 * Create a complete ColorValue from RGBA components.
 * Calculates HSV and HSL values automatically.
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @param a - Alpha component (0-255)
 * @returns Complete ColorValue with all format values
 */
export function createColorValue(r: number, g: number, b: number, a: number): ColorValue {
  const hsv = rgbToHsv(r, g, b);
  const hsl = rgbToHsl(r, g, b);

  return {
    r,
    g,
    b,
    a,
    h: hsv.h,
    s: hsv.s,
    v: hsv.v,
    hslS: hsl.s,
    l: hsl.l,
  };
}

/**
 * Create a ColorValue from HSV components.
 *
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param v - Value/Brightness (0-100)
 * @param a - Alpha (0-255)
 * @returns Complete ColorValue
 */
export function createColorValueFromHsv(h: number, s: number, v: number, a: number): ColorValue {
  const rgb = hsvToRgb(h, s, v);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return {
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    a,
    h,
    s,
    v,
    hslS: hsl.s,
    l: hsl.l,
  };
}

/**
 * Create a ColorValue from HSL components.
 *
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @param a - Alpha (0-255, HSL alpha is 0-100 but we use 0-255 for consistency)
 * @returns Complete ColorValue
 */
export function createColorValueFromHsl(h: number, s: number, l: number, a: number): ColorValue {
  const rgb = hslToRgb(h, s, l);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  return {
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    a,
    h,
    s: hsv.s,
    v: hsv.v,
    hslS: s,
    l,
  };
}

/**
 * Parse a hex string to ColorValue.
 *
 * @param hex - Hex color string
 * @returns ColorValue or null if invalid
 */
export function parseHexToColorValue(hex: string): ColorValue | null {
  const rgba = parseHexToRgba(hex);
  if (!rgba) {
    return null;
  }
  return createColorValue(rgba.r, rgba.g, rgba.b, rgba.a);
}

/**
 * Format a ColorValue to 8-digit hex string.
 *
 * @param color - ColorValue to format
 * @returns 8-digit hex string (#RRGGBBAA)
 */
export function colorValueToHex(color: ColorValue): string {
  return rgbaToHex(color.r, color.g, color.b, color.a);
}
