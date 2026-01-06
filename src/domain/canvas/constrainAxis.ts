import type { Point } from '../../types/canvas';
import type { ConstraintAxis } from '../../types/history';

export const AXIS_LOCK_THRESHOLD = 5;

export function determineConstraintAxis(delta: Point): ConstraintAxis {
  const absX = Math.abs(delta.x);
  const absY = Math.abs(delta.y);

  const maxMovement = Math.max(absX, absY);
  if (maxMovement < AXIS_LOCK_THRESHOLD) {
    return null;
  }

  return absX >= absY ? 'horizontal' : 'vertical';
}

export function constrainDelta(delta: Point, axis: ConstraintAxis): Point {
  if (axis === null) {
    return delta;
  }

  if (axis === 'horizontal') {
    return { x: delta.x, y: 0 };
  }

  return { x: 0, y: delta.y };
}
