/**
 * Knob Designer Domain
 *
 * Barrel export for knob designer domain utilities.
 */

// Validation
export {
  validateLayerGeometry,
  validateLayerMaterial,
  validateIndicator,
  validateLighting,
  validateOutput,
  validatePresetName,
  clampValue,
  suggestFrameCount,
  LAYER_CONSTRAINTS,
  MATERIAL_CONSTRAINTS,
  INDICATOR_CONSTRAINTS,
  LIGHTING_CONSTRAINTS,
  OUTPUT_CONSTRAINTS,
  PRESET_CONSTRAINTS,
  PRESET_NAME_REGEX,
  type ValidationResult,
} from './validation';

// Defaults
export {
  DEFAULT_KNOB_DESIGN,
  BUILTIN_PRESETS,
  createDefaultDesign,
  copyDesign,
} from './defaults';
