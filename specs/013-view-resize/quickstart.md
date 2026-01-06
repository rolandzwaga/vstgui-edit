# Quick Start: View Resize Implementation

**Feature**: 013-view-resize  
**Date**: 2026-01-06

## Implementation Order

Follow this sequence for test-first development:

### Phase 1: Types and Store (Foundation)

1. **Create resize types** (`src/types/resize.ts`)
   - ResizeState, ResizeBounds, MIN_VIEW_SIZE, RESIZE_CLICK_TOLERANCE
   - Test: Type compilation only (no runtime tests needed)

2. **Create resizeStore** (`src/stores/resizeStore.ts`)
   - Follow dragStore pattern exactly
   - Test: resizeStore.spec.ts - state transitions, computed values

3. **Add updateViewSize** to documentStore
   - Similar to updateViewOrigin but for size attribute
   - Test: documentStore.resize.spec.ts

### Phase 2: Domain Logic (Calculations)

4. **Create resize utilities** (`src/domain/canvas/resize.ts`)
   - calculateResizeBounds - core resize math
   - clampToMinimumSize - enforce 10×10 minimum
   - formatSize - "width×height" string
   - createResizeOperation - history integration
   - Test: resize.spec.ts - extensive unit tests for all handle positions

### Phase 3: Component Integration

5. **Modify SelectionOverlay** - add mousedown to handles
   - Pass handle position and view info to callback
   - Test: SelectionOverlay events (may already exist)

6. **Modify Canvas** - add resize event handlers
   - handleResizeStart, handleResizeMove, handleResizeEnd
   - Integrate with existing mouseup/mousemove handlers
   - Test: Canvas.resize.spec.tsx

7. **Add undo/redo** for resize
   - Use existing Ctrl+Z/Y handlers
   - Test: Canvas.resize.undo.spec.tsx

### Phase 4: Visual Feedback

8. **Create ResizePreview** component
   - Follow DragPreview pattern
   - 50% opacity, dashed stroke
   - Test: ResizePreview.spec.tsx

9. **Create DimensionIndicator** component
   - Floating "200×150" text near cursor
   - Test: DimensionIndicator.spec.tsx

### Phase 5: Modifier Keys

10. **Add Shift for aspect ratio lock**
    - Modify updateResize to accept shiftHeld
    - Test: Canvas.resize.aspect.spec.tsx

11. **Add Alt for center resize**
    - Modify updateResize to accept altHeld
    - Test: Canvas.resize.center.spec.tsx

12. **Add Escape to cancel**
    - Test: Canvas.resize.cancel.spec.tsx

## Key Patterns to Follow

### From dragStore (copy pattern)

```typescript
// resizeStore.ts follows same structure
const [isResizing, setIsResizing] = createSignal(false);
const [activeHandle, setActiveHandle] = createSignal<HandlePosition | null>(null);
// ... etc
```

### From DragPreview (copy pattern)

```typescript
// ResizePreview.tsx follows same structure
export const ResizePreview: Component<ResizePreviewProps> = (props) => {
  return (
    <Show when={resizeStore.isResizing}>
      <rect
        class={styles.preview}
        x={resizeStore.newOrigin.x}
        y={resizeStore.newOrigin.y}
        width={resizeStore.newSize.width}
        height={resizeStore.newSize.height}
      />
    </Show>
  );
};
```

### From move.ts (copy pattern for createResizeOperation)

```typescript
export function createResizeOperation(
  data: ResizeOperationData,
  updateOrigin: (id: string, p: Point) => void,
  updateSize: (id: string, s: Size) => void
): HistoryOperation {
  return {
    type: 'resize',
    description: 'Resize view',
    timestamp: Date.now(),
    undo: () => {
      updateOrigin(data.viewId, data.originalOrigin);
      updateSize(data.viewId, data.originalSize);
    },
    redo: () => {
      updateOrigin(data.viewId, data.newOrigin);
      updateSize(data.viewId, data.newSize);
    },
  };
}
```

## Testing Notes

**CRITICAL**: Read `specs/TESTING-GUIDE.md` before writing tests!

Key patterns for this feature:
- Use `testInRoot()` for store tests (signals need root)
- Use `fireEvent.mouseDown` + `fireEvent.mouseUp` (not click)
- Mock `updateViewSize` and `updateViewOrigin` in Canvas tests
- Use `vi.useFakeTimers()` for dimension indicator delay tests

## Files to Create

```
NEW FILES:
├── src/types/resize.ts
├── src/stores/resizeStore.ts
├── src/stores/__tests__/resizeStore.spec.ts
├── src/stores/__tests__/documentStore.resize.spec.ts
├── src/domain/canvas/resize.ts
├── src/domain/canvas/__tests__/resize.spec.ts
├── src/components/Canvas/ResizePreview.tsx
├── src/components/Canvas/ResizePreview.module.css
├── src/components/Canvas/DimensionIndicator.tsx
├── src/components/Canvas/DimensionIndicator.module.css
├── src/components/Canvas/__tests__/ResizePreview.spec.tsx
├── src/components/Canvas/__tests__/DimensionIndicator.spec.tsx
├── src/components/Canvas/__tests__/Canvas.resize.spec.tsx
└── src/components/Canvas/__tests__/Canvas.resize.undo.spec.tsx

MODIFIED FILES:
├── src/stores/documentStore.ts (add updateViewSize)
├── src/components/Canvas/Canvas.tsx (add resize handlers)
├── src/components/Canvas/SelectionOverlay.tsx (add mousedown to handles)
└── src/domain/canvas/index.ts (export resize utilities)
```

## Estimated Effort

| Phase | Tasks | Estimated Tests |
|-------|-------|-----------------|
| 1. Foundation | 3 | ~20 |
| 2. Domain Logic | 1 | ~30 |
| 3. Integration | 3 | ~25 |
| 4. Visual Feedback | 2 | ~15 |
| 5. Modifier Keys | 3 | ~20 |
| **Total** | **12** | **~110** |
