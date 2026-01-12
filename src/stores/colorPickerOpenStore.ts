/**
 * Store to track which color picker (by attribute name) is currently open.
 *
 * This is needed because the PropertiesPanel uses <For> loops that recreate
 * components when the document updates. By lifting the "is picker open" state
 * to this store, the state persists across component remounts.
 */
import { createSignal } from 'solid-js';

// Track which attribute's color picker is currently open (null = none open)
const [openColorPickerAttribute, setOpenColorPickerAttribute] = createSignal<string | null>(null);

// Track the original value when the picker was opened (for cancel/revert)
const [originalColorValue, setOriginalColorValue] = createSignal<string | null>(null);

/**
 * Check if the color picker for a specific attribute is open
 */
export function isColorPickerOpen(attributeName: string): boolean {
  return openColorPickerAttribute() === attributeName;
}

/**
 * Open the color picker for a specific attribute
 */
export function openColorPicker(attributeName: string, originalValue: string): void {
  setOpenColorPickerAttribute(attributeName);
  setOriginalColorValue(originalValue);
}

/**
 * Close the currently open color picker
 */
export function closeColorPicker(): void {
  setOpenColorPickerAttribute(null);
  setOriginalColorValue(null);
}

/**
 * Get the original value when the picker was opened
 */
export function getOriginalColorValue(): string | null {
  return originalColorValue();
}

/**
 * Get the currently open attribute name (for debugging)
 */
export function getOpenColorPickerAttribute(): string | null {
  return openColorPickerAttribute();
}

/**
 * Reset the store (for testing)
 */
export function resetColorPickerOpenStore(): void {
  setOpenColorPickerAttribute(null);
  setOriginalColorValue(null);
}
