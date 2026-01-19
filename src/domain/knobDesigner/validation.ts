/**
 * Knob Designer Validation
 *
 * Validation constraints and functions for knob designer inputs.
 * Ensures all numeric inputs are within valid bounds per FR-044.
 */

import type {
  IndicatorType,
  KnobIndicator,
  LayerGeometry,
  LayerMaterial,
  LightingConfig,
  OutputConfig,
} from '../../types/knobDesigner';

// ============================================================================
// Validation Result Type
// ============================================================================

/**
 * Result of a validation operation.
 */
export interface ValidationResult {
  /** Whether the value is valid */
  valid: boolean;

  /** Error message if invalid */
  error?: string;
}

// ============================================================================
// Validation Constraints
// ============================================================================

/**
 * Layer geometry constraints.
 */
export const LAYER_CONSTRAINTS = {
  /** Minimum number of layers */
  MIN_LAYERS: 1,

  /** Maximum number of layers */
  MAX_LAYERS: 3,

  /** Diameter constraints (percentage) */
  DIAMETER: {
    MIN: 10,
    MAX: 100,
  },

  /** Height constraints (percentage) */
  HEIGHT: {
    MIN: 10,
    MAX: 100,
  },

  /** Bevel radius constraints (pixels) */
  BEVEL_RADIUS: {
    MIN: 0,
    MAX: 20,
  },
} as const;

/**
 * Material constraints.
 */
export const MATERIAL_CONSTRAINTS = {
  /** Shininess constraints (0-128, maps to roughness) */
  SHININESS: {
    MIN: 0,
    MAX: 128,
  },

  /** Reflectivity constraints (percentage) */
  REFLECTIVITY: {
    MIN: 0,
    MAX: 100,
  },

  /** Brush intensity constraints (percentage) */
  BRUSH_INTENSITY: {
    MIN: 0,
    MAX: 100,
  },
} as const;

/**
 * Indicator constraints.
 */
export const INDICATOR_CONSTRAINTS = {
  /** Radial position constraints (percentage from center) */
  RADIAL_POSITION: {
    MIN: 10,
    MAX: 90,
  },

  /** Dot radius constraints (pixels) */
  RADIUS: {
    MIN: 1,
    MAX: 20,
  },

  /** Line length constraints (pixels) */
  LENGTH: {
    MIN: 5,
    MAX: 50,
  },

  /** Line width constraints (pixels) */
  WIDTH: {
    MIN: 1,
    MAX: 10,
  },

  /** Notch/groove depth constraints (pixels) */
  DEPTH: {
    MIN: 1,
    MAX: 10,
  },
} as const;

/**
 * Lighting constraints.
 */
export const LIGHTING_CONSTRAINTS = {
  /** Azimuth angle constraints (degrees) */
  AZIMUTH: {
    MIN: 0,
    MAX: 360,
  },

  /** Elevation angle constraints (degrees) */
  ELEVATION: {
    MIN: 0,
    MAX: 90,
  },

  /** Ambient occlusion strength constraints (percentage) */
  AO_STRENGTH: {
    MIN: 0,
    MAX: 100,
  },
} as const;

/**
 * Output constraints.
 */
export const OUTPUT_CONSTRAINTS = {
  /** Frame count constraints */
  FRAME_COUNT: {
    MIN: 8,
    MAX: 256,
  },

  /** Frame dimensions constraints (pixels) */
  FRAME_SIZE: {
    MIN: 16,
    MAX: 512,
  },

  /** Sweep angle constraints (degrees) */
  SWEEP_ANGLE: {
    MIN: 90,
    MAX: 360,
  },

  /** Start/end angle constraints (degrees) */
  ANGLE: {
    MIN: 0,
    MAX: 360,
  },
} as const;

/**
 * Preset constraints.
 */
export const PRESET_CONSTRAINTS = {
  /** Maximum custom presets */
  MAX_CUSTOM_PRESETS: 100,

  /** Name length constraints */
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
  },
} as const;

/**
 * Preset name validation regex.
 * Allows alphanumeric, spaces, hyphens, underscores.
 */
export const PRESET_NAME_REGEX = /^[a-zA-Z0-9 _-]+$/;

