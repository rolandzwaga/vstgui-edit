/**
 * Project Domain
 *
 * Business logic and types for project storage feature.
 */

// Types
export type {
  Project,
  Bitmap,
  UidescFormat,
  EditorState,
  Point,
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
  ProjectStoreState,
  SaveStatus,
  NameDialogMode,
  NameValidationResult,
  StorageQuota,
  ExportFormat,
  ExportResult,
} from './types';

// Constants and defaults
export {
  DEFAULT_EDITOR_STATE,
  DEFAULT_PROJECT_SETTINGS,
  DB_NAME,
  DB_VERSION,
  STORES,
  INDEXES,
  DEBOUNCE,
  THUMBNAIL,
  LIMITS as PROJECT_LIMITS,
  PROJECT_NAME_REGEX,
} from './types';

// Validation
export { validateProjectName, sanitizeProjectName, LIMITS } from './validation';

// Serialization
export {
  serializeEditorState,
  deserializeEditorState,
  serializeProjectSettings,
  deserializeProjectSettings,
} from './serialization';
