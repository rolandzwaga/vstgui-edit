/**
 * Alignment Toolbar Store
 *
 * Manages the docked/floating state of the alignment toolbar.
 */

import { createStore } from 'solid-js/store';
import type { Point } from '../types/canvas';
import type { AlignmentToolbarState } from '../types/alignment';

/**
 * localStorage key for persisting toolbar state.
 */
export const STORAGE_KEY = 'vstgui-edit:alignment-toolbar';

/**
 * Initial state - toolbar is docked.
 */
const initialState: AlignmentToolbarState = {
  isDocked: true,
  floatingPosition: null,
};

const [store, setStore] = createStore<AlignmentToolbarState>({ ...initialState });

/**
 * Docks the toolbar back into the main toolbar.
 */
export function dock(): void {
  setStore({
    isDocked: true,
    floatingPosition: null,
  });
}

/**
 * Undocks the toolbar to float at the given position.
 */
export function undock(position: Point): void {
  setStore({
    isDocked: false,
    floatingPosition: position,
  });
}

/**
 * Updates the floating position (while dragging).
 */
export function updateFloatingPosition(position: Point): void {
  setStore({ floatingPosition: position });
}

/**
 * Loads state from localStorage.
 */
export function loadAlignmentToolbarState(): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as AlignmentToolbarState;
      setStore({
        isDocked: parsed.isDocked ?? true,
        floatingPosition: parsed.floatingPosition ?? null,
      });
    }
  } catch {
    // Invalid JSON or other error - use default state
  }
}

/**
 * Saves current state to localStorage.
 */
export function saveAlignmentToolbarState(): void {
  const state: AlignmentToolbarState = {
    isDocked: store.isDocked,
    floatingPosition: store.floatingPosition,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Resets to initial docked state.
 */
export function resetAlignmentToolbarStore(): void {
  setStore({ ...initialState });
}

/**
 * The store instance (reactive, read-only).
 */
export const alignmentToolbarStore = store;
