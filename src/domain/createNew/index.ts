/**
 * Create New uidesc feature - domain exports
 */

// Types re-exported from types module
export type {
  ContainerClass,
  NewDocumentConfig,
  DimensionValidationResult,
  CreateNewDialogProps,
} from '../../types/createNew';

export {
  CONTAINER_CLASSES,
  DEFAULT_CONFIG,
  DIMENSION_CONSTRAINTS,
} from '../../types/createNew';

// Validation functions
export { validateDimension, validateDimensions, areDimensionsValid } from './validation';

// Document factory
export {
  createDocument,
  DEFAULT_TEMPLATE_NAME,
  DEFAULT_ORIGIN,
  DEFAULT_BACKGROUND_COLOR,
} from './documentFactory';
