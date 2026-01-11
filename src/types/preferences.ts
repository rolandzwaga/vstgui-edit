/**
 * Preferences Types Re-exports
 *
 * Re-exports preference types from the domain layer for convenience.
 */

export type {
  // Preference Types
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

  // UI Types
  PreferencesSection,
  PreferencesSectionInfo,
  KeyboardShortcut,
  ShortcutCategory,

  // Store Types
  PreferencesState,

  // Validation Types
  PreferencesValidationResult,
  MigrationResult,
  LegacyKey,
} from '../domain/preferences/types';

export { DEFAULT_PREFERENCES } from '../domain/preferences/defaults';
