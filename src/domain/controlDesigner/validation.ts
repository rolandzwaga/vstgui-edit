/**
 * Control Designer Validation Utilities
 *
 * Shared validation functions and constraints for control designer inputs.
 * Control-type-specific validation is in their respective domain folders.
 */

import type {
  BaseOutputConfig,
  ConstraintRange,
  LayerMaterial,
  LightingConfig,
  ValidationResult,
} from '../../types/controlDesigner';

// ============================================================================
// Shared Validation Constraints
// ============================================================================

/**
 * Material constraints shared across all control types.
 */
export const MATERIAL_CONSTRAINTS = {
  /** Shininess constraints (0-128, maps to roughness) */
  SHININESS: { MIN: 0, MAX: 128 },

  /** Reflectivity constraints (percentage) */
  REFLECTIVITY: { MIN: 0, MAX: 100 },

  /** Brush intensity constraints (percentage) */
  BRUSH_INTENSITY: { MIN: 0, MAX: 100 },
} as const;

/**
 * Lighting constraints shared across all control types.
 */
export const LIGHTING_CONSTRAINTS = {
  /** Azimuth angle constraints (degrees) */
  AZIMUTH: { MIN: 0, MAX: 360 },

  /** Elevation angle constraints (degrees) */
  ELEVATION: { MIN: 0, MAX: 90 },

  /** Ambient occlusion strength constraints (percentage) */
  AO_STRENGTH: { MIN: 0, MAX: 100 },
} as const;

/**
 * Output constraints shared across all control types.
 */
export const OUTPUT_CONSTRAINTS = {
  /** Frame count constraints */
  FRAME_COUNT: { MIN: 8, MAX: 256 },

  /** Frame dimensions constraints (pixels) */
  FRAME_SIZE: { MIN: 16, MAX: 512 },

  /** Sweep angle constraints (degrees) - for rotational controls */
  SWEEP_ANGLE: { MIN: 90, MAX: 360 },

  /** Start/end angle constraints (degrees) - for rotational controls */
  ANGLE: { MIN: 0, MAX: 360 },

  /** Rotation offset constraints (degrees) */
  ROTATION_OFFSET: { MIN: 0, MAX: 360 },
} as const;

/**
 * Preset constraints shared across all control types.
 */
export const PRESET_CONSTRAINTS = {
  /** Maximum custom presets */
  MAX_CUSTOM_PRESETS: 100,

  /** Name length constraints */
  NAME: { MIN_LENGTH: 1, MAX_LENGTH: 50 },
} as const;

/**
 * Preset name validation regex.
 * Allows alphanumeric, spaces, hyphens, underscores.
 */
export const PRESET_NAME_REGEX = /^[a-zA-Z0-9 _-]+$/;

// ============================================================================
// Generic Validation Functions
// ============================================================================

/**
 * Validates a numeric value within bounds.
 *
 * @param value - Value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param fieldName - Field name for error messages
 * @returns Validation result
 */
