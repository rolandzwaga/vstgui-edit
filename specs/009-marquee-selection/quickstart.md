# Quickstart: Marquee Selection

**Feature**: 009-marquee-selection
**Date**: 2026-01-06

## Implementation Order

1. **Types** → 2. **Domain utilities** → 3. **Store** → 4. **Component** → 5. **Integration**

---

## Step 1: Types (`src/types/marquee.ts`)

```typescript
import type { CanvasPoint } from './selection';

export interface MarqueeState {
  isActive: boolean;
  startPoint: CanvasPoint | null;
  currentPoint: CanvasPoint | null;
  isAdditive: boolean;
  previousSelection: Set<string>;
}
```

Test: Type-only file, no tests required.

---

## Step 2: Domain Utilities (`src/domain/canvas/marquee.ts`)

### 2.1 Constants and Types

```typescript
import type { CanvasPoint } from '../../types/selection';
import type { RenderableView } from '../../types/canvas';

export interface MarqueeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const MIN_MARQUEE_SIZE = 5;
```

### 2.2 normalizeRect

```typescript
export function normalizeRect(start: CanvasPoint, current: CanvasPoint): MarqueeRect {
  const x = Math.min(start.x, current.x);
  const y = Math.min(start.y, current.y);
  const width = Math.abs(current.x - start.x);
  const height = Math.abs(current.y - start.y);
  return { x, y, width, height };
}
```

Tests:
- Drag down-right: start (10, 10), current (50, 50) → { x: 10, y: 10, width: 40, height: 40 }
- Drag up-left: start (50, 50), current (10, 10) → { x: 10, y: 10, width: 40, height: 40 }
- Zero size: start (10, 10), current (10, 10) → { x: 10, y: 10, width: 0, height: 0 }

### 2.3 isMinimumSize

```typescript
export function isMinimumSize(start: CanvasPoint, current: CanvasPoint): boolean {
  const width = Math.abs(current.x - start.x);
  const height = Math.abs(current.y - start.y);
  return width >= MIN_MARQUEE_SIZE && height >= MIN_MARQUEE_SIZE;
}
```

Tests:
- Below threshold: 4x4 → false
- At threshold: 5x5 → true
- Above threshold: 10x10 → true
- Width only: 10x3 → false
- Height only: 3x10 → false

### 2.4 rectIntersect

```typescript
export function rectIntersect(a: MarqueeRect, b: MarqueeRect): boolean {
  const aRight = a.x + a.width;
  const aBottom = a.y + a.height;
  const bRight = b.x + b.width;
  const bBottom = b.y + b.height;

  return !(aRight < b.x || a.x > bRight || aBottom < b.y || a.y > bBottom);
}
```

Tests:
- Full overlap: a contains b → true
- Partial overlap: corner intersection → true
- Edge touch: a.right === b.left → true
- No overlap: separated → false
- Zero-size rect: 0x0 → false (no area)

### 2.5 findIntersectingViews

```typescript
export function findIntersectingViews(
  marqueeRect: MarqueeRect,
  views: RenderableView[]
): string[] {
  return views
    .filter(view => {
      const viewRect: MarqueeRect = {
        x: view.absoluteX,
        y: view.absoluteY,
        width: view.width,
        height: view.height,
      };
      return rectIntersect(marqueeRect, viewRect);
    })
    .map(view => view.id);
}
```

Tests:
- No views intersect → []
- All views intersect → all IDs
- Partial: 2 of 5 views intersect → 2 IDs
- Nested views: parent and child both intersect → both IDs

---

## Step 3: Store (`src/stores/marqueeStore.ts`)

