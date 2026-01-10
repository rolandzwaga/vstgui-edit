/**
 * Alignment Functions
 *
 * Functions for aligning views to common edges/centers.
 */

import type {
  AlignmentResult,
  AlignmentType,
  SelectionBounds,
  ViewBounds,
} from '../../types/alignment';
import type { Point, RenderableView } from '../../types/canvas';
import { calculateParentBounds, calculateSelectionBounds, viewToBounds } from './calculateBounds';

/**
 * Gets the alignment reference value for a given type.
 *
 * @param bounds - Selection or parent bounds
 * @param type - Type of alignment
 * @returns The coordinate value to align to
 */
export function getAlignmentReference(
  bounds: SelectionBounds | ViewBounds,
  type: AlignmentType
): number {
  switch (type) {
    case 'left':
      return bounds.left;
    case 'center':
      return bounds.centerX;
    case 'right':
      return bounds.right;
    case 'top':
      return bounds.top;
    case 'middle':
      return bounds.centerY;
    case 'bottom':
      return bounds.bottom;
  }
}

/**
 * Calculates new origin for a view based on alignment type.
 * The result is in relative coordinates (relative to parent).
 *
 * @param view - Current view bounds (absolute coordinates)
 * @param referenceValue - The value to align to (absolute)
 * @param type - Type of alignment
 * @param originalRelativeOrigin - The view's current relative origin
 * @returns New origin point (relative coordinates)
 */
export function calculateAlignedPosition(
  view: ViewBounds,
  referenceValue: number,
  type: AlignmentType,
  originalRelativeOrigin: Point
): Point {
  // Calculate the delta between current absolute position and target
  let deltaX = 0;
  let deltaY = 0;

  switch (type) {
    case 'left':
      // Move left edge to reference
      deltaX = referenceValue - view.left;
      break;
    case 'center':
      // Move center to reference
      deltaX = referenceValue - view.centerX;
      break;
    case 'right':
      // Move right edge to reference
      deltaX = referenceValue - view.right;
      break;
    case 'top':
      // Move top edge to reference
      deltaY = referenceValue - view.top;
      break;
    case 'middle':
      // Move middle to reference
      deltaY = referenceValue - view.centerY;
      break;
    case 'bottom':
      // Move bottom edge to reference
      deltaY = referenceValue - view.bottom;
      break;
  }

  // Apply delta to relative origin
  return {
    x: originalRelativeOrigin.x + deltaX,
    y: originalRelativeOrigin.y + deltaY,
  };
}

/**
 * Checks if a position is essentially unchanged (within floating point tolerance).
 */
function isPositionUnchanged(original: Point, newPos: Point): boolean {
  const EPSILON = 0.0001;
  return Math.abs(original.x - newPos.x) < EPSILON && Math.abs(original.y - newPos.y) < EPSILON;
}

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
 */
export function alignViews(
  viewIds: string[],
  type: AlignmentType,
  getView: (id: string) => RenderableView | null,
  getParentId: (id: string) => string | null
): AlignmentResult[] {
  if (viewIds.length === 0) {
    return [];
  }

  // Get all valid views
  const views = viewIds.map(getView).filter((v): v is RenderableView => v !== null);

  if (views.length === 0) {
    return [];
  }

  // Single-select: align to parent
  if (views.length === 1) {
    return alignSingleView(views[0], type, getParentId, getView);
  }

  // Multi-select: align to selection bounding box
  return alignMultipleViews(views, type);
}

/**
 * Aligns a single view to its parent bounds.
 */
function alignSingleView(
  view: RenderableView,
  type: AlignmentType,
  getParentId: (id: string) => string | null,
  getView: (id: string) => RenderableView | null
): AlignmentResult[] {
  const parentBounds = calculateParentBounds(view.id, getParentId, getView);

  if (parentBounds === null) {
    // Root view has no parent to align to
    return [];
  }

  const viewBounds = viewToBounds(view);
  const referenceValue = getAlignmentReference(parentBounds, type);
  const originalOrigin = { x: view.relativeX, y: view.relativeY };

  // For single-view alignment to parent, we need to calculate the new position
  // relative to the parent's origin (0, 0 in parent's coordinate space)
  const newOrigin = calculateSingleViewAlignedPosition(
    viewBounds,
    parentBounds,
    referenceValue,
    type,
    originalOrigin
  );

  if (isPositionUnchanged(originalOrigin, newOrigin)) {
    return [];
  }

  return [
    {
      viewId: view.id,
      originalOrigin,
      newOrigin,
    },
  ];
}

/**
 * Calculates the aligned position for a single view relative to its parent.
 */
function calculateSingleViewAlignedPosition(
  viewBounds: ViewBounds,
  parentBounds: ViewBounds,
  referenceValue: number,
  type: AlignmentType,
  originalRelativeOrigin: Point
): Point {
  // Calculate new absolute position
  let newAbsoluteX = viewBounds.left;
  let newAbsoluteY = viewBounds.top;

  switch (type) {
    case 'left':
      newAbsoluteX = parentBounds.left;
      break;
    case 'center':
      newAbsoluteX = referenceValue - viewBounds.width / 2;
      break;
    case 'right':
      newAbsoluteX = parentBounds.right - viewBounds.width;
      break;
    case 'top':
      newAbsoluteY = parentBounds.top;
      break;
    case 'middle':
      newAbsoluteY = referenceValue - viewBounds.height / 2;
      break;
    case 'bottom':
      newAbsoluteY = parentBounds.bottom - viewBounds.height;
      break;
  }

  // Convert to relative position (subtract parent's absolute position)
  const newRelativeX =
    type === 'left' || type === 'center' || type === 'right'
      ? newAbsoluteX - parentBounds.left
      : originalRelativeOrigin.x;

  const newRelativeY =
    type === 'top' || type === 'middle' || type === 'bottom'
      ? newAbsoluteY - parentBounds.top
      : originalRelativeOrigin.y;

  return { x: newRelativeX, y: newRelativeY };
}

/**
 * Aligns multiple views to their selection bounding box.
 */
function alignMultipleViews(views: RenderableView[], type: AlignmentType): AlignmentResult[] {
  const selectionBounds = calculateSelectionBounds(
    views.map(v => v.id),
    id => views.find(v => v.id === id) ?? null
  );

  if (selectionBounds === null) {
    return [];
  }

  const referenceValue = getAlignmentReference(selectionBounds, type);
  const results: AlignmentResult[] = [];

  for (const view of views) {
    const viewBounds = viewToBounds(view);
    const originalOrigin = { x: view.relativeX, y: view.relativeY };
    const newOrigin = calculateAlignedPosition(viewBounds, referenceValue, type, originalOrigin);

    if (!isPositionUnchanged(originalOrigin, newOrigin)) {
      results.push({
        viewId: view.id,
        originalOrigin,
        newOrigin,
      });
    }
  }

  return results;
}
