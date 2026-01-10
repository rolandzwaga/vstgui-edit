/**
 * guideSnap API Contract
 *
 * This file defines the public API for guide snapping functions.
 * Implementation must match these signatures.
 *
 * Note: SnapResult uses `snapped` (not `didSnap`) to match existing snap.ts types.
 * The `snappedTo` and `guideId` fields are used to distinguish guide snaps from grid snaps.
 */

import type { Point, Size } from '../../../src/types/canvas';
import type { SnapResult, SnapEdgesResult } from '../../../src/types/snap';
import type { CustomGuide, GuideOrientation } from '../../../src/types/guides';

// ============================================================================
// Single Value Snap
// ============================================================================

/**
 * Snap a single coordinate value to the nearest guide.
 *
 * @param value - The coordinate value to snap
 * @param guides - List of custom guides to consider
 * @param orientation - Which guides to consider ('horizontal' snaps to horizontal guides for Y values)
 * @param threshold - Snap distance threshold in pixels
 * @returns SnapResult with snapped value and metadata
 */
export function snapToGuide(
  value: number,
  guides: CustomGuide[],
  orientation: GuideOrientation,
  threshold: number
): SnapResult;

/**
 * Snap a single coordinate value to the nearest reference (grid or guide).
 * Returns whichever is closer when both are within threshold.
 *
 * @param value - The coordinate value to snap
 * @param gridSize - Grid cell size in pixels
 * @param guides - List of custom guides to consider
 * @param orientation - Which guides to consider
 * @param threshold - Snap distance threshold in pixels
 * @param gridEnabled - Whether grid snapping is enabled
 * @param guidesEnabled - Whether guide snapping is enabled (includes visibility check)
 * @returns SnapResult with snapped value and metadata
 */
export function snapToNearest(
  value: number,
  gridSize: number,
  guides: CustomGuide[],
  orientation: GuideOrientation,
  threshold: number,
  gridEnabled: boolean,
  guidesEnabled: boolean
): SnapResult;

// ============================================================================
// Point Snap (for move operations)
// ============================================================================

/**
 * Extended snap point result including guide information.
 */
export interface SnapPointWithGuidesResult {
  /** Snap result for X coordinate */
  x: SnapResult;
  /** Snap result for Y coordinate */
  y: SnapResult;
  /** Final position after snap */
  point: Point;
  /** IDs of guides that were snapped to (empty if grid snap) */
  snappedGuideIds: string[];
}

/**
 * Snap a point to nearest references (grid and/or guides).
 *
 * @param point - The point to snap
 * @param gridSize - Grid cell size in pixels
 * @param guides - List of custom guides
 * @param threshold - Snap distance threshold
 * @param gridEnabled - Whether grid snapping is enabled
 * @param guidesEnabled - Whether guide snapping is enabled
 * @returns Extended snap result with guide IDs
 */
export function snapPointWithGuides(
  point: Point,
  gridSize: number,
  guides: CustomGuide[],
  threshold: number,
  gridEnabled: boolean,
  guidesEnabled: boolean
): SnapPointWithGuidesResult;

// ============================================================================
// Edge Snap (for resize operations)
// ============================================================================

/**
 * Snap view edges to nearest references during resize.
 * Only active edges (based on resize handle) are snapped.
 *
 * @param origin - View origin point
 * @param size - View size
 * @param handle - Active resize handle ('n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se')
 * @param gridSize - Grid cell size in pixels
 * @param guides - List of custom guides
 * @param threshold - Snap distance threshold
 * @param gridEnabled - Whether grid snapping is enabled
 * @param guidesEnabled - Whether guide snapping is enabled
 * @returns Edge snap results for each edge
 */
export function snapEdgesWithGuides(
  origin: Point,
  size: Size,
  handle: string,
  gridSize: number,
  guides: CustomGuide[],
  threshold: number,
  gridEnabled: boolean,
  guidesEnabled: boolean
): SnapEdgesResult;

// ============================================================================
// Move Operation Integration
// ============================================================================

/**
 * Result of applying snap to a move operation.
 */
export interface ApplySnapToMoveWithGuidesResult {
  snappedOrigins: Record<string, Point>;
  snapDelta: Point;
  didSnap: boolean;
  snappedGuideIds: string[];
}

/**
 * Apply snap to a multi-view move operation.
 * Snaps the anchor view and applies the same delta to all views.
 *
 * @param origins - Current origins of all selected views (keyed by view ID)
 * @param anchorId - ID of the view to use as snap anchor
 * @param gridSize - Grid cell size
 * @param guides - List of custom guides
 * @param threshold - Snap threshold
 * @param gridEnabled - Whether grid snapping is enabled
 * @param guidesEnabled - Whether guide snapping is enabled
 * @returns Snapped origins and metadata
 */
export function applySnapToMoveWithGuides(
  origins: Record<string, Point>,
  anchorId: string,
  gridSize: number,
  guides: CustomGuide[],
  threshold: number,
  gridEnabled: boolean,
  guidesEnabled: boolean
): ApplySnapToMoveWithGuidesResult;

// ============================================================================
// Resize Operation Integration
// ============================================================================

/**
 * Result of applying snap to a resize operation.
 */
export interface ApplySnapToResizeWithGuidesResult {
  origin: Point;
  size: Size;
  didSnap: boolean;
  snappedGuideIds: string[];
}

/**
 * Apply snap to a resize operation.
 *
 * @param origin - Current view origin
 * @param size - Current view size
 * @param handle - Active resize handle
 * @param gridSize - Grid cell size
 * @param guides - List of custom guides
 * @param threshold - Snap threshold
 * @param gridEnabled - Whether grid snapping is enabled
 * @param guidesEnabled - Whether guide snapping is enabled
 * @returns Snapped origin, size, and metadata
 */
export function applySnapToResizeWithGuides(
  origin: Point,
  size: Size,
  handle: string,
  gridSize: number,
  guides: CustomGuide[],
  threshold: number,
  gridEnabled: boolean,
  guidesEnabled: boolean
): ApplySnapToResizeWithGuidesResult;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Filter guides by orientation.
 */
export function filterGuidesByOrientation(
  guides: CustomGuide[],
  orientation: GuideOrientation
): CustomGuide[];

/**
 * Find the closest guide to a given position.
 * Returns null if no guide is within threshold.
 */
export function findClosestGuide(
  position: number,
  guides: CustomGuide[],
  orientation: GuideOrientation,
  threshold: number
): CustomGuide | null;
