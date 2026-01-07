# Data Model: Snap to Grid

**Feature**: 014-snap-to-grid
**Date**: 2026-01-07

## Entities

### SnapState (extends gridStore)

Represents the current snap configuration stored in gridStore.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| isSnapEnabled | boolean | true | Whether snap is globally enabled |
| snapThreshold | number | 5 | Pixels within which snap engages |

**Validation Rules**:
- `snapThreshold` must be > 0
- Effective threshold clamped to `gridSize / 2` at calculation time

**Relationships**:
- Uses `gridStore.size` for grid line positions
- Independent of `gridStore.isVisible` (snap works even when grid hidden)

### SnapResult

Represents the outcome of a snap calculation for a single coordinate or point.

| Field | Type | Description |
|-------|------|-------------|
| snapped | boolean | Whether snap was applied |
| value | number | The resulting coordinate (snapped or original) |
| snapDelta | number | Amount adjusted (0 if not snapped) |
| gridLine | number | The grid line coordinate snapped to (if snapped) |

### SnapPointResult

Represents snap result for a 2D point (x, y).

| Field | Type | Description |
|-------|------|-------------|
| x | SnapResult | Snap result for x coordinate |
| y | SnapResult | Snap result for y coordinate |
| point | Point | Final { x, y } position after snap |

### SnapEdgesResult

Represents snap result for view edges during resize.

| Field | Type | Description |
|-------|------|-------------|
| left | SnapResult \| null | Snap result for left edge (if dragging left) |
| right | SnapResult \| null | Snap result for right edge (if dragging right) |
| top | SnapResult \| null | Snap result for top edge (if dragging top) |
| bottom | SnapResult \| null | Snap result for bottom edge (if dragging bottom) |

### SnapIndicatorState

Transient state for rendering snap visual feedback.

| Field | Type | Description |
|-------|------|-------------|
| horizontalLines | number[] | Y coordinates of horizontal snap lines to show |
| verticalLines | number[] | X coordinates of vertical snap lines to show |

## State Transitions

### Snap Toggle

```
User presses Shift+G
  → if (isSnapEnabled) setIsSnapEnabled(false)
  → else setIsSnapEnabled(true)
```

### Snap During Move

```
Initial state: isDragging=true, isSnapEnabled=true

On mousemove:
  1. Calculate raw delta from drag start
  2. Apply axis constraint (if Shift held)
  3. If Alt NOT held AND isSnapEnabled:
     a. Calculate target position = originalOrigin + delta
     b. snapResult = snapPoint(targetPosition, gridSize, effectiveThreshold)
     c. Apply snapResult.snapDelta to delta
  4. Update drag preview

On mouseup:
  1. Calculate final snapped positions
  2. Update view origins in documentStore
  3. Push history operation
```

### Snap During Resize

```
Initial state: isResizing=true, isSnapEnabled=true

On mousemove:
  1. Calculate resize bounds from delta
  2. If Alt NOT held AND isSnapEnabled:
     a. Get edges being dragged based on handle
     b. Snap each dragged edge independently
     c. Adjust origin/size to match snapped edges
  3. Clamp to minimum size (10x10)
  4. Update resize preview

On mouseup:
  1. Commit final snapped size/position
  2. Push history operation
```

## Utility Functions

### snapToGrid(value, gridSize, threshold)

```typescript
function snapToGrid(
  value: number,
  gridSize: number,
  threshold: number
): SnapResult
```

Snaps a single coordinate to nearest grid line if within threshold.

### snapPoint(point, gridSize, threshold)

```typescript
function snapPoint(
  point: Point,
  gridSize: number,
  threshold: number
): SnapPointResult
```

Snaps a 2D point, applying snap independently to x and y.

### snapEdges(bounds, handle, gridSize, threshold)

```typescript
function snapEdges(
  bounds: ResizeBounds,
  handle: HandlePosition,
  gridSize: number,
  threshold: number
): SnapEdgesResult
```

Snaps view edges based on which handle is being dragged.

### getEffectiveThreshold(threshold, gridSize)

```typescript
function getEffectiveThreshold(
  threshold: number,
  gridSize: number
): number
```

Returns clamped threshold: `Math.min(threshold, gridSize / 2)`.

## Type Definitions

```typescript
// src/types/snap.ts

export interface SnapResult {
  snapped: boolean;
  value: number;
  snapDelta: number;
  gridLine: number | null;
}

export interface SnapPointResult {
  x: SnapResult;
  y: SnapResult;
  point: Point;
}

export interface SnapEdgesResult {
  left: SnapResult | null;
  right: SnapResult | null;
  top: SnapResult | null;
  bottom: SnapResult | null;
}

export interface SnapIndicatorState {
  horizontalLines: number[];
  verticalLines: number[];
}

export const DEFAULT_SNAP_THRESHOLD = 5;
```
