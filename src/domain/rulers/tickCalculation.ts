/**
 * Tick Calculation Utilities
 *
 * Calculates tick intervals for rulers based on zoom level.
 * Uses power-of-2 scaling to maintain minimum 30px screen spacing.
 */

import type { GridSizePreset, TickIntervalConfig, TickIntervals } from '../../types/ruler';

/**
 * Default configuration for tick interval calculation.
 */
export const DEFAULT_TICK_CONFIG: TickIntervalConfig = {
  baseInterval: 100,
  minScreenSpacing: 30,
  minorTickRatio: 10,
};

/**
 * Calculate major and minor tick intervals for the current zoom level.
 * Uses power-of-2 scaling to maintain minimum 30px screen spacing.
 *
 * The algorithm ensures that majorInterval * zoomLevel >= minScreenSpacing (30px).
 * When zooming out, intervals double (100 -> 200 -> 400) to stay readable.
 * When zooming in, intervals halve (100 -> 50 -> 25) to show more detail.
 *
 * @param zoomLevel - Current zoom level (0.1 to 5.0)
 * @param config - Optional override for default configuration
 * @returns Tick intervals in canvas pixels
 */
export function calculateTickIntervals(
  zoomLevel: number,
  config?: Partial<TickIntervalConfig>
): TickIntervals {
  const { baseInterval, minScreenSpacing, minorTickRatio } = {
    ...DEFAULT_TICK_CONFIG,
    ...config,
  };

  // Calculate the target screen spacing we want (approximately 100px)
  const targetScreenSpacing = baseInterval;

  // Calculate what canvas interval would give us targetScreenSpacing on screen
  // screenSpacing = canvasInterval * zoom
  // canvasInterval = screenSpacing / zoom
  let canvasInterval = targetScreenSpacing / zoomLevel;

  // Round to nearest power of 2 relative to baseInterval
  // This keeps intervals at nice values: 25, 50, 100, 200, 400, etc.
  const ratio = canvasInterval / baseInterval;
  const power = Math.round(Math.log2(ratio));
  canvasInterval = baseInterval * Math.pow(2, power);

  // Ensure minimum screen spacing is maintained
  let screenSpacing = canvasInterval * zoomLevel;
  while (screenSpacing < minScreenSpacing) {
    canvasInterval *= 2;
    screenSpacing = canvasInterval * zoomLevel;
  }

  // Calculate minor interval
  const minorInterval = canvasInterval / minorTickRatio;

  return {
    major: canvasInterval,
    minor: minorInterval,
  };
}

/**
 * Adjust tick interval to align with grid when grid is enabled.
 * Finds nearest grid-multiple that maintains readability.
 *
 * @param interval - Calculated tick interval
 * @param gridSize - Current grid size preset (5, 8, 10, 12, 16, 20)
 * @param gridEnabled - Whether grid is visible
 * @returns Adjusted interval aligned to grid
 */
export function alignIntervalToGrid(
  interval: number,
  gridSize: GridSizePreset,
  gridEnabled: boolean
): number {
  // No adjustment when grid is disabled
  if (!gridEnabled) {
    return interval;
  }

  // Find the nearest multiple of gridSize
  const lower = Math.floor(interval / gridSize) * gridSize;
  const upper = Math.ceil(interval / gridSize) * gridSize;

  // Handle edge case where lower is 0
  if (lower <= 0) {
    return upper;
  }

  // Return whichever is closer to the original interval
  const lowerDiff = Math.abs(interval - lower);
  const upperDiff = Math.abs(interval - upper);

  return lowerDiff <= upperDiff ? lower : upper;
}
