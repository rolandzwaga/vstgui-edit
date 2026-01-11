/**
 * Shortcuts Registry Contract
 *
 * API contract for the keyboard shortcuts registry.
 * This file defines the expected function signatures and return types.
 */

import type {
  ShortcutCategoryId,
  ShortcutCategoryMeta,
  ShortcutConflict,
  ShortcutDefinition,
} from '../../../src/types/shortcuts';

// ============================================================================
// Registry Constants
// ============================================================================

/**
 * All shortcut categories with display metadata.
 * Ordered for display in the shortcuts panel.
 */
export declare const SHORTCUT_CATEGORIES: ShortcutCategoryMeta[];

/**
 * Complete registry of all keyboard shortcuts.
 * Single source of truth for all shortcut definitions.
 */
export declare const SHORTCUT_REGISTRY: ShortcutDefinition[];

// ============================================================================
// Registry Query Functions
// ============================================================================

/**
 * Gets all shortcuts for a specific category.
 *
 * @param category - The category ID to filter by
 * @returns Array of shortcuts in the category (may be empty)
 */
export declare function getShortcutsByCategory(
  category: ShortcutCategoryId
): ShortcutDefinition[];

/**
 * Gets a shortcut by its unique ID.
 *
 * @param id - The shortcut ID
 * @returns The shortcut definition or undefined if not found
 */
export declare function getShortcutById(id: string): ShortcutDefinition | undefined;

/**
 * Filters shortcuts by search query.
 * Matches against keys and description (case-insensitive).
 *
 * @param query - Search query string
 * @returns Array of matching shortcuts
 */
export declare function searchShortcuts(query: string): ShortcutDefinition[];

/**
 * Gets shortcuts grouped by category for display.
 * Categories are sorted by their defined order.
 *
 * @returns Map of category ID to array of shortcuts
 */
export declare function getShortcutsGroupedByCategory(): Map<
  ShortcutCategoryId,
  ShortcutDefinition[]
>;

// ============================================================================
// Conflict Detection
// ============================================================================

/**
 * Detects conflicting shortcuts (same key combination).
 * Should be called at application startup for development validation.
 *
 * @returns Array of conflicts (empty if no conflicts)
 */
export declare function detectConflicts(): ShortcutConflict[];

/**
 * Checks if a specific shortcut has conflicts.
 *
 * @param shortcutId - The shortcut ID to check
 * @returns true if the shortcut has conflicts
 */
export declare function hasConflict(shortcutId: string): boolean;

/**
 * Gets the conflict info for a shortcut.
 *
 * @param shortcutId - The shortcut ID
 * @returns Conflict info or undefined if no conflict
 */
export declare function getConflictForShortcut(
  shortcutId: string
): ShortcutConflict | undefined;

// ============================================================================
// Platform Utilities
// ============================================================================

/**
 * Detects if the current platform is macOS.
 *
 * @returns true if running on macOS
 */
export declare function isMacPlatform(): boolean;

/**
 * Gets the platform-appropriate modifier key name.
 *
 * @returns "Cmd" on Mac, "Ctrl" on Windows/Linux
 */
export declare function getModifierKeyName(): string;

/**
 * Formats a shortcut's keys for the current platform.
 * Converts "Ctrl+" to "Cmd+" on macOS.
 *
 * @param keys - The key combination string
 * @returns Platform-formatted key string
 */
export declare function formatKeysForPlatform(keys: string): string;

// ============================================================================
// Statistics
// ============================================================================

/**
 * Gets total count of registered shortcuts.
 */
export declare function getShortcutCount(): number;

/**
 * Gets count of shortcuts per category.
 */
export declare function getCategoryStats(): Map<ShortcutCategoryId, number>;
