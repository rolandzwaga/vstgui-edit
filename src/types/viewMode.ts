/**
 * View Mode Types
 *
 * Type definitions for the styled view mode feature.
 */

// =============================================================================
// Core Types
// =============================================================================

/**
 * Canvas rendering mode.
 * - 'wireframe': Current behavior with category-colored outlines
 * - 'styled': Renders views with their actual uidesc colors
 */
export type ViewMode = 'wireframe' | 'styled';

/**
 * Result of resolving a color reference from uidesc.
 * Null if the reference cannot be resolved.
 */
export type ResolvedColor = string | null;

// =============================================================================
// Styled View Properties
// =============================================================================

/**
 * Styled rendering properties resolved from uidesc view attributes.
 * Used to determine how a view should render in styled mode.
 */
export interface StyledViewProps {
  /** Resolved background color (CSS value) or null if unresolvable */
  backgroundColor: ResolvedColor;

  /** Resolved frame/border color (CSS value) or null */
  frameColor: ResolvedColor;

  /** Frame width in pixels (default 1 if not specified) */
  frameWidth: number;

  /** Whether view is transparent (no fill) */
  isTransparent: boolean;

  /** View opacity (0.0 to 1.0, default 1.0) */
  opacity: number;

  /** Whether this view should render in wireframe fallback */
  useWireframeFallback: boolean;
}

// =============================================================================
// Overlay Styling
// =============================================================================

/**
 * Overlay styling based on background luminance.
 */
export interface OverlayStyle {
  /** Fill color for overlay */
  fillColor: string;

  /** Fill opacity (0.5 for 50%) */
  fillOpacity: number;

  /** Stroke color for border */
  strokeColor: string;
}

// =============================================================================
// Store State
// =============================================================================

/**
 * View mode store state.
 */
export interface ViewModeState {
  /** Current view mode */
  mode: ViewMode;
}

// =============================================================================
// Constants
// =============================================================================

/** Default view mode */
export const DEFAULT_VIEW_MODE: ViewMode = 'wireframe';

/** Luminance threshold for determining overlay color */
export const LUMINANCE_THRESHOLD = 0.5;

/** Overlay opacity (50%) */
export const OVERLAY_OPACITY = 0.5;

/** Maximum color resolution depth (for circular reference protection) */
export const MAX_COLOR_RESOLUTION_DEPTH = 10;
