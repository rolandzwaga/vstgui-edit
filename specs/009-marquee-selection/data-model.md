# Data Model: Marquee Selection

**Feature**: 009-marquee-selection
**Date**: 2026-01-06

## Entities

### 1. MarqueeState

Primary state entity for tracking marquee operation.

```typescript
// src/types/marquee.ts

import type { CanvasPoint } from './selection';

/**
 * State for an active marquee selection operation.
 * Transient state - not persisted, reset after each operation.
 */
export interface MarqueeState {
  /** Whether a marquee operation is currently in progress */
  isActive: boolean;

  /** Starting point of the marquee in canvas coordinates */
  startPoint: CanvasPoint | null;

  /** Current mouse position in canvas coordinates */
  currentPoint: CanvasPoint | null;

  /** Whether Shift was held at operation start (additive mode) */
  isAdditive: boolean;

  /** Selection state before marquee started (for cancellation) */
  previousSelection: Set<string>;
}
```

**Validation Rules**:
- `startPoint` and `currentPoint` must both be set when `isActive` is true
- `previousSelection` is immutable copy of selectionStore.selectedIds at marquee start

**State Transitions**:

```
┌─────────────────────────────────────────────────────────────────┐
│                          IDLE                                    │
│  isActive: false                                                │
│  startPoint: null                                               │
│  currentPoint: null                                             │
│  isAdditive: false                                              │
│  previousSelection: empty Set                                   │
└─────────────────────────────────────────────────────────────────┘
            │                              ▲
            │ startMarquee(point, shift)   │ completeMarquee()
            │                              │ cancelMarquee()
            ▼                              │
┌─────────────────────────────────────────────────────────────────┐
│                         ACTIVE                                   │
│  isActive: true                                                 │
│  startPoint: CanvasPoint                                        │
│  currentPoint: CanvasPoint (updated on mousemove)               │
│  isAdditive: boolean (from Shift key)                           │
│  previousSelection: Set<string> (snapshot)                      │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2. MarqueeRect

Computed rectangle from start and current points.

```typescript
// src/domain/canvas/marquee.ts

/**
 * Normalized rectangle with positive dimensions.
 * Coordinates are in canvas space.
 */
export interface MarqueeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

**Computed Properties**:
- `left`: x
- `right`: x + width
- `top`: y
- `bottom`: y + height

**Normalization**: Handles any drag direction by computing min/max of start and current points.

---

### 3. IntersectionResult

Result of intersection detection between marquee and views.

```typescript
// Implicit type - array of view IDs
type IntersectionResult = string[];
```

**Relationship**: MarqueeRect → RenderableView[] → IntersectionResult

---

## Relationships

```
┌─────────────────┐
│   MarqueeState  │
│                 │
│  startPoint ────┼──┐
│  currentPoint ──┼──┤     ┌───────────────┐
│  isAdditive     │  ├────▶│  MarqueeRect  │
│  previousSel.   │  │     │  (computed)   │
└─────────────────┘  │     └───────┬───────┘
                     │             │
                     │             │ intersect with
                     │             ▼
                     │     ┌───────────────────┐
                     │     │ RenderableView[]  │
                     │     │ (from docStore)   │
                     │     └───────┬───────────┘
                     │             │
                     │             │ produces
                     │             ▼
                     │     ┌───────────────────┐
                     │     │ IntersectionResult│
                     │     │ (string[])        │
                     │     └───────┬───────────┘
                     │             │
                     │             │ applied to
                     │             ▼
                     │     ┌───────────────────┐
                     └────▶│  selectionStore   │
                           │  (existing)       │
                           └───────────────────┘
```

---

## Store Interface

### marqueeStore

```typescript
// src/stores/marqueeStore.ts

import { createSignal } from 'solid-js';
import type { MarqueeState } from '../types/marquee';
import type { CanvasPoint } from '../types/selection';

// Internal signals
const [isActive, setIsActive] = createSignal(false);
const [startPoint, setStartPoint] = createSignal<CanvasPoint | null>(null);
const [currentPoint, setCurrentPoint] = createSignal<CanvasPoint | null>(null);
const [isAdditive, setIsAdditive] = createSignal(false);
const [previousSelection, setPreviousSelection] = createSignal<Set<string>>(new Set());

// Reactive store object
export const marqueeStore = {
  get isActive() { return isActive(); },
  get startPoint() { return startPoint(); },
  get currentPoint() { return currentPoint(); },
  get isAdditive() { return isAdditive(); },
  get previousSelection() { return previousSelection(); },
};

// Actions
export function startMarquee(point: CanvasPoint, additive: boolean, currentSelection: Set<string>): void;
export function updateMarquee(point: CanvasPoint): void;
export function completeMarquee(): void;
export function cancelMarquee(): void;
export function resetMarquee(): void;
```

---

## Domain Functions

### marquee.ts

```typescript
// src/domain/canvas/marquee.ts

import type { CanvasPoint } from '../../types/selection';
import type { RenderableView } from '../../types/canvas';

export interface MarqueeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Minimum marquee size in pixels to trigger selection */
export const MIN_MARQUEE_SIZE = 5;

/**
 * Normalize start/current points into a rect with positive dimensions.
 * Handles any drag direction (up-left, down-right, etc.)
 */
export function normalizeRect(start: CanvasPoint, current: CanvasPoint): MarqueeRect;

/**
 * Check if two rectangles intersect (AABB overlap test).
 */
export function rectIntersect(a: MarqueeRect, b: MarqueeRect): boolean;

/**
 * Check if marquee meets minimum size threshold.
 */
export function isMinimumSize(start: CanvasPoint, current: CanvasPoint): boolean;

/**
 * Find all views that intersect with the marquee rectangle.
 * Returns array of view IDs.
 */
export function findIntersectingViews(
  marqueeRect: MarqueeRect,
  views: RenderableView[]
): string[];
```

---

## CSS Design Tokens

Add to `src/styles/tokens.css`:

```css
/* Marquee selection */
--color-marquee-fill: rgba(66, 153, 225, 0.15);
--color-marquee-stroke: #3182ce;
--color-marquee-stroke-width: 1px;
```

---

## Integration with Existing Stores

### selectionStore (existing)

Used actions:
- `clearSelection()` - Before applying new selection (non-additive mode)
- `selectAll(viewIds)` - Apply marquee selection result
- `selectionStore.selectedIds` - Read current selection for previousSelection snapshot

### canvasStore (existing)

Read properties:
- `canvasStore.isPanning` - Conflict detection
- `canvasStore.panOffset` - Coordinate transformation
- `canvasStore.zoomLevel` - Coordinate transformation

---

## Validation Rules Summary

| Field | Rule |
|-------|------|
| `startPoint` | Required when `isActive` is true |
| `currentPoint` | Required when `isActive` is true |
| `MarqueeRect.width` | >= 0 (normalized) |
| `MarqueeRect.height` | >= 0 (normalized) |
| `MIN_MARQUEE_SIZE` | 5 pixels (constant) |