// ============================================================================
// Validation Functions
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
function validateNumericRange(
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
 * Validates layer geometry constraints.
 *
 * @param geometry - Geometry to validate
 * @returns Validation result
 */
export function validateLayerGeometry(geometry: LayerGeometry): ValidationResult {
  // Validate diameter
  const diameterResult = validateNumericRange(
    geometry.diameter,
    LAYER_CONSTRAINTS.DIAMETER.MIN,
    LAYER_CONSTRAINTS.DIAMETER.MAX,
    'Diameter'
  );
  if (!diameterResult.valid) return diameterResult;

  // Validate height
  const heightResult = validateNumericRange(
    geometry.height,
    LAYER_CONSTRAINTS.HEIGHT.MIN,
    LAYER_CONSTRAINTS.HEIGHT.MAX,
    'Height'
  );
  if (!heightResult.valid) return heightResult;

  // Validate bevel radius
  const bevelResult = validateNumericRange(
    geometry.bevelRadius,
    LAYER_CONSTRAINTS.BEVEL_RADIUS.MIN,
    LAYER_CONSTRAINTS.BEVEL_RADIUS.MAX,
    'Bevel radius'
  );
  if (!bevelResult.valid) return bevelResult;

  // Validate skirt style
  const validSkirtStyles = ['cylindrical', 'tapered', 'angled'];
  if (!validSkirtStyles.includes(geometry.skirtStyle)) {
    return { valid: false, error: 'Invalid skirt style' };
  }

  return { valid: true };
}

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

  // Validate color format (hex with alpha)
  const hexColorRegex = /^#[0-9A-Fa-f]{8}$/;
  if (!hexColorRegex.test(material.color)) {
    return { valid: false, error: 'Color must be in #RRGGBBAA format' };
  }

  // Validate shininess (only relevant for metallic)
  const shininessResult = validateNumericRange(
    material.shininess,
    MATERIAL_CONSTRAINTS.SHININESS.MIN,
    MATERIAL_CONSTRAINTS.SHININESS.MAX,
    'Shininess'
  );
  if (!shininessResult.valid) return shininessResult;

  // Validate reflectivity (only relevant for metallic)
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

  // Validate brush intensity (only relevant for brushed)
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
 * Validates indicator constraints.
 *
 * @param indicator - Indicator to validate
 * @returns Validation result
 */
export function validateIndicator(indicator: KnobIndicator): ValidationResult {
  // If disabled, no further validation needed
  if (!indicator.enabled) {
    return { valid: true };
  }

  // Validate indicator type
  const validTypes: IndicatorType[] = ['dot', 'line', 'notch', 'groove'];
  if (!validTypes.includes(indicator.type)) {
    return { valid: false, error: 'Invalid indicator type' };
  }

  // Validate radial position
  const positionResult = validateNumericRange(
    indicator.radialPosition,
    INDICATOR_CONSTRAINTS.RADIAL_POSITION.MIN,
    INDICATOR_CONSTRAINTS.RADIAL_POSITION.MAX,
    'Radial position'
  );
  if (!positionResult.valid) return positionResult;

  // Validate color format
  const hexColorRegex = /^#[0-9A-Fa-f]{8}$/;
  if (!hexColorRegex.test(indicator.material.color)) {
    return { valid: false, error: 'Indicator color must be in #RRGGBBAA format' };
  }

  // Validate size based on indicator type
  switch (indicator.type) {
    case 'dot': {
      const radiusResult = validateNumericRange(
        indicator.size.radius,
        INDICATOR_CONSTRAINTS.RADIUS.MIN,
        INDICATOR_CONSTRAINTS.RADIUS.MAX,
        'Radius'
      );
      if (!radiusResult.valid) return radiusResult;
      break;
    }
    case 'line': {
      const lengthResult = validateNumericRange(
        indicator.size.length,
        INDICATOR_CONSTRAINTS.LENGTH.MIN,
        INDICATOR_CONSTRAINTS.LENGTH.MAX,
        'Length'
      );
      if (!lengthResult.valid) return lengthResult;

      const widthResult = validateNumericRange(
        indicator.size.width,
        INDICATOR_CONSTRAINTS.WIDTH.MIN,
        INDICATOR_CONSTRAINTS.WIDTH.MAX,
        'Width'
      );
      if (!widthResult.valid) return widthResult;
      break;
    }
    case 'notch':
    case 'groove': {
      const depthResult = validateNumericRange(
        indicator.size.depth,
        INDICATOR_CONSTRAINTS.DEPTH.MIN,
        INDICATOR_CONSTRAINTS.DEPTH.MAX,
        'Depth'
      );
      if (!depthResult.valid) return depthResult;

      const widthResult = validateNumericRange(
        indicator.size.width,
        INDICATOR_CONSTRAINTS.WIDTH.MIN,
        INDICATOR_CONSTRAINTS.WIDTH.MAX,
        'Width'
      );
      if (!widthResult.valid) return widthResult;
      break;
    }
  }

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
 * Validates output configuration.
 *
 * @param output - Output config to validate
 * @returns Validation result
 */
export function validateOutput(output: OutputConfig): ValidationResult {
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

  // Validate sweep angle
  const sweepResult = validateNumericRange(
    output.sweepAngle,
    OUTPUT_CONSTRAINTS.SWEEP_ANGLE.MIN,
    OUTPUT_CONSTRAINTS.SWEEP_ANGLE.MAX,
    'Sweep angle'
  );
  if (!sweepResult.valid) return sweepResult;

  // Validate start angle
  const startResult = validateNumericRange(
    output.startAngle,
    OUTPUT_CONSTRAINTS.ANGLE.MIN,
    OUTPUT_CONSTRAINTS.ANGLE.MAX,
    'Start angle'
  );
  if (!startResult.valid) return startResult;

  // Validate end angle
  const endResult = validateNumericRange(
    output.endAngle,
    OUTPUT_CONSTRAINTS.ANGLE.MIN,
    OUTPUT_CONSTRAINTS.ANGLE.MAX,
    'End angle'
  );
  if (!endResult.valid) return endResult;

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
