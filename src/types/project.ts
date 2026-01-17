/**
 * Project Types Re-exports
 *
 * Convenience re-exports of project storage types from domain layer.
 */

export type {
  AutoSaveSettings,
  Bitmap,
  CustomGuidesSettings,
  // Editor state
  EditorState,
  // Export
  ExportFormat,
  ExportResult,
  GridSettings,
  GridSizePreset,
  GridStyle,
  Guide,
  NameDialogMode,
  // Validation
  NameValidationResult,
  Point,
  // Core entities
  Project,
  // Project settings
  ProjectSettings,
  // Store state
  ProjectStoreState,
  SaveStatus,
  SmartGuidesSettings,
  SnapSettings,
  StorageQuota,
  ThemeMode,
  ThemeSettings,
  UidescFormat,
} from '../domain/project/types';

export {
  // Constants
  DB_NAME,
  DB_VERSION,
  DEBOUNCE,
  // Default values
  DEFAULT_EDITOR_STATE,
  DEFAULT_PROJECT_SETTINGS,
  INDEXES,
  LIMITS,
  PROJECT_NAME_REGEX,
  STORES,
  THUMBNAIL,
} from '../domain/project/types';
