# Research: View Selection

**Feature**: 008-view-selection
**Date**: 2026-01-06

## Research Topics

### 1. Hit Testing Strategy

**Decision**: Reverse iteration through flattened view array (highest z-index first)

**Rationale**:
- `flattenHierarchy()` returns views in render order (z-index 0 = bottom)
- Iterating backwards gives topmost views priority (FR-013)
- Point-in-rectangle test: `x >= view.absoluteX && x < view.absoluteX + width && ...`
- O(n) worst case, but typically returns early when hit found

**Alternatives Considered**:
- Spatial indexing (R-tree): Overkill for <500 views, adds complexity
- DOM hit testing via `elementsFromPoint()`: Requires SVG elements to be pointer-enabled, breaks with transforms

### 2. Coordinate Transformation

**Decision**: Manual inverse transform using canvasStore values

**Rationale**:
- Canvas wrapper applies `translate(panX, panY) scale(zoom)` CSS transform
- SVG coordinates are in "canvas space" (pre-transform)
- Mouse events are in "viewport space" (post-transform)
- Inverse: `canvasX = (mouseX - wrapperLeft - panX) / zoom`

**Formula**:
```typescript
function mouseToCanvas(
  mouseX: number,
  mouseY: number,
  wrapperRect: DOMRect,
  panOffset: { x: number; y: number },
  zoomLevel: number
): { x: number; y: number } {
  return {
    x: (mouseX - wrapperRect.left - panOffset.x) / zoomLevel,
    y: (mouseY - wrapperRect.top - panOffset.y) / zoomLevel,
  };
}
```

### 3. Selection Visual Design

**Decision**: SVG overlay with distinct border and 8 resize handles

**Rationale**:
- Selection overlay rendered after all views (on top)
- Border: 2px solid, accent color (meets 4:1 contrast - SC-004)
- Handles: 8x8px squares at corners and edge midpoints
- Cursor changes on handle hover (FR-014)

**Handle Positions** (relative to view bounds):
| Handle | Position | Cursor |
|--------|----------|--------|
| NW | (0, 0) | nwse-resize |
| N | (width/2, 0) | ns-resize |
| NE | (width, 0) | nesw-resize |
| E | (width, height/2) | ew-resize |
| SE | (width, height) | nwse-resize |
| S | (width/2, height) | ns-resize |
| SW | (0, height) | nesw-resize |
| W | (0, height/2) | ew-resize |

### 4. Hover Tooltip Implementation

**Decision**: Use @floating-ui/dom with delayed show

**Rationale**:
- Already in project dependencies
- Handles viewport boundary collision
- Configurable delay (500ms per SC-003)
- Auto-positioning (prefer top, fallback to bottom/sides)

**Content Format**: `ClassName (W×H)` - e.g., `CTextButton (100×30)`

### 5. Multi-Selection State

**Decision**: `Set<string>` for selected view IDs

**Rationale**:
- O(1) add/remove/has operations
- Natural fit for toggle behavior (Shift+click)
- Easy serialization if needed later
- Memory efficient for up to 500 views

**Alternatives Considered**:
- Array: O(n) lookup for `includes()` check
- Map<string, RenderableView>: Unnecessary to store full view data

### 6. Keyboard Shortcut Integration

**Decision**: Extend existing Canvas keyboard handler

**Rationale**:
- Canvas.tsx already handles keyboard events (zoom shortcuts)
- Same pattern: check for text input focus, then handle key
- Ctrl+A (Cmd+A on Mac) for select all
- Escape for clear selection

**Implementation**:
```typescript
// In Canvas keydown handler
if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
  e.preventDefault();
  selectAll(renderableViews);
}
if (e.key === 'Escape') {
  clearSelection();
}
```

### 7. Parent Highlight Logic

**Decision**: Derive parent IDs from view hierarchy, apply subtle highlight

**Rationale**:
- When child selected, find all ancestor view IDs
- Apply lighter/transparent highlight to ancestors
- Requires tracking parent-child relationships in RenderableView or separate lookup

**Implementation Approach**:
- Extend `RenderableView` to include `parentId?: string`
- Build parent lookup during `flattenHierarchy()`
- `getAncestorIds(viewId)` utility function

### 8. Performance Considerations

**Decision**: Minimize re-renders via fine-grained reactivity

**Rationale**:
- SolidJS signals update only affected DOM nodes
- Selection check per view: `selectionStore.selectedIds().has(view.id)`
- No full re-render of Canvas on selection change
- Tooltip only mounted when hover active

**Performance Targets**:
- SC-001: <100ms selection response - achieved via direct DOM updates
- SC-002: <16ms visual update - SolidJS fine-grained reactivity
- SC-006: 500 views - O(n) hit test acceptable at this scale

## Existing Code Analysis

### Reusable Components

| Component | Location | Reuse |
|-----------|----------|-------|
| canvasStore | `src/stores/canvasStore.ts` | Pan/zoom values for transforms |
| gridStore | `src/stores/gridStore.ts` | Pattern for store structure |
| flattenHierarchy | `src/domain/canvas/flattenHierarchy.ts` | View data source |
| RenderableView | `src/types/canvas.ts` | Type for selection targets |
| ViewRectangle | `src/components/Canvas/ViewRectangle.tsx` | Modify for selection styling |

### Design Tokens to Add

```css
/* Selection colors */
--color-selection-stroke: #0066cc;
--color-selection-fill: rgba(0, 102, 204, 0.1);
--color-selection-handle: #0066cc;
--color-selection-handle-border: #ffffff;

/* Hover colors */
--color-hover-stroke: #666666;
--color-hover-fill: rgba(102, 102, 102, 0.05);

/* Parent highlight */
--color-parent-highlight: rgba(0, 102, 204, 0.05);
--color-parent-highlight-stroke: rgba(0, 102, 204, 0.3);
```

## Resolved Clarifications

| Topic | Resolution |
|-------|------------|
| Cross-hierarchy multi-selection | Yes - views at any nesting level can be in selection |
| Selection event timing | Standard click (mouseup), not mousedown |
| Tooltip text format | `ClassName (W×H)` format |
