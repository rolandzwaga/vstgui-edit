# Quickstart: Snap to Grid

**Feature**: 014-snap-to-grid
**Date**: 2026-01-07

## Overview

This feature adds grid snapping to move and resize operations. Views automatically align to grid lines when within a configurable threshold.

## Key Files to Modify

### 1. gridStore.ts (Extend)

Add snap state signals:

```typescript
// New signals
const [isSnapEnabled, setIsSnapEnabled] = createSignal<boolean>(true);
const [snapThreshold, setSnapThreshold] = createSignal<number>(DEFAULT_SNAP_THRESHOLD);

// Add to gridStore object
export const gridStore = {
  // ... existing ...
  get isSnapEnabled() { return isSnapEnabled(); },
  get snapThreshold() { return snapThreshold(); },
};

// New actions
export function toggleSnap(): void { ... }
export function setSnapThreshold(threshold: number): void { ... }
```

### 2. snap.ts (New)

Core snap utilities:

```typescript
// src/domain/canvas/snap.ts
export function getEffectiveThreshold(threshold: number, gridSize: number): number;
export function snapToGrid(value: number, gridSize: number, threshold: number): SnapResult;
export function snapPoint(point: Point, gridSize: number, threshold: number): SnapPointResult;
export function snapEdges(bounds: ResizeBounds, handle: HandlePosition, gridSize: number, threshold: number): SnapEdgesResult;
```

### 3. useCanvasInteractions.ts (Modify)

Integrate snap into drag/resize:

```typescript
// In handleDragUp, before committing:
if (gridStore.isSnapEnabled && !altHeld) {
  const snapped = snapPoint(targetPosition, gridStore.size, effectiveThreshold);
  // Apply snapped position
}

// In handleResizeMove:
if (gridStore.isSnapEnabled && !e.altKey) {
  // Snap edges based on handle
}
```

### 4. useCanvasKeyboard.ts (Modify)

Add Shift+G shortcut:

```typescript
// In handleKeyDown
if (e.shiftKey && e.key.toLowerCase() === 'g') {
  e.preventDefault();
  toggleSnap();
}
```

### 5. SnapIndicator.tsx (New)

Visual feedback component:

```typescript
// src/components/SnapIndicator/SnapIndicator.tsx
export const SnapIndicator: Component<SnapIndicatorProps> = (props) => {
  return (
    <g class={styles.snapIndicator}>
      <For each={props.verticalLines}>
        {(x) => <line x1={x} y1={0} x2={x} y2="100%" />}
      </For>
      <For each={props.horizontalLines}>
        {(y) => <line x1={0} y1={y} x2="100%" y2={y} />}
      </For>
    </g>
  );
};
```

## Test Files to Create

1. `src/stores/__tests__/gridStore.snap.spec.ts` - Snap state tests
2. `src/domain/canvas/__tests__/snap.spec.ts` - Snap utility tests
3. `src/components/SnapIndicator/__tests__/SnapIndicator.spec.tsx` - Component tests
4. `src/hooks/canvas/__tests__/useCanvasInteractions.snap.spec.tsx` - Integration tests

## Implementation Order

1. **Types first**: Create `src/types/snap.ts`
2. **Domain utilities**: Create `src/domain/canvas/snap.ts` with TDD
3. **Store extension**: Extend `gridStore.ts` with snap signals
4. **Keyboard shortcut**: Add Shift+G to `useCanvasKeyboard.ts`
5. **Move integration**: Integrate snap into drag handlers
6. **Resize integration**: Integrate snap into resize handlers
7. **Visual feedback**: Create `SnapIndicator` component
8. **Toolbar**: Add snap toggle to `GridToolbar`

## Key Patterns

### Snap Calculation

```typescript
function snapToGrid(value: number, gridSize: number, threshold: number): SnapResult {
  const nearest = Math.round(value / gridSize) * gridSize;
  const distance = Math.abs(value - nearest);
  const effectiveThreshold = Math.min(threshold, gridSize / 2);
  
  if (distance <= effectiveThreshold) {
    return {
      snapped: true,
      value: nearest,
      snapDelta: nearest - value,
      gridLine: nearest,
    };
  }
  
  return {
    snapped: false,
    value,
    snapDelta: 0,
    gridLine: null,
  };
}
```

### Alt Key Check

```typescript
// In event handlers
const skipSnap = e.altKey || !gridStore.isSnapEnabled;
if (!skipSnap) {
  // Apply snap
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Shift+G | Toggle snap on/off |
| G | Toggle grid visibility (existing) |
| Alt (hold) | Temporarily disable snap during drag/resize |

## Design Tokens

Add to `src/styles/tokens.css`:

```css
--snap-indicator-color: var(--color-accent);
--snap-indicator-width: 1px;
```
