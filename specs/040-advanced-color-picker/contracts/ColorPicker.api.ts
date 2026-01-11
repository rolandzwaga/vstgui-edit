/**
 * ColorPicker Component API Contract
 * 
 * This file defines the public API for the Advanced Color Picker component.
 * Implementation must conform to these interfaces.
 */

import type { Component, Accessor } from 'solid-js';

// =============================================================================
// Core Types
// =============================================================================

/**
 * Complete color representation with all format values.
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
  /** Hue (0-360 degrees) */
  h: number;
  /** Saturation for HSV/HSB (0-100%) */
  s: number;
  /** Value/Brightness for HSV/HSB (0-100%) */
  v: number;
}

/**
 * Input format modes.
 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl';

/**
 * Display modes for the picker.
 */
export type PickerMode = 'popup' | 'inline';

/**
 * Color selection source.
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

// =============================================================================
// Component Props (Public API)
// =============================================================================

/**
 * Props for the main ColorPicker component.
 * 
 * @example
 * ```tsx
 * <ColorPicker
 *   value="#FF5500FF"
 *   documentColors={['Background', 'Text', 'Accent']}
 *   onChange={(color) => setColor(color)}
 *   onCommit={() => saveToHistory()}
 *   onCancel={() => revert()}
 * />
 * ```
 */
export interface ColorPickerProps {
  /** Current color value (hex, document color name, or predefined color) */
  value: string;
  
  /** Available document color names */
  documentColors: string[];
  
  /** Called on every color change (for live preview) */
  onChange: (value: string) => void;
  
  /** Called when editing is committed (Enter, blur, swatch click) */
  onCommit: () => void;
  
  /** Called when editing is cancelled (Escape) */
  onCancel: () => void;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Validation error to display */
  error?: string | null;
  
  /** Placeholder text (e.g., "Mixed" for batch edits) */
  placeholder?: string;
  
  /** Display mode - popup (default) or inline */
  mode?: PickerMode;
  
  /** Resolved hex values for document colors (for swatch preview) */
  documentColorValues?: Record<string, string>;
}

// =============================================================================
// Sub-Component Props
// =============================================================================

/**
 * Props for the gradient area (saturation-brightness picker).
 */
export interface GradientAreaProps {
  /** Current hue (0-360) */
  hue: number;
  /** Current saturation (0-100) */
  saturation: number;
  /** Current brightness (0-100) */
  brightness: number;
  /** Combined change handler */
  onChange: (saturation: number, brightness: number) => void;
  /** Commit handler (drag end) */
  onCommit: () => void;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Props for hue slider.
 */
export interface HueSliderProps {
  /** Current hue (0-360) */
  value: number;
  /** Change handler */
  onChange: (hue: number) => void;
  /** Commit handler */
  onCommit: () => void;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Props for alpha slider.
 */
export interface AlphaSliderProps {
  /** Current alpha (0-255) */
  value: number;
  /** Current color for gradient preview */
  color: { r: number; g: number; b: number };
  /** Change handler */
  onChange: (alpha: number) => void;
  /** Commit handler */
  onCommit: () => void;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Props for color input tabs.
 */
export interface ColorInputsProps {
  /** Current color value */
  value: ColorValue;
  /** Active format */
  format: ColorFormat;
  /** Format change handler */
  onFormatChange: (format: ColorFormat) => void;
  /** Color change handler */
  onChange: (value: ColorValue) => void;
  /** Commit handler */
  onCommit: () => void;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Props for color swatches section.
 */
export interface ColorSwatchesProps {
  /** Document colors */
  documentColors: string[];
  /** Resolved document color values */
  documentColorValues?: Record<string, string>;
  /** Selection handler (returns color name or hex) */
  onSelect: (color: string, source: ColorSource) => void;
  /** Currently selected value (for highlighting) */
  selected?: string;
}

/**
 * Props for old/new color preview.
 */
export interface ColorPreviewProps {
  /** Original color */
  original: ColorValue;
  /** Current color */
  current: ColorValue;
  /** Click handler for reverting to original */
  onRevert?: () => void;
}

/**
 * Props for eyedropper button.
 */
export interface EyeDropperButtonProps {
  /** Color pick handler */
  onColorPick: (hex: string) => void;
  /** Disabled state */
  disabled?: boolean;
}

// =============================================================================
// Domain Functions (Public API)
// =============================================================================

/**
 * Color conversion functions.
 */
export interface ColorConversionAPI {
  /** Parse hex string to ColorValue */
  parseHex(hex: string): ColorValue | null;
  
