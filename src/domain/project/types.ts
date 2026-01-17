/**
 * Project Storage Domain Types
 *
 * TypeScript interfaces for the project storage feature.
 * These define the shape of data stored in IndexedDB and managed by the projectStore.
 */

// ============================================================================
// Core Entities
// ============================================================================

/**
 * A complete project stored in IndexedDB.
 * Contains all data needed to restore an editing session.
 */
export interface Project {
  /** Unique identifier (UUID) */
  id: string;

  /** User-provided display name */
  name: string;

  /** ISO 8601 timestamp of creation */
  createdAt: string;

  /** ISO 8601 timestamp of last modification */
  updatedAt: string;

  /** Raw uidesc file content (JSON or XML string) */
  uidescContent: string;

  /** Original file format */
  uidescFormat: UidescFormat;

  /** Captured editor state for session restoration */
  editorState: EditorState;

  /** Project-specific settings */
  settings: ProjectSettings;

  /** Base64 data URL thumbnail for project list, or null */
  thumbnailDataUrl: string | null;
}

/**
 * Supported uidesc file formats.
 */
export type UidescFormat = 'json' | 'xml';

/**
 * A bitmap asset stored in IndexedDB.
 * Each bitmap belongs to exactly one project.
 */
export interface Bitmap {
  /** Unique identifier (UUID) */
  id: string;

  /** Parent project ID */
  projectId: string;

  /** Display name matching uidesc bitmap reference */
  name: string;

  /** Actual image data */
  blob: Blob;

  /** MIME type (e.g., 'image/png') */
  mimeType: string;

  /** Image width in pixels */
  width: number;

  /** Image height in pixels */
  height: number;

  /** File size in bytes */
  size: number;

  /** ISO 8601 timestamp when added */
  addedAt: string;
}

// ============================================================================
// Editor State
// ============================================================================

/**
 * Captured editor state for session restoration.
 * Serialized as part of the Project record.
 */
export interface EditorState {
  /** Canvas pan offset */
  panOffset: Point;

  /** Canvas zoom level (0.1 to 5.0) */
  zoomLevel: number;

  /** IDs of expanded nodes in hierarchy panel */
  expandedHierarchyNodes: string[];

  /** IDs of expanded groups in properties panel */
  expandedPropertyGroups: string[];

  /** Currently selected template, or null */
  selectedTemplateId: string | null;
}

/**
 * 2D point for canvas positioning.
 */
export interface Point {
  x: number;
  y: number;
}

// ============================================================================
// Project Settings
// ============================================================================

/**
 * Complete project settings structure.
 */
export interface ProjectSettings {
  grid: GridSettings;
  snap: SnapSettings;
  smartGuides: SmartGuidesSettings;
  customGuides: CustomGuidesSettings;
  theme: ThemeSettings;
  autoSave: AutoSaveSettings;
}

/**
 * Grid display settings.
 */
export interface GridSettings {
  /** Grid spacing in pixels */
  size: GridSizePreset;

  /** Visual style of grid lines */
  style: GridStyle;

  /** Whether grid is visible when opening document */
  visibleByDefault: boolean;
}

/** Valid grid size presets */
export type GridSizePreset = 5 | 8 | 10 | 12 | 16 | 20;

/** Grid visual styles */
export type GridStyle = 'lines' | 'dots' | 'crosshairs';

/**
 * Snap-to-grid settings.
 */
export interface SnapSettings {
  /** Whether snap is enabled when opening document */
  enabledByDefault: boolean;

  /** Snap distance in pixels (1-20) */
  threshold: number;
}

/**
 * Smart alignment guides settings.
 */
export interface SmartGuidesSettings {
  /** Whether smart guides are enabled when opening document */
  enabledByDefault: boolean;
}

/**
 * Custom guide lines settings.
 */
export interface CustomGuidesSettings {
  /** Whether snap-to-guides is enabled when opening document */
  snapEnabledByDefault: boolean;

  /** Saved guide positions */
  guides: Guide[];
}

/**
 * A custom alignment guide line.
 */
export interface Guide {
  /** Unique identifier */
  id: string;

  /** Guide direction */
  orientation: 'horizontal' | 'vertical';

  /** Position in pixels from origin */
  position: number;
}

/**
 * Theme settings.
 */
export interface ThemeSettings {
  /** Theme mode preference */
  mode: ThemeMode;
}

/** Theme mode options */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Auto-save settings.
 */
export interface AutoSaveSettings {
  /** Whether auto-save is enabled */
  enabled: boolean;
}

// ============================================================================
// Store State
// ============================================================================

/**
 * Project store state for current session.
 */
