/**
 * Ruler Store - Cursor position state for ruler indicators.
 *
 * Uses SolidJS signals to track cursor position for displaying
 * position indicators on horizontal and vertical rulers.
 */
import { createSignal } from 'solid-js';
import type { Point } from '../types/canvas';

// --- Signals ---

const [cursorPosition, setCursorPositionSignal] = createSignal<Point | null>(null);

// --- Reactive store object ---

/**
 * Reactive ruler store exposing cursor position state.
 * Access values as getters (they are signals).
 */
export const rulerStore = {
  get cursorPosition() {
    return cursorPosition();
  },
};

// --- Actions ---

/**
 * Set cursor position when mouse is over canvas.
 * @param position - Canvas coordinates of cursor
 */
export function setCursorPosition(position: Point): void {
  setCursorPositionSignal(position);
}

/**
 * Clear cursor position when mouse leaves canvas.
 */
export function clearCursorPosition(): void {
  setCursorPositionSignal(null);
}

/**
 * Reset ruler store to initial state.
 * Called when document is unloaded.
 */
export function resetRulerStore(): void {
  setCursorPositionSignal(null);
}
