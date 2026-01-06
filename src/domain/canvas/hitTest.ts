/**
 * Hit Test Utility
 * Determines which view (if any) is at a given canvas coordinate.
 */
import type { RenderableView } from '../../types/canvas';
import type { CanvasPoint } from '../../types/selection';

/**
 * Find the topmost view at the given canvas coordinates.
 *
 * Iterates through views in reverse z-order (highest first) and returns
 * the first view that contains the point. This ensures the topmost
 * visible view is selected when views overlap.
 *
 * @param point - Point in canvas coordinate space
 * @param views - Flattened view array (z-order: 0 = bottom, higher = top)
 * @returns View ID of topmost view at point, or null if no hit
 */
export function hitTest(point: CanvasPoint, views: RenderableView[]): string | null {
  // Iterate in reverse order (highest z-index first)
  for (let i = views.length - 1; i >= 0; i--) {
    const view = views[i];

    // Check if point is inside view bounds
    // Note: bounds are [x, x+width) and [y, y+height) - right/bottom edges are exclusive
    if (
      point.x >= view.absoluteX &&
      point.x < view.absoluteX + view.width &&
      point.y >= view.absoluteY &&
      point.y < view.absoluteY + view.height
    ) {
      return view.id;
    }
  }

  return null;
}
