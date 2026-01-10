/**
 * Guide Domain Utilities
 * Barrel exports for custom guide functionality
 */

// Guide operations (CRUD)
export {
  MAX_GUIDES,
  GUIDE_HIT_TOLERANCE,
  generateGuideId,
  roundGuidePosition,
  createGuide,
  guideExistsAtPosition,
  findGuideByPosition,
  addGuideToCollection,
  removeGuideFromCollection,
  updateGuidePosition,
  canAddGuide,
  getHorizontalGuides,
  getVerticalGuides,
  sortGuidesByPosition,
} from './guideOperations';

// History operations
export {
  GUIDE_CREATE_TYPE,
  GUIDE_DELETE_TYPE,
  GUIDE_REPOSITION_TYPE,
  GUIDE_CLEAR_ALL_TYPE,
  formatGuideCreateDescription,
  formatGuideDeleteDescription,
  formatGuideRepositionDescription,
  formatGuideClearAllDescription,
  createGuideCreateOperation,
  createGuideDeleteOperation,
  createGuideRepositionOperation,
  createGuideClearAllOperation,
} from './historyOperations';

// Guide snap functions
export {
  filterGuidesByOrientation,
  findClosestGuide,
  snapToGuide,
  snapToNearest,
  snapPointWithGuides,
  snapEdgesWithGuides,
  applySnapToMoveWithGuides,
  applySnapToResizeWithGuides,
} from './guideSnap';

// Re-export types for snap results
export type {
  SnapPointWithGuidesResult,
  ApplySnapToMoveWithGuidesResult,
  ApplySnapToResizeWithGuidesResult,
} from './guideSnap';
