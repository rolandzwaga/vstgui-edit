/**
 * Preferences Domain Module
 *
 * Unified preferences management for the editor.
 */

// Types
export type {
  GridSizePreset,
  GridStyle,
  GridPreferences,
  SnapPreferences,
  SmartGuidesPreferences,
  CustomGuidesPreferences,
  ThemeMode,
  ThemePreferences,
  AlignmentToolbarState,
  UIPreferences,
  SaveFormat,
  SavePreferences,
  UserPreferences,
  PreferencesSection,
  PreferencesSectionInfo,
  KeyboardShortcut,
  ShortcutCategory,
  PreferencesState,
  PreferencesValidationResult,
  MigrationResult,
  LegacyKey,
} from './types';

// Defaults
export { DEFAULT_PREFERENCES } from './defaults';

// Validation
export { validatePreferences } from './validation';
export { PREFERENCES_SCHEMA } from './schema';

// Persistence
export {
  STORAGE_KEY,
  loadPreferences,
  savePreferences,
  mergeWithDefaults,
  isStorageAvailable,
} from './persistence';

// Migration
export {
  LEGACY_KEYS,
  needsMigration,
  migratePreferences,
} from './migration';

// Keyboard Shortcuts
export { KEYBOARD_SHORTCUTS } from './keyboardShortcuts';
