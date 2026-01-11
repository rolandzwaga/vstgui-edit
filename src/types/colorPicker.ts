/**
 * Color Picker Types
 * Types for the advanced color picker component
 */

// =============================================================================
// Core Color Types
// =============================================================================

/**
 * Complete color representation with all format values.
 * Used as the internal state of the color picker.
 */
export interface ColorValue {
  /** Red component (0-255) */
  r: number;
  /** Green component (0-255) */
  g: number;
  /** Blue component (0-255) */
  b: number;
  /** Alpha component (0-255) */
  a: number;
  /** Hue (0-360 degrees) - shared by both HSV and HSL */
  h: number;
  /** Saturation for HSV/HSB (0-100%) */
  s: number;
  /** Value/Brightness for HSV/HSB (0-100%) */
  v: number;
  /** Saturation for HSL (0-100%) - different formula from HSV */
  hslS: number;
  /** Lightness for HSL (0-100%) */
  l: number;
}

/**
 * Input format modes for the color picker.
 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl';

/**
 * Origin of the color value for tracking selection method.
 */
export type ColorSource =
  | 'hex-input'
  | 'rgb-input'
  | 'hsl-input'
  | 'visual-picker'
  | 'document-color'
  | 'predefined-color'
  | 'recent-color'
  | 'eyedropper';

/**
 * Display mode for the picker component.
 */
export type PickerMode = 'popup' | 'inline';

// =============================================================================
// Predefined Colors
// =============================================================================

/**
 * VSTGUI predefined color with name and hex value.
 */
export interface PredefinedColor {
  /** Internal color name (e.g., 'BlackCColor') */
  name: string;
  /** Hex value (e.g., '#000000FF') */
  value: string;
  /** Display name for UI (e.g., 'Black') */
  displayName: string;
}

// =============================================================================
// Validation Types
// =============================================================================

/**
 * Result of validating a color input.
 */
export interface ColorValidationResult {
  /** Whether the input is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Normalized output string (e.g., uppercase hex) */
  normalized?: string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Maximum number of recent colors to store.
 */
export const MAX_RECENT_COLORS = 10;

/**
 * localStorage key for recent colors.
 */
export const RECENT_COLORS_STORAGE_KEY = 'vstgui-edit:recent-colors';

/**
 * Default picker dimensions.
 */
export const PICKER_DIMENSIONS = {
  gradientWidth: 200,
  gradientHeight: 150,
  sliderHeight: 12,
  swatchSize: 24,
} as const;

/**
 * Keyboard step sizes for arrow key navigation.
 * Normal arrow key: 1% step
 * Shift + arrow key: 10% step
 */
export const KEYBOARD_STEP = {
  normal: 1,
  shift: 10,
} as const;
