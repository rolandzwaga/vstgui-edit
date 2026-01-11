/**
 * Search Store - Find/Replace state management.
 *
 * Uses SolidJS signals for reactive state with fine-grained updates.
 * Manages search panel visibility, query, results, navigation, and filters.
 */
import { createSignal } from 'solid-js';
import type {
  CategoryFilters,
  FindPanelMode,
  SearchQuery,
  SearchResult,
  SearchScope,
  TemplateScope,
} from '../types/search';
import { DEFAULT_CATEGORY_FILTERS } from '../types/search';
import { setActiveTemplate, templateStore } from './templateStore';

// --- Signals for search state ---

const [isOpen, setIsOpen] = createSignal(false);
const [mode, setModeSignal] = createSignal<FindPanelMode>('find');
const [rawQuery, setRawQuerySignal] = createSignal('');
const [parsedQuery, setParsedQuerySignal] = createSignal<SearchQuery | null>(null);
const [results, setResultsSignal] = createSignal<SearchResult[]>([]);
const [currentIndex, setCurrentIndex] = createSignal(-1);
const [categoryFilters, setCategoryFiltersSignal] = createSignal<CategoryFilters>({
  ...DEFAULT_CATEGORY_FILTERS,
});
const [scope, setScopeSignal] = createSignal<SearchScope>('all');
const [scopeContainerId, setScopeContainerId] = createSignal<string | null>(null);
const [templateScope, setTemplateScopeSignal] = createSignal<TemplateScope>('current');
const [replaceValue, setReplaceValueSignal] = createSignal('');
const [highlightedIds, setHighlightedIds] = createSignal<Set<string>>(new Set());
const [isSearching, setIsSearchingSignal] = createSignal(false);

// --- Reactive store object ---

/**
 * Reactive search store exposing search state.
 * Access values as getters (they are signals).
 */
export const searchStore = {
  get isOpen() {
    return isOpen();
  },
  get mode() {
    return mode();
  },
  get rawQuery() {
    return rawQuery();
  },
  get parsedQuery() {
    return parsedQuery();
  },
  get results() {
    return results();
  },
  get currentIndex() {
    return currentIndex();
  },
  get categoryFilters() {
    return categoryFilters();
  },
  get scope() {
    return scope();
  },
  get scopeContainerId() {
    return scopeContainerId();
  },
  get templateScope() {
    return templateScope();
  },
  get replaceValue() {
    return replaceValue();
  },
  get highlightedIds() {
    return highlightedIds();
  },
  get isSearching() {
    return isSearching();
  },
  get resultCount() {
    return results().length;
  },
  get hasResults() {
    return results().length > 0;
  },
  get currentResult(): SearchResult | null {
    const idx = currentIndex();
    const r = results();
    return idx >= 0 && idx < r.length ? r[idx] : null;
  },
};

// --- Actions ---

/**
 * Open the Find panel in find mode.
 * Focuses the search input.
 * Remembers previous query if any.
 */
export function openFindPanel(): void {
  setIsOpen(true);
  setModeSignal('find');
}

/**
 * Open the Find panel in replace mode.
 * Focuses the search input.
 */
export function openReplacePanel(): void {
  setIsOpen(true);
  setModeSignal('replace');
}

/**
 * Close the Find panel.
 * Clears highlights but preserves query for next open.
 */
export function closeFindPanel(): void {
  setIsOpen(false);
  clearHighlights();
}

/**
 * Toggle Find panel open/closed.
 * Opens in find mode if closed.
 */
export function toggleFindPanel(): void {
  if (isOpen()) {
    closeFindPanel();
  } else {
    openFindPanel();
  }
}

/**
 * Set the raw search query.
 * Does not trigger search - use with debounced handler.
 *
 * @param query - Raw input string
 */
export function setRawQuery(query: string): void {
  setRawQuerySignal(query);
}

/**
 * Set parsed query and trigger search.
 * Called by debounced input handler.
 *
 * @param query - Parsed SearchQuery or null
 */
export function setParsedQuery(query: SearchQuery | null): void {
  setParsedQuerySignal(query);
}

/**
 * Set search results and update highlights.
 *
 * @param newResults - Array of SearchResult
 */
