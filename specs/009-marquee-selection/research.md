# Research: Marquee Selection

**Feature**: 009-marquee-selection
**Date**: 2026-01-06
**Status**: Complete

## Research Topics

### 1. Intersection Detection Algorithm

**Decision**: AABB (Axis-Aligned Bounding Box) overlap test

**Rationale**:
- All views are axis-aligned rectangles (no rotation)
- Simple O(1) check per view: compare edges for non-overlap
- Well-established algorithm with predictable performance
- Matches existing `hitTest()` pattern using bounding coordinates

**Alternatives Considered**:
- Separating Axis Theorem (SAT): Overkill for axis-aligned rectangles
- Spatial partitioning (quad-tree): Unnecessary for <500 views
- GPU-based hit testing: Added complexity, not needed at this scale

**Implementation**:
```typescript
function rectIntersect(a: Rect, b: Rect): boolean {
  return !(a.right < b.left || a.left > b.right ||
           a.bottom < b.top || a.top > b.bottom);
}
```

---

### 2. State Management Pattern

**Decision**: Dedicated `marqueeStore` using SolidJS signals

**Rationale**:
- Follows existing pattern: `selectionStore`, `canvasStore`, `gridStore`
- Clear separation of concerns
- Enables reactive updates across components
- Testable in isolation

**Alternatives Considered**:
- Local signals in Canvas.tsx: Would work but less testable, harder to extend
- Merge into canvasStore: Violates single responsibility, canvasStore is for pan/zoom
- Merge into selectionStore: Conceptually different - marquee is transient UI state

**State Shape**:
```typescript
interface MarqueeState {
  isActive: boolean;
  startPoint: CanvasPoint | null;
  currentPoint: CanvasPoint | null;
  isAdditive: boolean;
  previousSelection: Set<string>;
}
```

---

### 3. Event Handling Approach

**Decision**: Extend existing Canvas.tsx event handlers with document-level listeners for drag

**Rationale**:
- Follows pan gesture pattern already in Canvas.tsx
- Document-level mousemove/mouseup ensures reliable drag tracking
- Centralizes all canvas interactions in one component

**Alternatives Considered**:
- Separate MarqueeHandler component: Would require complex event coordination
- Global event manager: Over-engineering for single use case

**Event Sequence**:
1. `mousedown` on Canvas SVG → Check for empty space, start marquee
2. `mousemove` on document → Update marquee bounds (same pattern as pan)
3. `mouseup` on document → Complete or cancel marquee
4. `keydown` for Escape → Cancel marquee

---

### 4. Conflict Resolution with Pan/Zoom

**Decision**: Priority-based conflict detection

**Rationale**:
- Clear precedence: View click > Pan > Marquee
- Check existing state before starting new operation
- Cancel marquee if conflicting operation starts

**Conflict Rules**:
| Starting | Condition | Result |
|----------|-----------|--------|
| Marquee | Click on view | No marquee, view selection |
| Marquee | Middle mouse | No marquee, pan starts |
| Marquee | Ctrl+click | No marquee, pan starts |
| Marquee | isPanning true | No marquee |
| Active Marquee | Pan/zoom starts | Cancel marquee |

**Implementation**:
- Check `hitTest()` result before starting marquee
- Check `canvasStore.isPanning` before starting marquee
- Add `createEffect` to cancel marquee when `isPanning` becomes true

---

### 5. Visual Feedback Styling

**Decision**: Semi-transparent fill with solid stroke, crosshair cursor

**Rationale**:
- Standard UX pattern for marquee selection (Photoshop, Figma, etc.)
- Semi-transparency allows seeing views underneath (FR-003, SC-004)
- Crosshair cursor indicates selection mode (FR-013)

**Alternatives Considered**:
- Dashed/animated border ("marching ants"): Explicitly out of scope
- No fill (outline only): Less clear area indication
- Inverted colors: Complex to implement, accessibility concerns

**Styling**:
```css
.marqueeRect {
  fill: rgba(66, 153, 225, 0.15);  /* Light blue, 15% opacity */
  stroke: #3182ce;                  /* Solid blue border */
  stroke-width: 1;
  pointer-events: none;             /* Don't interfere with views */
}
```

**Design Tokens** (to add to tokens.css):
```css
--color-marquee-fill: rgba(66, 153, 225, 0.15);
--color-marquee-stroke: #3182ce;
```

---

### 6. Minimum Size Threshold (FR-010)

**Decision**: 5x5 pixels in canvas space

**Rationale**:
- Prevents accidental selection on click-without-drag
- Small enough to allow precise selections
- Applied after coordinate transform (consistent at all zoom levels)

**Implementation**:
```typescript
const MIN_MARQUEE_SIZE = 5;

function isMinimumSize(start: CanvasPoint, end: CanvasPoint): boolean {
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  return width >= MIN_MARQUEE_SIZE && height >= MIN_MARQUEE_SIZE;
}
```

---

### 7. Coordinate Transformation

**Decision**: Reuse existing `mouseToCanvas()` utility

**Rationale**:
- Already handles pan offset and zoom level
- Consistent with hit testing coordinates
- No new coordinate utilities needed

**Usage**:
```typescript
const canvasPoint = mouseToCanvas(
  event.clientX,
  event.clientY,
  wrapperRect,
  canvasStore.panOffset,
  canvasStore.zoomLevel
);
```

---

### 8. Performance for 500 Views (SC-006)

**Decision**: Linear scan with early termination considerations

**Rationale**:
- O(n) intersection test for n views
- At 500 views, worst case ~500 comparisons per selection
- Each comparison is 4 numeric comparisons (trivial cost)
- Expected time: <1ms on modern hardware

**Benchmarks** (estimated):
- 100 views: ~0.1ms
- 500 views: ~0.5ms
- 1000 views: ~1ms

**Optimization** (if needed in future):
- Spatial indexing (quad-tree) for 1000+ views
- Not implemented now - YAGNI principle

---

## Existing Code Reuse

| Existing Module | Reuse For |
|-----------------|-----------|
| `mouseToCanvas()` | Coordinate transformation |
| `hitTest()` | Check if click on view |
| `selectionStore` | Apply final selection |
| `canvasStore` | Pan/zoom state for conflict detection |
| `RenderableView` | View bounds for intersection |
| CSS design tokens | Marquee colors |

## New Code Required

| New Module | Purpose |
|------------|---------|
| `src/types/marquee.ts` | MarqueeState interface |
| `src/stores/marqueeStore.ts` | Marquee state management |
| `src/domain/canvas/marquee.ts` | Intersection utilities |
| `src/components/Canvas/MarqueeRectangle.tsx` | Visual component |

## Clarifications Resolved

No clarifications were needed - the feature spec and existing codebase provided sufficient context.
