/**
 * Project Domain
 *
 * Business logic and types for project storage feature.
 */

export type { ExportBitmap, ExportFormatType } from './export';
// Export
export {
  createDownloadBlob,
  exportAsJSON,
  exportAsXML,
  exportAsZIP,
  getFileExtension,
  triggerDownload,
} from './export';
// Serialization
export {
  deserializeEditorState,
  deserializeProjectSettings,
  serializeEditorState,
  serializeProjectSettings,
} from './serialization';
// Types
export type {
  AutoSaveSettings,
  Bitmap,
  CustomGuidesSettings,
  EditorState,
  ExportFormat,
  ExportResult,
  GridSettings,
  GridSizePreset,
  GridStyle,
  Guide,
  NameDialogMode,
  NameValidationResult,
  Point,
  Project,
  ProjectSettings,
  ProjectStoreState,
  SaveStatus,
  SmartGuidesSettings,
  SnapSettings,
  StorageQuota,
  ThemeMode,
  ThemeSettings,
  UidescFormat,
} from './types';
// Constants and defaults
export {
  DB_NAME,
  DB_VERSION,
  DEBOUNCE,
  DEFAULT_EDITOR_STATE,
  DEFAULT_PROJECT_SETTINGS,
  INDEXES,
  LIMITS as PROJECT_LIMITS,
  PROJECT_NAME_REGEX,
  STORES,
  THUMBNAIL,
} from './types';
// Validation
export { LIMITS, sanitizeProjectName, validateProjectName } from './validation';
