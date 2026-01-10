/**
 * Guide Domain Utilities
 * Barrel exports for custom guide functionality
 */

// Guide operations (CRUD)
export {
  addGuideToCollection,
  canAddGuide,
  createGuide,
  findGuideByPosition,
  GUIDE_HIT_TOLERANCE,
  generateGuideId,
  getHorizontalGuides,
  getVerticalGuides,
  guideExistsAtPosition,
  MAX_GUIDES,
  removeGuideFromCollection,
  roundGuidePosition,
  sortGuidesByPosition,
  updateGuidePosition,
} from './guideOperations';
// Re-export types for snap results
export type {
  ApplySnapToMoveWithGuidesResult,
  ApplySnapToResizeWithGuidesResult,
  SnapPointWithGuidesResult,
} from './guideSnap';

// Guide snap functions
export {
  applySnapToMoveWithGuides,
  applySnapToResizeWithGuides,
  filterGuidesByOrientation,
  findClosestGuide,
  snapEdgesWithGuides,
  snapPointWithGuides,
  snapToGuide,
  snapToNearest,
} from './guideSnap';
// History operations
export {
  createGuideClearAllOperation,
  createGuideCreateOperation,
  createGuideDeleteOperation,
  createGuideRepositionOperation,
  formatGuideClearAllDescription,
  formatGuideCreateDescription,
  formatGuideDeleteDescription,
  formatGuideRepositionDescription,
  GUIDE_CLEAR_ALL_TYPE,
  GUIDE_CREATE_TYPE,
  GUIDE_DELETE_TYPE,
  GUIDE_REPOSITION_TYPE,
} from './historyOperations';
