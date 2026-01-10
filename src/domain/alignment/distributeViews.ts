/**
 * Distribution Functions
 *
 * Functions for distributing views with equal spacing.
 */

import type { RenderableView } from '../../types/canvas';
import type {
  AlignmentResult,
  DistributionDirection,
  ViewBounds,
} from '../../types/alignment';
import { viewToBounds } from './calculateBounds';

/**
 * Calculates equal gap spacing for distribution.
 *
 * @param views - Sorted array of view bounds
 * @param direction - Distribution direction
 * @returns Gap size in pixels
 */
export function calculateEqualGap(
  views: ViewBounds[],
  direction: DistributionDirection
): number {
  if (views.length < 2) {
    return 0;
  }

  if (direction === 'horizontal') {
    // Calculate total span (from leftmost left to rightmost right)
    const leftMost = Math.min(...views.map((v) => v.left));
    const rightMost = Math.max(...views.map((v) => v.right));
    const totalSpan = rightMost - leftMost;

    // Calculate sum of view widths
    const totalWidth = views.reduce((sum, v) => sum + v.width, 0);

    // Calculate equal gap
    return (totalSpan - totalWidth) / (views.length - 1);
  } else {
    // Calculate total span (from topmost top to bottommost bottom)
    const topMost = Math.min(...views.map((v) => v.top));
    const bottomMost = Math.max(...views.map((v) => v.bottom));
    const totalSpan = bottomMost - topMost;

    // Calculate sum of view heights
    const totalHeight = views.reduce((sum, v) => sum + v.height, 0);

    // Calculate equal gap
    return (totalSpan - totalHeight) / (views.length - 1);
  }
}

/**
 * Checks if a position is essentially unchanged (within floating point tolerance).
 */
function isPositionUnchanged(original: number, newPos: number): boolean {
  const EPSILON = 0.0001;
  return Math.abs(original - newPos) < EPSILON;
}

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
 */
export function distributeViews(
  viewIds: string[],
  direction: DistributionDirection,
  getView: (id: string) => RenderableView | null
): AlignmentResult[] {
  if (viewIds.length < 3) {
    return [];
  }

  // Get all valid views
  const views = viewIds.map(getView).filter((v): v is RenderableView => v !== null);

  if (views.length < 3) {
    return [];
  }

  // Convert to bounds and pair with original views
  const viewsWithBounds = views.map((view) => ({
    view,
    bounds: viewToBounds(view),
  }));

  // Sort by position
  if (direction === 'horizontal') {
    viewsWithBounds.sort((a, b) => a.bounds.left - b.bounds.left);
  } else {
    viewsWithBounds.sort((a, b) => a.bounds.top - b.bounds.top);
  }

  // Calculate equal gap
  const bounds = viewsWithBounds.map((vb) => vb.bounds);
  const gap = calculateEqualGap(bounds, direction);

  const results: AlignmentResult[] = [];

  // Distribute inner views (first and last stay fixed)
  for (let i = 1; i < viewsWithBounds.length - 1; i++) {
    const current = viewsWithBounds[i];
    const previous = viewsWithBounds[i - 1];
    const originalOrigin = { x: current.view.relativeX, y: current.view.relativeY };

    let newRelativeX = originalOrigin.x;
    let newRelativeY = originalOrigin.y;

    if (direction === 'horizontal') {
      // New absolute position: previous right + gap
      const newAbsoluteX = previous.bounds.right + gap;
      // Calculate delta from current absolute position
      const deltaX = newAbsoluteX - current.bounds.left;
      newRelativeX = originalOrigin.x + deltaX;

      // Update bounds for next iteration
      current.bounds.left = newAbsoluteX;
      current.bounds.right = newAbsoluteX + current.bounds.width;
      current.bounds.centerX = newAbsoluteX + current.bounds.width / 2;
    } else {
      // New absolute position: previous bottom + gap
      const newAbsoluteY = previous.bounds.bottom + gap;
      // Calculate delta from current absolute position
      const deltaY = newAbsoluteY - current.bounds.top;
      newRelativeY = originalOrigin.y + deltaY;

      // Update bounds for next iteration
      current.bounds.top = newAbsoluteY;
      current.bounds.bottom = newAbsoluteY + current.bounds.height;
      current.bounds.centerY = newAbsoluteY + current.bounds.height / 2;
    }

    const newOrigin = { x: newRelativeX, y: newRelativeY };

    // Only include if position actually changed
    if (
      !isPositionUnchanged(originalOrigin.x, newOrigin.x) ||
      !isPositionUnchanged(originalOrigin.y, newOrigin.y)
    ) {
      results.push({
        viewId: current.view.id,
        originalOrigin,
        newOrigin,
      });
    }
  }

  return results;
}