```typescript
import { createSignal } from 'solid-js';
import type { CanvasPoint } from '../types/selection';

const [isActive, setIsActive] = createSignal(false);
const [startPoint, setStartPoint] = createSignal<CanvasPoint | null>(null);
const [currentPoint, setCurrentPoint] = createSignal<CanvasPoint | null>(null);
const [isAdditive, setIsAdditive] = createSignal(false);
const [previousSelection, setPreviousSelection] = createSignal<Set<string>>(new Set());

export const marqueeStore = {
  get isActive() { return isActive(); },
  get startPoint() { return startPoint(); },
  get currentPoint() { return currentPoint(); },
  get isAdditive() { return isAdditive(); },
  get previousSelection() { return previousSelection(); },
};

export function startMarquee(
  point: CanvasPoint,
  additive: boolean,
  currentSelection: Set<string>
): void {
  setStartPoint(point);
  setCurrentPoint(point);
  setIsAdditive(additive);
  setPreviousSelection(new Set(currentSelection));
  setIsActive(true);
}

export function updateMarquee(point: CanvasPoint): void {
  if (isActive()) {
    setCurrentPoint(point);
  }
}

export function completeMarquee(): void {
  resetMarquee();
}

export function cancelMarquee(): void {
  resetMarquee();
}

export function resetMarquee(): void {
  setIsActive(false);
  setStartPoint(null);
  setCurrentPoint(null);
  setIsAdditive(false);
  setPreviousSelection(new Set());
}
```

Tests:
- Initial state: isActive false, points null
- startMarquee: sets all fields correctly
- updateMarquee: only updates currentPoint when active
- updateMarquee: no-op when inactive
- completeMarquee: resets to initial state
- cancelMarquee: resets to initial state
- previousSelection: is copy, not reference

---

## Step 4: MarqueeRectangle Component

```typescript
// src/components/Canvas/MarqueeRectangle.tsx
import type { Component } from 'solid-js';
import { createMemo } from 'solid-js';
import { marqueeStore } from '../../stores/marqueeStore';
import { normalizeRect } from '../../domain/canvas/marquee';
import styles from './Canvas.module.css';

export const MarqueeRectangle: Component = () => {
  const rect = createMemo(() => {
    const start = marqueeStore.startPoint;
    const current = marqueeStore.currentPoint;
    if (!start || !current) return null;
    return normalizeRect(start, current);
  });

  return (
    <Show when={rect()}>
      {r => (
        <rect
          class={styles.marqueeRect}
          x={r().x}
          y={r().y}
          width={r().width}
          height={r().height}
          data-testid="marquee-rect"
        />
      )}
    </Show>
  );
};
```

CSS (add to Canvas.module.css):
```css
.marqueeRect {
  fill: var(--color-marquee-fill);
  stroke: var(--color-marquee-stroke);
  stroke-width: 1;
  pointer-events: none;
}

.marqueeCursor {
  cursor: crosshair;
}
```

Tests:
- Renders rect when marqueeStore.isActive
- Uses normalized coordinates
- Hidden when isActive false
- Correct class applied

---

## Step 5: Canvas Integration

### 5.1 Imports

```typescript
import { marqueeStore, startMarquee, updateMarquee, completeMarquee, cancelMarquee } from '../../stores/marqueeStore';
import { findIntersectingViews, isMinimumSize } from '../../domain/canvas/marquee';
import { MarqueeRectangle } from './MarqueeRectangle';
```

### 5.2 handleMouseDown (modify existing)

After pan check, before selection:
```typescript
// If left click on empty space, start marquee
if (event.button === 0 && !canvasStore.isPanning) {
  const canvasPoint = mouseToCanvas(event.clientX, event.clientY, wrapperRect, panOffset, zoomLevel);
  const hitViewId = hitTest(canvasPoint, renderableViews);

  if (!hitViewId) {
    // Empty space - start marquee
    startMarquee(canvasPoint, event.shiftKey, selectionStore.selectedIds);
    document.addEventListener('mousemove', handleMarqueeMove);
    document.addEventListener('mouseup', handleMarqueeUp);
    return;
  }
  // ... existing selection logic
}
```

### 5.3 handleMarqueeMove

```typescript
const handleMarqueeMove = (event: MouseEvent) => {
  const canvasPoint = mouseToCanvas(event.clientX, event.clientY, wrapperRect, panOffset, zoomLevel);
  updateMarquee(canvasPoint);
};
```

### 5.4 handleMarqueeUp

