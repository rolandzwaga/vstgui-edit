/**
 * Search Domain Module
 * Exports search query parsing, search engine, and replace operations.
 */

// Query parsing
export {
  parseSearchQuery,
  isClassNameLike,
  escapeSearchTerm,
  unescapeValue,
  CLASS_PREFIXES,
} from './searchQuery';

// Search engine
export {
  prepareViewForSearch,
  matchesQuery,
  passesCategoryFilter,
  isDescendantOf,
  executeSearch,
  buildDisplayPath,
} from './searchEngine';
export type { SearchableView } from './searchEngine';

// Replace operations
export {
  validateReplaceValue,
  replaceAttribute,
  replaceAll,
  READ_ONLY_ATTRIBUTES,
} from './replaceOperations';

// History operations
export { createReplaceOperation, createReplaceAllOperation } from './historyOperations';
