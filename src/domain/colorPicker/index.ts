/**
 * Color Picker Domain Module
 * Barrel exports for color picker utilities
 */

// Color conversion
export type { HslColor, HsvColor, RgbaColor, RgbColor } from './colorConversion';
export {
  clamp,
  colorValueToHex,
  createColorValue,
  createColorValueFromHsl,
  createColorValueFromHsv,
  hslToRgb,
  hsvToRgb,
  isValidHex,
  parseHexToColorValue,
  parseHexToRgba,
  rgbaToHex,
  rgbToHsl,
  rgbToHsv,
  roundTo,
} from './colorConversion';
// Color validation
export {
  validateHexInput,
  validateHslInput,
  validateRgbInput,
} from './colorValidation';
// Predefined colors
export {
  formatPredefinedColorRef,
  getPredefinedColor,
  getPredefinedColorHex,
  isPredefinedColorRef,
  VSTGUI_PREDEFINED_COLORS,
} from './predefinedColors';

// Recent colors
export {
  addRecentColor,
  clearRecentColors,
  getRecentColors,
  isStorageAvailable,
  MAX_RECENT_COLORS,
  STORAGE_KEY as RECENT_COLORS_STORAGE_KEY,
} from './recentColors';
