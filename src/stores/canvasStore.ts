/**
 * Canvas Store - Pan state management for canvas navigation.
 *
 * Uses SolidJS signals for reactive pan state with fine-grained updates.
 */
import { createSignal } from 'solid-js';
import type { Point } from '../types/canvas';

// --- Signals for pan state ---

const [panOffset, setPanOffset] = createSignal<Point>({ x: 0, y: 0 });
const [isPanning, setIsPanning] = createSignal(false);
const [panStart, setPanStart] = createSignal<Point | null>(null);

// --- Reactive store object ---

/**
 * Reactive canvas store exposing pan state.
 * Access values as getters (they are signals).
 */
export const canvasStore = {
  get panOffset() {
    return panOffset();
  },
  get isPanning() {
    return isPanning();
  },
  get panStart() {
    return panStart();
  },
};

// --- Actions ---

/**
 * Start a pan gesture at the given mouse position.
 * Sets isPanning to true and records the start position.
 */
export function startPan(x: number, y: number): void {
  setIsPanning(true);
  setPanStart({ x, y });
}

/**
 * Update pan during a drag gesture.
 * Calculates delta from panStart and adds it to panOffset.
 * Updates panStart to current position for next delta calculation.
 */
export function updatePan(x: number, y: number): void {
  const start = panStart();
  if (!isPanning() || !start) {
    return;
  }

  const deltaX = x - start.x;
  const deltaY = y - start.y;

  setPanOffset(current => ({
    x: current.x + deltaX,
    y: current.y + deltaY,
  }));

  setPanStart({ x, y });
}

/**
 * End the current pan gesture.
 * Preserves panOffset for the next gesture.
 */
export function endPan(): void {
  setIsPanning(false);
  setPanStart(null);
}

/**
 * Reset all pan state to initial values.
 */
export function resetPan(): void {
  setPanOffset({ x: 0, y: 0 });
  setIsPanning(false);
  setPanStart(null);
}
