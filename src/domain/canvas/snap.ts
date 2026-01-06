import type { Point, Size } from '../../types/canvas';
import type { SnapEdgesResult, SnapPointResult, SnapResult } from '../../types/snap';

export interface ViewBounds {
  origin: Point;
  size: Size;
}

export function getEffectiveThreshold(threshold: number, gridSize: number): number {
  return Math.min(threshold, gridSize / 2);
}

export function snapToGrid(value: number, gridSize: number, threshold: number): SnapResult {
  const effectiveThreshold = getEffectiveThreshold(threshold, gridSize);
  const nearestGridLine = Math.round(value / gridSize) * gridSize;
  const distance = Math.abs(value - nearestGridLine);

  if (distance <= effectiveThreshold) {
    return {
      snapped: true,
      value: nearestGridLine,
      snapDelta: nearestGridLine - value,
      gridLine: nearestGridLine,
    };
  }

  return {
    snapped: false,
    value,
    snapDelta: 0,
    gridLine: null,
  };
}

export function snapPoint(point: Point, gridSize: number, threshold: number): SnapPointResult {
  const x = snapToGrid(point.x, gridSize, threshold);
  const y = snapToGrid(point.y, gridSize, threshold);

  return {
    x,
    y,
    point: { x: x.value, y: y.value },
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

export function snapEdges(
  bounds: ViewBounds,
  handle: string,
  gridSize: number,
  threshold: number
): SnapEdgesResult {
  const affected = getAffectedEdges(handle as HandlePosition);

  const leftEdge = bounds.origin.x;
  const rightEdge = bounds.origin.x + bounds.size.width;
  const topEdge = bounds.origin.y;
  const bottomEdge = bounds.origin.y + bounds.size.height;

  return {
    left: affected.left ? snapToGrid(leftEdge, gridSize, threshold) : null,
    right: affected.right ? snapToGrid(rightEdge, gridSize, threshold) : null,
    top: affected.top ? snapToGrid(topEdge, gridSize, threshold) : null,
    bottom: affected.bottom ? snapToGrid(bottomEdge, gridSize, threshold) : null,
  };
}

export interface ApplySnapToMoveResult {
  snappedOrigins: Record<string, Point>;
  snapDelta: Point;
  didSnap: boolean;
}

export function applySnapToMove(
  origins: Record<string, Point>,
  anchorId: string,
  gridSize: number,
  threshold: number
): ApplySnapToMoveResult {
  const anchor = origins[anchorId];

  if (!anchor) {
    return {
      snappedOrigins: { ...origins },
      snapDelta: { x: 0, y: 0 },
      didSnap: false,
    };
  }

  const snapResult = snapPoint(anchor, gridSize, threshold);
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
  };
}
