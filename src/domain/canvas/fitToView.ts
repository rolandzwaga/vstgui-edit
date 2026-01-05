/**
 * Fit to View Calculation
 *
 * Calculates the zoom level and pan offset needed to fit a template
 * within a viewport with optional padding.
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
 * Default padding as a percentage (5% on each side = 10% total reduction)
 */
const DEFAULT_PADDING = 0.05;

/**
 * Calculate the zoom level and pan offset to fit a template within a viewport.
 *
 * @param templateSize - The size of the template to fit
 * @param viewportSize - The size of the viewport
 * @param padding - Padding percentage on each side (default 0.05 = 5%)
 * @returns FitResult with zoom level (capped at 1.0) and pan offset to center
 */
export function calculateFitZoom(
  templateSize: Size,
  viewportSize: Size,
  padding = DEFAULT_PADDING
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

  // Calculate effective viewport size after padding
  const paddingMultiplier = 1 - 2 * padding;
  const effectiveWidth = viewportSize.width * paddingMultiplier;
  const effectiveHeight = viewportSize.height * paddingMultiplier;

  // Calculate zoom to fit in each dimension
  const zoomX = effectiveWidth / templateSize.width;
  const zoomY = effectiveHeight / templateSize.height;

  // Use the smaller zoom to fit in both dimensions
  let zoom = Math.min(zoomX, zoomY);

  // Cap zoom at 1.0 (don't zoom above 100% for small templates)
  zoom = Math.min(zoom, 1.0);

  // Calculate scaled template size
  const scaledWidth = templateSize.width * zoom;
  const scaledHeight = templateSize.height * zoom;

  // Calculate pan offset to center the template
  const panX = (viewportSize.width - scaledWidth) / 2;
  const panY = (viewportSize.height - scaledHeight) / 2;

  return { zoom, panX, panY };
}
