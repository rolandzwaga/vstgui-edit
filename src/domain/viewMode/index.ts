/**
 * View Mode Domain Module
 *
 * Functions for styled view mode rendering including color resolution,
 * luminance calculation, and styled view props building.
 */

export {
  hexToRgba,
  isHexColor,
  normalizeHexColor,
  resolveColor,
} from './colorResolution';

export {
  calculateLuminance,
  getAdaptiveOverlayStyle,
  getDefaultOverlayStyle,
  isDarkColor,
  isLightColor,
  parseColorToRgb,
} from './luminance';

export {
  buildStyledViewProps,
  buildStyledViewPropsMap,
  parseFrameWidth,
  parseOpacity,
  parseTransparent,
  shouldUseWireframeFallback,
} from './styledViewProps';
