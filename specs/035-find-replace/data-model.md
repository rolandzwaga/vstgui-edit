# Data Model: Find/Replace

**Date**: 2026-01-11

## Type Definitions

### src/types/search.ts

```typescript
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
```

## State Management

### src/stores/searchStore.ts

```typescript
import { createSignal } from 'solid-js';
import type {
  CategoryFilters,
  FindPanelMode,
  SearchQuery,
  SearchResult,
  SearchScope,
  SearchState,
} from '../types/search';
import { DEFAULT_CATEGORY_FILTERS, INITIAL_SEARCH_STATE } from '../types/search';

// --- Signals ---

const [isOpen, setIsOpen] = createSignal(false);
const [mode, setMode] = createSignal<FindPanelMode>('find');
const [rawQuery, setRawQuery] = createSignal('');
const [parsedQuery, setParsedQuery] = createSignal<SearchQuery | null>(null);
const [results, setResults] = createSignal<SearchResult[]>([]);
const [currentIndex, setCurrentIndex] = createSignal(-1);
const [categoryFilters, setCategoryFilters] = createSignal<CategoryFilters>({
  ...DEFAULT_CATEGORY_FILTERS,
});
const [scope, setScope] = createSignal<SearchScope>('all');
const [scopeContainerId, setScopeContainerId] = createSignal<string | null>(null);
const [replaceValue, setReplaceValue] = createSignal('');
const [highlightedIds, setHighlightedIds] = createSignal<Set<string>>(new Set());
const [isSearching, setIsSearching] = createSignal(false);

// --- Reactive Store ---

export const searchStore = {
  get isOpen() { return isOpen(); },
  get mode() { return mode(); },
  get rawQuery() { return rawQuery(); },
  get parsedQuery() { return parsedQuery(); },
  get results() { return results(); },
  get currentIndex() { return currentIndex(); },
  get categoryFilters() { return categoryFilters(); },
  get scope() { return scope(); },
  get scopeContainerId() { return scopeContainerId(); },
  get replaceValue() { return replaceValue(); },
  get highlightedIds() { return highlightedIds(); },
  get isSearching() { return isSearching(); },
  get resultCount() { return results().length; },
  get hasResults() { return results().length > 0; },
  get currentResult(): SearchResult | null {
    const idx = currentIndex();
    const r = results();
    return idx >= 0 && idx < r.length ? r[idx] : null;
  },
};

// --- Actions ---

export function openFindPanel(): void;
export function openReplacePanel(): void;
export function closeFindPanel(): void;
export function toggleFindPanel(): void;
export function setSearchQuery(query: string): void;
export function setSearchResults(results: SearchResult[]): void;
export function navigateToNext(): void;
export function navigateToPrevious(): void;
export function selectResultAtIndex(index: number): void;
export function setCategoryFilter(category: keyof CategoryFilters, enabled: boolean): void;
export function setSearchScope(scope: SearchScope, containerId?: string): void;
export function setReplaceValue(value: string): void;
export function updateHighlightedIds(ids: Set<string>): void;
export function clearHighlights(): void;
export function resetSearchStore(): void;
```

## Entity Relationships

```
SearchState (searchStore)
    |
    ├── SearchQuery (parsed from rawQuery)
    |       ├── type: 'class' | 'attribute' | 'global'
    |       ├── term: string
    |       └── attributeName/value (for attribute type)
    |
    ├── SearchResult[] (from searchEngine)
    |       ├── viewId → links to documentStore view
    |       ├── className
    |       ├── category → links to viewCategory
    |       └── matchedAttribute/Value (for attribute searches)
    |
    ├── CategoryFilters
    |       └── container/control/display/custom toggles
    |
    └── highlightedIds → Set<string> (viewIds for canvas overlay)

documentStore
    └── getView(viewId) → ViewNode (source of attributes)
    └── updateViewAttribute() → for replace operations

selectionStore
    └── select(viewId) → selects result on canvas

canvasStore
    └── panOffset/zoomLevel → for scrolling to result

historyStore
    └── pushOperation() → for undo/redo of replace

lockHideStore
    └── isLocked(viewId) → skip in replace
```

## Domain Functions

### src/domain/search/searchQuery.ts

```typescript
import type { SearchQuery, SearchQueryType } from '../../types/search';

/**
 * Known VSTGUI class prefixes for class detection.
 */
export const CLASS_PREFIXES = ['C', 'UI'];

/**
 * Parse raw search input into structured query.
 */
export function parseSearchQuery(input: string): SearchQuery;

/**
 * Determine if input looks like a class name search.
 */
export function isClassNameLike(input: string): boolean;

/**
 * Escape special characters in search term.
 */
export function escapeSearchTerm(term: string): string;

/**
 * Unescape special characters (e.g., \: -> :).
 */
export function unescapeValue(value: string): string;
```

