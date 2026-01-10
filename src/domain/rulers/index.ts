/**
 * Ruler Domain Utilities
 *
 * Pure functions for ruler calculations including tick intervals,
 * tick generation, and coordinate mapping.
 */

// Type re-exports
export type {
  GridSizePreset,
  TickIntervalConfig,
  TickIntervals,
  TickMark,
  VisibleRange,
} from '../../types/ruler';
// coordinateMapping.ts exports
export {
  calculateTemplateBoundsPosition,
  canvasToScreenPosition,
  RULER_THICKNESS,
  screenToCanvasCoordinates,
  screenToCanvasPosition,
} from './coordinateMapping';
// tickCalculation.ts exports
export {
  alignIntervalToGrid,
  calculateTickIntervals,
  DEFAULT_TICK_CONFIG,
} from './tickCalculation';
// tickGeneration.ts exports
export { calculateVisibleRange, formatTickLabel, generateTicks } from './tickGeneration';
