/**
 * Alignment Types
 * Types for alignment and distribution operations
 */

import type { Point } from './canvas';

/**
 * Types of horizontal and vertical alignment operations.
 */
export type AlignmentType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

/**
 * Direction for distribution operations.
 */
export type DistributionDirection = 'horizontal' | 'vertical';

/**
 * Bounding box for a single view in absolute canvas coordinates.
 */
export interface ViewBounds {
  /** View ID */
  id: string;
  /** Left edge X coordinate (absolute) */
  left: number;
  /** Right edge X coordinate (absolute) */
  right: number;
  /** Top edge Y coordinate (absolute) */
  top: number;
  /** Bottom edge Y coordinate (absolute) */
  bottom: number;
  /** Horizontal center X coordinate */
  centerX: number;
  /** Vertical center Y coordinate */
  centerY: number;
  /** View width */
  width: number;
  /** View height */
  height: number;
}

/**
 * Bounding box encompassing all selected views.
 */
export interface SelectionBounds {
  /** Leftmost edge of selection */
  left: number;
  /** Rightmost edge of selection */
  right: number;
  /** Topmost edge of selection */
  top: number;
  /** Bottommost edge of selection */
  bottom: number;
  /** Horizontal center of selection */
  centerX: number;
  /** Vertical center of selection */
  centerY: number;
  /** Total width of selection */
  width: number;
  /** Total height of selection */
  height: number;
}

/**
 * Result of an alignment operation for a single view.
 */
export interface AlignmentResult {
  /** View that was moved */
  viewId: string;
  /** Original position (relative to parent) */
  originalOrigin: Point;
  /** New position (relative to parent) */
  newOrigin: Point;
}

/**
 * Configuration for alignment toolbar state persistence.
 */
export interface AlignmentToolbarState {
  /** Whether the toolbar is docked in the main toolbar */
  isDocked: boolean;
  /** Position when floating (null when docked) */
  floatingPosition: Point | null;
}
