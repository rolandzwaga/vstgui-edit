import type { Point } from '../../types/canvas';

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
