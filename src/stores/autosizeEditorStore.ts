/**
 * Autosize Editor Open Store
 *
 * Tracks which autosize editor dropdown is currently open.
 * This state is stored externally to survive component remounts
 * that occur when attribute values change.
 */

import { createSignal } from 'solid-js';

// Track which attribute's autosize editor is open (null if none)
const [openAutosizeEditor, setOpenAutosizeEditor] = createSignal<string | null>(null);

/**
 * Check if a specific autosize editor is open
 */
export function isAutosizeEditorOpen(attributeName: string): boolean {
  return openAutosizeEditor() === attributeName;
}

/**
 * Open an autosize editor dropdown
 */
export function openAutosizeEditorDropdown(attributeName: string): void {
  setOpenAutosizeEditor(attributeName);
}

/**
 * Close the autosize editor dropdown
 */
export function closeAutosizeEditorDropdown(): void {
  setOpenAutosizeEditor(null);
}

/**
 * Reset the store (for testing)
 */
export function resetAutosizeEditorStore(): void {
  setOpenAutosizeEditor(null);
}
