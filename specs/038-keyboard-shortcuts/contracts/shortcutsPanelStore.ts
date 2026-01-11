/**
 * Shortcuts Panel Store Contract
 *
 * API contract for the shortcuts panel state management.
 */

import type { ShortcutCategoryId, ShortcutsPanelState } from '../../../src/types/shortcuts';

// ============================================================================
// Store
// ============================================================================

/**
 * Reactive store for shortcuts panel state.
 * Read-only access to current state.
 */
export declare const shortcutsPanelStore: Readonly<ShortcutsPanelState>;

// ============================================================================
// Panel Visibility Actions
// ============================================================================

/**
 * Opens the keyboard shortcuts panel.
 * - Sets isOpen to true
 * - Clears search query
 * - Expands all categories
 */
export declare function openShortcutsPanel(): void;

/**
 * Closes the keyboard shortcuts panel.
 * - Sets isOpen to false
 */
export declare function closeShortcutsPanel(): void;

/**
 * Toggles the shortcuts panel visibility.
 */
export declare function toggleShortcutsPanel(): void;

// ============================================================================
// Search Actions
// ============================================================================

/**
 * Sets the search query.
 * UI will filter shortcuts based on this query.
 *
 * @param query - Search string (empty string shows all)
 */
export declare function setSearchQuery(query: string): void;

/**
 * Clears the search query.
 */
export declare function clearSearch(): void;

// ============================================================================
// Category Expansion Actions
// ============================================================================

/**
 * Expands a category.
 *
 * @param categoryId - Category to expand
 */
export declare function expandCategory(categoryId: ShortcutCategoryId): void;

/**
 * Collapses a category.
 *
 * @param categoryId - Category to collapse
 */
export declare function collapseCategory(categoryId: ShortcutCategoryId): void;

/**
 * Toggles a category's expanded state.
 *
 * @param categoryId - Category to toggle
 */
export declare function toggleCategory(categoryId: ShortcutCategoryId): void;

/**
 * Expands all categories.
 */
export declare function expandAllCategories(): void;

/**
 * Collapses all categories.
 */
export declare function collapseAllCategories(): void;

/**
 * Checks if a category is expanded.
 *
 * @param categoryId - Category to check
 * @returns true if expanded
 */
export declare function isCategoryExpanded(categoryId: ShortcutCategoryId): boolean;

// ============================================================================
// Reset
// ============================================================================

/**
 * Resets the store to initial state.
 * For testing purposes.
 */
export declare function resetShortcutsPanelStore(): void;
