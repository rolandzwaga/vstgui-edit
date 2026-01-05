/**
 * Grid Calculation Utilities
 *
 * Renderer-agnostic utilities for grid calculations.
 */

import { GRID_SIZE_PRESETS, MAJOR_LINE_INTERVAL } from '../../stores/gridStore';
import type { GridSizePreset, GridStyle } from '../../types/grid';

/**
 * Check if a line index is a major line (every 5th line).
 * Major lines are rendered more prominently for visual hierarchy.
 */
export function isMajorLine(index: number): boolean {
  return index % MAJOR_LINE_INTERVAL === 0;
}

/**
 * Calculate the number of grid lines needed for a dimension.
 * Returns the count of lines that fit within the dimension at the given grid size.
 */
export function calculateLineCount(dimension: number, gridSize: number): number {
  if (dimension <= 0) return 0;
  return Math.floor(dimension / gridSize) + 1;
}

/**
 * Generate SVG pattern ID based on style and size.
 * This ensures unique pattern IDs for different grid configurations.
 */
export function getPatternId(style: GridStyle, size: number): string {
  return `grid-pattern-${style}-${size}`;
}

/**
 * Validate grid size is a valid preset.
 * Type guard that narrows number to GridSizePreset.
 */
export function isValidGridSize(size: number): size is GridSizePreset {
  return GRID_SIZE_PRESETS.includes(size as GridSizePreset);
}
