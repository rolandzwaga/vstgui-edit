/**
 * Frame Calculation for CAnimKnob
 *
 * Pure functions for calculating filmstrip frame indices from values.
 */

import { KNOB_DRAG_SWEEP_DISTANCE } from '../../types/animknob';

/**
 * Clamps a value to the [0, 1] range.
 *
 * @param value - Value to clamp
 * @returns Clamped value between 0 and 1
 */
export function clampValue(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Calculates the frame index for a given normalized value.
 *
 * @param value - Normalized value (0.0 to 1.0)
 * @param numFrames - Total number of frames in the filmstrip
 * @param inverse - If true, reverse the frame order
 * @returns Frame index (0 to numFrames - 1)
 */
export function calculateFrameIndex(
  value: number,
  numFrames: number,
  inverse: boolean = false
): number {
  if (numFrames <= 0) {
    return 0;
  }

  const clampedValue = clampValue(value);

  // Calculate base index
  // For numFrames frames, value 0 = frame 0, value 1 = frame (numFrames - 1)
  let index = Math.floor(clampedValue * (numFrames - 1));

  // Safety clamp to valid range
  index = Math.max(0, Math.min(numFrames - 1, index));

  // Reverse if inverse mode
  if (inverse) {
    index = numFrames - 1 - index;
  }

  return index;
}

/**
 * Calculates the background-position-y offset for a frame.
 *
 * @param frameIndex - The frame index (0-based)
 * @param frameHeight - Height of each frame in pixels
 * @returns CSS background-position-y value in pixels (negative)
 */
export function calculateFrameOffset(frameIndex: number, frameHeight: number): number {
  return -(frameIndex * frameHeight);
}

/**
 * Calculates preview value from drag delta.
 *
 * @param startY - Starting Y position of drag (screen coordinates)
 * @param currentY - Current Y position (screen coordinates)
 * @param initialValue - Value at drag start (0.0 to 1.0)
 * @param sweepDistance - Pixels for full 0-1 sweep (default 150)
 * @returns New value clamped to [0, 1]
 */
export function calculatePreviewValue(
  startY: number,
  currentY: number,
  initialValue: number,
  sweepDistance: number = KNOB_DRAG_SWEEP_DISTANCE
): number {
  // Dragging up (negative deltaY) increases value
  const deltaY = startY - currentY;
  const valueDelta = deltaY / sweepDistance;
  return clampValue(initialValue + valueDelta);
}

/**
 * Calculates the number of frames from bitmap dimensions.
 *
 * @param bitmapHeight - Total height of the filmstrip image
 * @param frameHeight - Height of a single frame
 * @returns Number of frames (minimum 1)
 */
export function calculateNumFrames(bitmapHeight: number, frameHeight: number): number {
  if (frameHeight <= 0 || bitmapHeight <= 0) {
    return 1;
  }

  return Math.max(1, Math.floor(bitmapHeight / frameHeight));
}
