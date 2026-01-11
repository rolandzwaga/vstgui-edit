/**
 * Color Picker Domain Module
 * Barrel exports for color picker utilities
 */

// Predefined colors
export {
  VSTGUI_PREDEFINED_COLORS,
  getPredefinedColor,
  getPredefinedColorHex,
  isPredefinedColorRef,
  formatPredefinedColorRef,
} from './predefinedColors';

// Color conversion
export type { RgbColor, RgbaColor, HsvColor, HslColor } from './colorConversion';
export {
  clamp,
  roundTo,
  isValidHex,
  rgbToHsv,
  hsvToRgb,
  rgbToHsl,
  hslToRgb,
  parseHexToRgba,
  rgbaToHex,
  createColorValue,
  createColorValueFromHsv,
  createColorValueFromHsl,
  parseHexToColorValue,
  colorValueToHex,
} from './colorConversion';

// Color validation
export {
  validateHexInput,
  validateRgbInput,
  validateHslInput,
} from './colorValidation';

// Recent colors
export {
  STORAGE_KEY as RECENT_COLORS_STORAGE_KEY,
  MAX_RECENT_COLORS,
  isStorageAvailable,
  getRecentColors,
  addRecentColor,
  clearRecentColors,
} from './recentColors';
