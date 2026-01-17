/**
 * Ninepart Editor Open Store
 *
 * Tracks which ninepart editor dropdown is currently open.
 * This state is stored externally to survive component remounts
 * that occur when attribute values change.
 */

import { createSignal } from 'solid-js';

// Track which attribute's ninepart editor is open (null if none)
const [openNinepartEditor, setOpenNinepartEditor] = createSignal<string | null>(null);

/**
 * Check if a specific ninepart editor is open
 */
export function isNinepartEditorOpen(attributeName: string): boolean {
  return openNinepartEditor() === attributeName;
}

/**
 * Open a ninepart editor dropdown
 */
export function openNinepartEditorDropdown(attributeName: string): void {
  setOpenNinepartEditor(attributeName);
}

/**
 * Close the ninepart editor dropdown
 */
export function closeNinepartEditorDropdown(): void {
  setOpenNinepartEditor(null);
}

/**
 * Reset the store (for testing)
 */
export function resetNinepartEditorStore(): void {
  setOpenNinepartEditor(null);
}
