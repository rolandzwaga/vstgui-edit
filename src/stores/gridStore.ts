/**
 * Grid Store - Grid overlay state management for canvas.
 *
 * Uses SolidJS signals for reactive state with fine-grained updates.
 */
import { createSignal } from 'solid-js';
import type { GridSizePreset, GridStyle } from '../types/grid';

// --- Constants ---

/** Valid grid size presets in pixels */
export const GRID_SIZE_PRESETS: GridSizePreset[] = [5, 8, 10, 12, 16, 20];

/** Default grid size (10px) */
export const DEFAULT_GRID_SIZE: GridSizePreset = 10;

/** Default grid style (lines) */
export const DEFAULT_GRID_STYLE: GridStyle = 'lines';

/** Major line interval (every 5th line) */
export const MAJOR_LINE_INTERVAL = 5;

// --- Signals ---

const [isVisible, setIsVisible] = createSignal<boolean>(true);
const [size, setSize] = createSignal<GridSizePreset>(DEFAULT_GRID_SIZE);
const [style, setStyle] = createSignal<GridStyle>(DEFAULT_GRID_STYLE);

// --- Reactive store object ---

/**
 * Reactive grid store exposing grid state.
 * Access values as getters (they are signals).
 */
export const gridStore = {
  get isVisible() {
    return isVisible();
  },
  get size() {
    return size();
  },
  get style() {
    return style();
  },
};

// --- Actions ---

/**
 * Toggle grid visibility.
 */
export function toggleVisibility(): void {
  setIsVisible(current => !current);
}

/**
 * Set the grid size to a valid preset.
 */
export function setGridSize(newSize: GridSizePreset): void {
  setSize(newSize);
}

/**
 * Set the grid visual style.
 */
export function setGridStyle(newStyle: GridStyle): void {
  setStyle(newStyle);
}

/**
 * Reset all grid state to default values.
 */
export function resetGrid(): void {
  setIsVisible(true);
  setSize(DEFAULT_GRID_SIZE);
  setStyle(DEFAULT_GRID_STYLE);
}
