import { createSignal } from 'solid-js';
import { constrainDelta, determineConstraintAxis } from '../domain/canvas/constrainAxis';
import { calculateDelta } from '../domain/canvas/move';
import type { Point } from '../types/canvas';
import type { ConstraintAxis } from '../types/history';

const [isDragging, setIsDragging] = createSignal(false);
const [startPoint, setStartPoint] = createSignal<Point | null>(null);
const [currentPoint, setCurrentPoint] = createSignal<Point | null>(null);
const [originalOrigins, setOriginalOrigins] = createSignal<Record<string, Point>>({});
const [constrainedAxis, setConstrainedAxis] = createSignal<ConstraintAxis>(null);

function computeDelta(): Point {
  const start = startPoint();
  const current = currentPoint();

  if (!start || !current) {
    return { x: 0, y: 0 };
  }

  const rawDelta = calculateDelta(start, current);
  return constrainDelta(rawDelta, constrainedAxis());
}

export const dragStore = {
  get isDragging() {
    return isDragging();
  },
  get startPoint() {
    return startPoint();
  },
  get currentPoint() {
    return currentPoint();
  },
  get originalOrigins() {
    return originalOrigins();
  },
  get constrainedAxis() {
    return constrainedAxis();
  },
  get delta() {
    return computeDelta();
  },
};

export function startDrag(point: Point, origins: Record<string, Point>): void {
  setIsDragging(true);
  setStartPoint(point);
  setCurrentPoint(point);
  setOriginalOrigins({ ...origins });
  setConstrainedAxis(null);
}

export function updateDrag(point: Point, shiftHeld: boolean): void {
  if (!isDragging()) {
    return;
  }

  setCurrentPoint(point);

  if (shiftHeld) {
    if (constrainedAxis() === null) {
      const start = startPoint();
      if (start) {
        const delta = calculateDelta(start, point);
        const axis = determineConstraintAxis(delta);
        if (axis) {
          setConstrainedAxis(axis);
        }
      }
    }
  } else {
    setConstrainedAxis(null);
  }
}

export function endDrag(): void {
  setIsDragging(false);
}

export function cancelDrag(): void {
  resetDrag();
}

export function resetDrag(): void {
  setIsDragging(false);
  setStartPoint(null);
  setCurrentPoint(null);
  setOriginalOrigins({});
  setConstrainedAxis(null);
}
