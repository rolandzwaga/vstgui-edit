# Research: Hierarchy Reparenting

**Feature**: 018-hierarchy-reparenting
**Date**: 2026-01-07

## Research Topics

### 1. HTML5 Drag and Drop API for Tree Components

**Decision**: Use native HTML5 Drag and Drop API with `draggable` attribute and event handlers.

**Rationale**: 
- Already used successfully in ViewPalette (017-view-creation) for drag-to-create
- Native API provides cross-browser support without additional dependencies
- SolidJS handles event binding efficiently

**Alternatives considered**:
- Custom mouse event tracking: More control but more code, already have working pattern
- Third-party drag library (e.g., @dnd-kit): Adds dependency, constitution requires approval

**Implementation pattern** (from existing ViewPalette):
```typescript
// TreeNode.tsx
<div
  draggable="true"
  onDragStart={(e) => handleDragStart(e, node.id)}
  onDragOver={(e) => handleDragOver(e, node.id)}
  onDragLeave={(e) => handleDragLeave(e)}
  onDrop={(e) => handleDrop(e, node.id)}
>
```

### 2. Drop Target Detection: Container vs Between-Siblings

**Decision**: Use vertical position within drop target element to distinguish:
- Top 25% of element height → Insert before this sibling
- Bottom 25% of element height → Insert after this sibling
- Middle 50% of container element → Reparent into container

**Rationale**: 
- Industry standard pattern (VS Code, Figma, browser dev tools)
- Provides clear visual zones for user intent
- Single drop handler can determine action from mouse Y position

**Implementation**:
```typescript
function getDropPosition(e: DragEvent, element: HTMLElement): 'before' | 'inside' | 'after' {
  const rect = element.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const height = rect.height;
  
  if (y < height * 0.25) return 'before';
  if (y > height * 0.75) return 'after';
  return 'inside';
}
```

### 3. Circular Hierarchy Prevention

**Decision**: Check if drop target is descendant of dragged view before allowing drop.

**Rationale**: Dropping a parent onto its own descendant would create a cycle, corrupting the tree.

**Implementation**:
```typescript
function isDescendantOf(viewId: string, potentialAncestorId: string, document: Document): boolean {
  // Walk up from viewId, return true if we hit potentialAncestorId
}

// In drop handler:
if (isDescendantOf(targetId, draggedId, document)) {
  return; // Reject drop
}
```

### 4. Origin Adjustment on Reparent

**Decision**: When reparenting, adjust view's origin to maintain absolute canvas position.

**Rationale**: FR-005 and SC-007 require no visual jump after reparent.

**Formula**:
```typescript
// View at absolute position (100, 100)
// Old parent at (20, 20) → view origin was (80, 80)
// New parent at (50, 30) → view origin should be (50, 70)

newOrigin.x = oldAbsoluteX - newParentAbsoluteX;
newOrigin.y = oldAbsoluteY - newParentAbsoluteY;
```

**Existing utilities**:
- `parsePoint()` from `src/domain/canvas/coordinates.ts`
- `formatOrigin()` from `src/domain/canvas/move.ts`

### 5. Container Class Detection

**Decision**: Use existing `isContainerClass()` from `src/domain/views/viewClasses.ts`.

**Rationale**: Already implemented in 017-view-creation feature.

**Container classes** (from viewClasses.ts):
- CViewContainer
- CScrollView
- CRowColumnView
- CShadowViewContainer
- CSplitView
- CLayeredViewContainer
- UIViewSwitchContainer

### 6. Undo/Redo Pattern for Hierarchy Operations

**Decision**: Follow existing historyStore pattern with HistoryOperation interface.

**Rationale**: Consistent with 012-view-move, 013-view-resize, 017-view-creation.

**Pattern**:
```typescript
const operation: HistoryOperation = {
  type: 'reparent',
  description: `Reparent ${viewName}`,
  timestamp: Date.now(),
  undo: () => {
    // Restore view to original parent at original index
    // Restore original origin
  },
  redo: () => {
    // Move view to new parent
    // Update origin for position preservation
  },
};
pushOperation(operation);
```

### 7. Multi-View Drag Handling

**Decision**: When multiple views selected, drag all selected views together.

**Rationale**: FR-026 and FR-027 require multi-selection support.

**Constraints**:
- All selected views must have same parent for reorder
- For reparent, all views moved to same new parent
- Relative order among selected views preserved

### 8. Group Container Sizing

**Decision**: New group container sized to bounding box of grouped views.

**Rationale**: FR-011 requires container to encompass all grouped views.

**Implementation**:
```typescript
function calculateGroupBounds(views: ViewNode[]): { origin: Point; size: Size } {
  const minX = Math.min(...views.map(v => parsePoint(v.origin).x));
  const minY = Math.min(...views.map(v => parsePoint(v.origin).y));
  const maxX = Math.max(...views.map(v => parsePoint(v.origin).x + parseSize(v.size).width));
  const maxY = Math.max(...views.map(v => parsePoint(v.origin).y + parseSize(v.size).height));
  
  return {
    origin: { x: minX, y: minY },
    size: { width: maxX - minX, height: maxY - minY }
  };
}
```

### 9. Document Store Mutations

**Decision**: Add new mutations to existing documentStore for hierarchy operations.

**New mutations needed**:
- `reparentView(viewId, newParentId, index?)` - Move view to new parent
- `reorderView(viewId, newIndex)` - Change view's position among siblings
- `groupViews(viewIds)` - Create container, move views into it
- `ungroupContainer(containerId)` - Move children up, delete container

### 10. Visual Feedback Styles

**Decision**: Use CSS classes for drop indicators, consistent with existing selection styles.

**Styles needed**:
- `.dropTarget` - Highlight valid container target
- `.dropBefore` - Line indicator above item
- `.dropAfter` - Line indicator below item
- `.dropInvalid` - Rejection indicator (e.g., cursor change)

## Dependencies

**No new dependencies required.** All functionality achievable with:
- Existing SolidJS primitives
- Native HTML5 Drag and Drop API
- Existing domain utilities (parsePoint, formatOrigin, isContainerClass)
- Existing historyStore for undo/redo

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Complex drag state management | Isolate in dedicated hook (useHierarchyDrag) |
| Origin calculation errors | Comprehensive unit tests for position math |
| Circular hierarchy bugs | Explicit validation before any reparent |
| Multi-selection edge cases | Clear constraints: same parent for reorder |
