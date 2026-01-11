/**
 * Preferences Migration
 *
 * Migrates legacy localStorage keys to the unified preferences system.
 */

import { DEFAULT_PREFERENCES } from './defaults';
import { STORAGE_KEY, savePreferences } from './persistence';
import type { LegacyKey, MigrationResult, UserPreferences } from './types';

/**
 * Legacy localStorage keys to migrate.
 */
export const LEGACY_KEYS: LegacyKey[] = [
  'vstgui-edit:alignment-toolbar',
  'vstgui-edit:save-format',
];

/**
 * Checks if migration is needed.
 *
 * Migration is needed when:
 * - New preferences key does not exist
 * - At least one legacy key exists
 *
 * @returns True if migration should be performed
 */
export function needsMigration(): boolean {
  const hasNewKey = localStorage.getItem(STORAGE_KEY) !== null;
  if (hasNewKey) {
    return false;
  }

  return LEGACY_KEYS.some(key => localStorage.getItem(key) !== null);
}

/**
 * Migrates legacy preferences to unified system.
 *
 * - Reads values from legacy keys
 * - Writes to new unified key
 * - Deletes legacy keys immediately after migration
 *
 * @returns Migration result with migrated/failed key lists
 */
export function migratePreferences(): MigrationResult {
  const result: MigrationResult = {
    migrated: false,
    migratedKeys: [],
    failedKeys: [],
  };

  if (!needsMigration()) {
    return result;
  }

  const prefs: UserPreferences = { ...DEFAULT_PREFERENCES };

  // Migrate alignment toolbar
  migrateAlignmentToolbar(prefs, result);

  // Migrate save format
  migrateSaveFormat(prefs, result);

  // Save migrated preferences
  savePreferences(prefs);

  // Delete legacy keys immediately
  deleteLegacyKeys();

  result.migrated = result.migratedKeys.length > 0;

  if (result.migrated) {
    console.info('[preferences] Migrated keys:', result.migratedKeys);
  }

  return result;
}

/**
 * Migrates alignment toolbar state from legacy key.
 * Modifies prefs and result in place.
 */
function migrateAlignmentToolbar(prefs: UserPreferences, result: MigrationResult): void {
  const key = 'vstgui-edit:alignment-toolbar';

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      prefs.ui = {
        ...prefs.ui,
        alignmentToolbar: {
          isDocked: parsed.isDocked ?? true,
          floatingPosition: parsed.floatingPosition ?? null,
        },
      };
      result.migratedKeys.push(key);
    }
  } catch {
    result.failedKeys.push(key);
  }
}

/**
 * Migrates save format from legacy key.
 * Modifies prefs and result in place.
 */
function migrateSaveFormat(prefs: UserPreferences, result: MigrationResult): void {
  const key = 'vstgui-edit:save-format';

  try {
    const raw = localStorage.getItem(key);
    if (raw === 'json' || raw === 'xml') {
      prefs.save = {
        ...prefs.save,
        format: raw,
      };
      result.migratedKeys.push(key);
    }
    // Note: Invalid values like 'yaml' are silently ignored
    // The key will still be deleted, but not counted as migrated
  } catch {
    result.failedKeys.push(key);
  }
}

/**
 * Deletes all legacy keys from localStorage.
 */
function deleteLegacyKeys(): void {
  for (const key of LEGACY_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore deletion errors
    }
  }
}
