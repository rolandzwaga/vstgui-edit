/**
 * Preferences Types Re-exports
 *
 * Re-exports preference types from the domain layer for convenience.
 */

export { DEFAULT_PREFERENCES } from '../domain/preferences/defaults';
export type {
  AlignmentToolbarState,
  CustomGuidesPreferences,
  GridPreferences,
  // Preference Types
  GridSizePreset,
  GridStyle,
  KeyboardShortcut,
  LegacyKey,
  MigrationResult,
  // UI Types
  PreferencesSection,
  PreferencesSectionInfo,
  // Store Types
  PreferencesState,
  // Validation Types
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
} from '../domain/preferences/types';
