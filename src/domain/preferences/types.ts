/**
 * Preferences Types
 *
 * Type definitions for the unified preferences system.
 */

// ============================================================================
// Grid Preferences
// ============================================================================

/** Valid grid size presets */
export type GridSizePreset = 5 | 8 | 10 | 12 | 16 | 20;

/** Grid visual styles */
export type GridStyle = 'lines' | 'dots' | 'crosshairs';

/**
 * Grid display settings.
 */
export interface GridPreferences {
  /** Grid spacing in pixels */
  size: GridSizePreset;

  /** Visual style of grid lines */
  style: GridStyle;

  /** Whether grid is visible when opening a document */
  visibleByDefault: boolean;
}

// ============================================================================
// Snap Preferences
// ============================================================================

/**
 * Snap-to-grid behavior settings.
 */
export interface SnapPreferences {
  /** Whether snap-to-grid is enabled when opening a document */
  enabledByDefault: boolean;

  /** Distance in pixels within which views snap to grid lines (1-20) */
  threshold: number;
}

// ============================================================================
// Smart Guides Preferences
// ============================================================================

/**
 * Smart alignment guides settings.
 */
export interface SmartGuidesPreferences {
  /** Whether smart guides are enabled when opening a document */
  enabledByDefault: boolean;
}

// ============================================================================
// Custom Guides Preferences
// ============================================================================

/**
 * Custom guide lines settings.
 */
export interface CustomGuidesPreferences {
  /** Whether snap-to-guides is enabled when opening a document */
  snapEnabledByDefault: boolean;
}

// ============================================================================
// Theme Preferences
// ============================================================================

/** Theme mode options */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Visual theme settings.
 * Note: Theme application is stubbed in initial implementation.
 */
export interface ThemePreferences {
  /** Selected theme mode */
  mode: ThemeMode;
}

// ============================================================================
// UI Preferences
// ============================================================================

/**
 * Alignment toolbar state (from alignmentToolbarStore).
 */
export interface AlignmentToolbarState {
  /** Whether toolbar is docked or floating */
  isDocked: boolean;

  /** Position when floating (null when docked) */
  floatingPosition: { x: number; y: number } | null;
}

/**
 * UI component state (migrated from legacy localStorage keys).
 */
export interface UIPreferences {
  /** Alignment toolbar dock/float state */
  alignmentToolbar: AlignmentToolbarState;
}

// ============================================================================
// Save Preferences
// ============================================================================

/** Save format options */
export type SaveFormat = 'json' | 'xml';

/**
 * Save format settings (migrated from legacy localStorage keys).
 */
export interface SavePreferences {
  /** Preferred save format */
  format: SaveFormat | null;
}

// ============================================================================
// User Preferences (Root)
// ============================================================================

/**
 * Complete user preferences structure stored in localStorage.
 * All fields are required after validation/merging with defaults.
 */
export interface UserPreferences {
  /** Preferences schema version for future migrations */
  version: 1;

  /** Grid display and behavior settings */
  grid: GridPreferences;

  /** Snap-to-grid settings */
  snap: SnapPreferences;

  /** Smart alignment guides settings */
  smartGuides: SmartGuidesPreferences;

  /** Custom guide lines settings */
  customGuides: CustomGuidesPreferences;

  /** Visual theme settings */
  theme: ThemePreferences;

  /** UI component state (migrated from legacy keys) */
  ui: UIPreferences;

  /** Save format settings (migrated from legacy keys) */
  save: SavePreferences;
}

// ============================================================================
// UI Types (Sidebar Navigation)
// ============================================================================

/**
 * Navigation sections in the preferences panel.
 */
export type PreferencesSection =
  | 'grid'
  | 'snap'
  | 'smartGuides'
  | 'customGuides'
  | 'theme'
  | 'shortcuts';

/**
 * Section metadata for sidebar navigation.
 */
export interface PreferencesSectionInfo {
  id: PreferencesSection;
  label: string;
  icon: string;
}

// ============================================================================
// Store State Types
// ============================================================================

/**
 * Reactive store state for preferences panel.
 */
export interface PreferencesState {
  /** Current preferences (reactive) */
  preferences: UserPreferences;

  /** Whether preferences panel is open */
  isOpen: boolean;

  /** Currently selected section in sidebar */
  activeSection: PreferencesSection;

  /** Whether reset confirmation dialog is shown */
  isResetDialogOpen: boolean;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Result of validating preferences against schema.
 */
export interface PreferencesValidationResult {
  /** Whether preferences are valid */
  valid: boolean;

  /** Validation errors (empty if valid) */
  errors: string[];
}

// ============================================================================
// Migration Types
// ============================================================================

/**
 * Result of migrating legacy preferences.
 */
export interface MigrationResult {
  /** Whether any migration occurred */
  migrated: boolean;

  /** Keys that were successfully migrated */
  migratedKeys: string[];

  /** Keys that failed to migrate */
  failedKeys: string[];
}

/** Legacy localStorage keys to migrate */
export type LegacyKey = 'vstgui-edit:alignment-toolbar' | 'vstgui-edit:save-format';
