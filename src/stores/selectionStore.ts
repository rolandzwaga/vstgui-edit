/**
 * Selection Store - View selection state management.
 *
 * Uses SolidJS signals for reactive state with fine-grained updates.
 * Manages which views are selected and which view is currently hovered.
 */
import { createSignal } from 'solid-js';

// --- Signals for selection state ---

const [selectedIds, setSelectedIds] = createSignal<Set<string>>(new Set());
const [hoveredId, setHoveredId] = createSignal<string | null>(null);

// --- Reactive store object ---

/**
 * Reactive selection store exposing selection and hover state.
 * Access values as getters (they are signals).
 */
export const selectionStore = {
  get selectedIds() {
    return selectedIds();
  },
  get hoveredId() {
    return hoveredId();
  },
};

// --- Actions ---

/**
 * Select a single view, clearing any previous selection.
 * This is the standard single-click behavior.
 */
export function select(viewId: string): void {
  setSelectedIds(new Set([viewId]));
}

/**
 * Clear all selection (deselect all views).
 * Called when clicking on empty canvas or pressing Escape.
 */
export function clearSelection(): void {
  setSelectedIds(new Set<string>());
}

/**
 * Toggle selection of a view (add if not selected, remove if selected).
 * Used for Shift+click multi-selection behavior (FR-004).
 */
export function toggleSelect(viewId: string): void {
  const current = selectedIds();
  const newSet = new Set(current);

  if (newSet.has(viewId)) {
    newSet.delete(viewId);
  } else {
    newSet.add(viewId);
  }

  setSelectedIds(newSet);
}

/**
 * Select all views from the provided list.
 * Used for Ctrl+A keyboard shortcut (FR-005).
 */
export function selectAll(viewIds: string[]): void {
  setSelectedIds(new Set(viewIds));
}

/**
 * Reset all selection state to initial values.
 * Used for testing and when loading new documents.
 */
export function resetSelection(): void {
  setSelectedIds(new Set<string>());
  setHoveredId(null);
}

/**
 * Set the currently hovered view.
 * Pass null to clear hover state.
 */
export function setHovered(viewId: string | null): void {
  setHoveredId(viewId);
}

/**
 * Check if a specific view is selected.
 */
export function isSelected(viewId: string): boolean {
  return selectedIds().has(viewId);
}
