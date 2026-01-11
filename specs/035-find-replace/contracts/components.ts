/**
 * Component Contracts: Find/Replace
 *
 * TypeScript interfaces for all new components.
 * These serve as the contract between components.
 */

import type { Component, JSX } from 'solid-js';
import type {
  CategoryFilters,
  FindPanelMode,
  SearchResult,
  SearchScope,
} from '../../../src/types/search';

// =============================================================================
// FindPanel - Main container component
// =============================================================================

export interface FindPanelProps {
  /** Initial mode when opening */
  initialMode?: FindPanelMode;
  /** Called when panel requests close */
  onClose?: () => void;
}

/**
 * FindPanel component.
 *
 * Main floating panel containing search input, results list, and controls.
 * Positioned at top-right of editor viewport (VS Code style).
 *
 * @example
 * <FindPanel initialMode="find" onClose={handleClose} />
 */
export type FindPanelComponent = Component<FindPanelProps>;

// =============================================================================
// SearchInput - Debounced text input
// =============================================================================

export interface SearchInputProps {
  /** Current input value */
  value: string;
  /** Called immediately on input change */
  onInput: (value: string) => void;
  /** Called after debounce delay */
  onDebouncedInput: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in ms (default: 150) */
  debounceMs?: number;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Accessible label */
  'aria-label'?: string;
}

/**
 * SearchInput component.
 *
 * Text input with debounced onChange for performance.
 * Supports keyboard shortcuts (Enter, Escape, F3).
 *
 * @example
 * <SearchInput
 *   value={query()}
 *   onInput={setRawQuery}
 *   onDebouncedInput={executeSearch}
 *   placeholder="Search views..."
 * />
 */
export type SearchInputComponent = Component<SearchInputProps>;

// =============================================================================
// ResultsList - Scrollable list with keyboard navigation
// =============================================================================

export interface ResultsListProps {
  /** Search results to display */
  results: SearchResult[];
  /** Currently selected index */
  currentIndex: number;
  /** Called when result is clicked */
  onSelect: (index: number) => void;
  /** Called when navigating with keyboard */
  onNavigate: (direction: 'up' | 'down') => void;
  /** Maximum visible results before scrolling */
  maxVisible?: number;
  /** Empty state message */
  emptyMessage?: string;
}

/**
 * ResultsList component.
 *
 * Scrollable list of search results with keyboard navigation.
 * Supports Arrow Up/Down for navigation, Enter for selection.
 *
 * @example
 * <ResultsList
 *   results={searchStore.results}
 *   currentIndex={searchStore.currentIndex}
 *   onSelect={selectResult}
 *   onNavigate={handleNavigate}
 * />
 */
export type ResultsListComponent = Component<ResultsListProps>;

// =============================================================================
// ResultItem - Single result row
// =============================================================================

export interface ResultItemProps {
  /** Search result data */
  result: SearchResult;
  /** Whether this result is currently selected */
  isSelected: boolean;
  /** Called when clicked */
  onClick: () => void;
}

/**
 * ResultItem component.
 *
 * Single row in results list showing class name, path, and matched attribute.
 *
 * @example
 * <ResultItem
 *   result={result}
 *   isSelected={index === currentIndex()}
 *   onClick={() => onSelect(index)}
 * />
 */
export type ResultItemComponent = Component<ResultItemProps>;

// =============================================================================
// NavigationButtons - Find Next/Previous
// =============================================================================

export interface NavigationButtonsProps {
  /** Total result count */
  totalCount: number;
  /** Current result index (1-based for display) */
  currentIndex: number;
  /** Called for Find Next */
  onNext: () => void;
  /** Called for Find Previous */
  onPrevious: () => void;
  /** Whether navigation is disabled */
  disabled?: boolean;
}

/**
 * NavigationButtons component.
 *
 * Provides Find Next/Previous buttons with result counter.
 * Displays "N of M" format.
 *
 * @example
 * <NavigationButtons
 *   totalCount={12}
 *   currentIndex={3}
 *   onNext={navigateNext}
 *   onPrevious={navigatePrevious}
 * />
 */
export type NavigationButtonsComponent = Component<NavigationButtonsProps>;

// =============================================================================
// CategoryFilter - View category toggles
// =============================================================================

export interface CategoryFilterProps {
  /** Current filter state */
  filters: CategoryFilters;
  /** Called when filter changes */
  onFilterChange: (category: keyof CategoryFilters, enabled: boolean) => void;
  /** Whether filter controls are collapsed */
  collapsed?: boolean;
}

