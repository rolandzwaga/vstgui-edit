/**
 * Guide Snap Functions
 * Snap calculations for custom guides during move and resize operations
 */

import type { Point, Size } from '../../types/canvas';
import type { CustomGuide, GuideOrientation } from '../../types/guides';
import type { SnapEdgesResult, SnapResult } from '../../types/snap';

/**
 * Minimum view size constraint.
 */
const MIN_VIEW_SIZE = 10;

/**
 * Filter guides by orientation.
 */
export function filterGuidesByOrientation(
  guides: CustomGuide[],
  orientation: GuideOrientation
): CustomGuide[] {
  return guides.filter(g => g.orientation === orientation);
}

/**
 * Find the closest guide to a given position.
 * Returns null if no guide is within threshold.
 */
export function findClosestGuide(
  position: number,
  guides: CustomGuide[],
  orientation: GuideOrientation,
  threshold: number
): CustomGuide | null {
  const filtered = filterGuidesByOrientation(guides, orientation);

  let closest: CustomGuide | null = null;
  let minDistance = Infinity;

  for (const guide of filtered) {
    const distance = Math.abs(guide.position - position);
    if (distance <= threshold && distance < minDistance) {
      minDistance = distance;
      closest = guide;
    }
  }

  return closest;
}

/**
 * Snap a single coordinate value to the nearest guide.
 */
export function snapToGuide(
  value: number,
  guides: CustomGuide[],
  orientation: GuideOrientation,
  threshold: number
): SnapResult {
  const guide = findClosestGuide(value, guides, orientation, threshold);

  if (guide) {
    const snapDelta = guide.position - value;
    return {
      snapped: true,
      value: guide.position,
      snapDelta,
      gridLine: null,
      snappedTo: 'guide',
      guideId: guide.id,
    };
  }

  return {
    snapped: false,
    value,
    snapDelta: 0,
    gridLine: null,
    snappedTo: 'none',
  };
}

/**
 * Snap a single coordinate value to the nearest grid line.
 */
function snapToGrid(value: number, gridSize: number): SnapResult {
  const nearestGridLine = Math.round(value / gridSize) * gridSize;
  const snapDelta = nearestGridLine - value;

  return {
    snapped: true,
    value: nearestGridLine,
    snapDelta,
    gridLine: nearestGridLine,
    snappedTo: 'grid',
  };
}

/**
 * Snap a single coordinate value to the nearest reference (grid or guide).
 * Returns whichever is closer when both are within threshold.
 * Guide takes precedence when at equal distance.
 */
export function snapToNearest(
  value: number,
  gridSize: number,
  guides: CustomGuide[],
  orientation: GuideOrientation,
  threshold: number,
  gridEnabled: boolean,
  guidesEnabled: boolean
): SnapResult {
  const guideResult = guidesEnabled ? snapToGuide(value, guides, orientation, threshold) : null;
  const gridResult = gridEnabled ? snapToGrid(value, gridSize) : null;

  // If only guide is enabled and snapped
  if (guideResult?.snapped && !gridEnabled) {
    return guideResult;
  }

  // If only grid is enabled
  if (gridResult?.snapped && !guidesEnabled) {
    return gridResult;
  }

  // If both disabled
  if (!gridEnabled && !guidesEnabled) {
    return {
      snapped: false,
      value,
      snapDelta: 0,
      gridLine: null,
      snappedTo: 'none',
    };
  }

  // Both enabled - compare distances
  if (guideResult?.snapped && gridResult?.snapped) {
    const guideDistance = Math.abs(guideResult.snapDelta);
    const gridDistance = Math.abs(gridResult.snapDelta);

    // Guide takes precedence when equal or closer
    if (guideDistance <= gridDistance) {
      return guideResult;
    }
    return gridResult;
  }

  // One or the other
  if (guideResult?.snapped) {
    return guideResult;
  }
  if (gridResult?.snapped) {
    return gridResult;
  }

  return {
    snapped: false,
    value,
    snapDelta: 0,
    gridLine: null,
    snappedTo: 'none',
  };
}

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
 * X snaps to vertical guides, Y snaps to horizontal guides.
 */
export function snapPointWithGuides(
  point: Point,
  gridSize: number,
  guides: CustomGuide[],
  threshold: number,
  gridEnabled: boolean,
  guidesEnabled: boolean
): SnapPointWithGuidesResult {
  // X coordinate snaps to vertical guides (they have fixed X)
  const x = snapToNearest(
    point.x,
    gridSize,
    guides,
    'vertical',
    threshold,
    gridEnabled,
    guidesEnabled
  );
  // Y coordinate snaps to horizontal guides (they have fixed Y)
  const y = snapToNearest(
    point.y,
    gridSize,
    guides,
    'horizontal',
    threshold,
    gridEnabled,
    guidesEnabled
  );

  const snappedGuideIds: string[] = [];
  if (x.snappedTo === 'guide' && x.guideId) {
    snappedGuideIds.push(x.guideId);
  }
  if (y.snappedTo === 'guide' && y.guideId) {
    snappedGuideIds.push(y.guideId);
  }

  return {
    x,
    y,
    point: { x: x.value, y: y.value },
    snappedGuideIds,
  };
}

