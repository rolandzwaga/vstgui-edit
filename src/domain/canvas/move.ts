import type { Point } from '../../types/canvas';
import type { HistoryOperation, MoveOperationData } from '../../types/history';

export function calculateDelta(start: Point, current: Point): Point {
  return {
    x: current.x - start.x,
    y: current.y - start.y,
  };
}

export function applyDelta(origin: Point, delta: Point): Point {
  return {
    x: origin.x + delta.x,
    y: origin.y + delta.y,
  };
}

export function applyDeltaToAll(
  origins: Record<string, Point>,
  delta: Point
): Record<string, Point> {
  const result: Record<string, Point> = {};
  for (const [id, origin] of Object.entries(origins)) {
    result[id] = applyDelta(origin, delta);
  }
  return result;
}

export function formatOrigin(point: Point): string {
  return `${point.x}, ${point.y}`;
}

export function createMoveOperation(
  data: MoveOperationData,
  updateViewOrigin: (viewId: string, origin: Point) => void
): HistoryOperation {
  const viewCount = data.viewIds.length;
  const description = viewCount === 1 ? 'Move view' : `Move ${viewCount} views`;

  return {
    type: 'move',
    description,
    timestamp: Date.now(),
    undo: () => {
      for (const viewId of data.viewIds) {
        const original = data.originalOrigins[viewId];
        if (original) {
          updateViewOrigin(viewId, original);
        }
      }
    },
    redo: () => {
      for (const viewId of data.viewIds) {
        const newOrigin = data.newOrigins[viewId];
        if (newOrigin) {
          updateViewOrigin(viewId, newOrigin);
        }
      }
    },
  };
}
