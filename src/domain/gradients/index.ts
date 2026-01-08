export { formatStopCount, truncateGradientName } from './formatting';
export {
  createAddGradientOperation,
  createDeleteGradientOperation,
  createEditGradientNameOperation,
  createEditGradientStopsOperation,
  initGradientHistoryOperations,
  type RemovedGradientReference,
} from './historyOperations';
export {
  getColorAtPosition,
  interpolateColor,
  normalizePosition,
  sortStops,
} from './stopCalculations';
export { findGradientUsages, GRADIENT_ATTRIBUTES, type GradientUsage } from './usage';
export { type ValidationResult, validateGradientName } from './validation';