### src/domain/search/searchEngine.ts

```typescript
import type { CategoryFilters, SearchQuery, SearchResult } from '../../types/search';
import type { RenderableView } from '../../types/canvas';

/**
 * View data prepared for searching.
 */
export interface SearchableView {
  id: string;
  className: string;
  category: ViewCategory;
  attributes: Record<string, string>;
  parentPath: string;
}

/**
 * Convert RenderableView to SearchableView.
 */
export function prepareViewForSearch(
  view: RenderableView,
  attributes: Record<string, string>,
  parentPath: string
): SearchableView;

/**
 * Check if view matches query.
 */
export function matchesQuery(view: SearchableView, query: SearchQuery): boolean;

/**
 * Check if view passes category filter.
 */
export function passesCategoryFilter(
  view: SearchableView,
  filters: CategoryFilters
): boolean;

/**
 * Check if view is descendant of container.
 */
export function isDescendantOf(viewId: string, containerId: string): boolean;

/**
 * Execute search across views.
 */
export function executeSearch(
  views: SearchableView[],
  query: SearchQuery,
  filters: CategoryFilters,
  scope: { type: 'all' } | { type: 'selection'; containerId: string }
): SearchResult[];
```

### src/domain/search/replaceOperations.ts

```typescript
import type { ReplaceChange, ReplaceResult, ReplaceValidationError } from '../../types/search';

/**
 * Attributes that cannot be replaced (read-only).
 */
export const READ_ONLY_ATTRIBUTES = ['class'];

/**
 * Validate replacement value for attribute type.
 */
export function validateReplaceValue(
  attributeName: string,
  value: string
): ReplaceValidationError | null;

/**
 * Execute replacement on single view.
 */
export function replaceAttribute(
  viewId: string,
  attributeName: string,
  newValue: string,
  isLockedFn: (id: string) => boolean,
  updateFn: (viewId: string, attr: string, value: string) => string | null
): ReplaceChange | null;

/**
 * Execute replacement on all matching views.
 */
export function replaceAll(
  viewIds: string[],
  attributeName: string,
  newValue: string,
  isLockedFn: (id: string) => boolean,
  getAttributeFn: (viewId: string, attr: string) => string | undefined,
  updateFn: (viewId: string, attr: string, value: string) => void
): ReplaceResult;
```

### src/domain/search/historyOperations.ts

```typescript
import type { HistoryOperation } from '../../types/history';
import type { ReplaceChange } from '../../types/search';

/**
 * Create history operation for single replace.
 */
export function createReplaceOperation(
  change: ReplaceChange,
  updateFn: (viewId: string, attr: string, value: string) => void
): HistoryOperation;

/**
 * Create history operation for replace all.
 */
export function createReplaceAllOperation(
  changes: ReplaceChange[],
  updateFn: (viewId: string, attr: string, value: string) => void
): HistoryOperation;
```

## State Transitions

### Panel Open/Close

```
[Closed] --Ctrl+F--> [Open:Find]
[Closed] --Ctrl+Shift+F--> [Open:Replace]
[Open:Find] --Ctrl+Shift+F--> [Open:Replace]
[Open:Replace] --Ctrl+F--> [Open:Find]
[Open:*] --Escape--> [Closed]
```

### Search Flow

```
[Idle] --input change--> [Debouncing]
[Debouncing] --150ms elapsed--> [Searching]
[Searching] --results--> [Results:N]
[Results:N] --click result--> [Results:N, currentIndex=i]
[Results:N] --F3--> [Results:N, currentIndex++]
[Results:N] --Shift+F3--> [Results:N, currentIndex--]
[Results:N] --wrap--> [Results:N, currentIndex=0 or N-1]
```

### Replace Flow

```
[Results:N] --click Replace--> [Replacing]
[Replacing] --validate--> [Valid] | [Invalid:Error]
[Valid] --apply--> [Replaced, pushHistory]
[Replaced] --Ctrl+Z--> [Undone, results refresh]
[Results:N] --click Replace All--> [Replacing All]
[Replacing All] --apply batch--> [Replaced N, pushHistory]
```

## Canvas Highlighting Integration

The `highlightedIds` signal contains view IDs to highlight on canvas while Find panel is open.

```typescript
// In Canvas component
const searchHighlights = () => searchStore.highlightedIds;

// Render additional highlight overlays
<For each={[...searchHighlights()]}>
  {(viewId) => {
    const view = viewMap().get(viewId);
    if (!view) return null;
    return (
      <SearchHighlight
        x={view.absoluteX}
        y={view.absoluteY}
        width={view.width}
        height={view.height}
        isCurrent={viewId === searchStore.currentResult?.viewId}
      />
    );
  }}
</For>
```
