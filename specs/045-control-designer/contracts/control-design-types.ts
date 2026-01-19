/**
 * Control Designer Base Types Contract
 *
 * Defines the shared type definitions used across all control types.
 * These types form the foundation of the plugin architecture.
 */

// ============================================================================
// Control Type Identifiers
// ============================================================================

/**
 * Unique identifiers for control types.
 * Extend this union when adding new control types.
 */
export type ControlTypeId = 'knob' | 'slider';

/**
 * Control categories determine frame generation behavior.
 * - rotational: Angle-based frames (knobs, rotary controls)
 * - linear: Position-based frames (sliders, faders)
 * - binary: Two-state frames (switches, toggles)
 * - multiState: N discrete state frames (multi-position switches)
 * - grid2D: X/Y position-based frames (XY pads)
 */
export type ControlCategory = 'rotational' | 'linear' | 'binary' | 'multiState' | 'grid2D';

// ============================================================================
// View and Layout
// ============================================================================

/**
 * Camera view angle for 3D preview rendering.
 */
export type CameraView = 'top' | 'side';

/**
 * Filmstrip layout arrangement.
 */
export type FilmstripLayout = 'vertical' | 'horizontal' | 'grid';

// ============================================================================
// Lighting Configuration
// ============================================================================

/**
 * Lighting configuration shared by all control types.
 * Controls the main directional light position using spherical coordinates.
 */
export interface LightingConfig {
  /**
   * Azimuth angle in degrees (0-360).
   * 0 = front, 90 = right, 180 = back, 270 = left.
   */
  azimuth: number;

  /**
   * Elevation angle in degrees (0-90).
   * 0 = horizon, 90 = directly above.
   */
  elevation: number;

  /**
   * Ambient occlusion strength (0-100).
   * Higher values create stronger shadows in crevices.
   */
  aoStrength: number;
}

// ============================================================================
// Output Configuration
// ============================================================================

/**
 * Base output configuration shared by all control types.
 */
export interface BaseOutputConfig {
  /** Number of frames in filmstrip (1-256) */
  frameCount: number;

  /** Width of each frame in pixels (16-512) */
  frameWidth: number;

  /** Height of each frame in pixels (16-512) */
  frameHeight: number;

  /** Filmstrip layout arrangement */
  layout: FilmstripLayout;
}

/**
 * Output configuration for rotational controls (knobs).
 */
export interface RotationalOutputConfig extends BaseOutputConfig {
  /** Total rotation sweep in degrees (1-360) */
  sweepAngle: number;

  /** Start angle in degrees (0-360) */
  startAngle: number;

  /** End angle in degrees (computed: startAngle + sweepAngle) */
  endAngle: number;

  /** Additional rotation offset in degrees (-180 to 180) */
  rotationOffset: number;
}

/**
 * Output configuration for linear controls (sliders/faders).
 * Position is calculated as frameIndex / (frameCount - 1).
 */
export interface LinearOutputConfig extends BaseOutputConfig {
  // No additional fields needed
}

// ============================================================================
// Material System
// ============================================================================

/**
 * Material types supported by the designer.
 */
export type MaterialType = 'solid' | 'metallic' | 'matte' | 'brushed';

/**
 * Brush direction for brushed metal materials.
 */
export type BrushDirection = 'horizontal' | 'vertical' | 'radial' | 'circular';

/**
 * Material configuration for geometry surfaces.
 */
export interface LayerMaterial {
  /** Material type determines PBR properties */
  type: MaterialType;

  /** Base color in hex format with alpha (#RRGGBBAA) */
  color: string;

  /** Specular highlight intensity (0-100) */
  shininess: number;

  /** Environment reflection intensity (0-100) */
  reflectivity: number;

  /** Direction of brushed metal texture */
  brushDirection: BrushDirection;

  /** Intensity of brush effect (0-100) */
  brushIntensity: number;
}

// ============================================================================
// Material Target Selection
// ============================================================================

/**
 * Material target for knob control (layer-based).
 */
export interface MaterialTargetKnob {
  type: 'layer';
  layerId: string;
}

/**
 * Material target for slider control (component-based).
 */
export interface MaterialTargetSlider {
  type: 'component';
  componentId: 'track' | 'handle' | 'fill';
}

/**
 * Union type for all material target types.
 */
export type MaterialTarget = MaterialTargetKnob | MaterialTargetSlider;

// ============================================================================
// Base Control Design
// ============================================================================

/**
 * Base interface for all control type designs.
 * All control types extend this interface.
 */
export interface BaseControlDesign {
  /** Unique identifier (UUID) */
  id: string;

  /** User-provided display name */
  name: string;

  /** Control type discriminator */
  controlType: ControlTypeId;

  /** Lighting configuration */
  lighting: LightingConfig;

  /** Output configuration (may be extended by control type) */
  output: BaseOutputConfig;

  /** Camera view angle */
  cameraView: CameraView;
}

// ============================================================================
// Preset Types
// ============================================================================

/**
 * A saved preset for any control type.
 */
export interface ControlPreset<T extends BaseControlDesign = BaseControlDesign> {
  /** Unique identifier (UUID) */
  id: string;

  /** User-provided preset name */
  name: string;

  /** Control type discriminator for filtering */
  controlType: ControlTypeId;

  /** Whether this is a built-in preset */
  isBuiltIn: boolean;

  /** ISO 8601 timestamp of creation */
  createdAt: string;

  /** ISO 8601 timestamp of last modification */
  updatedAt: string;

  /** The complete design configuration */
  design: T;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if material target is for knob.
 */
export function isKnobMaterialTarget(target: MaterialTarget): target is MaterialTargetKnob {
  return target.type === 'layer';
}

/**
 * Type guard to check if material target is for slider.
 */
export function isSliderMaterialTarget(target: MaterialTarget): target is MaterialTargetSlider {
  return target.type === 'component';
}

// ============================================================================
// Validation Constraints
// ============================================================================

/**
 * Shared validation constraints for all control types.
 */
export const SHARED_CONSTRAINTS = {
  lighting: {
    azimuth: { min: 0, max: 360 },
    elevation: { min: 0, max: 90 },
    aoStrength: { min: 0, max: 100 },
  },
  output: {
    frameCount: { min: 1, max: 256 },
    frameWidth: { min: 16, max: 512 },
    frameHeight: { min: 16, max: 512 },
  },
  material: {
    shininess: { min: 0, max: 100 },
    reflectivity: { min: 0, max: 100 },
    brushIntensity: { min: 0, max: 100 },
  },
} as const;
