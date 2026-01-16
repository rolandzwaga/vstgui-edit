import { createSignal } from 'solid-js';
import { calculateResizeBounds, clampToMinimumSize } from '../domain/canvas/resize';
import type { Point, Size } from '../types/canvas';
import type { HandlePosition } from '../types/selection';

const [isResizing, setIsResizing] = createSignal(false);
const [activeHandle, setActiveHandle] = createSignal<HandlePosition | null>(null);
const [viewId, setViewId] = createSignal<string | null>(null);
const [startPoint, setStartPoint] = createSignal<Point | null>(null);
const [currentPoint, setCurrentPoint] = createSignal<Point | null>(null);
const [originalOrigin, setOriginalOrigin] = createSignal<Point | null>(null);
const [originalSize, setOriginalSize] = createSignal<Size | null>(null);
const [newOrigin, setNewOrigin] = createSignal<Point>({ x: 0, y: 0 });
const [newSize, setNewSize] = createSignal<Size>({ width: 0, height: 0 });
// Parent offset for calculating absolute position during resize preview
const [parentOffset, setParentOffset] = createSignal<Point>({ x: 0, y: 0 });

export const resizeStore = {
  get isResizing() {
    return isResizing();
  },
  get activeHandle() {
    return activeHandle();
  },
  get viewId() {
    return viewId();
  },
  get startPoint() {
    return startPoint();
  },
  get currentPoint() {
    return currentPoint();
  },
  get originalOrigin() {
    return originalOrigin();
  },
  get originalSize() {
    return originalSize();
  },
  get newOrigin() {
    return newOrigin();
  },
  get newSize() {
    return newSize();
  },
  get parentOffset() {
    return parentOffset();
  },
};

export function startResize(
  handle: HandlePosition,
  targetViewId: string,
  point: Point,
  origin: Point,
  size: Size,
  parentOffsetValue: Point = { x: 0, y: 0 }
): void {
  setIsResizing(true);
  setActiveHandle(handle);
  setViewId(targetViewId);
  setStartPoint(point);
  setCurrentPoint(point);
  setOriginalOrigin(origin);
  setOriginalSize(size);
  setNewOrigin({ ...origin });
  setNewSize({ ...size });
  setParentOffset(parentOffsetValue);
}

export function updateResize(point: Point, shiftHeld: boolean, altHeld: boolean): void {
  if (!isResizing()) {
    return;
  }

  setCurrentPoint(point);

  const handle = activeHandle();
  const origin = originalOrigin();
  const size = originalSize();
  const start = startPoint();

  if (!handle || !origin || !size || !start) {
    return;
  }

  const delta = {
    x: point.x - start.x,
    y: point.y - start.y,
  };

  const rawBounds = calculateResizeBounds(handle, origin, size, delta, {
    maintainAspectRatio: shiftHeld,
    resizeFromCenter: altHeld,
  });

  const bounds = clampToMinimumSize(rawBounds, handle);

  setNewOrigin(bounds.origin);
  setNewSize(bounds.size);
}

export function endResize(): void {
  setIsResizing(false);
}

export function cancelResize(): void {
  resetResize();
}

export function updateResizePreview(origin: Point, size: Size): void {
  setNewOrigin(origin);
  setNewSize(size);
}

export function resetResize(): void {
  setIsResizing(false);
  setActiveHandle(null);
  setViewId(null);
  setStartPoint(null);
  setCurrentPoint(null);
  setOriginalOrigin(null);
  setOriginalSize(null);
  setNewOrigin({ x: 0, y: 0 });
  setNewSize({ width: 0, height: 0 });
  setParentOffset({ x: 0, y: 0 });
}
