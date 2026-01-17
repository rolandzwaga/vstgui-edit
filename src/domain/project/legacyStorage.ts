/**
 * Legacy Storage Cleanup
 *
 * Functions to clean up legacy localStorage keys that are no longer used
 * after migration to project-based storage in IndexedDB.
 */

/**
 * Legacy localStorage keys that were used before project-based storage.
 */
export const LEGACY_KEYS = [
  'vstgui-edit:preferences',
  'vstgui-edit:alignment-toolbar',
  'vstgui-edit:save-format',
  'vstgui-edit:recent-colors',
] as const;

/**
 * Checks if any legacy localStorage keys exist.
 *
 * @returns true if any legacy keys are found
 */
export function hasLegacyStorage(): boolean {
  for (const key of LEGACY_KEYS) {
    if (localStorage.getItem(key) !== null) {
      return true;
    }
  }
  return false;
}

/**
 * Removes all legacy localStorage keys.
 *
 * This should be called on app startup to clean up old data
 * that is no longer needed after migration to IndexedDB.
 */
export function cleanupLegacyStorage(): void {
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
  }
}

/**
 * Gets a list of existing legacy keys.
 * Useful for debugging/logging which keys were cleaned up.
 *
 * @returns Array of existing legacy key names
 */
export function getExistingLegacyKeys(): string[] {
  return LEGACY_KEYS.filter(key => localStorage.getItem(key) !== null);
}
