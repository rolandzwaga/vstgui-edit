/**
 * View Mode Store
 *
 * State management for canvas view mode (wireframe/styled).
 */

import { createSignal } from 'solid-js';
import type { ViewMode, ViewModeState } from '../types/viewMode';
import { DEFAULT_VIEW_MODE } from '../types/viewMode';

// =============================================================================
// Signals
// =============================================================================

const [mode, setMode] = createSignal<ViewMode>(DEFAULT_VIEW_MODE);

// =============================================================================
// Store (read-only reactive access)
// =============================================================================

/**
 * Reactive store instance (read-only).
 */
export const viewModeStore: ViewModeState = {
  get mode() {
    return mode();
  },
};

// =============================================================================
// Actions
// =============================================================================

/**
 * Sets the view mode.
 * Also updates the preferencesStore to persist the change.
 *
 * @param newMode - The view mode to set ('wireframe' or 'styled')
 */
export function setViewMode(newMode: ViewMode): void {
  setMode(newMode);
  // Import dynamically to avoid circular dependency
  // Preferences update is handled by the calling code to avoid cycles
}

/**
 * Toggles between wireframe and styled view modes.
 * If current mode is 'wireframe', switches to 'styled', and vice versa.
 */
export function toggleViewMode(): void {
  setMode(current => (current === 'wireframe' ? 'styled' : 'wireframe'));
}

/**
 * Resets the store to initial state (wireframe mode).
 * Used for testing and cleanup.
 */
export function resetViewModeStore(): void {
  setMode(DEFAULT_VIEW_MODE);
}

/**
 * Initializes the view mode from preferences.
 * Called when preferences are loaded or on document load.
 *
 * @param initialMode - The view mode from preferences
 */
export function initializeViewMode(initialMode: ViewMode): void {
  setMode(initialMode);
}