  /** Format ColorValue to 8-digit hex string */
  formatHex(color: ColorValue): string;
  
  /** Convert RGB to HSV */
  rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number };
  
  /** Convert HSV to RGB */
  hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number };
  
  /** Convert RGB to HSL */
  rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number };
  
  /** Convert HSL to RGB */
  hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number };
  
  /** Create ColorValue from RGB+A */
  createColorValue(r: number, g: number, b: number, a: number): ColorValue;
}

/**
 * Validation functions.
 */
export interface ColorValidationAPI {
  /** Validate hex input */
  validateHexInput(value: string): { valid: boolean; error?: string; normalized?: string };
  
  /** Validate RGB input */
  validateRgbInput(r: number, g: number, b: number, a: number): { valid: boolean; error?: string };
  
  /** Validate HSL input */
  validateHslInput(h: number, s: number, l: number, a: number): { valid: boolean; error?: string };
}

/**
 * Recent colors persistence.
 */
export interface RecentColorsAPI {
  /** Get recent colors from storage */
  getRecentColors(): string[];
  
  /** Add color to recent list */
  addRecentColor(hex: string): void;
  
  /** Clear all recent colors */
  clearRecentColors(): void;
}

// =============================================================================
// Constants
// =============================================================================

export const RECENT_COLORS_STORAGE_KEY = 'vstgui-edit:recent-colors';
export const MAX_RECENT_COLORS = 10;

export const VSTGUI_PREDEFINED_COLORS = [
  { name: 'BlackCColor', value: '#000000FF', ref: '~ BlackCColor' },
  { name: 'WhiteCColor', value: '#FFFFFFFF', ref: '~ WhiteCColor' },
  { name: 'GreyCColor', value: '#808080FF', ref: '~ GreyCColor' },
  { name: 'RedCColor', value: '#FF0000FF', ref: '~ RedCColor' },
  { name: 'GreenCColor', value: '#00FF00FF', ref: '~ GreenCColor' },
  { name: 'BlueCColor', value: '#0000FFFF', ref: '~ BlueCColor' },
  { name: 'YellowCColor', value: '#FFFF00FF', ref: '~ YellowCColor' },
  { name: 'CyanCColor', value: '#00FFFFFF', ref: '~ CyanCColor' },
  { name: 'MagentaCColor', value: '#FF00FFFF', ref: '~ MagentaCColor' },
  { name: 'TransparentCColor', value: '#00000000', ref: '~ TransparentCColor' },
] as const;

// =============================================================================
// Keyboard Navigation Behavior
// =============================================================================

/**
 * Keyboard step sizes per clarification (Session 2026-01-11).
 * 
 * - Normal arrow key: 1% step
 * - Shift + arrow key: 10% step
 */
export const KEYBOARD_STEP = {
  normal: 1,  // 1%
  shift: 10,  // 10%
} as const;

// =============================================================================
// Output Format Guarantee
// =============================================================================

/**
 * Output format (FR-009a): Always 8-digit HEX (#RRGGBBAA)
 * 
 * Regardless of input mode (HEX, RGB, HSL, visual picker),
 * the final output is always an 8-digit hex string.
 * 
 * Exceptions:
 * - Document color names are preserved as-is (e.g., "Background")
 * - Predefined colors use reference format (e.g., "~ BlackCColor")
 */
