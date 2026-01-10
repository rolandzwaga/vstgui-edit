/**
 * Coordinate Mapping Utilities
 *
 * Functions for converting between screen and canvas coordinates
 * for ruler positioning and cursor tracking.
 */

import type { Point } from '../../types/canvas';

/**
 * Ruler thickness constant (20px per spec).
 */
export const RULER_THICKNESS = 20;

/**
 * Convert screen coordinates to canvas coordinates.
 * Accounts for ruler offset, pan, and zoom.
 *
 * @param screenX - Screen X coordinate (relative to RulerContainer)
 * @param screenY - Screen Y coordinate (relative to RulerContainer)
 * @param panOffset - Current pan offset
 * @param zoomLevel - Current zoom level
 * @returns Canvas coordinates
 */
export function screenToCanvasCoordinates(
  screenX: number,
  screenY: number,
  panOffset: Point,
  zoomLevel: number
): Point {
  // First subtract the ruler thickness to get position relative to canvas viewport
  // Then apply the inverse of the canvas transform:
  // canvasPos = (screenPos - rulerThickness - panOffset) / zoomLevel
  const canvasX = (screenX - RULER_THICKNESS - panOffset.x) / zoomLevel;
  const canvasY = (screenY - RULER_THICKNESS - panOffset.y) / zoomLevel;

  return { x: canvasX, y: canvasY };
}

/**
 * Convert canvas coordinate to screen position on ruler.
 * Used for positioning tick marks and indicators.
 *
 * @param canvasValue - Canvas coordinate value
 * @param panOffset - Pan offset along this axis
 * @param zoomLevel - Current zoom level
 * @returns Screen position in pixels
 */
export function canvasToScreenPosition(
  canvasValue: number,
  panOffset: number,
  zoomLevel: number
): number {
  // Transform from canvas to screen:
  // screenPos = canvasValue * zoomLevel + panOffset
  return canvasValue * zoomLevel + panOffset;
}

/**
 * Convert screen position on ruler to canvas coordinate.
 * Used for guide creation from ruler drag.
 *
 * @param screenValue - Screen position in pixels
 * @param panOffset - Pan offset along this axis
 * @param zoomLevel - Current zoom level
 * @returns Canvas coordinate value
 */
export function screenToCanvasPosition(
  screenValue: number,
  panOffset: number,
  zoomLevel: number
): number {
  // Inverse of canvasToScreenPosition:
  // canvasValue = (screenPos - panOffset) / zoomLevel
  return (screenValue - panOffset) / zoomLevel;
}

/**
 * Calculate screen positions for template bounds indicator.
 * Returns start (always at canvas origin) and end (at template extent).
 *
 * @param templateExtent - Template width or height
 * @param panOffset - Pan offset along this axis
 * @param zoomLevel - Current zoom level
 * @returns Start and end positions in screen pixels
 */
export function calculateTemplateBoundsPosition(
  templateExtent: number,
  panOffset: number,
  zoomLevel: number
): { start: number; end: number } {
  // Start is always at canvas origin (0)
  const start = canvasToScreenPosition(0, panOffset, zoomLevel);

  // End is at the template extent
  const end = canvasToScreenPosition(templateExtent, panOffset, zoomLevel);

  return { start, end };
}
