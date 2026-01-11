/**
 * Shortcut Conflict Detection
 *
 * Utilities for detecting and reporting keyboard shortcut conflicts.
 */

import type { ShortcutConflict, ShortcutDefinition } from '../../types/shortcuts';
import { SHORTCUT_REGISTRY } from './registry';

// Cache for conflict detection results
let cachedConflicts: ShortcutConflict[] | null = null;

/**
 * Normalizes a key combination for comparison.
 * Converts to lowercase and standardizes format.
 *
 * @param keys - The key combination string
 * @returns Normalized key string
 */
function normalizeKeys(keys: string): string {
  return keys.toLowerCase().trim();
}

/**
 * Detects conflicting shortcuts (same key combination).
 * Should be called at application startup for development validation.
 * Logs warnings to console for detected conflicts.
 *
 * @returns Array of conflicts (empty if no conflicts)
 */
export function detectConflicts(): ShortcutConflict[] {
  // Return cached result if available
  if (cachedConflicts !== null) {
    return cachedConflicts;
  }

  const keyMap = new Map<string, ShortcutDefinition[]>();

  // Group shortcuts by normalized key
  for (const shortcut of SHORTCUT_REGISTRY) {
    const normalizedKey = normalizeKeys(shortcut.keys);
    const existing = keyMap.get(normalizedKey) ?? [];
    existing.push(shortcut);
    keyMap.set(normalizedKey, existing);
  }

  // Find conflicts (more than one shortcut with same key)
  const conflicts: ShortcutConflict[] = [];
  for (const [normalizedKey, shortcuts] of keyMap) {
    if (shortcuts.length > 1) {
      conflicts.push({ normalizedKey, shortcuts });

      // Log warning to console
      console.warn(
        `[Shortcuts] Conflict detected for "${normalizedKey}":`,
        shortcuts.map((s) => `${s.id} (${s.description})`).join(', ')
      );
    }
  }

  // Cache result
  cachedConflicts = conflicts;

  return conflicts;
}

/**
 * Checks if a specific shortcut has conflicts.
 *
 * @param shortcutId - The shortcut ID to check
 * @returns true if the shortcut has conflicts
 */
export function hasConflict(shortcutId: string): boolean {
  const conflicts = detectConflicts();
  return conflicts.some((conflict) => conflict.shortcuts.some((s) => s.id === shortcutId));
}

/**
 * Gets the conflict info for a shortcut.
 *
 * @param shortcutId - The shortcut ID
 * @returns Conflict info or undefined if no conflict
 */
export function getConflictForShortcut(shortcutId: string): ShortcutConflict | undefined {
  const conflicts = detectConflicts();
  return conflicts.find((conflict) => conflict.shortcuts.some((s) => s.id === shortcutId));
}

/**
 * Clears the conflict cache.
 * For testing purposes only.
 */
export function clearConflictCache(): void {
  cachedConflicts = null;
}
