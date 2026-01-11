/**
 * Preferences Store
 *
 * Unified state management for all user preferences.
 */

import { createStore } from 'solid-js/store';
import { DEFAULT_PREFERENCES } from '../domain/preferences/defaults';
import { migratePreferences, needsMigration } from '../domain/preferences/migration';
import { loadPreferences, savePreferences } from '../domain/preferences/persistence';
import type {
  AlignmentToolbarState,
  GridSizePreset,
  GridStyle,
  PreferencesSection,
  PreferencesState,
  SaveFormat,
  ThemeMode,
} from '../types/preferences';
import {
  setGridSize,
  setGridStyle,
  setGridVisibility,
  setSnapEnabled,
  setSnapThreshold,
} from './gridStore';
import { setGuidesSnap } from './guidesStore';
import { setSmartGuidesEnabled } from './smartGuidesStore';

// ============================================================================
// Initial State
// ============================================================================

const initialState: PreferencesState = {
  preferences: { ...DEFAULT_PREFERENCES },
  isOpen: false,
  activeSection: 'grid',
  isResetDialogOpen: false,
};

// ============================================================================
// Store
// ============================================================================

const [store, setStore] = createStore<PreferencesState>({ ...initialState });

/**
 * The reactive store instance (read-only).
 */
export const preferencesStore = store;

// ============================================================================
// Panel State Actions
// ============================================================================

/**
 * Opens the preferences panel.
 */
export function openPreferences(): void {
  setStore({ isOpen: true });
}

/**
 * Closes the preferences panel.
 */
export function closePreferences(): void {
  setStore({ isOpen: false });
}

/**
 * Sets the active section in the sidebar.
 */
export function setActiveSection(section: PreferencesSection): void {
  setStore({ activeSection: section });
}

/**
 * Opens the reset confirmation dialog.
 */
export function openResetDialog(): void {
  setStore({ isResetDialogOpen: true });
}

/**
 * Closes the reset confirmation dialog.
 */
export function closeResetDialog(): void {
  setStore({ isResetDialogOpen: false });
}

// ============================================================================
// Grid Preference Setters
// ============================================================================

/**
 * Sets the grid size preference and applies to gridStore.
 */
export function setGridSizePreference(size: GridSizePreset): void {
  setStore('preferences', 'grid', 'size', size);
  setGridSize(size);
  saveCurrentPreferences();
}

/**
 * Sets the grid style preference and applies to gridStore.
 */
export function setGridStylePreference(style: GridStyle): void {
  setStore('preferences', 'grid', 'style', style);
  setGridStyle(style);
  saveCurrentPreferences();
}

/**
 * Sets the grid visible by default preference.
 */
export function setGridVisibleByDefaultPreference(visible: boolean): void {
  setStore('preferences', 'grid', 'visibleByDefault', visible);
  saveCurrentPreferences();
}

// ============================================================================
// Snap Preference Setters
// ============================================================================

/**
 * Sets the snap enabled by default preference.
 */
export function setSnapEnabledByDefaultPreference(enabled: boolean): void {
  setStore('preferences', 'snap', 'enabledByDefault', enabled);
  saveCurrentPreferences();
}

/**
 * Sets the snap threshold preference and applies to gridStore.
 */
export function setSnapThresholdPreference(threshold: number): void {
  setStore('preferences', 'snap', 'threshold', threshold);
  setSnapThreshold(threshold);
  saveCurrentPreferences();
}

// ============================================================================
// Smart Guides Preference Setters
// ============================================================================

/**
 * Sets the smart guides enabled by default preference.
 */
export function setSmartGuidesEnabledByDefaultPreference(enabled: boolean): void {
  setStore('preferences', 'smartGuides', 'enabledByDefault', enabled);
  saveCurrentPreferences();
}

// ============================================================================
// Custom Guides Preference Setters
// ============================================================================

/**
 * Sets the custom guides snap enabled by default preference.
 */
export function setCustomGuidesSnapEnabledByDefaultPreference(enabled: boolean): void {
  setStore('preferences', 'customGuides', 'snapEnabledByDefault', enabled);
  saveCurrentPreferences();
}

// ============================================================================
// Theme Preference Setters
// ============================================================================

/**
 * Sets the theme mode preference.
 * Note: Theme application is stubbed - only persistence implemented.
 */
export function setThemeModePreference(mode: ThemeMode): void {
  setStore('preferences', 'theme', 'mode', mode);
  saveCurrentPreferences();
}

// ============================================================================
// Save Preference Setters
// ============================================================================

/**
 * Sets the save format preference.
 */
export function setSaveFormatPreference(format: SaveFormat | null): void {
  setStore('preferences', 'save', 'format', format);
  saveCurrentPreferences();
}

// ============================================================================
// UI Preference Setters
// ============================================================================

/**
 * Sets the alignment toolbar state preference.
 */
export function setAlignmentToolbarPreference(state: AlignmentToolbarState): void {
  setStore('preferences', 'ui', 'alignmentToolbar', state);
  saveCurrentPreferences();
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes preferences from localStorage.
 *
 * - Migrates legacy keys if needed
 * - Loads stored preferences
 * - Applies preferences to existing stores
 */
export function initializePreferences(): void {
  if (needsMigration()) {
    migratePreferences();
  }

  const prefs = loadPreferences();
  setStore('preferences', prefs);
  applyPreferencesToStores();
}

/**
 * Applies current preferences to existing stores.
 */
export function applyPreferencesToStores(): void {
  const prefs = store.preferences;

  // Apply to gridStore
  setGridSize(prefs.grid.size);
  setGridStyle(prefs.grid.style);
  setSnapThreshold(prefs.snap.threshold);

  // Note: visibleByDefault and enabledByDefault are applied on document load,
  // not here. The grid/snap/guides are toggled when loading a new document.

  // Note: smartGuides and customGuides defaults are also applied on document load
  // Note: alignmentToolbar state is loaded by its own store (alignmentToolbarStore)
}

/**
 * Applies default visibility/enabled states on document load.
 * Call this when a new document is loaded to reset states based on preferences.
 */
export function applyDefaultStatesOnDocumentLoad(): void {
  const prefs = store.preferences;

  // Apply grid visibility and snap defaults
  setGridVisibility(prefs.grid.visibleByDefault);
  setSnapEnabled(prefs.snap.enabledByDefault);

  // Apply smart guides default
  setSmartGuidesEnabled(prefs.smartGuides.enabledByDefault);

  // Apply custom guides snap default
  setGuidesSnap(prefs.customGuides.snapEnabledByDefault);
}

// ============================================================================
// Reset
// ============================================================================

/**
 * Resets all preferences to factory defaults.
 */
export function resetToDefaults(): void {
  setStore('preferences', { ...DEFAULT_PREFERENCES });
  saveCurrentPreferences();
  applyPreferencesToStores();
  closeResetDialog();
}

/**
 * Resets the store to initial state (for testing).
 */
export function resetPreferencesStore(): void {
  setStore({ ...initialState, preferences: { ...DEFAULT_PREFERENCES } });
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Saves current preferences to localStorage.
 */
function saveCurrentPreferences(): void {
  savePreferences(store.preferences);
}
