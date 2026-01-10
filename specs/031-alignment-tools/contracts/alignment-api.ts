/**
 * Alignment Tools API Contracts
 *
 * Feature: 031-alignment-tools
 * Date: 2026-01-10
 *
 * This file defines the function signatures and contracts for the alignment
 * domain module. Implementation must conform to these interfaces.
 */

import type { Point, RenderableView } from '../../../src/types/canvas';
import type { HistoryOperation, MoveOperationData } from '../../../src/types/history';

// =============================================================================
// Type Definitions
// =============================================================================

export type AlignmentType =
  | 'left'
  | 'center'
  | 'right'
  | 'top'
  | 'middle'
  | 'bottom';

export type DistributionDirection = 'horizontal' | 'vertical';

export interface ViewBounds {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export interface SelectionBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export interface AlignmentResult {
  viewId: string;
  originalOrigin: Point;
  newOrigin: Point;
}

// =============================================================================
// Bounds Calculation Functions
// =============================================================================

/**
 * Converts a RenderableView to ViewBounds.
 *
 * @param view - The renderable view to convert
 * @returns ViewBounds with absolute coordinates
 *
 * @example
 * ```ts
 * const bounds = viewToBounds(renderableView);
 * // bounds.left === renderableView.absoluteX
 * // bounds.right === renderableView.absoluteX + renderableView.width
 * ```
 */
export function viewToBounds(view: RenderableView): ViewBounds;

/**
 * Calculates the bounding box encompassing all selected views.
 *
 * @param viewIds - Array of selected view IDs
 * @param getView - Function to retrieve view data by ID
 * @returns SelectionBounds or null if no valid views
 *
 * @precondition viewIds.length > 0
 * @postcondition Returns bounding box containing all views
 *
 * @example
 * ```ts
 * const bounds = calculateSelectionBounds(['view1', 'view2'], getView);
 * // bounds.left is minimum of all view left edges
 * // bounds.right is maximum of all view right edges
 * ```
 */
export function calculateSelectionBounds(
  viewIds: string[],
  getView: (id: string) => RenderableView | null
): SelectionBounds | null;

/**
 * Calculates the bounds of a view's parent container.
 *
 * @param viewId - The view whose parent bounds to calculate
 * @param getParentId - Function to get parent view ID
 * @param getView - Function to retrieve view data by ID
 * @returns Parent ViewBounds or null if view is root
 *
 * @example
 * ```ts
 * const parentBounds = calculateParentBounds('child-view', getParentId, getView);
 * if (parentBounds) {
 *   // Can align to parent
 * }
 * ```
 */
export function calculateParentBounds(
  viewId: string,
  getParentId: (id: string) => string | null,
  getView: (id: string) => RenderableView | null
): ViewBounds | null;

// =============================================================================
// Alignment Functions
// =============================================================================

/**
 * Calculates new positions for views to align them to a common edge/center.
 *
 * For multi-select (2+ views):
 * - 'left': Align left edges to leftmost view's left edge
 * - 'center': Align horizontal centers to selection center
 * - 'right': Align right edges to rightmost view's right edge
 * - 'top': Align top edges to topmost view's top edge
 * - 'middle': Align vertical centers to selection center
 * - 'bottom': Align bottom edges to bottommost view's bottom edge
 *
 * For single-select (1 view, non-root):
 * - Align relative to parent container bounds
 *
 * @param viewIds - Array of view IDs to align
 * @param type - Type of alignment to perform
 * @param getView - Function to retrieve view data by ID
 * @param getParentId - Function to get parent view ID
 * @returns Array of alignment results (empty if no change needed)
 *
 * @precondition viewIds.length >= 1
 * @precondition For single view, must not be root (getParentId returns non-null)
 * @postcondition Returns results only for views that actually moved
 *
 * @example
 * ```ts
 * const results = alignViews(['view1', 'view2', 'view3'], 'left', getView, getParentId);
 * // results contains only views that changed position
 * ```
 */
export function alignViews(
  viewIds: string[],
  type: AlignmentType,
  getView: (id: string) => RenderableView | null,
  getParentId: (id: string) => string | null
): AlignmentResult[];

/**
 * Gets the alignment reference value for a given type.
 *
 * @param bounds - Selection or parent bounds
 * @param type - Type of alignment
 * @returns The coordinate value to align to
 *
 * @example
 * ```ts
 * const ref = getAlignmentReference(selectionBounds, 'left');
 * // ref === selectionBounds.left
 * ```
 */
export function getAlignmentReference(
  bounds: SelectionBounds | ViewBounds,
  type: AlignmentType
): number;

/**
 * Calculates new origin for a view based on alignment type.
 *
 * @param view - Current view bounds
 * @param referenceValue - The value to align to
 * @param type - Type of alignment
 * @returns New origin point (relative coordinates)
 */
export function calculateAlignedPosition(
  view: ViewBounds,
  referenceValue: number,
  type: AlignmentType,
  originalRelativeOrigin: Point
): Point;

// =============================================================================
// Distribution Functions
// =============================================================================

/**
 * Calculates new positions to distribute views with equal spacing.
 *
 * For horizontal distribution:
 * - Sort views by left edge
 * - Keep leftmost and rightmost views fixed
 * - Redistribute inner views to create equal gaps
 *
 * For vertical distribution:
 * - Sort views by top edge
 * - Keep topmost and bottommost views fixed
 * - Redistribute inner views to create equal gaps
 *
 * @param viewIds - Array of view IDs to distribute (minimum 3)
 * @param direction - Direction to distribute
 * @param getView - Function to retrieve view data by ID
 * @returns Array of alignment results (empty if no change needed)
 *
 * @precondition viewIds.length >= 3
 * @postcondition Outer views remain in original positions
 * @postcondition Gaps between adjacent views are equal
 *
 * @example
 * ```ts
 * const results = distributeViews(['v1', 'v2', 'v3', 'v4'], 'horizontal', getView);
 * // v1 (leftmost) and v4 (rightmost) unchanged
 * // v2, v3 repositioned for equal gaps
 * ```
 */
export function distributeViews(
  viewIds: string[],
  direction: DistributionDirection,
  getView: (id: string) => RenderableView | null
): AlignmentResult[];

/**
 * Calculates equal gap spacing for distribution.
 *
 * @param views - Sorted array of view bounds
 * @param direction - Distribution direction
 * @returns Gap size in pixels
 *
 * @example
 * ```ts
 * const gap = calculateEqualGap(sortedViews, 'horizontal');
 * // gap = (totalSpan - sumOfWidths) / (viewCount - 1)
 * ```
 */
export function calculateEqualGap(
  views: ViewBounds[],
  direction: DistributionDirection
): number;

// =============================================================================
// History Operations
// =============================================================================

/**
 * Creates a history operation from alignment results.
 *
 * @param results - Array of alignment/distribution results
 * @param description - Human-readable description for undo UI
 * @param updateViewOrigin - Function to update view positions
 * @returns HistoryOperation for undo/redo stack
 *
 * @precondition results.length > 0
 * @postcondition Returned operation has valid undo/redo functions
 *
 * @example
 * ```ts
 * const results = alignViews(viewIds, 'left', getView, getParentId);
 * if (results.length > 0) {
 *   const op = createAlignmentOperation(results, 'Align 3 views left', updateViewOrigin);
 *   pushOperation(op);
 * }
 * ```
 */
export function createAlignmentOperation(
  results: AlignmentResult[],
  description: string,
  updateViewOrigin: (viewId: string, origin: Point) => void
): HistoryOperation;

/**
 * Generates description for alignment operation.
 *
 * @param count - Number of views aligned
 * @param type - Type of alignment
 * @param isParentAlign - Whether this is single-view align to parent
 * @returns Human-readable description
 *
 * @example
 * ```ts
 * getAlignmentDescription(3, 'left', false);  // "Align 3 views left"
 * getAlignmentDescription(1, 'center', true); // "Align view to parent center"
 * ```
 */
export function getAlignmentDescription(
  count: number,
  type: AlignmentType,
  isParentAlign: boolean
): string;

/**
 * Generates description for distribution operation.
 *
 * @param count - Number of views distributed
 * @param direction - Distribution direction
 * @returns Human-readable description
 *
 * @example
 * ```ts
 * getDistributionDescription(5, 'horizontal'); // "Distribute 5 views horizontally"
 * ```
 */
export function getDistributionDescription(
  count: number,
  direction: DistributionDirection
): string;

// =============================================================================
// Store Functions
// =============================================================================

export interface AlignmentToolbarState {
  isDocked: boolean;
  floatingPosition: Point | null;
}

/**
 * Gets the current toolbar state.
 */
export const alignmentToolbarStore: {
  readonly isDocked: boolean;
  readonly floatingPosition: Point | null;
};

/**
 * Docks the toolbar back into the main toolbar.
 */
export function dock(): void;

/**
 * Undocks the toolbar to float at the given position.
 */
export function undock(position: Point): void;

/**
 * Updates the floating position (while dragging).
 */
export function updateFloatingPosition(position: Point): void;

/**
 * Loads state from localStorage.
 */
export function loadAlignmentToolbarState(): void;

/**
 * Saves current state to localStorage.
 */
export function saveAlignmentToolbarState(): void;

/**
 * Resets to initial docked state.
 */
export function resetAlignmentToolbarStore(): void;

// =============================================================================
// Component Props Interfaces
// =============================================================================

export interface AlignmentButtonProps {
  /** Type of alignment or distribution this button performs */
  type: AlignmentType | DistributionDirection;
  /** Icon component to render */
  icon: () => JSX.Element;
  /** Button label for tooltip */
  label: string;
  /** Keyboard shortcut (optional, for tooltip) */
  shortcut?: string;
  /** Whether the button is disabled */
  disabled: boolean;
  /** Click handler */
  onClick: () => void;
}

export interface AlignmentToolbarProps {
  /** Called when undock is triggered */
  onUndock?: (position: Point) => void;
  /** Called when redock is triggered */
  onRedock?: () => void;
}

// =============================================================================
// Keyboard Handler Extensions
// =============================================================================

/**
 * Handles Ctrl+Shift+{L,C,R,T,M,B} shortcuts.
 *
 * Integration point: Add to useCanvasKeyboard hook.
 *
 * @example
 * ```ts
 * // In useCanvasKeyboard
 * if (e.ctrlKey && e.shiftKey) {
 *   const handled = handleAlignmentShortcut(e, selectedIds);
 *   if (handled) return;
 * }
 * ```
 */
export function handleAlignmentShortcut(
  event: KeyboardEvent,
  selectedIds: Set<string>
): boolean;
