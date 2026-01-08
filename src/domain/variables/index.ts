export {
  createAddVariableOperation,
  createDeleteVariableOperation,
  createEditVariableNameOperation,
  createEditVariableValueOperation,
  initVariableHistoryOperations,
  type RemovedVariableReference,
} from './historyOperations';
export { VARIABLE_REFERENCE_PATTERN, type VariableUsage, findVariableUsages } from './usage';
export {
  generateUniqueVariableName,
  type ValidationResult,
  validateVariableName,
} from './validation';
