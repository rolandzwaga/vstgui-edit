# Data Model: View Resize

**Feature**: 013-view-resize  
**Date**: 2026-01-06

## Type Definitions

### ResizeState (resizeStore)

```typescript
// src/types/resize.ts

import type { HandlePosition } from './selection';
import type { Point, Size } from './canvas';

/**
 * Transient state during resize operation.
 * Similar to dragStore pattern.
 */
export interface ResizeState {
  /** Whether a resize is currently in progress */
  isResizing: boolean;
  
  /** Which handle initiated the resize */
  activeHandle: HandlePosition | null;
  
  /** View ID being resized */
  viewId: string | null;
  
  /** Mouse position when resize started (canvas coordinates) */
  startPoint: Point | null;
  
  /** Current mouse position during resize */
  currentPoint: Point | null;
  
  /** Original view origin before resize */
  originalOrigin: Point | null;
  
  /** Original view size before resize */
  originalSize: Size | null;
  
  /** Computed new origin (reactive) */
  newOrigin: Point;
  
  /** Computed new size (reactive) */
  newSize: Size;
}

/**
 * Minimum allowed view dimensions.
 */
export const MIN_VIEW_SIZE = 10;

/**
 * Click tolerance before resize initiates (pixels).
 */
export const RESIZE_CLICK_TOLERANCE = 3;
```

### ResizeOperation (for history)

```typescript
// Extends existing HistoryOperation pattern

export interface ResizeOperationData {
  viewId: string;
  originalOrigin: Point;
  originalSize: Size;
  newOrigin: Point;
  newSize: Size;
}
```

### ResizeBounds

```typescript
/**
 * Complete bounds after resize calculation.
 */
export interface ResizeBounds {
  origin: Point;
  size: Size;
}
```

## Store Interface

### resizeStore

```typescript
// src/stores/resizeStore.ts

export const resizeStore: {
  readonly isResizing: boolean;
  readonly activeHandle: HandlePosition | null;
  readonly viewId: string | null;
  readonly startPoint: Point | null;
  readonly currentPoint: Point | null;
  readonly originalOrigin: Point | null;
  readonly originalSize: Size | null;
  readonly newOrigin: Point;
  readonly newSize: Size;
};

export function startResize(
  handle: HandlePosition,
  viewId: string,
  point: Point,
  origin: Point,
  size: Size
): void;

export function updateResize(
  point: Point,
  shiftHeld: boolean,
  altHeld: boolean
): void;

export function endResize(): void;

export function cancelResize(): void;

export function resetResize(): void;
```

## Domain Functions

### Resize Calculations

```typescript
// src/domain/canvas/resize.ts

/**
 * Calculate new bounds based on handle position and delta.
 */
export function calculateResizeBounds(
  handle: HandlePosition,
  originalOrigin: Point,
  originalSize: Size,
  delta: Point,
  options?: {
    maintainAspectRatio?: boolean;
    resizeFromCenter?: boolean;
  }
): ResizeBounds;

/**
 * Clamp size to minimum and adjust origin if needed.
 */
export function clampToMinimumSize(
  bounds: ResizeBounds,
  handle: HandlePosition,
  minSize?: number
): ResizeBounds;

/**
 * Format size as "width×height" string.
 */
export function formatSize(size: Size): string;

/**
 * Create history operation for resize.
 */
export function createResizeOperation(
  data: ResizeOperationData,
  updateViewOrigin: (id: string, origin: Point) => void,
  updateViewSize: (id: string, size: Size) => void
): HistoryOperation;
```

## documentStore Extension

```typescript
// Addition to src/stores/documentStore.ts

/**
 * Update a view's size attribute in the document.
 * Returns the previous size for undo purposes.
 */
export function updateViewSize(viewId: string, newSize: Size): Size | null;
```

## Relationships

```
┌─────────────────┐     ┌──────────────────┐
│  resizeStore    │────▶│  ResizePreview   │
│  (transient)    │     │  (visual only)   │
└────────┬────────┘     └──────────────────┘
         │
         │ on endResize()
         ▼
┌─────────────────┐     ┌──────────────────┐
│ documentStore   │◀───▶│  historyStore    │
│ updateViewSize  │     │  pushOperation   │
│ updateViewOrigin│     └──────────────────┘
└─────────────────┘
```

## State Transitions

```
IDLE ──[mousedown on handle]──▶ PENDING
  │
  │ (< 3px movement)
  ▼
IDLE ◀──[mouseup]

PENDING ──[> 3px movement]──▶ RESIZING
  │
  │ [mousemove]
  ▼
RESIZING ──[mouseup]──▶ COMMIT ──▶ IDLE
  │
  │ [Escape]
  ▼
CANCEL ──▶ IDLE
```
