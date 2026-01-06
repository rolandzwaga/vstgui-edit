import { createSignal } from 'solid-js';
import type { Point, Size } from '../types/canvas';
import { MIN_VIEW_SIZE } from '../types/resize';
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

function calculateNewBoundsInternal(
  handle: HandlePosition,
  origin: Point,
  size: Size,
  delta: Point
): { origin: Point; size: Size } {
  let x = origin.x;
  let y = origin.y;
  let width = size.width;
  let height = size.height;

  switch (handle) {
    case 'nw':
      x += delta.x;
      y += delta.y;
      width -= delta.x;
      height -= delta.y;
      break;
    case 'n':
      y += delta.y;
      height -= delta.y;
      break;
    case 'ne':
      y += delta.y;
      width += delta.x;
      height -= delta.y;
      break;
    case 'e':
      width += delta.x;
      break;
    case 'se':
      width += delta.x;
      height += delta.y;
      break;
    case 's':
      height += delta.y;
      break;
    case 'sw':
      x += delta.x;
      width -= delta.x;
      height += delta.y;
      break;
    case 'w':
      x += delta.x;
      width -= delta.x;
      break;
  }

  if (width < MIN_VIEW_SIZE) {
    if (handle === 'nw' || handle === 'w' || handle === 'sw') {
      x = origin.x + size.width - MIN_VIEW_SIZE;
    }
    width = MIN_VIEW_SIZE;
  }

  if (height < MIN_VIEW_SIZE) {
    if (handle === 'nw' || handle === 'n' || handle === 'ne') {
      y = origin.y + size.height - MIN_VIEW_SIZE;
    }
    height = MIN_VIEW_SIZE;
  }

  return {
    origin: { x, y },
    size: { width, height },
  };
}

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
};

export function startResize(
  handle: HandlePosition,
  targetViewId: string,
  point: Point,
  origin: Point,
  size: Size
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
}

export function updateResize(point: Point, _shiftHeld: boolean, _altHeld: boolean): void {
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

  const bounds = calculateNewBoundsInternal(handle, origin, size, delta);

  setNewOrigin(bounds.origin);
  setNewSize(bounds.size);
}

export function endResize(): void {
  setIsResizing(false);
}

export function cancelResize(): void {
  resetResize();
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
}
