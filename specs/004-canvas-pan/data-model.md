# Data Model: Canvas Pan Navigation

**Feature**: 004-canvas-pan
**Date**: 2026-01-05

## Entities

### PanState

Represents the current pan offset and gesture tracking state.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| panOffset | `{ x: number; y: number }` | Yes | Current accumulated pan offset in pixels |
| isPanning | `boolean` | Yes | Whether a pan gesture is currently active |
| panStart | `{ x: number; y: number } \| null` | Yes | Mouse position when pan started, null when not panning |

**Default Values**:
```typescript
{
  panOffset: { x: 0, y: 0 },
  isPanning: false,
  panStart: null
}
```

### PanInput

Input method that triggered the pan gesture.

| Value | Description |
|-------|-------------|
| `'middle-mouse'` | Middle mouse button drag |
| `'space-drag'` | Space key + left mouse button drag |

## State Transitions

```
                    ┌──────────────────────────────────┐
                    │           IDLE                   │
                    │  isPanning: false                │
                    │  panStart: null                  │
                    │  cursor: default (or grab if    │
                    │          spaceHeld)              │
                    └──────────┬───────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
    middle-mousedown     space + left-mousedown
           │                   │                   │
           └───────────────────┼───────────────────┘
                               │
                               ▼
                    ┌──────────────────────────────────┐
                    │          PANNING                 │
                    │  isPanning: true                 │
                    │  panStart: { x, y }              │
                    │  cursor: grabbing                │
                    │                                  │
                    │  On mousemove:                   │
                    │    panOffset += delta            │
                    │    panStart = current pos        │
                    └──────────┬───────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
       mouseup           space keyup         mouse leaves
           │                   │              (continues)
           └───────────────────┼───────────────────┘
                               │
                               ▼
                    ┌──────────────────────────────────┐
                    │           IDLE                   │
                    │  isPanning: false                │
                    │  panStart: null                  │
                    │  panOffset: preserved            │
                    └──────────────────────────────────┘
```

## Type Definitions

### New Types (src/types/canvas.ts)

```typescript
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
```

### Store Interface (src/stores/canvasStore.ts)

```typescript
/**
 * Canvas store for pan (and future zoom) state.
 */
export interface CanvasStore {
  /** Current pan state */
  panOffset: Point;
  isPanning: boolean;
  panStart: Point | null;
}

/**
 * Canvas store actions.
 */
export interface CanvasStoreActions {
  /** Start a pan gesture at the given position */
  startPan: (x: number, y: number) => void;
  /** Update pan during drag */
  updatePan: (x: number, y: number) => void;
  /** End pan gesture and preserve offset */
  endPan: () => void;
  /** Reset pan offset to origin */
  resetPan: () => void;
}
```

## Validation Rules

1. **panOffset**: No limits (unlimited pan range per spec)
2. **isPanning**: Boolean only, no intermediate states
3. **panStart**: Must be non-null when isPanning is true

## Relationships

- **CanvasStore** → **Canvas Component**: Store is consumed by Canvas component
- **PanState** → **CSS Transform**: panOffset is applied as `translate(x, y)`
- **isPanning + spaceHeld** → **Cursor**: Determines cursor style class
