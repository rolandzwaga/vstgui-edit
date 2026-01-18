/**
 * Knob Preview Store
 *
 * Manages transient state for CAnimKnob filmstrip preview interactions.
 * Preview is ephemeral - resets to initial value on mouse release.
 */

import { createSignal } from 'solid-js';
import type { AnimKnobBitmapInfo } from '../types/animknob';
import { clampValue } from '../domain/animknob/frameCalculation';
import { KNOB_DRAG_SWEEP_DISTANCE } from '../types/animknob';

// ============================================================================
// Signals (internal state)
// ============================================================================

const [isActive, setIsActive] = createSignal(false);
const [viewId, setViewId] = createSignal<string | null>(null);
const [initialValue, setInitialValue] = createSignal(0);
const [previewValue, setPreviewValue] = createSignal(0);
const [accumulatedDelta, setAccumulatedDelta] = createSignal(0);
const [bitmapInfo, setBitmapInfo] = createSignal<AnimKnobBitmapInfo | null>(null);

// ============================================================================
// Read-only store
// ============================================================================

export const knobPreviewStore = {
  /** Whether a knob preview interaction is active */
  get isActive() {
    return isActive();
  },

  /** ID of the view being previewed */
  get viewId() {
    return viewId();
  },

  /** Initial value when drag started (from default-value or 0) */
  get initialValue() {
    return initialValue();
  },

  /** Current preview value (0.0 to 1.0) */
  get previewValue() {
    return previewValue();
  },

  /** Bitmap information for rendering */
  get bitmapInfo() {
    return bitmapInfo();
  },
};

// ============================================================================
// Actions
// ============================================================================

/**
 * Starts a knob preview interaction.
 *
 * @param targetViewId - ID of the CAnimKnob view
 * @param defaultValue - Initial value (from default-value attribute or 0)
 * @param info - Bitmap information for rendering
 */
export function startKnobPreview(
  targetViewId: string,
  defaultValue: number,
  info: AnimKnobBitmapInfo
): void {
  setIsActive(true);
  setViewId(targetViewId);
  setInitialValue(defaultValue);
  setPreviewValue(defaultValue);
  setAccumulatedDelta(0);
  setBitmapInfo(info);
}

/**
 * Updates the preview value based on mouse movement delta.
 * Uses accumulated delta for smooth tracking with Pointer Lock API.
 *
 * @param movementY - Mouse movement delta Y (from MouseEvent.movementY)
 */
export function updateKnobPreviewByDelta(movementY: number): void {
  if (!isActive()) {
    return;
  }

  // Accumulate the delta (negative because dragging up should increase value)
  const newDelta = accumulatedDelta() - movementY;
  setAccumulatedDelta(newDelta);

  // Calculate new value: initial + (accumulated delta / sweep distance)
  const valueDelta = newDelta / KNOB_DRAG_SWEEP_DISTANCE;
  const newValue = clampValue(initialValue() + valueDelta);
  setPreviewValue(newValue);
}

/**
 * Ends the knob preview interaction.
 * Resets all state - preview value returns to default on next render.
 */
export function endKnobPreview(): void {
  resetKnobPreviewStore();
}

/**
 * Cancels the knob preview interaction (e.g., on Escape key).
 * Equivalent to endKnobPreview.
 */
export function cancelKnobPreview(): void {
  resetKnobPreviewStore();
}

/**
 * Resets the store to initial state.
 */
export function resetKnobPreviewStore(): void {
  setIsActive(false);
  setViewId(null);
  setInitialValue(0);
  setPreviewValue(0);
  setAccumulatedDelta(0);
  setBitmapInfo(null);
}

/**
 * Gets the current preview value for a specific view.
 * Returns the preview value if the view is being previewed, otherwise null.
 *
 * @param targetViewId - View ID to check
 * @returns Preview value or null if not being previewed
 */
export function getPreviewValueForView(targetViewId: string): number | null {
  if (isActive() && viewId() === targetViewId) {
    return previewValue();
  }
  return null;
}
