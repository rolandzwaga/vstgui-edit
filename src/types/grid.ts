/**
 * Grid Type Definitions
 *
 * Types for the canvas grid overlay system.
 */

/**
 * Grid visual style options.
 */
export type GridStyle = 'lines' | 'dots' | 'crosshairs';

/**
 * Valid grid size presets in pixels.
 */
export type GridSizePreset = 5 | 8 | 10 | 12 | 16 | 20;

/**
 * Grid settings state.
 */
export interface GridSettings {
  /** Whether grid is visible (default: true) */
  isVisible: boolean;
  /** Grid spacing in pixels (default: 10) */
  size: GridSizePreset;
  /** Visual style of grid (default: 'lines') */
  style: GridStyle;
}

/**
 * Props for Grid component.
 */
export interface GridProps {
  /** Template bounds width */
  width: number;
  /** Template bounds height */
  height: number;
}
