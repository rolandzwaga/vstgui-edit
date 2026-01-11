/**
 * Preferences Store API Contract
 *
 * Defines the public interface for preferencesStore.
 * Implementation in: src/stores/preferencesStore.ts
 */

import type {
  CustomGuidesPreferences,
  GridPreferences,
  PreferencesSection,
  SavePreferences,
  SmartGuidesPreferences,
  SnapPreferences,
  ThemePreferences,
  UIPreferences,
  UserPreferences,
} from './types';

/**
 * Storage key for unified preferences.
 */
export const STORAGE_KEY = 'vstgui-edit:preferences';

/**
 * Reactive preferences store (read-only access).
 */
export interface PreferencesStore {
  /** Complete preferences object */
  readonly preferences: UserPreferences;

  /** Whether preferences panel is open */
  readonly isOpen: boolean;

  /** Currently active section in preferences panel */
  readonly activeSection: PreferencesSection;

  /** Whether reset confirmation dialog is shown */
  readonly isResetDialogOpen: boolean;

  /** Whether preferences have been modified from defaults */
  readonly isDirty: boolean;
}

// =============================================================================
// Panel State Actions
// =============================================================================

/**
 * Open the preferences panel.
 * Focuses the panel and sets initial section.
 */
export function openPreferences(): void;

/**
 * Close the preferences panel.
 * Auto-saves any pending changes.
 */
export function closePreferences(): void;

/**
 * Navigate to a specific section in the panel.
 */
export function setActiveSection(section: PreferencesSection): void;

/**
 * Open the reset confirmation dialog.
 */
export function openResetDialog(): void;

/**
 * Close the reset confirmation dialog.
 */
export function closeResetDialog(): void;

// =============================================================================
// Grid Settings Actions
// =============================================================================

/**
 * Update grid size preference.
 * Immediately applies to gridStore and persists to localStorage.
 */
export function setGridSize(size: GridPreferences['size']): void;

/**
 * Update grid style preference.
 * Immediately applies to gridStore and persists to localStorage.
 */
export function setGridStyle(style: GridPreferences['style']): void;

/**
 * Update grid default visibility preference.
 * Persists to localStorage. Applied on next document load.
 */
export function setGridVisibleByDefault(visible: boolean): void;

// =============================================================================
// Snap Settings Actions
// =============================================================================

/**
 * Update snap enabled by default preference.
 * Persists to localStorage. Applied on next document load.
 */
export function setSnapEnabledByDefault(enabled: boolean): void;

/**
 * Update snap threshold preference.
 * Immediately applies to gridStore and persists to localStorage.
 * @param threshold - Value 1-20, clamped if out of range
 */
export function setSnapThreshold(threshold: number): void;

// =============================================================================
// Smart Guides Settings Actions
// =============================================================================

/**
 * Update smart guides enabled by default preference.
 * Persists to localStorage. Applied on next document load.
 */
export function setSmartGuidesEnabledByDefault(enabled: boolean): void;

// =============================================================================
// Custom Guides Settings Actions
// =============================================================================

/**
 * Update custom guides snap enabled by default preference.
 * Persists to localStorage. Applied on next document load.
 */
export function setCustomGuidesSnapEnabledByDefault(enabled: boolean): void;

// =============================================================================
// Theme Settings Actions
// =============================================================================

/**
 * Update theme mode preference.
 * Persists to localStorage.
 * Note: Actual theme application is stubbed in initial implementation.
 */
export function setThemeMode(mode: ThemePreferences['mode']): void;

// =============================================================================
// Lifecycle Actions
// =============================================================================

/**
 * Initialize preferences from localStorage.
 * - Runs migration if legacy keys exist
 * - Validates stored preferences
 * - Resets to defaults if validation fails
 * - Applies preferences to existing stores
 *
 * Call once on app initialization.
 */
export function initializePreferences(): void;

/**
 * Apply current preferences to all relevant stores.
 * Called after loading preferences and after any preference change.
 */
export function applyPreferencesToStores(): void;

/**
 * Reset all preferences to factory defaults.
 * - Clears localStorage
 * - Resets in-memory state
 * - Applies defaults to existing stores
 * - Closes reset dialog
 */
export function resetToDefaults(): void;

/**
 * Reset the store to initial state.
 * Used for testing.
 */
export function resetPreferencesStore(): void;

// =============================================================================
// Persistence Helpers
// =============================================================================

/**
 * Manually trigger save to localStorage.
 * Normally called automatically on preference changes.
 */
export function savePreferences(): void;

/**
 * Check if localStorage is available.
 * Returns false in private browsing mode.
 */
export function isStorageAvailable(): boolean;
