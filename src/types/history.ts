/**
 * History Types
 * Types for undo/redo history management
 */

import type { Point } from './canvas';

/**
 * Represents a single undoable/redoable operation.
 * Generic interface that can support future operation types beyond 'move'.
 */
export interface HistoryOperation {
  type:
    | 'move'
    | 'resize'
    | 'property-change'
    | 'delete'
    | 'create'
    | 'duplicate'
    | 'reparent'
    | 'reorder'
    | 'group'
    | 'ungroup';
  description: string;
  undo: () => void;
  redo: () => void;
  timestamp: number;
}

/**
 * Data captured for a move operation.
 * Used to construct a HistoryOperation with proper undo/redo closures.
 */
export interface MoveOperationData {
  /** View IDs that were moved */
  viewIds: string[];
  /** Original origins before move (keyed by viewId) */
  originalOrigins: Record<string, Point>;
  /** New origins after move (keyed by viewId) */
  newOrigins: Record<string, Point>;
}

/**
 * Axis constraint options for constrained movement.
 */
export type ConstraintAxis = 'horizontal' | 'vertical' | null;

/**
 * Transient state during a drag operation.
 * Not persisted - only used during active drag gestures.
 */
export interface DragState {
  /** Whether a drag is currently active */
  isDragging: boolean;
  /** Starting mouse position in canvas coordinates */
  startPoint: Point | null;
  /** Current mouse position in canvas coordinates */
  currentPoint: Point | null;
  /** Original origins of selected views when drag started */
  originalOrigins: Record<string, Point>;
  /** Locked axis when Shift is held */
  constrainedAxis: ConstraintAxis;
}

/**
 * Maximum number of operations in the history stack.
 * Oldest operations are dropped when this limit is exceeded.
 */
export const HISTORY_STACK_LIMIT = 100;

/**
 * Minimum drag distance in pixels before a drag is initiated.
 * Prevents accidental micro-drags from being treated as moves.
 */
export const CLICK_TOLERANCE = 3;

/**
 * Distance in pixels before axis constraint locks.
 * Movement must exceed this in one direction for Shift-constrain to engage.
 */
export const AXIS_LOCK_THRESHOLD = 5;

/**
 * Nudge distances for arrow key movement.
 */
export const NUDGE_DISTANCE = 1;
export const NUDGE_DISTANCE_FAST = 10;
