/**
 * Search Types
 * Types for Find/Replace functionality
 */

import type { ViewCategory } from './canvas';

/**
 * Search query type determines matching behavior.
 */
export type SearchQueryType = 'class' | 'attribute' | 'global';

/**
 * Parsed search query from user input.
 */
export interface SearchQuery {
  /** Query type based on input format */
  type: SearchQueryType;
  /** Raw input term */
  term: string;
  /** Attribute name for attribute searches */
  attributeName?: string;
  /** Value to match for attribute searches */
  value?: string;
}

/**
 * Single search result representing a matched view.
 */
export interface SearchResult {
  /** Unique view ID */
  viewId: string;
  /** Display class name (e.g., "CKnob") */
  className: string;
  /** View category for filtering */
  category: ViewCategory;
  /** Path from root for display (e.g., "MainPanel > Controls > Knob1") */
  displayPath: string;
  /** Matched attribute name (for attribute searches) */
  matchedAttribute?: string;
  /** Matched attribute value (for attribute searches) */
  matchedValue?: string;
}

/**
 * Category filter options for narrowing search results.
 */
export interface CategoryFilters {
  container: boolean;
  control: boolean;
  display: boolean;
  custom: boolean;
}

/**
 * Search scope options.
 */
export type SearchScope = 'all' | 'selection';

/**
 * Panel mode determines visible controls.
 */
export type FindPanelMode = 'find' | 'replace';

/**
 * Complete search state managed by searchStore.
 */
export interface SearchState {
  /** Whether the Find panel is open */
  isOpen: boolean;
  /** Current panel mode (find or replace) */
  mode: FindPanelMode;
  /** Raw search input (before debounce) */
  rawQuery: string;
  /** Debounced/parsed query */
  parsedQuery: SearchQuery | null;
  /** Search results */
  results: SearchResult[];
  /** Index of currently selected result (for navigation) */
  currentIndex: number;
  /** Active category filters */
  categoryFilters: CategoryFilters;
  /** Search scope (all views or selection descendants) */
  scope: SearchScope;
  /** Container ID when scope is 'selection' (single container - updates when selection changes) */
  scopeContainerId: string | null;
  /** Replace value input */
  replaceValue: string;
  /** IDs of views highlighted on canvas */
  highlightedIds: Set<string>;
  /** Loading state during search */
  isSearching: boolean;
}

/**
 * Data for a single replace change (for undo/redo).
 */
export interface ReplaceChange {
  viewId: string;
  attributeName: string;
  oldValue: string;
  newValue: string;
}

/**
 * Result of a replace operation.
 */
export interface ReplaceResult {
  /** Number of replacements made */
  replacedCount: number;
  /** Number of locked views skipped */
  skippedLockedCount: number;
  /** Changes for history operation */
  changes: ReplaceChange[];
}

/**
 * Validation error for replace operations.
 */
export interface ReplaceValidationError {
  type: 'invalid-format' | 'empty-value' | 'read-only-attribute';
  message: string;
}

/**
 * Default category filters (all enabled).
 */
export const DEFAULT_CATEGORY_FILTERS: CategoryFilters = {
  container: true,
  control: true,
  display: true,
  custom: true,
};

/**
 * Initial search state.
 */
export const INITIAL_SEARCH_STATE: SearchState = {
  isOpen: false,
  mode: 'find',
  rawQuery: '',
  parsedQuery: null,
  results: [],
  currentIndex: -1,
  categoryFilters: { ...DEFAULT_CATEGORY_FILTERS },
  scope: 'all',
  scopeContainerId: null,
  replaceValue: '',
  highlightedIds: new Set(),
  isSearching: false,
};

/**
 * Debounce delay for search input (milliseconds).
 */
export const SEARCH_DEBOUNCE_MS = 150;

/**
 * Maximum results to display before virtual scrolling.
 */
export const MAX_VISIBLE_RESULTS = 100;
