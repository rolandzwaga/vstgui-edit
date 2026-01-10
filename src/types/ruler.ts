/**
 * Ruler Type Definitions
 *
 * Types for the canvas rulers that display pixel coordinates
 * along canvas edges with tick marks, cursor indicators, and
 * template bounds visualization.
 */

import type { JSX } from 'solid-js';
import type { Point } from './canvas';

/**
 * Grid size preset values.
 * Matches GRID_SIZE_PRESETS from src/stores/gridStore.ts
 */
export type GridSizePreset = 5 | 8 | 10 | 12 | 16 | 20;

/**
 * Tick mark types for ruler rendering.
 */
export type TickType = 'major' | 'minor';

/**
 * A single tick mark on a ruler.
 */
export interface TickMark {
  /** Canvas coordinate (pixels) */
  position: number;
  /** Type determines visual styling */
  type: TickType;
  /** Label text (only for major ticks, null for minor) */
  label: string | null;
}

/**
 * Ruler orientation for component reuse.
 */
export type RulerOrientation = 'horizontal' | 'vertical';

/**
 * Configuration for tick interval calculation.
 */
export interface TickIntervalConfig {
  /** Base interval at 100% zoom (default: 100) */
  baseInterval: number;
  /** Minimum screen pixels between major ticks (default: 30) */
  minScreenSpacing: number;
  /** Ratio of minor to major ticks (default: 10) */
  minorTickRatio: number;
}

/**
 * Calculated tick intervals for current zoom level.
 */
export interface TickIntervals {
  /** Major tick interval in canvas pixels */
  major: number;
  /** Minor tick interval in canvas pixels */
  minor: number;
}

/**
 * Visible range in canvas coordinates.
 */
export interface VisibleRange {
  /** Start coordinate (may be negative if panned) */
  start: number;
  /** End coordinate */
  end: number;
}

/**
 * Props for ruler components.
 */
export interface RulerProps {
  /** Orientation of the ruler */
  orientation: RulerOrientation;
  /** Length of the ruler in screen pixels */
  length: number;
}

/**
 * Props for the horizontal ruler.
 */
export interface HorizontalRulerProps {
  /** Width in screen pixels */
  width: number;
  /** Current cursor position in canvas coordinates (null if outside) */
  cursorPosition: Point | null;
  /** Template width for bounds indicator */
  templateWidth: number;
}

/**
 * Props for the vertical ruler.
 */
export interface VerticalRulerProps {
  /** Height in screen pixels */
  height: number;
  /** Current cursor position in canvas coordinates (null if outside) */
  cursorPosition: Point | null;
  /** Template height for bounds indicator */
  templateHeight: number;
}

/**
 * Props for the origin indicator.
 */
export interface RulerOriginProps {
  /** Current pan offset from canvasStore */
  panOffset: Point;
}

/**
 * Props for the cursor indicator.
 */
export interface CursorIndicatorProps {
  /** Position along the ruler axis in screen pixels */
  screenPosition: number;
  /** Canvas coordinate value for tooltip */
  canvasValue: number;
  /** Orientation determines axis label (X or Y) */
  orientation: RulerOrientation;
  /** Whether to show the indicator */
  visible: boolean;
}

/**
 * Props for the ruler container.
 */
export interface RulerContainerProps {
  /** Children to render in the canvas viewport area */
  children: JSX.Element;
}
