import { createSignal } from 'solid-js';
import type { CanvasPoint } from '../types/selection';

const [isActive, setIsActive] = createSignal(false);
const [startPoint, setStartPoint] = createSignal<CanvasPoint | null>(null);
const [currentPoint, setCurrentPoint] = createSignal<CanvasPoint | null>(null);
const [isAdditive, setIsAdditive] = createSignal(false);
const [previousSelection, setPreviousSelection] = createSignal<Set<string>>(new Set());

export const marqueeStore = {
  get isActive() {
    return isActive();
  },
  get startPoint() {
    return startPoint();
  },
  get currentPoint() {
    return currentPoint();
  },
  get isAdditive() {
    return isAdditive();
  },
  get previousSelection() {
    return previousSelection();
  },
};

export function startMarquee(
  point: CanvasPoint,
  additive: boolean,
  currentSelection: Set<string>
): void {
  setStartPoint(point);
  setCurrentPoint(point);
  setIsAdditive(additive);
  setPreviousSelection(new Set(currentSelection));
  setIsActive(true);
}

export function updateMarquee(point: CanvasPoint): void {
  if (isActive()) {
    setCurrentPoint(point);
  }
}

export function completeMarquee(): void {
  resetMarquee();
}

export function cancelMarquee(): void {
  resetMarquee();
}

export function resetMarquee(): void {
  setIsActive(false);
  setStartPoint(null);
  setCurrentPoint(null);
  setIsAdditive(false);
  setPreviousSelection(new Set());
}
