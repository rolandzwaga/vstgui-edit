/**
 * Keyboard Shortcuts Type Definitions
 *
 * Types for the centralized keyboard shortcuts system.
 */

/**
 * Category identifier for shortcuts.
 * 10 categories covering all shortcut groups.
 */
export type ShortcutCategoryId =
  | 'canvas'
  | 'selection'
  | 'editing'
  | 'clipboard'
  | 'alignment'
  | 'viewManagement'
  | 'grouping'
  | 'findReplace'
  | 'file'
  | 'general';

/**
 * A single keyboard shortcut definition.
 */
export interface ShortcutDefinition {
  /** Unique identifier */
  id: string;
  /** Key combination display (e.g., "Ctrl+Z") */
  keys: string;
  /** Action description */
  description: string;
  /** Category this shortcut belongs to */
  category: ShortcutCategoryId;
  /** Optional context note (e.g., "when views selected") */
  context?: string;
}

/**
 * Metadata for a shortcut category.
 */
export interface ShortcutCategoryMeta {
  /** Category identifier */
  id: ShortcutCategoryId;
  /** Display name (e.g., "Canvas Navigation") */
  name: string;
  /** Sort order for display */
  order: number;
}

/**
 * Represents a key combination conflict between shortcuts.
 */
export interface ShortcutConflict {
  /** Normalized key combination (lowercase) */
  normalizedKey: string;
  /** Conflicting shortcut definitions */
  shortcuts: ShortcutDefinition[];
}

/**
 * Shortcuts panel UI state.
 */
export interface ShortcutsPanelState {
  /** Whether the panel is visible */
  isOpen: boolean;
  /** Current search filter query */
  searchQuery: string;
  /** Set of expanded category IDs */
  expandedCategories: Set<ShortcutCategoryId>;
}
