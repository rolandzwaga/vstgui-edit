/**
 * Alignment Domain Module
 *
 * Provides alignment and distribution functionality for views.
 */

// Bounds calculation
export {
  calculateParentBounds,
  calculateSelectionBounds,
  viewToBounds,
} from './calculateBounds';

// Alignment functions
export {
  alignViews,
  calculateAlignedPosition,
  getAlignmentReference,
} from './alignViews';

// Distribution functions
export { calculateEqualGap, distributeViews } from './distributeViews';

// History operations
export {
  createAlignmentOperation,
  getAlignmentDescription,
  getDistributionDescription,
} from './historyOperations';

// Keyboard shortcuts
export { handleAlignmentShortcut } from './shortcuts';
