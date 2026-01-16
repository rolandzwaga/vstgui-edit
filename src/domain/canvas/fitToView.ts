/**
 * Fit to View Calculation
 *
 * Calculates the zoom level needed to fit a template within a viewport.
 */

export interface Size {
  width: number;
  height: number;
}

export interface FitResult {
  zoom: number;
  panX: number;
  panY: number;
}

/**
 * Calculate the zoom level to fit a template within a viewport.
 * Uses the maximum zoom where the entire template is still visible.
 * Positions the template at the top-left (0, 0).
 *
 * @param templateSize - The size of the template to fit
 * @param viewportSize - The size of the viewport
 * @returns FitResult with zoom level and pan offset at origin
 */
export function calculateFitZoom(
  templateSize: Size,
  viewportSize: Size
): FitResult {
  // Handle edge cases with 0 dimensions
  if (
    templateSize.width <= 0 ||
    templateSize.height <= 0 ||
    viewportSize.width <= 0 ||
    viewportSize.height <= 0
  ) {
    return { zoom: 1.0, panX: 0, panY: 0 };
  }

  // Calculate zoom to fit in each dimension
  const zoomX = viewportSize.width / templateSize.width;
  const zoomY = viewportSize.height / templateSize.height;

  // Use the smaller zoom to fit in both dimensions
  const zoom = Math.min(zoomX, zoomY);

  // Position at top-left origin
  return { zoom, panX: 0, panY: 0 };
}
