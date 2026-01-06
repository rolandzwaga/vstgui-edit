/**
 * Resize Types
 * Type definitions for view resize feature (013-view-resize)
 */

import type { HandlePosition } from './selection';
import type { Point, Size } from './canvas';
import type { HistoryOperation } from './history';

/**
 * Minimum allowed view dimensions in pixels.
 */
export const MIN_VIEW_SIZE = 10;

/**
 * Click tolerance before resize initiates (pixels).
 * Movement less than this is not considered a resize.
 */
export const RESIZE_CLICK_TOLERANCE = 3;

/**
 * Transient state during resize operation.
 * Similar to dragStore pattern.
 */
export interface ResizeState {
  /** Whether a resize is currently in progress */
  isResizing: boolean;

  /** Which handle initiated the resize */
  activeHandle: HandlePosition | null;

  /** View ID being resized */
  viewId: string | null;

  /** Mouse position when resize started (canvas coordinates) */
  startPoint: Point | null;

  /** Current mouse position during resize */
  currentPoint: Point | null;

  /** Original view origin before resize */
  originalOrigin: Point | null;

  /** Original view size before resize */
  originalSize: Size | null;

  /** Computed new origin (reactive) */
  newOrigin: Point;

  /** Computed new size (reactive) */
  newSize: Size;
}

/**
 * Data needed to create a history operation for resize.
 */
export interface ResizeOperationData {
  viewId: string;
  originalOrigin: Point;
  originalSize: Size;
  newOrigin: Point;
  newSize: Size;
}

/**
 * Complete bounds after resize calculation.
 */
export interface ResizeBounds {
  origin: Point;
  size: Size;
}

/**
 * Options for resize calculation.
 */
export interface ResizeOptions {
  /** Maintain aspect ratio during resize (Shift key) */
  maintainAspectRatio?: boolean;
  /** Resize symmetrically from center (Alt key) */
  resizeFromCenter?: boolean;
}

/**
 * Function signature for creating resize history operations.
 */
export type CreateResizeOperationFn = (
  data: ResizeOperationData,
  updateViewOrigin: (id: string, origin: Point) => void,
  updateViewSize: (id: string, size: Size) => void
) => HistoryOperation;
