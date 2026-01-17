/**
 * Project Types Re-exports
 *
 * Convenience re-exports of project storage types from domain layer.
 */

export type {
  // Core entities
  Project,
  Bitmap,
  UidescFormat,

  // Editor state
  EditorState,
  Point,

  // Project settings
  ProjectSettings,
  GridSettings,
  GridSizePreset,
  GridStyle,
  SnapSettings,
  SmartGuidesSettings,
  CustomGuidesSettings,
  Guide,
  ThemeSettings,
  ThemeMode,
  AutoSaveSettings,

  // Store state
  ProjectStoreState,
  SaveStatus,
  NameDialogMode,

  // Validation
  NameValidationResult,
  StorageQuota,

  // Export
  ExportFormat,
  ExportResult,
} from '../domain/project/types';

export {
  // Default values
  DEFAULT_EDITOR_STATE,
  DEFAULT_PROJECT_SETTINGS,

  // Constants
  DB_NAME,
  DB_VERSION,
  STORES,
  INDEXES,
  DEBOUNCE,
  THUMBNAIL,
  LIMITS,
  PROJECT_NAME_REGEX,
} from '../domain/project/types';
