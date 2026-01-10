/**
 * Bounds Calculation Functions
 *
 * Functions for calculating bounding boxes of views and selections.
 */

import type { SelectionBounds, ViewBounds } from '../../types/alignment';
import type { RenderableView } from '../../types/canvas';

/**
 * Converts a RenderableView to ViewBounds.
 *
 * @param view - The renderable view to convert
 * @returns ViewBounds with absolute coordinates
 */
export function viewToBounds(view: RenderableView): ViewBounds {
  const left = view.absoluteX;
  const top = view.absoluteY;
  const right = left + view.width;
  const bottom = top + view.height;

  return {
    id: view.id,
    left,
    right,
    top,
    bottom,
    centerX: left + view.width / 2,
    centerY: top + view.height / 2,
    width: view.width,
    height: view.height,
  };
}

/**
 * Calculates the bounding box encompassing all selected views.
 *
 * @param viewIds - Array of selected view IDs
 * @param getView - Function to retrieve view data by ID
 * @returns SelectionBounds or null if no valid views
 */
export function calculateSelectionBounds(
  viewIds: string[],
  getView: (id: string) => RenderableView | null
): SelectionBounds | null {
  if (viewIds.length === 0) {
    return null;
  }

  const views = viewIds.map(getView).filter((v): v is RenderableView => v !== null);

  if (views.length === 0) {
    return null;
  }

  const bounds = views.map(viewToBounds);

  const left = Math.min(...bounds.map(b => b.left));
  const right = Math.max(...bounds.map(b => b.right));
  const top = Math.min(...bounds.map(b => b.top));
  const bottom = Math.max(...bounds.map(b => b.bottom));

  const width = right - left;
  const height = bottom - top;

  return {
    left,
    right,
    top,
    bottom,
    centerX: left + width / 2,
    centerY: top + height / 2,
    width,
    height,
  };
}

/**
 * Calculates the bounds of a view's parent container.
 *
 * @param viewId - The view whose parent bounds to calculate
 * @param getParentId - Function to get parent view ID
 * @param getView - Function to retrieve view data by ID
 * @returns Parent ViewBounds or null if view is root
 */
export function calculateParentBounds(
  viewId: string,
  getParentId: (id: string) => string | null,
  getView: (id: string) => RenderableView | null
): ViewBounds | null {
  const parentId = getParentId(viewId);

  if (parentId === null) {
    return null;
  }

  const parentView = getView(parentId);

  if (parentView === null) {
    return null;
  }

  return viewToBounds(parentView);
}
