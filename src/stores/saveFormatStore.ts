/**
 * Save Format Store
 *
 * Manages the state for save format selection UI including:
 * - Current selected format
 * - Dropdown open/close state
 * - Confirmation dialog state for format changes
 */

import { createStore } from 'solid-js/store';
import { getFormatPreference, setFormatPreference } from '../domain/save/formatPreference';
import type { SaveFormat } from '../domain/serializer/types';
import type { SaveFormatState } from '../types/save';

/**
 * Internal state tracking the original format of the loaded file.
 * Used to determine if confirmation is needed when changing format.
 */
let originalFormat: SaveFormat | null = null;

/**
 * Initial state for the save format store.
 */
const initialState: SaveFormatState = {
  selectedFormat: 'json',
  isDropdownOpen: false,
  isConfirmDialogOpen: false,
  pendingFormat: null,
};

const [store, setStore] = createStore<SaveFormatState>({ ...initialState });

/**
 * Initialize the selected format based on:
 * 1. originalFormat (if provided)
 * 2. localStorage preference
 * 3. 'json' default
 *
 * @param format - Format of the loaded file, or null for new documents
 */
export function initializeFormat(format: SaveFormat | null): void {
  originalFormat = format;

  if (format !== null) {
    setStore({ selectedFormat: format });
  } else {
    const preference = getFormatPreference();
    setStore({ selectedFormat: preference ?? 'json' });
  }
}

/**
 * Open the format selection dropdown.
 */
export function openDropdown(): void {
  setStore({ isDropdownOpen: true });
}

/**
 * Close the format selection dropdown.
 */
export function closeDropdown(): void {
  setStore({ isDropdownOpen: false });
}

/**
 * Select a format from the dropdown.
 * - If format differs from originalFormat, opens confirmation dialog
 * - If format same as current or originalFormat is null, applies immediately
 *
 * @param format - The format to select
 */
export function selectFormat(format: SaveFormat): void {
  // Close dropdown regardless
  setStore({ isDropdownOpen: false });

  // No confirmation needed if:
  // 1. No original format (new document)
  // 2. Same as original format
  if (originalFormat === null || format === originalFormat) {
    setStore({ selectedFormat: format });
    return;
  }

  // Need confirmation - show dialog
  setStore({
    isConfirmDialogOpen: true,
    pendingFormat: format,
  });
}

/**
 * Confirm the pending format change.
 * - Applies pendingFormat as selectedFormat
 * - Persists to localStorage
 * - Closes confirmation dialog
 */
export function confirmFormatChange(): void {
  const pending = store.pendingFormat;
  if (pending === null) {
    return;
  }

  setStore({
    selectedFormat: pending,
    pendingFormat: null,
    isConfirmDialogOpen: false,
  });

  // Persist to localStorage
  setFormatPreference(pending);
}

/**
 * Cancel the pending format change.
 * - Clears pendingFormat
 * - Closes confirmation dialog
 * - Leaves selectedFormat unchanged
 */
export function cancelFormatChange(): void {
  setStore({
    pendingFormat: null,
    isConfirmDialogOpen: false,
  });
}

/**
 * Reset store to initial state.
 * Used for testing and when clearing document.
 */
export function resetSaveFormatStore(): void {
  originalFormat = null;
  setStore({ ...initialState });
}

/**
 * The store instance (reactive, read-only)
 */
export const saveFormatStore = store;
