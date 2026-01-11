/**
 * Store Contract: searchStore
 *
 * Complete API specification for the search store.
 */

import type {
  CategoryFilters,
  FindPanelMode,
  SearchQuery,
  SearchResult,
  SearchScope,
} from '../../../src/types/search';

// =============================================================================
// Reactive Store Interface
// =============================================================================

/**
 * Reactive store object with getter properties.
 * All properties are signals that trigger reactivity when accessed.
 */
export interface SearchStoreState {
  /** Whether the Find panel is currently open */
  readonly isOpen: boolean;

  /** Current panel mode (find or replace) */
  readonly mode: FindPanelMode;

  /** Raw search query input (updates immediately on input) */
  readonly rawQuery: string;

  /** Parsed query after debounce (null if empty or invalid) */
  readonly parsedQuery: SearchQuery | null;

  /** Array of search results */
  readonly results: SearchResult[];

  /** Index of currently selected result (-1 if none) */
  readonly currentIndex: number;

  /** Active category filters */
  readonly categoryFilters: CategoryFilters;

  /** Search scope (all or within selection) */
  readonly scope: SearchScope;

  /** Container ID when scope is 'selection' (single container - updates when selection changes) */
  readonly scopeContainerId: string | null;

  /** Replace value input */
  readonly replaceValue: string;

  /** Set of view IDs to highlight on canvas */
  readonly highlightedIds: Set<string>;

  /** Whether search is currently executing */
  readonly isSearching: boolean;

  // --- Computed properties ---

  /** Total number of results */
  readonly resultCount: number;

  /** Whether there are any results */
  readonly hasResults: boolean;

  /** Currently selected result (null if none) */
  readonly currentResult: SearchResult | null;
}

// =============================================================================
// Action Functions
// =============================================================================

/**
 * Open the Find panel in find mode.
 * Focuses the search input.
 * Remembers previous query if any.
 */
export function openFindPanel(): void;

/**
 * Open the Find panel in replace mode.
 * Focuses the search input.
 */
export function openReplacePanel(): void;

/**
 * Close the Find panel.
 * Clears highlights but preserves query for next open.
 */
export function closeFindPanel(): void;

/**
 * Toggle Find panel open/closed.
 * Opens in find mode if closed.
 */
export function toggleFindPanel(): void;

/**
 * Set the raw search query.
 * Does not trigger search - use with debounced handler.
 *
 * @param query - Raw input string
 */
export function setRawQuery(query: string): void;

/**
 * Set parsed query and trigger search.
 * Called by debounced input handler.
 *
 * @param query - Parsed SearchQuery or null
 */
export function setParsedQuery(query: SearchQuery | null): void;

/**
 * Set search results and update highlights.
 *
 * @param results - Array of SearchResult
 */
export function setSearchResults(results: SearchResult[]): void;

/**
 * Navigate to the next result.
 * Wraps from last to first.
 */
export function navigateToNext(): void;

/**
 * Navigate to the previous result.
 * Wraps from first to last.
 */
export function navigateToPrevious(): void;

/**
 * Select result at specific index.
 * Also selects the view on canvas and pans if needed.
 *
 * @param index - Result index (0-based)
 */
export function selectResultAtIndex(index: number): void;

/**
 * Set category filter enabled state.
 *
 * @param category - Category key
 * @param enabled - Whether to include category
 */
export function setCategoryFilter(
  category: keyof CategoryFilters,
  enabled: boolean
): void;

/**
 * Toggle all category filters on/off.
 *
 * @param enabled - Whether all categories should be enabled
 */
export function setAllCategoryFilters(enabled: boolean): void;

/**
 * Set search scope.
 *
 * @param scope - 'all' or 'selection'
 * @param containerId - Container ID when scope is 'selection'
 */
export function setSearchScope(scope: SearchScope, containerId?: string): void;

/**
 * Set panel mode (find or replace).
 *
 * @param mode - Panel mode
 */
export function setMode(mode: FindPanelMode): void;

/**
 * Set replace value input.
 *
 * @param value - Replacement value
 */
export function setReplaceValue(value: string): void;

/**
 * Update highlighted view IDs on canvas.
 *
 * @param ids - Set of view IDs to highlight
 */
export function updateHighlightedIds(ids: Set<string>): void;

/**
 * Clear all search highlights from canvas.
 */
export function clearHighlights(): void;

/**
 * Set searching state (for loading indicator).
 *
 * @param isSearching - Whether search is in progress
 */
export function setIsSearching(isSearching: boolean): void;

/**
 * Reset store to initial state.
 * Called when loading new document.
 */
export function resetSearchStore(): void;

// =============================================================================
// Integration Hooks
// =============================================================================

/**
 * Hook for keyboard shortcut handling.
 * Call from Editor component's keydown handler.
 *
 * @param event - Keyboard event
 * @returns true if event was handled
 */
export function handleSearchKeyboard(event: KeyboardEvent): boolean;

/**
 * Execute search with current query and filters.
 * Called after debounce delay.
 *
 * @param views - Flat array of views to search
 * @param getAttributes - Function to get view attributes
 */
export function executeSearch(
  views: Array<{ id: string; className: string; parentId: string | null }>,
  getAttributes: (viewId: string) => Record<string, string>
): void;

// =============================================================================
// Usage Example
// =============================================================================

/**
 * @example
 * ```typescript
 * // In Editor component
 * const handleKeyDown = (e: KeyboardEvent) => {
 *   if (handleSearchKeyboard(e)) return;
 *   // ... other keyboard handlers
 * };
 *
 * // In FindPanel component
 * <Show when={searchStore.isOpen}>
 *   <SearchInput
 *     value={searchStore.rawQuery}
 *     onInput={setRawQuery}
 *     onDebouncedInput={(query) => {
 *       const parsed = parseSearchQuery(query);
 *       setParsedQuery(parsed);
 *       executeSearch(views, getAttributes);
 *     }}
 *   />
 *   <ResultsList
 *     results={searchStore.results}
 *     currentIndex={searchStore.currentIndex}
 *     onSelect={selectResultAtIndex}
 *   />
 * </Show>
 *
 * // In Canvas component
 * <For each={[...searchStore.highlightedIds]}>
 *   {(viewId) => <SearchHighlight viewId={viewId} />}
 * </For>
 * ```
 */
