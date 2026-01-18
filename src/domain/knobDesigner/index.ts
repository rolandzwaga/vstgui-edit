/**
 * Knob Designer Domain
 *
 * Barrel export for knob designer domain utilities.
 */

// Defaults
export {
  BUILTIN_PRESETS,
  copyDesign,
  createDefaultDesign,
  DEFAULT_KNOB_DESIGN,
} from './defaults';
// Filmstrip
export {
  blobToDataUrl,
  calculateFilmstripDimensions,
  calculateFrameAngle,
  calculateFramesPerRow,
  dataUrlToBlob,
  estimateFilmstripSize,
  formatFileSize,
  getDataUrlSize,
  getFrameViewport,
  validateFilmstripSize,
} from './filmstrip';
// Geometry
export {
  applyBevel,
  calculateLayerYOffset,
  calculateSegments,
  createDotGeometry,
  createGrooveGeometry,
  createIndicatorGeometry,
  createLayerGeometry,
  createLayerProfile,
  createLineGeometry,
  createNotchGeometry,
} from './geometry';
// Materials
export {
  clearCache as clearMaterialCache,
  createBrushedMetalMaterial,
  createIndicatorMaterial,
  createMaterial,
  createMatteMaterial,
  createMetallicMaterial,
  createSolidMaterial,
  disposeAll as disposeMaterials,
} from './materials';
// Scene setup
export {
  cartesianToSpherical,
  createAmbientLight,
  createCamera,
  createMainLight,
  createScene,
  sphericalToCartesian,
  updateCameraAspect,
  updateLightPosition,
} from './scene';
// Validation
export {
  clampValue,
  INDICATOR_CONSTRAINTS,
  LAYER_CONSTRAINTS,
  LIGHTING_CONSTRAINTS,
  MATERIAL_CONSTRAINTS,
  OUTPUT_CONSTRAINTS,
  PRESET_CONSTRAINTS,
  PRESET_NAME_REGEX,
  suggestFrameCount,
  type ValidationResult,
  validateIndicator,
  validateLayerGeometry,
  validateLayerMaterial,
  validateLighting,
  validateOutput,
  validatePresetName,
} from './validation';
