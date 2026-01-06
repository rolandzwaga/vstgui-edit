/**
 * Selection Types
 * Type definitions for view selection feature (008-view-selection)
 */

/**
 * Handle positions for selection resize handles.
 * Visual only in this feature - no resize functionality.
 */
export type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

/**
 * Cursor styles for resize handles.
 */
export type HandleCursor =
  | 'nwse-resize' // NW, SE corners
  | 'nesw-resize' // NE, SW corners
  | 'ns-resize' // N, S edges
  | 'ew-resize'; // E, W edges

/**
 * Map handle position to cursor style.
 */
export const HANDLE_CURSORS: Record<HandlePosition, HandleCursor> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
};

/**
 * All handle positions in order (clockwise from NW).
 */
export const HANDLE_POSITIONS: HandlePosition[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

/**
 * Dimensions for resize handles in pixels.
 */
export const HANDLE_SIZE = 8;

/**
 * Point in canvas coordinate space.
 */
export interface CanvasPoint {
  x: number;
  y: number;
}

/**
 * Rectangle bounds in canvas space.
 */
export interface CanvasBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Tooltip content for hovered view.
 */
export interface TooltipContent {
  /** VSTGUI class name (e.g., "CTextButton") */
  className: string;
  /** View width in pixels */
  width: number;
  /** View height in pixels */
  height: number;
}

/**
 * Selection state for a single view.
 */
export interface ViewSelectionState {
  /** View is in the selected set */
  isSelected: boolean;
  /** View is currently hovered */
  isHovered: boolean;
  /** View is an ancestor of a selected view */
  isParentOfSelected: boolean;
}
