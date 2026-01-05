/**
 * Canvas Rendering Types
 * Types for the visual representation of uidesc views
 */

/**
 * Classification of VSTGUI view classes for visual styling.
 * - container: Layout containers (CViewContainer, CScrollView, etc.)
 * - control: Interactive controls (CSlider, CKnob, CTextButton, etc.)
 * - display: Display-only elements (CTextLabel, CVuMeter, etc.)
 * - custom: Unknown/custom view classes
 */
export type ViewCategory = 'container' | 'control' | 'display' | 'custom';

/**
 * Parsed coordinate value from uidesc "x, y" format.
 * Default: { x: 0, y: 0 } when origin attribute is missing.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Parsed dimension value from uidesc "width, height" format.
 * Default: { width: 20, height: 20 } when size attribute is missing.
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Pre-computed view data ready for rendering.
 * This is the key abstraction that separates domain logic from rendering implementation.
 */
export interface RenderableView {
  /** Unique identifier for the view (from uidesc key or generated) */
  id: string;

  /** Absolute X position in canvas coordinates (parent origin + child origin) */
  absoluteX: number;

  /** Absolute Y position in canvas coordinates */
  absoluteY: number;

  /** View width in pixels */
  width: number;

  /** View height in pixels */
  height: number;

  /** View class name for identification */
  className: string;

  /** Category for styling purposes */
  category: ViewCategory;

  /** Render order (0 = bottom, higher = on top). Based on hierarchy traversal order. */
  zIndex: number;

  /** Title text from uidesc (for CTextLabel display) */
  title?: string;

  /** Font size in pixels (resolved from uidesc font definition) */
  fontSize?: number;

  /** Font color as CSS color string (resolved from uidesc color definition) */
  fontColor?: string;
}

/**
 * Dimensions of the template root view for rendering the bounds indicator.
 */
export interface TemplateBounds {
  width: number;
  height: number;
}

/**
 * Pan state for canvas navigation.
 */
export interface PanState {
  /** Current pan offset in pixels */
  panOffset: Point;
  /** Whether a pan gesture is currently active */
  isPanning: boolean;
  /** Mouse position when pan gesture started */
  panStart: Point | null;
}
