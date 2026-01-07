/**
 * Smart Guides Type Definitions
 * Types for visual alignment guides during drag operations
 */

/** Orientation of the guide line */
export type GuideOrientation = 'horizontal' | 'vertical';

/** Type of alignment the guide represents */
export type GuideType = 'edge' | 'center' | 'parent-center' | 'spacing';

/** A single guide line to render */
export interface SmartGuide {
  /** Unique identifier for the guide */
  id: string;

  /** Orientation: horizontal or vertical */
  orientation: GuideOrientation;

  /** Position in canvas coordinates (x for vertical, y for horizontal) */
  position: number;

  /** Type of alignment */
  type: GuideType;

  /** IDs of views participating in this alignment */
  participatingViewIds: string[];
}

/** A spacing guide with distance information */
export interface SpacingGuide extends SmartGuide {
  type: 'spacing';

  /** Distance in pixels between the elements */
  distance: number;

  /** Start position of the spacing measurement */
  measureStart: number;

  /** End position of the spacing measurement */
  measureEnd: number;
}

/** State for smart guides feature */
export interface SmartGuidesState {
  /** Whether smart guides are enabled */
  isEnabled: boolean;

  /** Currently active guides (during drag operation) */
  activeGuides: SmartGuide[];
}

/** Edge types for alignment matching */
export type EdgeType = 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY';

/** Result of checking alignment between two edges/centers */
export interface GuideMatch {
  /** The source edge/center being checked */
  sourceEdge: EdgeType;

  /** The target edge/center that matched */
  targetEdge: EdgeType;

  /** Position where they align */
  position: number;

  /** Distance from exact alignment (0 = exact) */
  distance: number;

  /** ID of the target view */
  targetViewId: string;
}

/** Bounds of a view for guide calculations */
export interface ViewBounds {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

/** Type guard for SpacingGuide */
export function isSpacingGuide(guide: SmartGuide): guide is SpacingGuide {
  return guide.type === 'spacing';
}
