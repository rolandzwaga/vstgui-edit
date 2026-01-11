/**
 * Search Domain Module
 * Exports search query parsing, search engine, and replace operations.
 */

// History operations
export { createReplaceAllOperation, createReplaceOperation } from './historyOperations';
// Replace operations
export {
  READ_ONLY_ATTRIBUTES,
  replaceAll,
  replaceAttribute,
  validateReplaceValue,
} from './replaceOperations';
export type { SearchableView } from './searchEngine';
// Search engine
export {
  buildDisplayPath,
  executeSearch,
  isDescendantOf,
  matchesQuery,
  passesCategoryFilter,
  prepareViewForSearch,
} from './searchEngine';
// Query parsing
export {
  CLASS_PREFIXES,
  escapeSearchTerm,
  isClassNameLike,
  parseSearchQuery,
  unescapeValue,
} from './searchQuery';

// Keyboard shortcuts
export { handleSearchShortcut } from './shortcuts';
