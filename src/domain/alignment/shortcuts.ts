/**
 * Keyboard Shortcuts for Alignment
 *
 * Handler for Ctrl+Shift+{L,C,R,T,M,B} alignment shortcuts.
 */

import type { AlignmentType } from '../../types/alignment';

/**
 * Keyboard shortcut key to alignment type mapping.
 */
const SHORTCUT_MAP: Record<string, AlignmentType> = {
  l: 'left',
  c: 'center',
  r: 'right',
  t: 'top',
  m: 'middle',
  b: 'bottom',
};

/**
 * Callback for executing alignment when shortcut is triggered.
 */
export type AlignmentCallback = (type: AlignmentType, selectedIds: string[]) => void;

/**
 * Handles Ctrl+Shift+{L,C,R,T,M,B} shortcuts.
 *
 * @param event - The keyboard event
 * @param selectedIds - Set of currently selected view IDs
 * @param onAlign - Callback to execute alignment (optional, for dependency injection)
 * @returns true if the shortcut was handled, false otherwise
 */
export function handleAlignmentShortcut(
  event: KeyboardEvent,
  selectedIds: Set<string>,
  onAlign?: AlignmentCallback
): boolean {
  // Must have Ctrl+Shift pressed
  if (!event.ctrlKey || !event.shiftKey) {
    return false;
  }

  // Must have views selected
  if (selectedIds.size === 0) {
    return false;
  }

  // Check if key maps to an alignment type
  const key = event.key.toLowerCase();
  const alignmentType = SHORTCUT_MAP[key];

  if (!alignmentType) {
    return false;
  }

  // If callback provided, execute it
  if (onAlign) {
    onAlign(alignmentType, [...selectedIds]);
  }

  return true;
}
