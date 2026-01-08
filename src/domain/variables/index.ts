export {
  createAddVariableOperation,
  createDeleteVariableOperation,
  createEditVariableNameOperation,
  createEditVariableValueOperation,
  initVariableHistoryOperations,
  type RemovedVariableReference,
} from './historyOperations';
export { findVariableUsages, VARIABLE_REFERENCE_PATTERN, type VariableUsage } from './usage';
export {
  generateUniqueVariableName,
  type ValidationResult,
  validateVariableName,
} from './validation';
