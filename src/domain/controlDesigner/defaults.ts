/**
 * Control Designer Defaults Factory
 *
 * Factory functions for creating default values for control designs.
 * Shared defaults are defined here; control-type-specific defaults
 * are in their respective domain folders.
 */

import type {
  BaseOutputConfig,
  CameraView,
  LayerMaterial,
  LightingConfig,
  LinearOutputConfig,
  RotationalOutputConfig,
} from '../../types/controlDesigner';

// ============================================================================
// Default Lighting Configuration
// ============================================================================

/**
 * Default lighting configuration for all control types.
 * Light positioned at 315 azimuth (upper-left), 45 elevation.
 */
export const DEFAULT_LIGHTING: LightingConfig = {
  azimuth: 315,
  elevation: 45,
  aoStrength: 50,
};

/**
 * Creates a copy of the default lighting configuration.
 *
 * @returns New lighting configuration object
 */
export function createDefaultLighting(): LightingConfig {
  return { ...DEFAULT_LIGHTING };
}

// ============================================================================
// Default Output Configuration
// ============================================================================

/**
 * Default base output configuration.
 */
export const DEFAULT_BASE_OUTPUT: BaseOutputConfig = {
  frameCount: 64,
  frameWidth: 100,
  frameHeight: 100,
  layout: 'vertical',
};

/**
 * Default rotational output configuration (for knobs).
 */
export const DEFAULT_ROTATIONAL_OUTPUT: RotationalOutputConfig = {
  ...DEFAULT_BASE_OUTPUT,
  sweepAngle: 270,
  startAngle: 225,
  endAngle: 315,
  rotationOffset: 0,
};

/**
 * Default linear output configuration (for sliders).
 */
export const DEFAULT_LINEAR_OUTPUT: LinearOutputConfig = {
  ...DEFAULT_BASE_OUTPUT,
};

/**
 * Creates a copy of the default base output configuration.
 *
 * @returns New output configuration object
 */
export function createDefaultBaseOutput(): BaseOutputConfig {
  return { ...DEFAULT_BASE_OUTPUT };
}

/**
 * Creates a copy of the default rotational output configuration.
 *
 * @returns New rotational output configuration object
 */
export function createDefaultRotationalOutput(): RotationalOutputConfig {
  return { ...DEFAULT_ROTATIONAL_OUTPUT };
}

/**
 * Creates a copy of the default linear output configuration.
 *
 * @returns New linear output configuration object
 */
export function createDefaultLinearOutput(): LinearOutputConfig {
  return { ...DEFAULT_LINEAR_OUTPUT };
}

// ============================================================================
// Default Material Configuration
// ============================================================================

/**
 * Default metallic material configuration.
 */
export const DEFAULT_MATERIAL: LayerMaterial = {
  type: 'metallic',
  color: '#808080FF',
  shininess: 60,
  reflectivity: 40,
  brushDirection: 'radial',
  brushIntensity: 0,
};

/**
 * Creates a copy of the default material configuration.
 *
 * @param overrides - Optional property overrides
 * @returns New material configuration object
 */
export function createDefaultMaterial(overrides?: Partial<LayerMaterial>): LayerMaterial {
  return { ...DEFAULT_MATERIAL, ...overrides };
}

/**
 * Creates a dark matte material configuration.
 *
 * @returns Dark matte material configuration
 */
export function createDarkMatteMaterial(): LayerMaterial {
  return {
    type: 'matte',
    color: '#2A2A2AFF',
    shininess: 0,
    reflectivity: 0,
    brushDirection: 'radial',
    brushIntensity: 0,
  };
}

/**
 * Creates a brushed aluminum material configuration.
 *
 * @returns Brushed aluminum material configuration
 */
export function createBrushedAluminumMaterial(): LayerMaterial {
  return {
    type: 'brushed',
    color: '#A8A8A8FF',
    shininess: 90,
    reflectivity: 70,
    brushDirection: 'radial',
    brushIntensity: 50,
  };
}

// ============================================================================
// Default Camera View
// ============================================================================

/**
 * Default camera view for all control types.
 */
export const DEFAULT_CAMERA_VIEW: CameraView = 'top';

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generates a unique ID for a design component.
 *
 * @param prefix - ID prefix (e.g., 'layer', 'design')
 * @returns Unique ID string
 */
export function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * Generates a full UUID.
 *
 * @returns Full UUID string
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

// ============================================================================
// Deep Copy Utilities
// ============================================================================

/**
 * Creates a deep copy of a lighting configuration.
 *
 * @param lighting - Lighting configuration to copy
 * @returns New lighting configuration object
 */
export function copyLighting(lighting: LightingConfig): LightingConfig {
  return { ...lighting };
}

/**
 * Creates a deep copy of a material configuration.
 *
 * @param material - Material configuration to copy
 * @returns New material configuration object
 */
export function copyMaterial(material: LayerMaterial): LayerMaterial {
  return { ...material };
}

/**
 * Creates a deep copy of a base output configuration.
 *
 * @param output - Output configuration to copy
 * @returns New output configuration object
 */
export function copyBaseOutput(output: BaseOutputConfig): BaseOutputConfig {
  return { ...output };
}

/**
 * Creates a deep copy of a rotational output configuration.
 *
 * @param output - Output configuration to copy
 * @returns New output configuration object
 */
export function copyRotationalOutput(output: RotationalOutputConfig): RotationalOutputConfig {
  return { ...output };
}

/**
 * Creates a deep copy of a linear output configuration.
 *
 * @param output - Output configuration to copy
 * @returns New output configuration object
 */
export function copyLinearOutput(output: LinearOutputConfig): LinearOutputConfig {
  return { ...output };
}
