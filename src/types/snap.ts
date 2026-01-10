/**
 * Snap Types
 * Types for grid and guide snapping during move and resize operations
 */

import type { Point } from './canvas';

/**
 * Default snap threshold in pixels.
 * Views within this distance of a grid line or guide will snap to it.
 */
export const DEFAULT_SNAP_THRESHOLD = 5;

/**
 * Source of a snap operation result.
 */
export type SnapSource = 'grid' | 'guide' | 'none';

/**
 * Result of snapping a single coordinate to a grid line or guide.
 */
export interface SnapResult {
  /** Whether the coordinate was snapped to a grid line or guide */
  snapped: boolean;
  /** The resulting coordinate (snapped or original) */
  value: number;
  /** Amount the coordinate was adjusted (0 if not snapped) */
  snapDelta: number;
  /** The grid line coordinate snapped to (null if not snapped to grid) */
  gridLine: number | null;
  /** What the value snapped to ('grid', 'guide', or 'none') */
  snappedTo?: SnapSource;
  /** ID of the guide that was snapped to (if snappedTo === 'guide') */
  guideId?: string;
}

/**
 * Result of snapping a 2D point to the grid.
 * X and Y are snapped independently.
 */
export interface SnapPointResult {
  /** Snap result for the X coordinate */
  x: SnapResult;
  /** Snap result for the Y coordinate */
  y: SnapResult;
  /** Final position after snap */
  point: Point;
}

/**
 * Result of snapping view edges during resize.
 * Only edges being actively dragged are snapped.
 */
export interface SnapEdgesResult {
  /** Snap result for left edge (null if not dragging left) */
  left: SnapResult | null;
  /** Snap result for right edge (null if not dragging right) */
  right: SnapResult | null;
  /** Snap result for top edge (null if not dragging top) */
  top: SnapResult | null;
  /** Snap result for bottom edge (null if not dragging bottom) */
  bottom: SnapResult | null;
}

/**
 * Transient state for rendering snap visual feedback.
 * Contains coordinates where snap lines should be displayed.
 */
export interface SnapIndicatorState {
  /** Y coordinates of horizontal snap lines to show */
  horizontalLines: number[];
  /** X coordinates of vertical snap lines to show */
  verticalLines: number[];
}
