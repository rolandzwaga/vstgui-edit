/**
 * Canvas Domain Module
 *
 * Renderer-agnostic utilities for transforming uidesc view data
 * into renderable structures.
 */

// Ancestor traversal
export { getAncestorIds, isAncestorOfSelected } from './ancestors';
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
// View category classification
export {
  CONTAINER_CLASSES,
  CONTROL_CLASSES,
  DISPLAY_CLASSES,
  getViewCategory,
} from './viewCategory';
// Marquee selection utilities
export {
  findIntersectingViews,
  isMinimumSize,
  MIN_MARQUEE_SIZE,
  normalizeRect,
  rectIntersect,
} from './marquee';
