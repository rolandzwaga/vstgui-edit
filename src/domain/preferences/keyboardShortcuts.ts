/**
 * Keyboard Shortcuts Data (DEPRECATED)
 *
 * This module is deprecated. Use domain/shortcuts instead.
 *
 * Re-exports from domain/shortcuts for backward compatibility.
 *
 * @deprecated Use imports from '../../domain/shortcuts' directly
 */

import type { ShortcutCategory } from './types';
import { SHORTCUT_CATEGORIES, getShortcutsGroupedByCategory } from '../shortcuts';

/**
 * All keyboard shortcuts organized by category.
 *
 * @deprecated Use SHORTCUT_CATEGORIES and getShortcutsGroupedByCategory from domain/shortcuts
 */
export const KEYBOARD_SHORTCUTS: ShortcutCategory[] = SHORTCUT_CATEGORIES.map((category) => ({
  name: category.name,
  shortcuts: (getShortcutsGroupedByCategory().get(category.id) ?? []).map((s) => ({
    keys: s.keys,
    description: s.description,
  })),
}));