export interface ProjectStoreState {
  /** Currently open project, or null if no project open */
  currentProject: Project | null;

  /** Whether current project has unsaved changes */
  isDirty: boolean;

  /** Current save operation status */
  saveStatus: SaveStatus;

  /** Timestamp of last successful save */
  lastSavedAt: Date | null;

  /** Whether IndexedDB is unavailable (session-only mode) */
  isSessionOnly: boolean;

  /** Whether project list modal is open */
  isProjectListOpen: boolean;

  /** Whether name dialog is open (for create/rename) */
  isNameDialogOpen: boolean;

  /** Mode for name dialog */
  nameDialogMode: NameDialogMode | null;

  /** Pending file for project creation */
  pendingFile: PendingFileInfo | null;
}

/** Save operation status */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/** Name dialog modes */
export type NameDialogMode = 'create' | 'rename' | 'duplicate';

/**
 * Pending file info for project creation.
 * Stored after a file is parsed and before the project name dialog is completed.
 */
export interface PendingFileInfo {
  /** Raw file content */
  content: string;
  /** Detected format */
  format: UidescFormat;
  /** Original filename */
  filename: string;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Result of project name validation.
 */
export interface NameValidationResult {
  /** Whether the name is valid */
  valid: boolean;

  /** Error message if invalid */
  error?: string;
}

/**
 * Storage quota information.
 */
export interface StorageQuota {
  /** Bytes used by this origin */
  used: number;

  /** Total bytes available to this origin */
  available: number;

  /** Percentage of quota used (0-100) */
  percentUsed: number;
}

// ============================================================================
// Export
// ============================================================================

/** Export format options */
export type ExportFormat = 'json' | 'xml' | 'zip';

/**
 * Export operation result.
 */
export interface ExportResult {
  /** Whether export succeeded */
  success: boolean;

  /** Filename of exported file */
  filename: string;

  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Replace Uidesc
// ============================================================================

/**
 * Result of a replaceUidesc operation.
 */
export interface ReplaceUidescResult {
  /** Whether the replace succeeded */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** List of bitmaps that are no longer referenced by the new uidesc */
  orphanedBitmaps?: OrphanedBitmap[];
}

/**
 * Information about an orphaned bitmap.
 */
export interface OrphanedBitmap {
  /** Bitmap name */
  name: string;

  /** File size in bytes */
  size: number;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default editor state for new projects.
 */
export const DEFAULT_EDITOR_STATE: EditorState = {
  panOffset: { x: 0, y: 0 },
  zoomLevel: 1.0,
  expandedHierarchyNodes: [],
  expandedPropertyGroups: ['layout', 'appearance', 'behavior', 'typography', 'animation'],
  selectedTemplateId: null,
};

/**
 * Default project settings for new projects.
 */
export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  grid: {
    size: 10,
    style: 'lines',
    visibleByDefault: false,
  },
  snap: {
    enabledByDefault: false,
    threshold: 5,
  },
  smartGuides: {
    enabledByDefault: true,
  },
  customGuides: {
    snapEnabledByDefault: true,
    guides: [],
  },
  theme: {
    mode: 'system',
  },
  autoSave: {
    enabled: true,
  },
};

// ============================================================================
// Constants
// ============================================================================

/** IndexedDB database name */
export const DB_NAME = 'vstgui-edit-projects';

/** IndexedDB database version */
export const DB_VERSION = 1;

/** Object store names */
export const STORES = {
  PROJECTS: 'projects',
  BITMAPS: 'bitmaps',
} as const;

/** Index names */
export const INDEXES = {
  BITMAPS_BY_PROJECT: 'projectId',
} as const;

/** Auto-save debounce timers (milliseconds) */
export const DEBOUNCE = {
  DOCUMENT: 2000,
  EDITOR_STATE: 10000,
} as const;

/** Thumbnail dimensions */
export const THUMBNAIL = {
  WIDTH: 200,
  HEIGHT: 150,
} as const;

/** Storage limits */
export const LIMITS = {
  /** Maximum bitmap size in bytes (10MB) */
  MAX_BITMAP_SIZE: 10 * 1024 * 1024,

  /** Maximum project name length */
  MAX_NAME_LENGTH: 100,

  /** Minimum project name length */
  MIN_NAME_LENGTH: 1,

  /** Maximum guides per project */
  MAX_GUIDES: 50,

  /** Storage warning threshold (percentage) */
  QUOTA_WARNING_THRESHOLD: 80,
} as const;

/** Project name validation regex */
export const PROJECT_NAME_REGEX = /^[a-zA-Z0-9 _-]+$/;
