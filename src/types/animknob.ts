/**
 * AnimKnob Preview Types
 *
 * Type definitions for CAnimKnob filmstrip preview functionality.
 */

/**
 * Information about a CAnimKnob bitmap for frame rendering.
 */
export interface AnimKnobBitmapInfo {
  /** Bitmap name from view's bitmap attribute */
  bitmapName: string;
  /** Object URL or data URL for the bitmap image */
  imageUrl: string;
  /** Total height of the filmstrip image in pixels */
  totalHeight: number;
  /** Height of a single frame in pixels */
  frameHeight: number;
  /** Total number of frames in the filmstrip */
  numFrames: number;
  /** Width of the bitmap in pixels */
  width: number;
  /** Whether frames should be played in reverse order */
  inverse: boolean;
}

/**
 * Props for AnimKnobPreview component.
 */
export interface AnimKnobPreviewProps {
  /** View ID */
  viewId: string;
  /** Absolute X position in canvas coordinates */
  x: number;
  /** Absolute Y position in canvas coordinates */
  y: number;
  /** View width in pixels */
  width: number;
  /** View height in pixels */
  height: number;
  /** Bitmap info for rendering */
  bitmapInfo: AnimKnobBitmapInfo;
  /** Current value (0.0 to 1.0) */
  value: number;
}

/** Full drag sweep distance in pixels (150px = full 0 to 1 range) */
export const KNOB_DRAG_SWEEP_DISTANCE = 150;
