/**
 * Tick Generation Utilities
 *
 * Generates tick mark arrays for ruler rendering based on
 * visible range and tick intervals.
 */

import type { TickIntervals, TickMark, VisibleRange } from '../../types/ruler';

/**
 * Calculate the visible range from viewport and transform.
 * Determines which canvas coordinates are visible in the viewport.
 *
 * @param viewportLength - Viewport dimension in screen pixels
 * @param panOffset - Pan offset along this axis
 * @param zoomLevel - Current zoom level
 * @returns Visible range in canvas coordinates
 */
export function calculateVisibleRange(
  viewportLength: number,
  panOffset: number,
  zoomLevel: number
): VisibleRange {
  // Convert screen position to canvas coordinates:
  // canvasPos = (screenPos - panOffset) / zoomLevel
  //
  // At screen position 0 (left/top edge of viewport):
  // canvasStart = (0 - panOffset) / zoomLevel = -panOffset / zoomLevel
  //
  // At screen position viewportLength (right/bottom edge):
  // canvasEnd = (viewportLength - panOffset) / zoomLevel

  let start = -panOffset / zoomLevel;
  const end = (viewportLength - panOffset) / zoomLevel;

  // Normalize -0 to 0 for consistent comparisons
  if (start === 0) {
    start = 0;
  }

  return { start, end };
}

/**
 * Format a tick label for display.
 * Handles negative numbers and rounds to integers.
 *
 * @param value - Canvas coordinate value
 * @returns Formatted label string
 */
export function formatTickLabel(value: number): string {
  return String(Math.round(value));
}

/**
 * Generate tick marks for a visible range.
 * Produces both major and minor ticks within the range.
 *
 * @param range - Visible range in canvas coordinates
 * @param intervals - Major and minor tick intervals
 * @returns Array of tick marks sorted by position
 */
export function generateTicks(range: VisibleRange, intervals: TickIntervals): TickMark[] {
  const { start, end } = range;
  const { major, minor } = intervals;

  const ticks: TickMark[] = [];

  // Find the first minor tick at or after start
  // We align to the interval grid starting from 0
  const firstMinor = Math.ceil(start / minor) * minor;

  // Generate all minor ticks in the range
  for (let pos = firstMinor; pos <= end; pos += minor) {
    // Round to avoid floating point precision issues
    const roundedPos = Math.round(pos * 1000) / 1000;

    // Check if this is a major tick
    const isMajor =
      Math.abs(roundedPos % major) < 0.001 || Math.abs((roundedPos % major) - major) < 0.001;

    if (isMajor) {
      ticks.push({
        position: roundedPos,
        type: 'major',
        label: formatTickLabel(roundedPos),
      });
    } else {
      ticks.push({
        position: roundedPos,
        type: 'minor',
        label: null,
      });
    }
  }

  // Sort by position (should already be sorted, but ensure it)
  ticks.sort((a, b) => a.position - b.position);

  return ticks;
}
