# Data Model: Smart Guides

**Feature**: 015-smart-guides  
**Date**: 2026-01-07

## Entities

### SmartGuide

Represents a single guide line to be rendered.

```typescript
// src/types/smartGuides.ts

/** Orientation of the guide line */
type GuideOrientation = 'horizontal' | 'vertical';

/** Type of alignment the guide represents */
type GuideType = 'edge' | 'center' | 'parent-center' | 'spacing';

/** A single guide line to render */
interface SmartGuide {
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
```

### SpacingGuide (extends SmartGuide)

Additional data for spacing guides that show distance labels.

```typescript
/** A spacing guide with distance information */
interface SpacingGuide extends SmartGuide {
  type: 'spacing';
  
  /** Distance in pixels between the elements */
  distance: number;
  
  /** Start position of the spacing measurement */
  measureStart: number;
  
  /** End position of the spacing measurement */
  measureEnd: number;
}
```

### SmartGuidesState

State managed by the smart guides store.

```typescript
/** State for smart guides feature */
interface SmartGuidesState {
  /** Whether smart guides are enabled */
  isEnabled: boolean;
  
  /** Currently active guides (during drag operation) */
  activeGuides: SmartGuide[];
}
```

### GuideMatch

Internal type for guide calculation results.

```typescript
/** Result of checking alignment between two edges/centers */
interface GuideMatch {
  /** The source edge/center being checked */
  sourceEdge: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY';
  
  /** The target edge/center that matched */
  targetEdge: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY';
  
  /** Position where they align */
  position: number;
  
  /** Distance from exact alignment (0 = exact) */
  distance: number;
  
  /** ID of the target view */
  targetViewId: string;
}
```

### ViewBounds

Bounds of a view for guide calculations (reuses existing types).

```typescript
// Already exists in src/types/canvas.ts
interface Point { x: number; y: number; }
interface Size { width: number; height: number; }

// New helper type for guide calculations
interface ViewBounds {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}
```

## Relationships

```
SmartGuidesState
    └── activeGuides: SmartGuide[]
            └── participatingViewIds: string[] → RenderableView.id

ViewBounds (computed from RenderableView)
    └── Used for guide calculations
```

## State Transitions

### SmartGuidesState.isEnabled

| From | Event | To |
|------|-------|-----|
| true | S key pressed | false |
| false | S key pressed | true |
| * | resetSmartGuides() | true |

### SmartGuidesState.activeGuides

| From | Event | To |
|------|-------|-----|
| [] | Drag starts | [] |
| [] | Drag move (with alignments) | [guide1, guide2, ...] |
| [guides] | Drag move (no alignments) | [] |
| [guides] | Drag ends | [] |
| [guides] | Drag cancelled | [] |

## Validation Rules

1. **SmartGuide.position**: Must be a finite number
2. **SmartGuide.participatingViewIds**: Must contain at least 1 ID (dragged view)
3. **SpacingGuide.distance**: Must be >= 0
4. **GuideMatch.distance**: Used with threshold (5px) - only matches where |distance| <= 5 are valid

## Constants

```typescript
// src/domain/canvas/smartGuides.ts

/** Threshold in pixels for detecting alignment */
export const GUIDE_THRESHOLD = 5;

/** Default enabled state */
export const DEFAULT_GUIDES_ENABLED = true;
```

## Design Token

```css
/* src/styles/tokens.css */

:root {
  /* Smart guide color - magenta for visibility */
  --color-smart-guide: #ff00ff;
  --color-smart-guide-label-bg: rgba(255, 0, 255, 0.9);
  --color-smart-guide-label-text: #ffffff;
}
```
