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
// Environment maps
export {
  DEFAULT_ENVIRONMENT_CONFIG,
  disposeEnvironment,
  type EnvironmentConfig,
  generateProceduralEnvironment,
  getEnvironmentTexture,
  initializeEnvironment,
  loadHDRIEnvironment,
} from './environment';
// Filmstrip
export {
  blobToDataUrl,
  calculateFilmstripDimensions,
  calculateFrameAngle,
  calculateFramesPerRowForGrid,
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
  createHemisphereLight,
  createMainLight,
  createScene,
  setCameraView,
  sphericalToCartesian,
  updateCameraAspect,
  updateLightPosition,
} from './scene';
// Shaders
export {
  BRUSHED_METAL_FRAGMENT_SHADER,
  BRUSHED_METAL_VERTEX_SHADER,
  getBrushedMetalShaderChunks,
  LINEAR_BRUSH_GLSL,
  NOISE_2D_GLSL,
  RADIAL_BRUSH_GLSL,
  validateShaderCode,
} from './shaders';
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
