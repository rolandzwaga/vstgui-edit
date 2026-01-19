/**
 * Knob Control Designer Types
 *
 * TypeScript interfaces for the knob control type.
 * Extends the base control designer types with knob-specific configuration.
 */

import type { BaseControlDesign, LayerMaterial, RotationalOutputConfig } from './base';

// ============================================================================
// Geometry Types
// ============================================================================

/**
 * Skirt style options for layer edges.
 */
export type SkirtStyle = 'cylindrical' | 'tapered' | 'angled';

/**
 * Geometry configuration for a knob layer.
 */
export interface LayerGeometry {
  /** Diameter as percentage of knob size (10-100) */
  diameter: number;

  /** Height as percentage of total knob height (10-100) */
  height: number;

  /** Bevel radius in pixels (0-20) */
  bevelRadius: number;

  /** Skirt style for the layer edge */
  skirtStyle: SkirtStyle;
}

// ============================================================================
// Layer Types
// ============================================================================

/**
 * A single concentric layer of the knob.
 * Layers stack from bottom (index 0) to top.
 */
export interface KnobLayer {
  /** Unique identifier */
  id: string;

  /** Display name for UI */
  name: string;

  /** Layer geometry configuration */
  geometry: LayerGeometry;

  /** Layer material configuration */
  material: LayerMaterial;
}

// ============================================================================
// Indicator Types
// ============================================================================

/**
 * Indicator shape types.
 */
export type IndicatorType = 'dot' | 'line' | 'notch' | 'groove';

/**
 * Indicator material configuration.
 */
export interface IndicatorMaterial {
  /** Indicator color in hex format */
  color: string;

  /** Whether indicator is metallic */
  metallic: boolean;
}

/**
 * Indicator size parameters.
 * Only relevant fields apply based on type.
 */
export interface IndicatorSize {
  /** Radius for dot type (pixels) */
  radius: number;

  /** Length for line type (pixels) */
  length: number;

  /** Width for line type (pixels) */
  width: number;

  /** Height/thickness for dot and line types (pixels) */
  height: number;

  /** Depth for notch/groove types (pixels) */
  depth: number;
}

/**
 * Indicator (dial marker) configuration.
 */
export interface KnobIndicator {
  /** Whether indicator is enabled */
  enabled: boolean;

  /** Indicator shape type */
  type: IndicatorType;

  /** Indicator material/appearance */
  material: IndicatorMaterial;

  /** Size parameters based on type */
  size: IndicatorSize;

  /** Radial position from center (percentage, 10-90) */
  radialPosition: number;
}

// ============================================================================
// Knob Design Type
// ============================================================================

/**
 * Complete knob design configuration.
 * Represents the full state of a knob being designed.
 */
export interface KnobDesign extends BaseControlDesign {
  /** Control type discriminator */
  controlType: 'knob';

  /** Concentric layers (1-3, bottom to top) */
  layers: KnobLayer[];

  /** Optional indicator configuration */
  indicator: KnobIndicator | null;

  /** Knob-specific output with rotation settings */
  output: RotationalOutputConfig;
}