export function setSearchResults(newResults: SearchResult[]): void {
  setResultsSignal(newResults);
  // Reset current index when results change
  setCurrentIndex(newResults.length > 0 ? 0 : -1);
  // Update highlights with all result view IDs
  const ids = new Set(newResults.map(r => r.viewId));
  setHighlightedIds(ids);
}

/**
 * Navigate to the next result.
 * Wraps from last to first.
 */
export function navigateToNext(): void {
  const r = results();
  if (r.length === 0) return;

  const idx = currentIndex();
  const nextIdx = idx >= r.length - 1 ? 0 : idx + 1;
  setCurrentIndex(nextIdx);
}

/**
 * Navigate to the previous result.
 * Wraps from first to last.
 */
export function navigateToPrevious(): void {
  const r = results();
  if (r.length === 0) return;

  const idx = currentIndex();
  const prevIdx = idx <= 0 ? r.length - 1 : idx - 1;
  setCurrentIndex(prevIdx);
}

/**
 * Select result at specific index.
 * Also selects the view on canvas and pans if needed.
 * Switches to the result's template if it's from a different template.
 *
 * @param index - Result index (0-based)
 */
export function selectResultAtIndex(index: number): void {
  const r = results();
  if (index < 0 || index >= r.length) return;

  const selectedResult = r[index];

  // Switch template if the result is from a different template
  if (selectedResult.templateId && selectedResult.templateId !== templateStore.activeTemplateId) {
    setActiveTemplate(selectedResult.templateId);
  }

  setCurrentIndex(index);
}

/**
 * Set category filter enabled state.
 *
 * @param category - Category key
 * @param enabled - Whether to include category
 */
export function setCategoryFilter(category: keyof CategoryFilters, enabled: boolean): void {
  setCategoryFiltersSignal(prev => ({
    ...prev,
    [category]: enabled,
  }));
}

/**
 * Toggle all category filters on/off.
 *
 * @param enabled - Whether all categories should be enabled
 */
export function setAllCategoryFilters(enabled: boolean): void {
  setCategoryFiltersSignal({
    container: enabled,
    control: enabled,
    display: enabled,
    custom: enabled,
  });
}

/**
 * Set search scope.
 *
 * @param newScope - 'all' or 'selection'
 * @param containerId - Container ID when scope is 'selection'
 */
export function setSearchScope(newScope: SearchScope, containerId?: string): void {
  setScopeSignal(newScope);
  setScopeContainerId(containerId ?? null);
}

/**
 * Set template scope (current template or all templates).
 * Clears existing results and highlights when changed.
 *
 * @param newScope - 'current' or 'all'
 */
export function setTemplateScope(newScope: TemplateScope): void {
  setTemplateScopeSignal(newScope);
  // Clear results and highlights when scope changes - new search will be triggered
  setResultsSignal([]);
  setCurrentIndex(-1);
  setHighlightedIds(new Set<string>());
}

/**
 * Set panel mode (find or replace).
 *
 * @param newMode - Panel mode
 */
export function setMode(newMode: FindPanelMode): void {
  setModeSignal(newMode);
}

/**
 * Set replace value input.
 *
 * @param value - Replacement value
 */
export function setReplaceValue(value: string): void {
  setReplaceValueSignal(value);
}

/**
 * Update highlighted view IDs on canvas.
 *
 * @param ids - Set of view IDs to highlight
 */
export function updateHighlightedIds(ids: Set<string>): void {
  setHighlightedIds(ids);
}

/**
 * Clear all search highlights from canvas.
 */
export function clearHighlights(): void {
  setHighlightedIds(new Set<string>());
}

/**
 * Set searching state (for loading indicator).
 *
 * @param searching - Whether search is in progress
 */
export function setIsSearching(searching: boolean): void {
  setIsSearchingSignal(searching);
}

/**
 * Reset store to initial state.
 * Called when loading new document.
 */
export function resetSearchStore(): void {
  setIsOpen(false);
  setModeSignal('find');
  setRawQuerySignal('');
  setParsedQuerySignal(null);
  setResultsSignal([]);
  setCurrentIndex(-1);
  setCategoryFiltersSignal({ ...DEFAULT_CATEGORY_FILTERS });
  setScopeSignal('all');
  setScopeContainerId(null);
  setTemplateScopeSignal('current');
  setReplaceValueSignal('');
  setHighlightedIds(new Set<string>());
  setIsSearchingSignal(false);
}
