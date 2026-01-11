/**
 * Keyboard Shortcuts Domain
 *
 * Barrel export for the shortcuts domain module.
 */

// Conflict exports
export {
  clearConflictCache,
  detectConflicts,
  getConflictForShortcut,
  hasConflict,
} from './conflicts';

// Platform exports
export { formatKeysForPlatform, getModifierKeyName, isMacPlatform } from './platform';
// Registry exports
export {
  getCategoryStats,
  getShortcutById,
  getShortcutCount,
  getShortcutsByCategory,
  getShortcutsGroupedByCategory,
  SHORTCUT_CATEGORIES,
  SHORTCUT_REGISTRY,
} from './registry';
// Search exports
export { searchShortcuts } from './search';
