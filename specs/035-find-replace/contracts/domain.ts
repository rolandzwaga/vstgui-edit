/**
 * Domain Contract: Search Operations
 *
 * Pure functions for search logic, query parsing, and replace operations.
 */

import type { ViewCategory } from '../../../src/types/canvas';
import type { HistoryOperation } from '../../../src/types/history';
import type {
  CategoryFilters,
  ReplaceChange,
  ReplaceResult,
  ReplaceValidationError,
  SearchQuery,
  SearchResult,
} from '../../../src/types/search';

// =============================================================================
// src/domain/search/searchQuery.ts
// =============================================================================

/**
 * Parse user input into structured search query.
 *
 * Determines query type based on input format:
 * - "attribute:value" -> attribute search
 * - "CClassName" (starts with C + uppercase) -> class search
 * - Other -> global search (matches class or any attribute)
 *
 * @param input - Raw search input string
 * @returns Parsed SearchQuery
 *
 * @example
 * parseSearchQuery('CKnob')
 * // { type: 'class', term: 'CKnob' }
 *
 * parseSearchQuery('background-color:#FF0000')
 * // { type: 'attribute', term: 'background-color:#FF0000',
 * //   attributeName: 'background-color', value: '#FF0000' }
 *
 * parseSearchQuery('red')
 * // { type: 'global', term: 'red' }
 */
export function parseSearchQuery(input: string): SearchQuery;

/**
 * Check if input looks like a VSTGUI class name.
 *
 * @param input - String to check
 * @returns true if matches class name pattern
 *
 * @example
 * isClassNameLike('CKnob') // true
 * isClassNameLike('CViewContainer') // true
 * isClassNameLike('UIViewSwitchContainer') // true
 * isClassNameLike('background-color') // false
 */
export function isClassNameLike(input: string): boolean;

/**
 * Escape special characters for literal matching.
 *
 * @param term - Search term
 * @returns Escaped term
 */
export function escapeSearchTerm(term: string): string;

/**
 * Unescape special characters (e.g., \: -> :).
 *
 * @param value - Escaped value
 * @returns Unescaped value
 */
export function unescapeValue(value: string): string;

// =============================================================================
// src/domain/search/searchEngine.ts
// =============================================================================

/**
 * View data structure optimized for searching.
 */
export interface SearchableView {
  /** Unique view ID */
  id: string;
  /** VSTGUI class name */
  className: string;
  /** View category */
  category: ViewCategory;
  /** All view attributes */
  attributes: Record<string, string>;
  /** Display path (e.g., "MainPanel > Controls") */
  parentPath: string;
}

/**
 * Check if a view matches the search query.
 *
 * Matching behavior by query type:
 * - class: Case-insensitive substring match on className
 * - attribute: Exact attribute name + case-insensitive substring on value
 * - global: Case-insensitive substring on className OR any attribute value
 *
 * @param view - View to check
 * @param query - Parsed search query
 * @returns true if view matches
 *
 * @example
 * matchesQuery({ className: 'CAnimKnob', ... }, { type: 'class', term: 'Knob' })
 * // true (substring match)
 *
 * matchesQuery(
 *   { attributes: { 'background-color': '#FF0000' }, ... },
 *   { type: 'attribute', attributeName: 'background-color', value: 'FF00' }
 * )
 * // true (value substring match)
 */
export function matchesQuery(view: SearchableView, query: SearchQuery): boolean;

/**
 * Check if view passes category filter.
 *
 * @param view - View to check
 * @param filters - Active filters
 * @returns true if view's category is enabled
 *
 * @example
 * passesCategoryFilter(
 *   { category: 'control', ... },
 *   { container: true, control: true, display: false, custom: false }
 * )
 * // true
 */
export function passesCategoryFilter(
  view: SearchableView,
  filters: CategoryFilters
): boolean;

/**
 * Check if view ID is descendant of container.
 *
 * Uses ID path structure: parent-0-child-1 is child of parent-0.
 *
 * @param viewId - View ID to check
 * @param containerId - Potential ancestor ID
 * @returns true if viewId is descendant of containerId
 *
 * @example
 * isDescendantOf('template-0-1-2', 'template-0-1') // true
 * isDescendantOf('template-0-1', 'template-0-2') // false
 */
export function isDescendantOf(viewId: string, containerId: string): boolean;

/**
 * Execute search across all views.
 *
 * @param views - Array of searchable views
 * @param query - Search query
 * @param filters - Category filters
 * @param scope - Search scope configuration
 * @returns Array of matching SearchResults
 *
 * @example
 * executeSearch(
 *   views,
 *   { type: 'class', term: 'Knob' },
 *   { container: true, control: true, display: true, custom: true },
 *   { type: 'all' }
 * )
 * // [{ viewId: 'template-0-1', className: 'CKnob', ... }, ...]
 */
export function executeSearch(
  views: SearchableView[],
  query: SearchQuery,
  filters: CategoryFilters,
  scope: { type: 'all' } | { type: 'selection'; containerId: string }
): SearchResult[];

/**
 * Build display path for a view.
 *
 * @param viewId - View ID
 * @param viewMap - Map of ID to view data
 * @returns Display path string (e.g., "MainPanel > Controls > Knob1")
 */
export function buildDisplayPath(
  viewId: string,
  viewMap: Map<string, { className: string; parentId: string | null }>
): string;

// =============================================================================
// src/domain/search/replaceOperations.ts
// =============================================================================

