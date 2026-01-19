/**
 * Slider Designer Domain
 *
 * Barrel export for slider designer domain utilities.
 */

// Defaults
export {
  BUILTIN_SLIDER_PRESETS,
  createDefaultHandle,
  createDefaultSliderDesign,
  createDefaultTrack,
  createDefaultValueFill,
  DEFAULT_HANDLE_MATERIAL,
  DEFAULT_SLIDER_LIGHTING,
  DEFAULT_SLIDER_OUTPUT,
  DEFAULT_TRACK_MATERIAL,
} from './defaults';

// Geometry
export {
  calculateGripLinePositions,
  calculateHandleDimensions,
  calculateHandlePosition,
  calculateSegments,
  calculateSliderGeometry,
  calculateTrackDimensions,
  calculateValueFillPosition,
  createCircleHandleGeometry,
  createFaderCapHandleGeometry,
  createGripLinesGeometry,
  createHandleGeometry,
  createRectangleHandleGeometry,
  createRoundedHandleGeometry,
  createSegmentedFillGeometries,
  createTrackGeometry,
  createTrackGrooveGeometry,
  createValueFillGeometry,
  percentToWorldUnits,
} from './geometry';

// Plugin
export { registerSliderPanels, sliderPlugin } from './plugin';

// Validation
export {
  HANDLE_CONSTRAINTS,
  SLIDER_OUTPUT_CONSTRAINTS,
  TRACK_CONSTRAINTS,
  VALUE_FILL_CONSTRAINTS,
  validateHandle,
  validateSliderDesign,
  validateSliderOutput,
  validateTrack,
  validateValueFill,
} from './validation';
