# Research: View Move

**Feature**: 012-view-move
**Date**: 2026-01-06

## Research Areas

### 1. Undo/Redo Pattern for SolidJS

**Decision**: Command pattern with undo/redo stacks in a dedicated historyStore

**Rationale**: 
- Matches existing store patterns (documentStore, selectionStore, canvasStore)
- Command pattern allows arbitrary operations to be undoable
- Simple stack-based implementation with push/pop semantics
- SolidJS signals provide automatic reactivity for UI state

**Alternatives Considered**:
- Event sourcing: Overkill for single-document editing
- Memento pattern: Stores entire state snapshots; memory-heavy for large documents
- External library (immer patches): Adds dependency; constitution requires minimizing deps

**Implementation Approach**:
```typescript
interface HistoryOperation {
  type: 'move' | 'resize' | 'property' | etc;
  undo: () => void;
  redo: () => void;
  description: string;
}
```

### 2. Document Mutation Strategy

**Decision**: Add `updateViewOrigin(viewId, newOrigin)` action to documentStore

**Rationale**:
- documentStore already manages the parsed uidesc document
- Direct mutation of nested store state via `setDocument` path
- Keeps all document mutations in one place

**Alternatives Considered**:
- Separate mutation store: Adds complexity; document state is already centralized
- Immutable updates with spread: SolidJS stores support direct path mutation

**Implementation Approach**:
- Parse composite viewId to path (e.g., 'MainView-panel-button' → path to nested view)
- Update `attributes.origin` at that path
- Return previous value for undo operation

### 3. Drag-to-Move Interaction Pattern

**Decision**: Reuse existing mouse event pattern from marquee selection with move-specific handlers

**Rationale**:
- Canvas.tsx already has mousedown/mousemove/mouseup infrastructure
- Can extend existing pattern rather than create parallel system
- Click tolerance (3px) differentiates click from drag

**Existing Pattern** (from marquee):
- mousedown: Capture start position, target
- mousemove: Update drag state, calculate delta
- mouseup: Commit operation

**Move-Specific Additions**:
- Check if mousedown target is selected view (not empty canvas)
- Track original positions of all selected views
- Apply delta to all selected views during drag
- Commit on mouseup, push to history

### 4. Arrow Key Nudge Implementation

**Decision**: Keyboard handler in Canvas component, similar to existing shortcuts

**Rationale**:
- Canvas already handles keyboard shortcuts (G for grid, F for fit, etc.)
- Arrow keys naturally fit this pattern
- Shift modifier already used for multi-select; here repurposed for fast nudge

**Implementation Approach**:
- Check if arrow key and selection exists
- Calculate delta: 1px default, 10px with Shift
- Apply to all selected views
- Push to history (debounce multiple rapid nudges into single operation)

### 5. Shift-Constrain Axis Determination

**Decision**: Lock axis after 5px movement in dominant direction

**Rationale**:
- 5px matches existing marquee threshold (MIN_MARQUEE_SIZE)
- Dominant direction = which axis has larger absolute delta
- Once locked, only that axis updates until Shift released

**Implementation Approach**:
```typescript
if (shiftHeld && !axisLocked && distance > 5) {
  lockedAxis = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
}
```

### 6. Ghost Preview Rendering

**Decision**: Separate DragPreview component rendered in SVG during drag

**Rationale**:
- Keep ViewRectangle focused on normal rendering
- Preview has different styling (semi-transparent, dashed outline)
- Simpler state management - preview only exists during drag

**Implementation Approach**:
- When dragging, render DragPreview for each selected view
- Position at current cursor offset from original
- Style with opacity 0.5 and dashed stroke
- Remove on drag end

### 7. Cursor Feedback

**Decision**: Use CSS cursor styles on canvas during drag

**Rationale**:
- Native browser cursor provides immediate feedback
- `move` cursor indicates drag operation
- Already have `grab`/`grabbing` for pan; `move` is distinct

**Implementation**:
- Set `cursor: move` when hovering selected view
- Set `cursor: move` during drag operation
- Reset to default on drag end

## Dependencies

**New**: None required

**Existing to Reuse**:
- documentStore: For document mutations
- selectionStore: For selected view IDs
- flattenHierarchy: For getting all view positions
- mouseToCanvas: For coordinate conversion
- parsePoint/formatPoint: For origin string parsing/formatting

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| History stack memory growth | Limit stack size (100 operations default) |
| Rapid nudge creates many history entries | Debounce consecutive nudges into single operation |
| Complex nested view ID parsing | Reuse existing composite ID pattern from flattenHierarchy |
| Performance with many selected views | Batch DOM updates; SolidJS fine-grained reactivity helps |

## Open Questions (Resolved)

All questions resolved during research. No blockers for Phase 1.
