/**
 * Guide Types
 * Types for custom guide lines created by dragging from rulers
 */

/**
 * Orientation of a custom guide line.
 * Horizontal guides have a fixed Y position and span full canvas width.
 * Vertical guides have a fixed X position and span full canvas height.
 */
export type GuideOrientation = 'horizontal' | 'vertical';

/**
 * A single custom guide line created by the user.
 */
export interface CustomGuide {
  /** Unique identifier for the guide */
  id: string;

  /** Orientation: horizontal (fixed Y) or vertical (fixed X) */
  orientation: GuideOrientation;

  /** Position in canvas coordinates (Y for horizontal, X for vertical) */
  position: number;
}

/**
 * Complete state for custom guides feature.
 */
export interface GuidesState {
  /** Collection of all custom guides */
  guides: CustomGuide[];

  /** Whether guides are visible on the canvas */
  isVisible: boolean;

  /** Whether snapping to guides is enabled */
  isSnapEnabled: boolean;
}

/**
 * Transient state during guide creation by dragging from ruler.
 */
export interface GuideCreationDrag {
  /** Orientation based on source ruler (horizontal = top ruler, vertical = left ruler) */
  orientation: GuideOrientation;

  /** Current guide position in canvas coordinates */
  currentPosition: number;

  /** Whether cursor is over valid drop zone (canvas area) */
  isOverCanvas: boolean;
}

/**
 * Transient state during guide repositioning.
 */
export interface GuideRepositionDrag {
  /** ID of the guide being repositioned */
  guideId: string;

  /** Original position before drag started (for Escape cancellation) */
  originalPosition: number;

  /** Current position in canvas coordinates */
  currentPosition: number;

  /** Whether cursor is over source ruler (indicates deletion) */
  isOverRuler: boolean;
}
