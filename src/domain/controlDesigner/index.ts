/**
 * Control Designer Domain Index
 *
 * Re-exports all control designer domain utilities for convenient importing.
 */

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
export type { SimpleIndicatorMaterial } from './materials';

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
export type { SceneSetup } from './scene';

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
export type { FilmstripDimensions, FilmstripValidation, FrameViewport } from './filmstrip';

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