/**
 * CategoryFilter component.
 *
 * Checkboxes to filter results by view category.
 *
 * @example
 * <CategoryFilter
 *   filters={searchStore.categoryFilters}
 *   onFilterChange={setCategoryFilter}
 * />
 */
export type CategoryFilterComponent = Component<CategoryFilterProps>;

// =============================================================================
// ScopeFilter - Search scope selection
// =============================================================================

export interface ScopeFilterProps {
  /** Current scope */
  scope: SearchScope;
  /** Container ID when scope is 'selection' */
  containerId: string | null;
  /** Whether selection scope is available */
  hasSelection: boolean;
  /** Called when scope changes */
  onScopeChange: (scope: SearchScope, containerId?: string) => void;
}

/**
 * ScopeFilter component.
 *
 * Toggle between searching all views or within selection.
 *
 * @example
 * <ScopeFilter
 *   scope={searchStore.scope}
 *   containerId={searchStore.scopeContainerId}
 *   hasSelection={selectionStore.selectedIds.size > 0}
 *   onScopeChange={setSearchScope}
 * />
 */
export type ScopeFilterComponent = Component<ScopeFilterProps>;

// =============================================================================
// ReplaceControls - Replace input and buttons
// =============================================================================

export interface ReplaceControlsProps {
  /** Replace value input */
  value: string;
  /** Called on replace value change */
  onValueChange: (value: string) => void;
  /** Called for Replace (single) */
  onReplace: () => void;
  /** Called for Replace All */
  onReplaceAll: () => void;
  /** Whether replace is available (has current result with replaceable attribute) */
  canReplace: boolean;
  /** Whether replace all is available */
  canReplaceAll: boolean;
  /** Validation error message */
  error?: string;
}

/**
 * ReplaceControls component.
 *
 * Input for replacement value and Replace/Replace All buttons.
 *
 * @example
 * <ReplaceControls
 *   value={searchStore.replaceValue}
 *   onValueChange={setReplaceValue}
 *   onReplace={handleReplace}
 *   onReplaceAll={handleReplaceAll}
 *   canReplace={canReplace()}
 *   canReplaceAll={canReplaceAll()}
 * />
 */
export type ReplaceControlsComponent = Component<ReplaceControlsProps>;

// =============================================================================
// SearchHighlight - Canvas overlay for search results
// =============================================================================

export interface SearchHighlightProps {
  /** X position in canvas coordinates */
  x: number;
  /** Y position in canvas coordinates */
  y: number;
  /** Width of highlight */
  width: number;
  /** Height of highlight */
  height: number;
  /** Whether this is the current (focused) result */
  isCurrent: boolean;
}

/**
 * SearchHighlight component.
 *
 * SVG rect overlay to highlight search results on canvas.
 * Different styling for current vs other matches.
 *
 * @example
 * <SearchHighlight
 *   x={view.absoluteX}
 *   y={view.absoluteY}
 *   width={view.width}
 *   height={view.height}
 *   isCurrent={viewId === currentResultId}
 * />
 */
export type SearchHighlightComponent = Component<SearchHighlightProps>;

// =============================================================================
// ModeToggle - Find/Replace mode switch
// =============================================================================

export interface ModeToggleProps {
  /** Current mode */
  mode: FindPanelMode;
  /** Called when mode changes */
  onModeChange: (mode: FindPanelMode) => void;
}

/**
 * ModeToggle component.
 *
 * Tabs or buttons to switch between Find and Replace modes.
 *
 * @example
 * <ModeToggle
 *   mode={searchStore.mode}
 *   onModeChange={setMode}
 * />
 */
export type ModeToggleComponent = Component<ModeToggleProps>;

// =============================================================================
// Keyboard shortcuts
// =============================================================================

/**
 * Global keyboard shortcuts for Find/Replace.
 *
 * These are registered at the Editor level.
 */
export interface FindKeyboardShortcuts {
  /** Open Find panel */
  openFind: 'Ctrl+F' | 'Cmd+F';
  /** Open Replace panel */
  openReplace: 'Ctrl+Shift+F' | 'Cmd+Shift+F';
  /** Find next result */
  findNext: 'F3' | 'Enter' | 'Ctrl+G';
  /** Find previous result */
  findPrevious: 'Shift+F3' | 'Ctrl+Shift+G';
  /** Close panel */
  close: 'Escape';
}

/**
 * Default shortcuts (Windows/Linux).
 */
export const DEFAULT_SHORTCUTS: FindKeyboardShortcuts = {
  openFind: 'Ctrl+F',
  openReplace: 'Ctrl+Shift+F',
  findNext: 'F3',
  findPrevious: 'Shift+F3',
  close: 'Escape',
};
