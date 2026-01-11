/**
 * Preferences Domain Module
 *
 * Unified preferences management for the editor.
 */

// Defaults
export { DEFAULT_PREFERENCES } from './defaults';
// Migration
export {
  LEGACY_KEYS,
  migratePreferences,
  needsMigration,
} from './migration';
// Persistence
export {
  isStorageAvailable,
  loadPreferences,
  mergeWithDefaults,
  STORAGE_KEY,
  savePreferences,
} from './persistence';
export { PREFERENCES_SCHEMA } from './schema';
// Types
export type {
  AlignmentToolbarState,
  CustomGuidesPreferences,
  GridPreferences,
  GridSizePreset,
  GridStyle,
  KeyboardShortcut,
  LegacyKey,
  MigrationResult,
  PreferencesSection,
  PreferencesSectionInfo,
  PreferencesState,
  PreferencesValidationResult,
  SaveFormat,
  SavePreferences,
  ShortcutCategory,
  SmartGuidesPreferences,
  SnapPreferences,
  ThemeMode,
  ThemePreferences,
  UIPreferences,
  UserPreferences,
} from './types';
// Validation
export { validatePreferences } from './validation';