export function validateNumericRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }
  if (value < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }
  if (value > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` };
  }
  return { valid: true };
}

/**
 * Validates a numeric value against a constraint range.
 *
 * @param value - Value to validate
 * @param constraint - Constraint range with min and max
 * @param fieldName - Field name for error messages
 * @returns Validation result
 */
export function validateConstraint(
  value: number,
  constraint: ConstraintRange,
  fieldName: string
): ValidationResult {
  return validateNumericRange(value, constraint.min, constraint.max, fieldName);
}

/**
 * Validates a hex color string.
 *
 * @param color - Color string to validate
 * @param requireAlpha - Whether alpha channel is required (defaults to true)
 * @returns Validation result
 */
export function validateHexColor(color: string, requireAlpha = true): ValidationResult {
  const hexColorRegex = requireAlpha ? /^#[0-9A-Fa-f]{8}$/ : /^#[0-9A-Fa-f]{6,8}$/;
  if (!hexColorRegex.test(color)) {
    const format = requireAlpha ? '#RRGGBBAA' : '#RRGGBB or #RRGGBBAA';
    return { valid: false, error: `Color must be in ${format} format` };
  }
  return { valid: true };
}

// ============================================================================
// Shared Component Validation
// ============================================================================

/**
 * Validates layer material constraints.
 *
 * @param material - Material to validate
 * @returns Validation result
 */
export function validateLayerMaterial(material: LayerMaterial): ValidationResult {
  // Validate material type
  const validTypes = ['solid', 'metallic', 'matte', 'brushed'];
  if (!validTypes.includes(material.type)) {
    return { valid: false, error: 'Invalid material type' };
  }

  // Validate color format
  const colorResult = validateHexColor(material.color);
  if (!colorResult.valid) return colorResult;

  // Validate shininess
  const shininessResult = validateNumericRange(
    material.shininess,
    MATERIAL_CONSTRAINTS.SHININESS.MIN,
    MATERIAL_CONSTRAINTS.SHININESS.MAX,
    'Shininess'
  );
  if (!shininessResult.valid) return shininessResult;

  // Validate reflectivity
  const reflectivityResult = validateNumericRange(
    material.reflectivity,
    MATERIAL_CONSTRAINTS.REFLECTIVITY.MIN,
    MATERIAL_CONSTRAINTS.REFLECTIVITY.MAX,
    'Reflectivity'
  );
  if (!reflectivityResult.valid) return reflectivityResult;

  // Validate brush direction
  const validDirections = ['radial', 'linear'];
  if (!validDirections.includes(material.brushDirection)) {
    return { valid: false, error: 'Invalid brush direction' };
  }

  // Validate brush intensity
  const brushIntensityResult = validateNumericRange(
    material.brushIntensity,
    MATERIAL_CONSTRAINTS.BRUSH_INTENSITY.MIN,
    MATERIAL_CONSTRAINTS.BRUSH_INTENSITY.MAX,
    'Brush intensity'
  );
  if (!brushIntensityResult.valid) return brushIntensityResult;

  return { valid: true };
}

/**
 * Validates lighting configuration.
 *
 * @param lighting - Lighting config to validate
 * @returns Validation result
 */
export function validateLighting(lighting: LightingConfig): ValidationResult {
  // Validate azimuth
  const azimuthResult = validateNumericRange(
    lighting.azimuth,
    LIGHTING_CONSTRAINTS.AZIMUTH.MIN,
    LIGHTING_CONSTRAINTS.AZIMUTH.MAX,
    'Azimuth'
  );
  if (!azimuthResult.valid) return azimuthResult;

  // Validate elevation
  const elevationResult = validateNumericRange(
    lighting.elevation,
    LIGHTING_CONSTRAINTS.ELEVATION.MIN,
    LIGHTING_CONSTRAINTS.ELEVATION.MAX,
    'Elevation'
  );
  if (!elevationResult.valid) return elevationResult;

  // Validate AO strength
  const aoResult = validateNumericRange(
    lighting.aoStrength,
    LIGHTING_CONSTRAINTS.AO_STRENGTH.MIN,
    LIGHTING_CONSTRAINTS.AO_STRENGTH.MAX,
    'AO strength'
  );
  if (!aoResult.valid) return aoResult;

  return { valid: true };
}

/**
 * Validates base output configuration.
 *
 * @param output - Output config to validate
 * @returns Validation result
 */
export function validateBaseOutput(output: BaseOutputConfig): ValidationResult {
  // Validate frame count
  const frameCountResult = validateNumericRange(
    output.frameCount,
    OUTPUT_CONSTRAINTS.FRAME_COUNT.MIN,
    OUTPUT_CONSTRAINTS.FRAME_COUNT.MAX,
    'Frame count'
  );
  if (!frameCountResult.valid) return frameCountResult;

  // Validate frame width
  const frameWidthResult = validateNumericRange(
    output.frameWidth,
    OUTPUT_CONSTRAINTS.FRAME_SIZE.MIN,
    OUTPUT_CONSTRAINTS.FRAME_SIZE.MAX,
    'Frame width'
  );
  if (!frameWidthResult.valid) return frameWidthResult;

  // Validate frame height
  const frameHeightResult = validateNumericRange(
    output.frameHeight,
    OUTPUT_CONSTRAINTS.FRAME_SIZE.MIN,
    OUTPUT_CONSTRAINTS.FRAME_SIZE.MAX,
    'Frame height'
  );
  if (!frameHeightResult.valid) return frameHeightResult;

  // Validate layout
  const validLayouts = ['grid', 'vertical', 'horizontal'];
  if (!validLayouts.includes(output.layout)) {
    return { valid: false, error: 'Invalid layout' };
  }

  return { valid: true };
}

/**
 * Validates a preset name.
 *
 * @param name - Name to validate
 * @returns Validation result
 */
export function validatePresetName(name: string): ValidationResult {
  // Check type
  if (typeof name !== 'string') {
    return { valid: false, error: 'Name must be a string' };
  }

  // Trim and check length
  const trimmed = name.trim();
  if (trimmed.length < PRESET_CONSTRAINTS.NAME.MIN_LENGTH) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  if (trimmed.length > PRESET_CONSTRAINTS.NAME.MAX_LENGTH) {
    return {
      valid: false,
      error: `Name must be at most ${PRESET_CONSTRAINTS.NAME.MAX_LENGTH} characters`,
    };
  }

  // Check characters
  if (!PRESET_NAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'Name can only contain letters, numbers, spaces, hyphens, and underscores',
    };
  }

  return { valid: true };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clamps a value to the specified range.
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Clamps a value to a constraint range.
 *
 * @param value - Value to clamp
 * @param constraint - Constraint range with min and max
 * @returns Clamped value
 */
export function clampToConstraint(value: number, constraint: ConstraintRange): number {
  return clampValue(value, constraint.min, constraint.max);
}

/**
 * Suggests optimal frame count based on frame width.
 * Uses formula: frameCount = clamp(frameWidth * 0.8, 32, 128)
 *
 * @param frameWidth - Frame width in pixels
 * @returns Suggested frame count
 */
export function suggestFrameCount(frameWidth: number): number {
  const suggested = Math.round(frameWidth * 0.8);
  return clampValue(suggested, 32, 128);
}

/**
 * Combines multiple validation results.
 * Returns the first invalid result, or a valid result if all pass.
 *
 * @param results - Array of validation results
 * @returns Combined validation result
 */
export function combineValidations(...results: ValidationResult[]): ValidationResult {
  for (const result of results) {
    if (!result.valid) return result;
  }
  return { valid: true };
}
