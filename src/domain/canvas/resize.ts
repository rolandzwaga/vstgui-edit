import type { Point, Size } from '../../types/canvas';
import type { HistoryOperation } from '../../types/history';
import type { ResizeBounds, ResizeOperationData, ResizeOptions } from '../../types/resize';
import { MIN_VIEW_SIZE } from '../../types/resize';
import type { HandlePosition } from '../../types/selection';

export function formatSize(size: Size): string {
  return `${Math.round(size.width)}, ${Math.round(size.height)}`;
}

export function clampToMinimumSize(
  bounds: ResizeBounds,
  handle: HandlePosition,
  minSize: number = MIN_VIEW_SIZE
): ResizeBounds {
  const { origin, size } = bounds;
  let { x, y } = origin;
  let { width, height } = size;

  const widthBelowMin = width < minSize;
  const heightBelowMin = height < minSize;

  if (widthBelowMin) {
    const bottomRight = x + width;
    if (handle === 'nw' || handle === 'w' || handle === 'sw') {
      x = bottomRight - minSize;
    }
    width = minSize;
  }

  if (heightBelowMin) {
    const bottom = y + height;
    if (handle === 'nw' || handle === 'n' || handle === 'ne') {
      y = bottom - minSize;
    }
    height = minSize;
  }

  return {
    origin: { x, y },
    size: { width, height },
  };
}

export function calculateResizeBounds(
  handle: HandlePosition,
  originalOrigin: Point,
  originalSize: Size,
  delta: Point,
  options?: ResizeOptions
): ResizeBounds {
  let x = originalOrigin.x;
  let y = originalOrigin.y;
  let width = originalSize.width;
  let height = originalSize.height;

  const resizeFromCenter = options?.resizeFromCenter ?? false;
  const maintainAspectRatio = options?.maintainAspectRatio ?? false;

  let effectiveDeltaX = delta.x;
  let effectiveDeltaY = delta.y;

  if (maintainAspectRatio && originalSize.width > 0 && originalSize.height > 0) {
    const aspectRatio = originalSize.width / originalSize.height;
    const absX = Math.abs(delta.x);
    const absY = Math.abs(delta.y);

    if (absX >= absY) {
      effectiveDeltaY = delta.x / aspectRatio;
    } else {
      effectiveDeltaX = delta.y * aspectRatio;
    }
  }

  if (resizeFromCenter) {
    switch (handle) {
      case 'nw':
      case 'n':
      case 'ne':
      case 'e':
      case 'se':
      case 's':
      case 'sw':
      case 'w': {
        const centerDeltaX = effectiveDeltaX;
        const centerDeltaY = effectiveDeltaY;
        x = originalOrigin.x - centerDeltaX;
        y = originalOrigin.y - centerDeltaY;
        width = originalSize.width + centerDeltaX * 2;
        height = originalSize.height + centerDeltaY * 2;
        return { origin: { x, y }, size: { width, height } };
      }
    }
  }

  switch (handle) {
    case 'nw':
      x += effectiveDeltaX;
      y += effectiveDeltaY;
      width -= effectiveDeltaX;
      height -= effectiveDeltaY;
      break;
    case 'n':
      y += effectiveDeltaY;
      height -= effectiveDeltaY;
      break;
    case 'ne':
      y += effectiveDeltaY;
      width += effectiveDeltaX;
      height -= effectiveDeltaY;
      break;
    case 'e':
      width += effectiveDeltaX;
      break;
    case 'se':
      width += effectiveDeltaX;
      height += effectiveDeltaY;
      break;
    case 's':
      height += effectiveDeltaY;
      break;
    case 'sw':
      x += effectiveDeltaX;
      width -= effectiveDeltaX;
      height += effectiveDeltaY;
      break;
    case 'w':
      x += effectiveDeltaX;
      width -= effectiveDeltaX;
      break;
  }

  return { origin: { x, y }, size: { width, height } };
}

export function createResizeOperation(
  data: ResizeOperationData,
  updateViewOrigin: (id: string, origin: Point) => void,
  updateViewSize: (id: string, size: Size) => void
): HistoryOperation {
  return {
    type: 'resize',
    description: 'Resize view',
    timestamp: Date.now(),
    undo: () => {
      updateViewOrigin(data.viewId, data.originalOrigin);
      updateViewSize(data.viewId, data.originalSize);
    },
    redo: () => {
      updateViewOrigin(data.viewId, data.newOrigin);
      updateViewSize(data.viewId, data.newSize);
    },
  };
}
