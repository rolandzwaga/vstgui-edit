/**
 * Preferences Persistence
 *
 * localStorage operations for user preferences.
 */

import { DEFAULT_PREFERENCES } from './defaults';
import type { UserPreferences } from './types';
import { validatePreferences } from './validation';

/**
 * localStorage key for user preferences.
 */
export const STORAGE_KEY = 'vstgui-edit:preferences';

/**
 * Checks if localStorage is available.
 *
 * @returns True if localStorage can be used
 */
export function isStorageAvailable(): boolean {
  const testKey = '__storage_test__';
  try {
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads preferences from localStorage.
 *
 * Returns defaults when:
 * - No stored preferences exist
 * - JSON parsing fails
 * - Validation fails
 * - localStorage is unavailable
 *
 * @returns User preferences (defaults if load fails)
 */
export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_PREFERENCES };
    }

    const parsed = JSON.parse(raw);
    const validation = validatePreferences(parsed);

    if (!validation.valid) {
      console.warn('[preferences] Stored preferences invalid, resetting:', validation.errors);
      return { ...DEFAULT_PREFERENCES };
    }

    return mergeWithDefaults(parsed);
  } catch (error) {
    console.warn('[preferences] Failed to load, resetting:', error);
    return { ...DEFAULT_PREFERENCES };
  }
}

/**
 * Saves preferences to localStorage.
 *
 * Silently fails if localStorage is unavailable (e.g., private browsing).
 *
 * @param prefs - Preferences to save
 */
export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Silent fail - localStorage unavailable
  }
}

/**
 * Merges partial preferences with defaults.
 *
 * Ensures all fields are present even if stored preferences are incomplete.
 *
 * @param partial - Partial preferences from storage
 * @returns Complete preferences with defaults for missing fields
 */
export function mergeWithDefaults(partial: Partial<UserPreferences>): UserPreferences {
  return {
    ...DEFAULT_PREFERENCES,
    ...partial,
    grid: {
      ...DEFAULT_PREFERENCES.grid,
      ...partial.grid,
    },
    snap: {
      ...DEFAULT_PREFERENCES.snap,
      ...partial.snap,
    },
    smartGuides: {
      ...DEFAULT_PREFERENCES.smartGuides,
      ...partial.smartGuides,
    },
    customGuides: {
      ...DEFAULT_PREFERENCES.customGuides,
      ...partial.customGuides,
    },
    theme: {
      ...DEFAULT_PREFERENCES.theme,
      ...partial.theme,
    },
    ui: {
      ...DEFAULT_PREFERENCES.ui,
      ...partial.ui,
      alignmentToolbar: {
        ...DEFAULT_PREFERENCES.ui.alignmentToolbar,
        ...partial.ui?.alignmentToolbar,
      },
    },
    save: {
      ...DEFAULT_PREFERENCES.save,
      ...partial.save,
    },
  };
}
