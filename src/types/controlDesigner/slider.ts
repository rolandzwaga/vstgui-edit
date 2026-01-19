/**
 * Slider Control Designer Types
 *
 * TypeScript interfaces for the slider control type.
 * Extends the base control designer types with slider-specific configuration.
 */

import type {
  BaseControlDesign,
  LayerMaterial,
  LinearOutputConfig,
} from './base';

// ============================================================================
// Slider Component Types
// ============================================================================

/**
 * Slider orientation options.
 */
export type SliderOrientation = 'horizontal' | 'vertical';

/**
 * Handle shape options.
 */
export type HandleShape = 'rectangle' | 'rounded' | 'circle' | 'faderCap';

/**
 * Value fill display mode options.
 */
export type ValueFillMode = 'none' | 'fromStart' | 'fromCenter' | 'segmented';

// ============================================================================
// Track Configuration
// ============================================================================

/**
 * Slider track configuration.
 */
export interface SliderTrack {
  /** Track orientation */
  orientation: SliderOrientation;

  /** Track length as percentage of frame dimension (10-100) */
  length: number;

  /** Track width as percentage of frame dimension (5-50) */
  width: number;

  /** Track depth in world units (1-20) */
  depth: number;

  /** Corner radius (0-10) */
  cornerRadius: number;

  /** Track material configuration */
  material: LayerMaterial;
}

// ============================================================================
// Handle Configuration
// ============================================================================

/**
 * Slider handle configuration.
 */
export interface SliderHandle {
  /** Handle shape */
  shape: HandleShape;

  /** Handle width as percentage of track width (50-150) */
  width: number;

  /** Handle height as percentage of track width (50-200) */
  height: number;

  /** Number of grip lines (0-5) */
  gripLines: number;

  /** Handle material configuration */
  material: LayerMaterial;
}

// ============================================================================
// Value Fill Configuration
// ============================================================================

/**
 * Slider value fill configuration.
 * The fill indicates the current value visually.
 */
export interface SliderValueFill {
  /** Fill display mode */
  mode: ValueFillMode;

  /** Fill color in hex format (e.g., '#00FF00FF') */
  color: string;

  /** Glow intensity (0-100) */
  glowIntensity: number;
}

// ============================================================================
// Slider Design Type
// ============================================================================

/**
 * Complete slider design configuration.
 * Represents the full state of a slider being designed.
 */
export interface SliderDesign extends BaseControlDesign {
  /** Control type discriminator */
  controlType: 'slider';

  /** Track configuration */
  track: SliderTrack;

  /** Handle configuration */
  handle: SliderHandle;

  /** Optional value fill configuration */
  valueFill: SliderValueFill;

  /** Slider-specific output (linear position-based) */
  output: LinearOutputConfig;
}
