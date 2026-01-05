/**
 * Canvas Domain Module
 *
 * Renderer-agnostic utilities for transforming uidesc view data
 * into renderable structures.
 */

// Coordinate parsing
export { parsePoint, parseSize } from './coordinates';

// Hierarchy flattening
export { flattenHierarchy } from './flattenHierarchy';

// Label formatting
export { formatLabel } from './labelFormat';

// View category classification
export {
  CONTAINER_CLASSES,
  CONTROL_CLASSES,
  DISPLAY_CLASSES,
  getViewCategory,
} from './viewCategory';
