/**
 * Save Format Store API Contract
 *
 * This file defines the TypeScript interface for the saveFormatStore module.
 * Implementation: src/stores/saveFormatStore.ts
 */

import type { SaveFormat } from '../../../src/domain/serializer/types';

/**
 * Read-only store state
 */
export interface SaveFormatStoreState {
  /** Currently selected format for saving */
  readonly selectedFormat: SaveFormat;

  /** Whether the format dropdown is open */
  readonly isDropdownOpen: boolean;

  /** Whether the format change confirmation dialog is open */
  readonly isConfirmDialogOpen: boolean;

  /** Format pending user confirmation (when dialog is open) */
  readonly pendingFormat: SaveFormat | null;
}

/**
 * Store actions
 */
export interface SaveFormatStoreActions {
  /**
   * Initialize the selected format based on:
   * 1. originalFormat (if provided)
   * 2. localStorage preference
   * 3. 'json' default
   *
   * @param originalFormat - Format of the loaded file, or null for new documents
   */
  initializeFormat(originalFormat: SaveFormat | null): void;

  /**
   * Open the format selection dropdown
   */
  openDropdown(): void;

  /**
   * Close the format selection dropdown
   */
  closeDropdown(): void;

  /**
   * Select a format from the dropdown.
   * - If format differs from originalFormat, opens confirmation dialog
   * - If format same as current or originalFormat is null, applies immediately
   *
   * @param format - The format to select
   */
  selectFormat(format: SaveFormat): void;

  /**
   * Confirm the pending format change.
   * - Applies pendingFormat as selectedFormat
   * - Persists to localStorage
   * - Closes confirmation dialog
   */
  confirmFormatChange(): void;

  /**
   * Cancel the pending format change.
   * - Clears pendingFormat
   * - Closes confirmation dialog
   * - Leaves selectedFormat unchanged
   */
  cancelFormatChange(): void;

  /**
   * Reset store to initial state.
   * Used for testing and when clearing document.
   */
  resetSaveFormatStore(): void;
}

/**
 * The exported store combines state and actions
 */
export type SaveFormatStore = SaveFormatStoreState;

/**
 * The store instance (reactive, read-only)
 */
export declare const saveFormatStore: SaveFormatStore;

/**
 * Exported action functions
 */
export declare const initializeFormat: SaveFormatStoreActions['initializeFormat'];
export declare const openDropdown: SaveFormatStoreActions['openDropdown'];
export declare const closeDropdown: SaveFormatStoreActions['closeDropdown'];
export declare const selectFormat: SaveFormatStoreActions['selectFormat'];
export declare const confirmFormatChange: SaveFormatStoreActions['confirmFormatChange'];
export declare const cancelFormatChange: SaveFormatStoreActions['cancelFormatChange'];
export declare const resetSaveFormatStore: SaveFormatStoreActions['resetSaveFormatStore'];