type HandlePosition = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

function getAffectedEdges(handle: HandlePosition): {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
} {
  return {
    left: handle.includes('w'),
    right: handle.includes('e'),
    top: handle.includes('n'),
    bottom: handle.includes('s'),
  };
}

/**
 * Snap view edges to nearest references during resize.
 * Only active edges (based on resize handle) are snapped.
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
): SnapEdgesResult {
  const affected = getAffectedEdges(handle as HandlePosition);

  const leftEdge = origin.x;
  const rightEdge = origin.x + size.width;
  const topEdge = origin.y;
  const bottomEdge = origin.y + size.height;

  return {
    left: affected.left
      ? snapToNearest(leftEdge, gridSize, guides, 'vertical', threshold, gridEnabled, guidesEnabled)
      : null,
    right: affected.right
      ? snapToNearest(
          rightEdge,
          gridSize,
          guides,
          'vertical',
          threshold,
          gridEnabled,
          guidesEnabled
        )
      : null,
    top: affected.top
      ? snapToNearest(
          topEdge,
          gridSize,
          guides,
          'horizontal',
          threshold,
          gridEnabled,
          guidesEnabled
        )
      : null,
    bottom: affected.bottom
      ? snapToNearest(
          bottomEdge,
          gridSize,
          guides,
          'horizontal',
          threshold,
          gridEnabled,
          guidesEnabled
        )
      : null,
  };
}

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
 */
export function applySnapToMoveWithGuides(
  origins: Record<string, Point>,
  anchorId: string,
  gridSize: number,
  guides: CustomGuide[],
  threshold: number,
  gridEnabled: boolean,
  guidesEnabled: boolean
): ApplySnapToMoveWithGuidesResult {
  const anchor = origins[anchorId];

  if (!anchor) {
    return {
      snappedOrigins: { ...origins },
      snapDelta: { x: 0, y: 0 },
      didSnap: false,
      snappedGuideIds: [],
    };
  }

  const snapResult = snapPointWithGuides(
    anchor,
    gridSize,
    guides,
    threshold,
    gridEnabled,
    guidesEnabled
  );

  const snapDelta: Point = {
    x: snapResult.x.snapped ? snapResult.x.snapDelta : 0,
    y: snapResult.y.snapped ? snapResult.y.snapDelta : 0,
  };

  const didSnap = snapResult.x.snapped || snapResult.y.snapped;

  const snappedOrigins: Record<string, Point> = {};
  for (const [id, origin] of Object.entries(origins)) {
    snappedOrigins[id] = {
      x: origin.x + snapDelta.x,
      y: origin.y + snapDelta.y,
    };
  }

  return {
    snappedOrigins,
    snapDelta,
    didSnap,
    snappedGuideIds: snapResult.snappedGuideIds,
  };
}

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
): ApplySnapToResizeWithGuidesResult {
  const edgeSnap = snapEdgesWithGuides(
    origin,
    size,
    handle,
    gridSize,
    guides,
    threshold,
    gridEnabled,
    guidesEnabled
  );

  let newX = origin.x;
  let newY = origin.y;
  let newWidth = size.width;
  let newHeight = size.height;

  let didSnap = false;
  const snappedGuideIds: string[] = [];

  if (edgeSnap.left?.snapped) {
    const delta = edgeSnap.left.snapDelta;
    newX += delta;
    newWidth -= delta;
    didSnap = true;
    if (edgeSnap.left.snappedTo === 'guide' && edgeSnap.left.guideId) {
      snappedGuideIds.push(edgeSnap.left.guideId);
    }
  }

  if (edgeSnap.right?.snapped) {
    const snappedRight = edgeSnap.right.value;
    newWidth = snappedRight - newX;
    didSnap = true;
    if (edgeSnap.right.snappedTo === 'guide' && edgeSnap.right.guideId) {
      snappedGuideIds.push(edgeSnap.right.guideId);
    }
  }

  if (edgeSnap.top?.snapped) {
    const delta = edgeSnap.top.snapDelta;
    newY += delta;
    newHeight -= delta;
    didSnap = true;
    if (edgeSnap.top.snappedTo === 'guide' && edgeSnap.top.guideId) {
      snappedGuideIds.push(edgeSnap.top.guideId);
    }
  }

  if (edgeSnap.bottom?.snapped) {
    const snappedBottom = edgeSnap.bottom.value;
    newHeight = snappedBottom - newY;
    didSnap = true;
    if (edgeSnap.bottom.snappedTo === 'guide' && edgeSnap.bottom.guideId) {
      snappedGuideIds.push(edgeSnap.bottom.guideId);
    }
  }

  // Enforce minimum size
  if (newWidth < MIN_VIEW_SIZE) {
    newWidth = MIN_VIEW_SIZE;
  }
  if (newHeight < MIN_VIEW_SIZE) {
    newHeight = MIN_VIEW_SIZE;
  }

  return {
    origin: { x: newX, y: newY },
    size: { width: newWidth, height: newHeight },
    didSnap,
    snappedGuideIds,
  };
}
