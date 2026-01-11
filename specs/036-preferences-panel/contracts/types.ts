/**
 * Preferences Types Contract
 *
 * Re-exports all types from data-model.md for implementation.
 * Implementation file: src/types/preferences.ts
 */

// =============================================================================
// Core Preference Types
// =============================================================================

/**
 * Complete user preferences structure stored in localStorage.
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

/**
 * Valid grid size presets.
 */
export type GridSizePreset = 5 | 8 | 10 | 12 | 16 | 20;

/**
 * Grid visual styles.
 */
export type GridStyle = 'lines' | 'dots' | 'crosshairs';

/**
 * Snap-to-grid behavior settings.
 */
export interface SnapPreferences {
  /** Whether snap-to-grid is enabled when opening a document */
  enabledByDefault: boolean;

  /** Distance in pixels within which views snap to grid lines (1-20) */
  threshold: number;
}

/**
 * Smart alignment guides settings.
 */
export interface SmartGuidesPreferences {
  /** Whether smart guides are enabled when opening a document */
  enabledByDefault: boolean;
}

/**
 * Custom guide lines settings.
 */
export interface CustomGuidesPreferences {
  /** Whether snap-to-guides is enabled when opening a document */
  snapEnabledByDefault: boolean;
}

/**
 * Visual theme settings.
 */
export interface ThemePreferences {
  /** Selected theme mode */
  mode: ThemeMode;
}

/**
 * Theme mode options.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * UI component state.
 */
export interface UIPreferences {
  /** Alignment toolbar dock/float state */
  alignmentToolbar: AlignmentToolbarState;
}

/**
 * Alignment toolbar state.
 */
export interface AlignmentToolbarState {
  /** Whether toolbar is docked or floating */
  isDocked: boolean;

  /** Position when floating (null when docked) */
  floatingPosition: { x: number; y: number } | null;
}

/**
 * Save format settings.
 */
export interface SavePreferences {
  /** Preferred save format */
  format: SaveFormat | null;
}

/**
 * Save format options.
 */
export type SaveFormat = 'json' | 'xml';

// =============================================================================
// UI Types
// =============================================================================

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
 * A single keyboard shortcut entry.
 */
export interface KeyboardShortcut {
  /** Key combination display string */
  keys: string;

  /** Action description */
  description: string;
}

/**
 * A category of related shortcuts.
 */
export interface ShortcutCategory {
  /** Category name */
  name: string;

  /** Shortcuts in this category */
  shortcuts: KeyboardShortcut[];
}

// =============================================================================
// Store State Types
// =============================================================================

/**
 * Reactive store state for preferences panel.
 */
export interface PreferencesState {
  /** Current preferences */
  preferences: UserPreferences;

  /** Whether preferences panel is open */
  isOpen: boolean;

  /** Currently selected section in sidebar */
  activeSection: PreferencesSection;

  /** Whether reset confirmation dialog is shown */
  isResetDialogOpen: boolean;

  /** Whether preferences have been modified from defaults */
  isDirty: boolean;
}

// =============================================================================
// Validation Types
// =============================================================================

/**
 * Result of preferences validation.
 */
export interface PreferencesValidationResult {
  /** Whether preferences are valid */
  valid: boolean;

  /** Validation errors (empty if valid) */
  errors: string[];
}

// =============================================================================
// Migration Types
// =============================================================================

/**
 * Legacy key identifiers for migration.
 */
export type LegacyKey = 'vstgui-edit:alignment-toolbar' | 'vstgui-edit:save-format';

/**
 * Result of migration attempt.
 */
export interface MigrationResult {
  /** Whether migration was performed */
  migrated: boolean;

  /** Keys that were migrated */
  migratedKeys: LegacyKey[];

  /** Keys that failed to migrate */
  failedKeys: LegacyKey[];
}
