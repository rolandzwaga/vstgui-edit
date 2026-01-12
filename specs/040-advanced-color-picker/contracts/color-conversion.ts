/**
 * Color Conversion API Contract
 *
 * Pure functions for converting between color formats.
 * All functions are stateless and can be tested in isolation.
 */

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
// RGB <-> HSV Conversion
// =============================================================================

/**
 * Convert RGB to HSV color space.
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns HSV color with H: 0-360, S: 0-100, V: 0-100
 *
 * @example
 * rgbToHsv(255, 0, 0) // { h: 0, s: 100, v: 100 } (pure red)
 * rgbToHsv(0, 0, 0)   // { h: 0, s: 0, v: 0 } (black)
 * rgbToHsv(128, 128, 128) // { h: 0, s: 0, v: 50 } (gray)
 */
export function rgbToHsv(r: number, g: number, b: number): HsvColor;

/**
 * Convert HSV to RGB color space.
 *
 * @param h - Hue (0-360 degrees)
 * @param s - Saturation (0-100 percent)
 * @param v - Value/Brightness (0-100 percent)
 * @returns RGB color with R, G, B: 0-255
 *
 * @example
 * hsvToRgb(0, 100, 100)   // { r: 255, g: 0, b: 0 } (pure red)
 * hsvToRgb(120, 100, 100) // { r: 0, g: 255, b: 0 } (pure green)
 * hsvToRgb(0, 0, 50)      // { r: 128, g: 128, b: 128 } (gray)
 */
export function hsvToRgb(h: number, s: number, v: number): RgbColor;

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
 *
 * @example
 * rgbToHsl(255, 0, 0)     // { h: 0, s: 100, l: 50 } (pure red)
 * rgbToHsl(255, 255, 255) // { h: 0, s: 0, l: 100 } (white)
 * rgbToHsl(0, 0, 0)       // { h: 0, s: 0, l: 0 } (black)
 */
export function rgbToHsl(r: number, g: number, b: number): HslColor;

/**
 * Convert HSL to RGB color space.
 *
 * @param h - Hue (0-360 degrees)
 * @param s - Saturation (0-100 percent)
 * @param l - Lightness (0-100 percent)
 * @returns RGB color with R, G, B: 0-255
 *
 * @example
 * hslToRgb(0, 100, 50)   // { r: 255, g: 0, b: 0 } (pure red)
 * hslToRgb(0, 0, 100)    // { r: 255, g: 255, b: 255 } (white)
 * hslToRgb(0, 0, 0)      // { r: 0, g: 0, b: 0 } (black)
 */
export function hslToRgb(h: number, s: number, l: number): RgbColor;

// =============================================================================
// Hex Conversion
// =============================================================================

/**
 * Parse a hex color string to RGBA components.
 *
 * @param hex - Hex color string (#RGB, #RRGGBB, or #RRGGBBAA)
 * @returns RGBA color or null if invalid
 *
 * @example
 * parseHexToRgba('#FF0000')   // { r: 255, g: 0, b: 0, a: 255 }
 * parseHexToRgba('#FF000080') // { r: 255, g: 0, b: 0, a: 128 }
 * parseHexToRgba('#F00')      // { r: 255, g: 0, b: 0, a: 255 }
 * parseHexToRgba('invalid')   // null
 */
export function parseHexToRgba(hex: string): RgbaColor | null;

/**
 * Format RGBA components to a hex string.
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @param a - Alpha component (0-255, optional, defaults to 255)
 * @returns Uppercase hex string (#RRGGBB or #RRGGBBAA)
 *
 * @example
 * rgbaToHex(255, 0, 0)       // '#FF0000FF'
 * rgbaToHex(255, 0, 0, 128)  // '#FF000080'
 * rgbaToHex(255, 0, 0, 255)  // '#FF0000FF'
 */
export function rgbaToHex(r: number, g: number, b: number, a?: number): string;

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
export function clamp(value: number, min: number, max: number): number;

/**
 * Round a number to a specified precision.
 *
 * @param value - Value to round
 * @param decimals - Number of decimal places (default: 0)
 * @returns Rounded value
 */
export function roundTo(value: number, decimals?: number): number;

/**
 * Check if a hex color string is valid.
 *
 * @param hex - String to validate
 * @returns True if valid hex color
 */
export function isValidHex(hex: string): boolean;
