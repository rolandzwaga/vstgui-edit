/**
 * Canvas Domain Module
 *
 * Renderer-agnostic utilities for transforming uidesc view data
 * into renderable structures.
 */

// Ancestor traversal
export { getAncestorIds, isAncestorOfSelected } from './ancestors';
// Axis constraint utilities
export {
  AXIS_LOCK_THRESHOLD,
  constrainDelta,
  determineConstraintAxis,
} from './constrainAxis';
// Coordinate parsing
export { parsePoint, parseSize } from './coordinates';
// Hierarchy flattening
export { flattenHierarchy } from './flattenHierarchy';
// Grid utilities
export {
  calculateLineCount,
  getPatternId,
  isMajorLine,
  isValidGridSize,
} from './grid';
// Label formatting
export { formatLabel } from './labelFormat';
// Marquee selection utilities
export {
  findIntersectingViews,
  isMinimumSize,
  MIN_MARQUEE_SIZE,
  normalizeRect,
  rectIntersect,
} from './marquee';
// Move utilities
export {
  applyDelta,
  applyDeltaToAll,
  calculateDelta,
  formatOrigin,
} from './move';
// Resize utilities
export {
  calculateResizeBounds,
  clampToMinimumSize,
  createResizeOperation,
  formatSize,
} from './resize';
// Snap-to-grid utilities
export {
  getEffectiveThreshold,
  snapEdges,
  snapPoint,
  snapToGrid,
  type ViewBounds,
} from './snap';
// View category classification
export {
  CONTAINER_CLASSES,
  CONTROL_CLASSES,
  DISPLAY_CLASSES,
  getViewCategory,
} from './viewCategory';
