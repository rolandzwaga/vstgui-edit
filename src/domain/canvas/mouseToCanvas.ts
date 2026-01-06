/**
 * Mouse to Canvas Coordinate Transform
 * Converts viewport (mouse event) coordinates to canvas space.
 */
import type { CanvasPoint } from '../../types/selection';

/**
 * Convert mouse event coordinates to canvas coordinate space.
 *
 * The canvas has a CSS transform applied (translate + scale), so we need
 * to apply the inverse transform to get the actual canvas coordinates.
 *
 * Transform chain (viewport → canvas):
 * 1. Subtract wrapper element's position (mouseX - wrapperRect.left)
 * 2. Subtract pan offset (the CSS translate values)
 * 3. Divide by zoom level (the CSS scale value)
 *
 * @param mouseX - Mouse X in viewport coordinates (e.g., event.clientX)
 * @param mouseY - Mouse Y in viewport coordinates (e.g., event.clientY)
 * @param wrapperRect - Bounding rect of the canvas wrapper element
 * @param panOffset - Current pan offset from canvasStore
 * @param zoomLevel - Current zoom level from canvasStore
 * @returns Point in canvas coordinate space
 */
export function mouseToCanvas(
  mouseX: number,
  mouseY: number,
  wrapperRect: DOMRect,
  panOffset: { x: number; y: number },
  zoomLevel: number
): CanvasPoint {
  // Step 1: Get position relative to wrapper element
  const relativeX = mouseX - wrapperRect.left;
  const relativeY = mouseY - wrapperRect.top;

  // Step 2: Subtract pan offset (inverse of CSS translate)
  const panAdjustedX = relativeX - panOffset.x;
  const panAdjustedY = relativeY - panOffset.y;

  // Step 3: Divide by zoom (inverse of CSS scale)
  const canvasX = panAdjustedX / zoomLevel;
  const canvasY = panAdjustedY / zoomLevel;

  return { x: canvasX, y: canvasY };
}