```typescript
const handleMarqueeUp = (event: MouseEvent) => {
  document.removeEventListener('mousemove', handleMarqueeMove);
  document.removeEventListener('mouseup', handleMarqueeUp);

  const start = marqueeStore.startPoint;
  const current = marqueeStore.currentPoint;

  if (!start || !current) {
    cancelMarquee();
    return;
  }

  // Check minimum size (FR-010)
  if (!isMinimumSize(start, current)) {
    clearSelection();
    completeMarquee();
    return;
  }

  // Find intersecting views
  const marqueeRect = normalizeRect(start, current);
  const intersectingIds = findIntersectingViews(marqueeRect, renderableViews);

  // Apply selection
  if (marqueeStore.isAdditive) {
    // Merge with previous selection
    const merged = new Set([...marqueeStore.previousSelection, ...intersectingIds]);
    selectAll([...merged]);
  } else {
    selectAll(intersectingIds);
  }

  completeMarquee();
};
```

### 5.5 handleKeyDown (extend)

Add before other shortcuts:
```typescript
if (e.key === 'Escape' && marqueeStore.isActive) {
  // Restore previous selection
  selectAll([...marqueeStore.previousSelection]);
  cancelMarquee();
  document.removeEventListener('mousemove', handleMarqueeMove);
  document.removeEventListener('mouseup', handleMarqueeUp);
  return;
}
```

### 5.6 handleContextMenu (right-click cancel)

```typescript
const handleContextMenu = (event: MouseEvent) => {
  if (marqueeStore.isActive) {
    event.preventDefault();
    selectAll([...marqueeStore.previousSelection]);
    cancelMarquee();
    document.removeEventListener('mousemove', handleMarqueeMove);
    document.removeEventListener('mouseup', handleMarqueeUp);
  }
};
```

### 5.7 Conflict Detection (createEffect)

```typescript
createEffect(() => {
  if (canvasStore.isPanning && marqueeStore.isActive) {
    cancelMarquee();
    document.removeEventListener('mousemove', handleMarqueeMove);
    document.removeEventListener('mouseup', handleMarqueeUp);
  }
});
```

### 5.8 Render MarqueeRectangle

Inside SVG, after SelectionOverlay:
```tsx
<Show when={marqueeStore.isActive}>
  <MarqueeRectangle />
</Show>
```

---

## Testing Checklist

### Unit Tests
- [ ] normalizeRect - all drag directions
- [ ] isMinimumSize - threshold cases
- [ ] rectIntersect - overlap scenarios
- [ ] findIntersectingViews - filter and map

### Store Tests
- [ ] Initial state
- [ ] startMarquee sets all fields
- [ ] updateMarquee when active/inactive
- [ ] completeMarquee resets
- [ ] cancelMarquee resets
- [ ] previousSelection is copy

### Component Tests
- [ ] MarqueeRectangle renders when active
- [ ] MarqueeRectangle hidden when inactive
- [ ] Mousedown on empty space starts marquee
- [ ] Mousedown on view does not start marquee
- [ ] Mouseup selects intersecting views
- [ ] Shift+drag adds to selection
- [ ] Escape cancels and restores
- [ ] Right-click cancels
- [ ] Small marquee treated as click
- [ ] Pan conflict cancels marquee

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/types/marquee.ts` | CREATE | MarqueeState interface |
| `src/domain/canvas/marquee.ts` | CREATE | Intersection utilities |
| `src/domain/canvas/__tests__/marquee.spec.ts` | CREATE | Unit tests |
| `src/stores/marqueeStore.ts` | CREATE | State management |
| `src/stores/__tests__/marqueeStore.spec.ts` | CREATE | Store tests |
| `src/components/Canvas/MarqueeRectangle.tsx` | CREATE | Visual component |
| `src/components/Canvas/__tests__/MarqueeRectangle.spec.tsx` | CREATE | Component tests |
| `src/components/Canvas/Canvas.tsx` | MODIFY | Event handlers |
| `src/components/Canvas/__tests__/Canvas.marquee.spec.tsx` | CREATE | Integration tests |
| `src/components/Canvas/Canvas.module.css` | MODIFY | Marquee styles |
| `src/styles/tokens.css` | MODIFY | Color tokens |
| `src/domain/canvas/index.ts` | MODIFY | Re-export marquee |
