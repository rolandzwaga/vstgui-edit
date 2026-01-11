/**
 * Shortcuts Panel Store
 *
 * State management for the keyboard shortcuts reference panel.
 */

import { createSignal } from 'solid-js';
import { SHORTCUT_CATEGORIES } from '../domain/shortcuts';
import type { ShortcutCategoryId, ShortcutsPanelState } from '../types/shortcuts';

// Helper to get all category IDs as a Set
function getAllCategoryIds(): Set<ShortcutCategoryId> {
  return new Set(SHORTCUT_CATEGORIES.map((c) => c.id));
}

// Initial state
const initialState: ShortcutsPanelState = {
  isOpen: false,
  searchQuery: '',
  expandedCategories: getAllCategoryIds(),
};

// Signals for each piece of state
const [isOpen, setIsOpen] = createSignal(initialState.isOpen);
const [searchQuery, setSearchQuerySignal] = createSignal(initialState.searchQuery);
const [expandedCategories, setExpandedCategories] = createSignal<Set<ShortcutCategoryId>>(
  new Set(initialState.expandedCategories)
);

/**
 * Reactive store for shortcuts panel state.
 * Read-only access to current state.
 */
export const shortcutsPanelStore: Readonly<ShortcutsPanelState> = {
  get isOpen() {
    return isOpen();
  },
  get searchQuery() {
    return searchQuery();
  },
  get expandedCategories() {
    return expandedCategories();
  },
};

// ============================================================================
// Panel Visibility Actions
// ============================================================================

/**
 * Opens the keyboard shortcuts panel.
 * - Sets isOpen to true
 * - Clears search query
 * - Expands all categories
 */
export function openShortcutsPanel(): void {
  setSearchQuerySignal('');
  setExpandedCategories(getAllCategoryIds());
  setIsOpen(true);
}

/**
 * Closes the keyboard shortcuts panel.
 * - Sets isOpen to false
 */
export function closeShortcutsPanel(): void {
  setIsOpen(false);
}

/**
 * Toggles the shortcuts panel visibility.
 */
export function toggleShortcutsPanel(): void {
  if (isOpen()) {
    closeShortcutsPanel();
  } else {
    openShortcutsPanel();
  }
}

// ============================================================================
// Search Actions
// ============================================================================

/**
 * Sets the search query.
 * UI will filter shortcuts based on this query.
 *
 * @param query - Search string (empty string shows all)
 */
export function setSearchQuery(query: string): void {
  setSearchQuerySignal(query);
}

/**
 * Clears the search query.
 */
export function clearSearch(): void {
  setSearchQuerySignal('');
}

// ============================================================================
// Category Expansion Actions
// ============================================================================

/**
 * Expands a category.
 *
 * @param categoryId - Category to expand
 */
export function expandCategory(categoryId: ShortcutCategoryId): void {
  const current = expandedCategories();
  if (!current.has(categoryId)) {
    const newSet = new Set(current);
    newSet.add(categoryId);
    setExpandedCategories(newSet);
  }
}

/**
 * Collapses a category.
 *
 * @param categoryId - Category to collapse
 */
export function collapseCategory(categoryId: ShortcutCategoryId): void {
  const current = expandedCategories();
  if (current.has(categoryId)) {
    const newSet = new Set(current);
    newSet.delete(categoryId);
    setExpandedCategories(newSet);
  }
}

/**
 * Toggles a category's expanded state.
 *
 * @param categoryId - Category to toggle
 */
export function toggleCategory(categoryId: ShortcutCategoryId): void {
  const current = expandedCategories();
  if (current.has(categoryId)) {
    collapseCategory(categoryId);
  } else {
    expandCategory(categoryId);
  }
}

/**
 * Expands all categories.
 */
export function expandAllCategories(): void {
  setExpandedCategories(getAllCategoryIds());
}

/**
 * Collapses all categories.
 */
export function collapseAllCategories(): void {
  setExpandedCategories(new Set());
}

/**
 * Checks if a category is expanded.
 *
 * @param categoryId - Category to check
 * @returns true if expanded
 */
export function isCategoryExpanded(categoryId: ShortcutCategoryId): boolean {
  return expandedCategories().has(categoryId);
}

// ============================================================================
// Reset
// ============================================================================

/**
 * Resets the store to initial state.
 * For testing purposes.
 */
export function resetShortcutsPanelStore(): void {
  setIsOpen(initialState.isOpen);
  setSearchQuerySignal(initialState.searchQuery);
  setExpandedCategories(getAllCategoryIds());
}
