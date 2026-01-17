/**
 * View Mode Store Contract
 *
 * State management for canvas view mode (wireframe/styled).
 * Location: src/stores/viewModeStore.ts
 */

import type { ViewMode, ViewModeState } from './viewMode.types';

// =============================================================================
// Store State
// =============================================================================

/**
 * Initial state for the view mode store.
 */
export const initialState: ViewModeState = {
  mode: 'wireframe',
};

// =============================================================================
// Store Exports
// =============================================================================

/**
 * Reactive store instance (read-only).
 */
export declare const viewModeStore: ViewModeState;

// =============================================================================
// Actions
// =============================================================================

/**
 * Sets the view mode.
 * Also updates the preferencesStore to persist the change.
 *
 * @param mode - The view mode to set ('wireframe' or 'styled')
 */
export declare function setViewMode(mode: ViewMode): void;

/**
 * Toggles between wireframe and styled view modes.
 * If current mode is 'wireframe', switches to 'styled', and vice versa.
 */
export declare function toggleViewMode(): void;

/**
 * Resets the store to initial state (wireframe mode).
 * Used for testing and cleanup.
 */
export declare function resetViewModeStore(): void;

/**
 * Initializes the view mode from preferences.
 * Called when preferences are loaded or on document load.
 *
 * @param mode - The view mode from preferences
 */
export declare function initializeViewMode(mode: ViewMode): void;
