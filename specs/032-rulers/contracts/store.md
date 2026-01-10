# Store Contract: rulerStore

**Feature**: 032-rulers | **Date**: 2026-01-10

## Overview

The rulerStore manages cursor position state for ruler cursor indicators. It is a simple signal-based store that tracks whether the cursor is over the canvas and its position in canvas coordinates.

## Interface

```typescript
import type { Point } from '../types/canvas';

/**
 * Ruler store state.
 */
interface RulerStoreState {
  /** Cursor position in canvas coordinates, null when outside canvas */
  cursorPosition: Point | null;
}

/**
 * Reactive store object with getter properties.
 */
export const rulerStore: {
  /** Current cursor position (canvas coordinates) or null */
  readonly cursorPosition: Point | null;
};

/**
 * Set cursor position when mouse is over canvas.
 * @param position - Canvas coordinates of cursor
 */
export function setCursorPosition(position: Point): void;

/**
 * Clear cursor position when mouse leaves canvas.
 */
export function clearCursorPosition(): void;

/**
 * Reset ruler store to initial state.
 * Called when document is unloaded.
 */
export function resetRulerStore(): void;
```

## Behavior

### State Transitions

```
Initial State:
  cursorPosition: null

On setCursorPosition({ x, y }):
  cursorPosition: { x, y }

On clearCursorPosition():
  cursorPosition: null

On resetRulerStore():
  cursorPosition: null
```

### Integration Points

**Canvas Component** (updates rulerStore):
```typescript
// In useCanvasInteractions or directly in Canvas.tsx
const handleCanvasMouseMove = (e: MouseEvent) => {
  const canvasPoint = screenToCanvasCoordinates(
    e.clientX - containerRect.left,
    e.clientY - containerRect.top,
    canvasStore.panOffset,
    canvasStore.zoomLevel
  );
  setCursorPosition(canvasPoint);
};

const handleCanvasMouseLeave = () => {
  clearCursorPosition();
};
```

**Ruler Components** (reads rulerStore):
```typescript
// In HorizontalRuler.tsx
const cursorX = createMemo(() => rulerStore.cursorPosition?.x ?? null);
const showCursor = createMemo(() => rulerStore.cursorPosition !== null);
```

## Implementation Pattern

Following existing store patterns in the codebase (canvasStore, gridStore):

```typescript
import { createSignal } from 'solid-js';
import type { Point } from '../types/canvas';

// --- Signals ---
const [cursorPosition, setCursorPositionSignal] = createSignal<Point | null>(null);

// --- Reactive store object ---
export const rulerStore = {
  get cursorPosition() {
    return cursorPosition();
  },
};

// --- Actions ---
export function setCursorPosition(position: Point): void {
  setCursorPositionSignal(position);
}

export function clearCursorPosition(): void {
  setCursorPositionSignal(null);
}

export function resetRulerStore(): void {
  setCursorPositionSignal(null);
}
```

## Testing Contract

```typescript
describe('rulerStore', () => {
  beforeEach(() => {
    resetRulerStore();
  });

  it('should initialize with null cursor position', () => {
    expect(rulerStore.cursorPosition).toBeNull();
  });

  it('should set cursor position', () => {
    setCursorPosition({ x: 100, y: 50 });
    expect(rulerStore.cursorPosition).toEqual({ x: 100, y: 50 });
  });

  it('should clear cursor position', () => {
    setCursorPosition({ x: 100, y: 50 });
    clearCursorPosition();
    expect(rulerStore.cursorPosition).toBeNull();
  });

  it('should reset to initial state', () => {
    setCursorPosition({ x: 100, y: 50 });
    resetRulerStore();
    expect(rulerStore.cursorPosition).toBeNull();
  });
});
```
