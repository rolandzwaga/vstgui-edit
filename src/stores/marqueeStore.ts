import { createSignal } from 'solid-js';
import type { CanvasPoint } from '../types/selection';

const [isActive, setIsActive] = createSignal(false);
const [isPending, setIsPending] = createSignal(false);
const [startPoint, setStartPoint] = createSignal<CanvasPoint | null>(null);
const [currentPoint, setCurrentPoint] = createSignal<CanvasPoint | null>(null);
const [isAdditive, setIsAdditive] = createSignal(false);
const [previousSelection, setPreviousSelection] = createSignal<Set<string>>(new Set());
const [clickTarget, setClickTarget] = createSignal<string | null>(null);

export const marqueeStore = {
  get isActive() {
    return isActive();
  },
  get isPending() {
    return isPending();
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
  get clickTarget() {
    return clickTarget();
  },
};

export function beginTracking(
  point: CanvasPoint,
  additive: boolean,
  currentSelection: Set<string>,
  targetViewId: string | null
): void {
  setStartPoint(point);
  setCurrentPoint(point);
  setIsAdditive(additive);
  setPreviousSelection(new Set(currentSelection));
  setClickTarget(targetViewId);
  setIsPending(true);
  setIsActive(false);
}

export function activateMarquee(): void {
  if (isPending()) {
    setIsPending(false);
    setIsActive(true);
  }
}

export function updateMarquee(point: CanvasPoint): void {
  setCurrentPoint(point);
}

export function completeMarquee(): void {
  resetMarquee();
}

export function cancelMarquee(): void {
  resetMarquee();
}

export function resetMarquee(): void {
  setIsActive(false);
  setIsPending(false);
  setStartPoint(null);
  setCurrentPoint(null);
  setIsAdditive(false);
  setPreviousSelection(new Set());
  setClickTarget(null);
}
