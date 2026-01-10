# Data Model: Custom Guides

**Feature**: 033-custom-guides
**Date**: 2026-01-10
**Status**: Complete

## Entity Definitions

### CustomGuide

A user-created alignment reference line that persists until explicitly deleted or template unloaded.

```typescript
// src/types/guides.ts

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
```

### GuidesState

Complete state for the custom guides feature.

```typescript
// src/types/guides.ts

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
```

### GuideCreationDrag

Transient state during drag-from-ruler guide creation.

```typescript
// src/types/guides.ts

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
```

### GuideRepositionDrag

Transient state during guide repositioning.

```typescript
// src/types/guides.ts

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
```

## Entity Relationships

```
GuidesState
├── guides: CustomGuide[]  (0..50)
│   ├── id: string (unique)
│   ├── orientation: GuideOrientation
│   └── position: number
├── isVisible: boolean
└── isSnapEnabled: boolean

GuideCreationDrag (transient, exists during drag-from-ruler)
├── orientation: GuideOrientation
├── currentPosition: number
└── isOverCanvas: boolean

GuideRepositionDrag (transient, exists during guide drag)
├── guideId: string -> CustomGuide.id
├── originalPosition: number
├── currentPosition: number
└── isOverRuler: boolean
```

## Validation Rules

### CustomGuide

| Field | Type | Constraints |
|-------|------|-------------|
| id | string | Non-empty, unique within guides collection |
| orientation | GuideOrientation | Must be 'horizontal' or 'vertical' |
| position | number | Integer, can be negative (if panned), typically 0 to template extent |

### GuidesState

| Field | Type | Constraints |
|-------|------|-------------|
| guides | CustomGuide[] | Max 50 entries, no duplicate position+orientation |
| isVisible | boolean | - |
| isSnapEnabled | boolean | - |

### GuideCreationDrag

| Field | Type | Constraints |
|-------|------|-------------|
| orientation | GuideOrientation | Determined by source ruler |
| currentPosition | number | Tracks mouse, can be any value |
| isOverCanvas | boolean | True when mouse is in canvas viewport |

### GuideRepositionDrag

| Field | Type | Constraints |
|-------|------|-------------|
| guideId | string | Must reference existing guide |
| originalPosition | number | Captured at drag start |
| currentPosition | number | Tracks mouse |
| isOverRuler | boolean | True when over source ruler = will delete |

## State Transitions

### Guide Lifecycle

```
[No Guide]
    │
    ├─── dragFromRuler() ──→ [Creating]
    │                            │
    │                            ├─── releaseOverCanvas() ──→ [Exists]
    │                            │
    │                            └─── releaseOutside() / Escape ──→ [No Guide]
    │
    ├─── addAtPosition() ──→ [Exists]
    │
    ▼
[Exists]
    │
    ├─── doubleClick() ──→ [No Guide]
    │
    ├─── dragToRuler() ──→ [No Guide]
    │
    ├─── delete() ──→ [No Guide]
    │
    ├─── reposition() ──→ [Exists] (new position)
    │
    └─── clearAll() ──→ [No Guide]
```

### Visibility State

```
[Visible]
    │
    └─── toggleVisibility() / Ctrl+; ──→ [Hidden]
                                              │
                                              └─── toggleVisibility() / Ctrl+; ──→ [Visible]
```

### Snap State

```
[Snap Enabled]
    │
    └─── toggleSnap() ──→ [Snap Disabled]
                              │
                              └─── toggleSnap() ──→ [Snap Enabled]
```

Note: When guides are hidden, snap is effectively disabled regardless of isSnapEnabled value (FR-013).

## Constants

```typescript
// src/domain/guides/guideOperations.ts

/** Maximum number of simultaneous guides supported */
export const MAX_GUIDES = 50;

/** Hit testing tolerance in pixels (either side of guide line) */
export const GUIDE_HIT_TOLERANCE = 4;
```

## Integration Points

### With historyStore

Guide operations create HistoryOperation entries:

| Operation | History Type | Undo | Redo |
|-----------|--------------|------|------|
| Create guide | 'guide-create' | Delete the guide | Re-create the guide |
| Delete guide | 'guide-delete' | Re-create the guide | Delete the guide |
| Reposition guide | 'guide-reposition' | Restore original position | Apply new position |
| Clear all guides | 'guide-clear-all' | Restore all guides | Clear again |

### With snap system

Extends snap behavior in move/resize operations:

| Scenario | Behavior |
|----------|----------|
| Grid snap only | Existing behavior unchanged |
| Guide snap only | Snap to nearest guide within threshold |
| Both enabled | Snap to whichever is closer (grid or guide) |
| Both disabled | No snapping |
| Guides hidden | Guide snap disabled regardless of isSnapEnabled |

### With coordinateMapping

Uses existing functions:
- `screenToCanvasCoordinates()` - Convert mouse position to canvas position
- `canvasToScreenPosition()` - Convert guide position for rendering

### With canvasStore

Reads:
- `panOffset` - For coordinate conversion
- `zoomLevel` - For stroke-width scaling and coordinate conversion
