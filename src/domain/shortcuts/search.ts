/**
 * Shortcut Search Utilities
 *
 * Functions for filtering and searching the shortcuts registry.
 */

import type { ShortcutDefinition } from '../../types/shortcuts';
import { SHORTCUT_REGISTRY } from './registry';

/**
 * Searches shortcuts by query string.
 * Matches against keys and description (case-insensitive substring match).
 *
 * @param query - Search query string
 * @returns Array of matching shortcuts
 */
export function searchShortcuts(query: string): ShortcutDefinition[] {
  if (!query || query.trim() === '') {
    return [...SHORTCUT_REGISTRY];
  }

  const normalizedQuery = query.toLowerCase().trim();

  return SHORTCUT_REGISTRY.filter((shortcut) => {
    const keysMatch = shortcut.keys.toLowerCase().includes(normalizedQuery);
    const descriptionMatch = shortcut.description.toLowerCase().includes(normalizedQuery);
    return keysMatch || descriptionMatch;
  });
}