/**
 * Attributes that cannot be replaced.
 */
export const READ_ONLY_ATTRIBUTES: readonly string[];

/**
 * Validate replacement value for a specific attribute.
 *
 * Validation rules:
 * - class: Always invalid (read-only)
 * - origin/size: Must be valid "x, y" format
 * - colors: Must be valid hex or color name
 * - others: Non-empty string
 *
 * @param attributeName - Attribute to replace
 * @param value - New value
 * @returns Error if invalid, null if valid
 *
 * @example
 * validateReplaceValue('class', 'CNewClass')
 * // { type: 'read-only-attribute', message: 'Class name cannot be changed' }
 *
 * validateReplaceValue('origin', '10, 20')
 * // null (valid)
 *
 * validateReplaceValue('origin', 'invalid')
 * // { type: 'invalid-format', message: 'Origin must be "x, y" format' }
 */
export function validateReplaceValue(
  attributeName: string,
  value: string
): ReplaceValidationError | null;

/**
 * Execute replace on a single view.
 *
 * @param viewId - View to modify
 * @param attributeName - Attribute to replace
 * @param newValue - Replacement value
 * @param isLockedFn - Function to check if view is locked
 * @param getAttributeFn - Function to get current attribute value
 * @param updateFn - Function to update attribute
 * @returns ReplaceChange for history, or null if skipped (locked/missing)
 */
export function replaceAttribute(
  viewId: string,
  attributeName: string,
  newValue: string,
  isLockedFn: (id: string) => boolean,
  getAttributeFn: (viewId: string, attr: string) => string | undefined,
  updateFn: (viewId: string, attr: string, value: string) => void
): ReplaceChange | null;

/**
 * Execute replace on all matching views.
 *
 * @param viewIds - Views to modify
 * @param attributeName - Attribute to replace
 * @param newValue - Replacement value
 * @param isLockedFn - Function to check if view is locked
 * @param getAttributeFn - Function to get current attribute value
 * @param updateFn - Function to update attribute
 * @returns ReplaceResult with counts and changes
 *
 * @example
 * replaceAll(
 *   ['view-1', 'view-2', 'view-3'],
 *   'background-color',
 *   '#00FF00',
 *   isLocked,
 *   getViewAttribute,
 *   updateViewAttribute
 * )
 * // { replacedCount: 2, skippedLockedCount: 1, changes: [...] }
 */
export function replaceAll(
  viewIds: string[],
  attributeName: string,
  newValue: string,
  isLockedFn: (id: string) => boolean,
  getAttributeFn: (viewId: string, attr: string) => string | undefined,
  updateFn: (viewId: string, attr: string, value: string) => void
): ReplaceResult;

// =============================================================================
// src/domain/search/historyOperations.ts
// =============================================================================

/**
 * Create history operation for single replace.
 *
 * @param change - Single replace change
 * @param updateFn - Function to update attribute
 * @returns HistoryOperation for undo/redo
 */
export function createReplaceOperation(
  change: ReplaceChange,
  updateFn: (viewId: string, attr: string, value: string) => void
): HistoryOperation;

/**
 * Create history operation for replace all.
 *
 * @param changes - Array of replace changes
 * @param updateFn - Function to update attribute
 * @returns HistoryOperation for undo/redo
 *
 * @example
 * const op = createReplaceAllOperation(changes, updateViewAttribute);
 * pushOperation(op);
 * // Ctrl+Z now undoes all changes in one action
 */
export function createReplaceAllOperation(
  changes: ReplaceChange[],
  updateFn: (viewId: string, attr: string, value: string) => void
): HistoryOperation;

// =============================================================================
// Constants
// =============================================================================

/**
 * Known VSTGUI class name prefixes.
 */
export const CLASS_PREFIXES: readonly string[] = ['C', 'UI'];

/**
 * All known VSTGUI class names (for validation/autocomplete).
 */
export const KNOWN_CLASS_NAMES: readonly string[] = [
  // Containers
  'CView',
  'CViewContainer',
  'CLayeredViewContainer',
  'CRowColumnView',
  'CScrollView',
  'CSplitView',
  'CShadowViewContainer',
  'UIViewSwitchContainer',
  // Controls
  'CControl',
  'CTextEdit',
  'CSearchTextEdit',
  'CTextButton',
  'COnOffButton',
  'CCheckBox',
  'CSegmentButton',
  'CKickButton',
  'CRockerSwitch',
  'CVerticalSwitch',
  'CHorizontalSwitch',
  'CMovieButton',
  'CKnob',
  'CAnimKnob',
  'CSlider',
  'CXYPad',
  'COptionMenu',
  // Display
  'CTextLabel',
  'CMultiLineTextLabel',
  'CParamDisplay',
  'CVuMeter',
  'CGradientView',
  'CMovieBitmap',
  'CAutoAnimation',
  'CAnimationSplashScreen',
  'CStringListControl',
];

/**
 * Searchable attribute names (from ATTRIBUTE_GROUP_MAP).
 */
export const SEARCHABLE_ATTRIBUTES: readonly string[] = [
  'class',
  'origin',
  'size',
  'min-size',
  'max-size',
  'background-color',
  'opacity',
  'bitmap',
  'transparent',
  'frame-color',
  'frame-width',
  'font',
  'font-color',
  'text-alignment',
  'title',
  'tooltip',
  'mouse-enabled',
  'want-focus',
  'autosize',
  'uidesc-label',
  'control-tag',
];
