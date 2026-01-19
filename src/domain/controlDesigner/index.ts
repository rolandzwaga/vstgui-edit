/**
 * Control Designer Domain Index
 *
 * Re-exports all control designer domain utilities for convenient importing.
 */

// Defaults
export {
  copyBaseOutput,
  copyLighting,
  copyLinearOutput,
  copyMaterial,
  copyRotationalOutput,
  createBrushedAluminumMaterial,
  createDarkMatteMaterial,
  createDefaultBaseOutput,
  createDefaultLighting,
  createDefaultLinearOutput,
  createDefaultRotationalOutput,
  DEFAULT_BASE_OUTPUT,
  DEFAULT_CAMERA_VIEW,
  DEFAULT_LIGHTING,
  DEFAULT_LINEAR_OUTPUT,
  DEFAULT_MATERIAL,
  DEFAULT_ROTATIONAL_OUTPUT,
  generateId,
  generateUUID,
} from './defaults';
export type { FilmstripDimensions, FilmstripValidation, FrameViewport } from './filmstrip';
// Filmstrip
export {
  blobToDataUrl,
  calculateFilmstripDimensions,
  calculateFrameAngle,
  calculateFramePosition,
  calculateFramesPerRowForGrid,
  checkNarrowDimensionWarning,
  dataUrlToBlob,
  estimateFilmstripSize,
  formatFileSize,
  getDataUrlSize,
  getFrameValueCalculator,
  getFrameViewport,
  getLayoutDescription,
  suggestLayout,
  validateFilmstripSize,
} from './filmstrip';
export type { SimpleIndicatorMaterial } from './materials';
// Materials
export {
  clearMaterialCache,
  createBrushedMetalMaterial,
  createDefaultMaterial,
  createGlowMaterial,
  createIndicatorMaterial,
  createMaterial,
  createMatteMaterial,
  createMetallicMaterial,
  createSolidMaterial,
  disposeAllMaterials,
  MATERIAL_PRESETS,
  parseColor,
} from './materials';
// Registry
export {
  clearRegistry,
  controlTypeRegistry,
  getAllControlTypes,
  getControlType,
  getRegisteredCount,
  getRegisteredIds,
  isControlTypeRegistered,
  registerControlType,
} from './registry';
export type { SceneSetup } from './scene';
// Scene
export {
  applyLightingConfig,
  cartesianToSpherical,
  createAmbientLight,
  createCamera,
  createHemisphereLight,
  createMainLight,
  createScene,
  createSceneSetup,
  setCameraView,
  sphericalToCartesian,
  updateCameraAspect,
  updateLightPosition,
} from './scene';
// Validation
export {
  clampToConstraint,
  clampValue,
  combineValidations,
  LIGHTING_CONSTRAINTS,
  MATERIAL_CONSTRAINTS,
  OUTPUT_CONSTRAINTS,
  PRESET_CONSTRAINTS,
  PRESET_NAME_REGEX,
  suggestFrameCount,
  validateBaseOutput,
  validateConstraint,
  validateHexColor,
  validateLayerMaterial,
  validateLighting,
  validateNumericRange,
  validatePresetName,
} from './validation';
