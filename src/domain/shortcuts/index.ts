/**
 * Keyboard Shortcuts Domain
 *
 * Barrel export for the shortcuts domain module.
 */

// Registry exports
export {
  SHORTCUT_CATEGORIES,
  SHORTCUT_REGISTRY,
  getShortcutsByCategory,
  getShortcutById,
  getShortcutsGroupedByCategory,
  getShortcutCount,
  getCategoryStats,
} from './registry';

// Platform exports
export { isMacPlatform, getModifierKeyName, formatKeysForPlatform } from './platform';

// Search exports
export { searchShortcuts } from './search';

// Conflict exports
export {
  detectConflicts,
  hasConflict,
  getConflictForShortcut,
  clearConflictCache,
} from './conflicts';
