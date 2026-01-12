/**
 * Create New uidesc feature - domain exports
 */

// Types re-exported from types module
export type {
  ContainerClass,
  CreateNewDialogProps,
  DimensionValidationResult,
  NewDocumentConfig,
} from '../../types/createNew';

export {
  CONTAINER_CLASSES,
  DEFAULT_CONFIG,
  DIMENSION_CONSTRAINTS,
} from '../../types/createNew';
// Document factory
export {
  createDocument,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_ORIGIN,
  DEFAULT_TEMPLATE_NAME,
} from './documentFactory';
// Validation functions
export { areDimensionsValid, validateDimension, validateDimensions } from './validation';
