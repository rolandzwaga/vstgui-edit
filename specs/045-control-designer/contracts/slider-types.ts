/**
 * Slider Designer Types Contract
 *
 * Type definitions specific to the slider/fader control type.
 * Extends the base control design with slider-specific properties.
 */

import type { BaseControlDesign, LinearOutputConfig, LayerMaterial } from './control-design-types';

// ============================================================================
// Slider-Specific Enums
// ============================================================================

/**
 * Slider orientation (direction of travel).
 */
export type SliderOrientation = 'horizontal' | 'vertical';

/**
 * Handle shape options.
 * - rectangle: Sharp corners
 * - rounded: Rounded corners (uses cornerRadius)
 * - circle: Circular handle
 * - faderCap: Traditional mixer fader cap shape
 */
export type HandleShape = 'rectangle' | 'rounded' | 'circle' | 'faderCap';

/**
 * Value fill display mode.
 * - none: No fill visualization
 * - fromStart: Fill from minimum to current value
 * - fromCenter: Fill expands from center in both directions
 * - segmented: Discrete LED-style segments
 */
export type ValueFillMode = 'none' | 'fromStart' | 'fromCenter' | 'segmented';

// ============================================================================
// Slider Track
// ============================================================================

/**
 * Track configuration for slider control.
 * The track is the stationary guide along which the handle moves.
 */
export interface SliderTrack {
  /** Track orientation (direction of travel) */
  orientation: SliderOrientation;

  /**
   * Track length as percentage of frame dimension (10-100).
   * For vertical: percentage of frame height.
   * For horizontal: percentage of frame width.
   */
  length: number;

  /**
   * Track width as percentage of frame dimension (5-50).
   * For vertical: percentage of frame width.
   * For horizontal: percentage of frame height.
   */
  width: number;

  /** Track depth/thickness in world units (1-20) */
  depth: number;

  /** Corner radius for rounded edges (0-10) */
  cornerRadius: number;

  /** Track material configuration */
  material: LayerMaterial;
}

// ============================================================================
// Slider Handle
// ============================================================================

/**
 * Handle configuration for slider control.
 * The handle is the movable element the user interacts with.
 */
export interface SliderHandle {
  /** Handle shape */
  shape: HandleShape;

  /**
   * Handle width as percentage of track width (50-150).
   * Can be wider than track for "cap" style handles.
   */
  width: number;

  /**
   * Handle height as percentage of track width (50-200).
   * Controls thickness along travel axis.
   */
  height: number;

  /** Corner radius for rounded shapes (0-10) */
  cornerRadius: number;

  /**
   * Number of horizontal grip lines on handle (0-5).
   * 0 = no grip lines, 1-5 = number of engraved lines.
   */
  gripLines: number;

  /** Handle material configuration */
  material: LayerMaterial;
}

// ============================================================================
// Slider Value Fill
// ============================================================================

/**
 * Value fill visualization configuration.
 * Optional colored region showing current value level.
 */
export interface SliderValueFill {
  /** Fill display mode */
  mode: ValueFillMode;

  /** Fill color in hex format (#RRGGBBAA) */
  color: string;

  /**
   * Glow/emission intensity (0-100).
   * Higher values create a luminous LED-like effect.
   */
  glowIntensity: number;

  /**
   * Number of segments for segmented mode (2-20).
   * Only used when mode is 'segmented'.
   */
  segmentCount?: number;

  /**
   * Gap between segments as percentage of segment height (0-50).
   * Only used when mode is 'segmented'.
   */
  segmentGap?: number;
}

// ============================================================================
// Complete Slider Design
// ============================================================================

/**
 * Complete slider design configuration.
 * Extends BaseControlDesign with slider-specific properties.
 */
export interface SliderDesign extends BaseControlDesign {
  /** Control type discriminator (always 'slider') */
  controlType: 'slider';

  /** Track configuration */
  track: SliderTrack;

  /** Handle configuration */
  handle: SliderHandle;

  /** Value fill configuration */
  valueFill: SliderValueFill;

  /** Linear output configuration */
  output: LinearOutputConfig;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if design is a slider design.
 */
export function isSliderDesign(design: BaseControlDesign): design is SliderDesign {
  return design.controlType === 'slider';
}

// ============================================================================
// Validation Constraints
// ============================================================================

/**
 * Slider-specific validation constraints.
 */
export const SLIDER_CONSTRAINTS = {
  track: {
    length: { min: 10, max: 100 },
    width: { min: 5, max: 50 },
    depth: { min: 1, max: 20 },
    cornerRadius: { min: 0, max: 10 },
  },
  handle: {
    width: { min: 50, max: 150 },
    height: { min: 50, max: 200 },
    cornerRadius: { min: 0, max: 10 },
    gripLines: { min: 0, max: 5 },
  },
  valueFill: {
    glowIntensity: { min: 0, max: 100 },
    segmentCount: { min: 2, max: 20 },
    segmentGap: { min: 0, max: 50 },
  },
} as const;

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default material for track.
 */
export const DEFAULT_TRACK_MATERIAL: LayerMaterial = {
  type: 'metallic',
  color: '#404040FF',
  shininess: 40,
  reflectivity: 20,
  brushDirection: 'vertical',
  brushIntensity: 0,
};

/**
 * Default material for handle.
 */
export const DEFAULT_HANDLE_MATERIAL: LayerMaterial = {
  type: 'metallic',
  color: '#A0A0A0FF',
  shininess: 80,
  reflectivity: 50,
  brushDirection: 'horizontal',
  brushIntensity: 30,
};

/**
 * Default track configuration.
 */
export const DEFAULT_TRACK: SliderTrack = {
  orientation: 'vertical',
  length: 80,
  width: 15,
  depth: 5,
  cornerRadius: 2,
  material: DEFAULT_TRACK_MATERIAL,
};

/**
 * Default handle configuration.
 */
export const DEFAULT_HANDLE: SliderHandle = {
  shape: 'rounded',
  width: 100,
  height: 80,
  cornerRadius: 3,
  gripLines: 3,
  material: DEFAULT_HANDLE_MATERIAL,
};

/**
 * Default value fill configuration.
 */
export const DEFAULT_VALUE_FILL: SliderValueFill = {
  mode: 'none',
  color: '#00FF00FF',
  glowIntensity: 0,
};

/**
 * Default output configuration for sliders.
 */
export const DEFAULT_SLIDER_OUTPUT: LinearOutputConfig = {
  frameCount: 64,
  frameWidth: 50,
  frameHeight: 200,
  layout: 'vertical',
};
