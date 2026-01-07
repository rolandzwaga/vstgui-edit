import type { Point, Size } from '../../types/canvas';
import type { SnapEdgesResult, SnapPointResult, SnapResult } from '../../types/snap';

export interface ViewBounds {
  origin: Point;
  size: Size;
}

export function getEffectiveThreshold(threshold: number, gridSize: number): number {
  return Math.min(threshold, gridSize / 2);
}

export function snapToGrid(value: number, gridSize: number, _threshold: number): SnapResult {
  const nearestGridLine = Math.round(value / gridSize) * gridSize;
  const snapDelta = nearestGridLine - value;

  return {
    snapped: true,
    value: nearestGridLine,
    snapDelta,
    gridLine: nearestGridLine,
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

const MIN_VIEW_SIZE = 10;

export interface ApplySnapToResizeResult {
  origin: Point;
  size: Size;
  didSnap: boolean;
}

export function applySnapToResize(
  origin: Point,
  size: Size,
  handle: string,
  gridSize: number,
  threshold: number
): ApplySnapToResizeResult {
  const bounds: ViewBounds = { origin, size };
  const edgeSnap = snapEdges(bounds, handle, gridSize, threshold);

  let newX = origin.x;
  let newY = origin.y;
  let newWidth = size.width;
  let newHeight = size.height;

  let didSnap = false;

  if (edgeSnap.left?.snapped) {
    const delta = edgeSnap.left.snapDelta;
    newX += delta;
    newWidth -= delta;
    didSnap = true;
  }

  if (edgeSnap.right?.snapped) {
    const rightEdge = origin.x + size.width;
    const snappedRight = edgeSnap.right.value;
    newWidth = snappedRight - newX;
    didSnap = true;
  }

  if (edgeSnap.top?.snapped) {
    const delta = edgeSnap.top.snapDelta;
    newY += delta;
    newHeight -= delta;
    didSnap = true;
  }

  if (edgeSnap.bottom?.snapped) {
    const bottomEdge = origin.y + size.height;
    const snappedBottom = edgeSnap.bottom.value;
    newHeight = snappedBottom - newY;
    didSnap = true;
  }

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
  };
}
