# Quickstart: Hierarchy Reparenting

**Feature**: 018-hierarchy-reparenting
**Date**: 2026-01-07

## Overview

This feature adds drag-and-drop hierarchy manipulation to the HierarchyPanel:
- **Reparent**: Drag view onto container to change parent
- **Reorder**: Drag view between siblings to change z-order
- **Group** (Ctrl+G): Wrap selected siblings in new CViewContainer
- **Ungroup** (Ctrl+Shift+G): Move container's children up, delete container

## Key Files

| File | Purpose |
|------|---------|
| `src/components/HierarchyPanel/TreeNode.tsx` | Add draggable and drop target handlers |
| `src/domain/hierarchy/reparent.ts` | Reparent logic and validation |
| `src/domain/hierarchy/reorder.ts` | Sibling reorder logic |
| `src/domain/hierarchy/group.ts` | Group/ungroup operations |
| `src/hooks/hierarchy/useHierarchyDrag.ts` | Drag state management |
| `src/stores/documentStore.ts` | Add reparent/reorder mutations |
| `src/types/hierarchy.ts` | Type definitions |

## Implementation Sequence

### Phase 1: Domain Logic (no UI)

1. **Types** (`src/types/hierarchy.ts`)
   - HierarchyDragState, DropInfo, ReparentOperation, etc.

2. **Reparent logic** (`src/domain/hierarchy/reparent.ts`)
   - `isDescendantOf()` - Check for circular hierarchy
   - `validateReparent()` - Validate drop is allowed
   - `calculateNewOrigin()` - Adjust origin for position preservation
   - `createReparentOperation()` - Create HistoryOperation

3. **Reorder logic** (`src/domain/hierarchy/reorder.ts`)
   - `validateReorder()` - Check same parent, valid index
   - `createReorderOperation()` - Create HistoryOperation

4. **Group logic** (`src/domain/hierarchy/group.ts`)
   - `validateGroup()` - Check 2+ siblings selected
   - `calculateGroupBounds()` - Compute container size/position
   - `createGroupOperation()` - Create HistoryOperation
   - `validateUngroup()` - Check single container selected, not root
   - `createUngroupOperation()` - Create HistoryOperation

### Phase 2: Document Store Mutations

5. **Store mutations** (`src/stores/documentStore.ts`)
   - `reparentView(viewId, newParentId, index, origin)`
   - `reorderView(viewId, newIndex)`
   - `createGroupContainer(viewIds, containerId, attrs)`
   - `ungroupContainer(containerId)`

### Phase 3: Drag Hook

6. **Drag state hook** (`src/hooks/hierarchy/useHierarchyDrag.ts`)
   - Track drag state (isDragging, draggedIds, dropTarget)
   - Handle drag events (start, over, leave, drop)
   - Determine drop position (before/inside/after)
   - Validate drop targets

### Phase 4: UI Integration

7. **TreeNode updates** (`src/components/HierarchyPanel/TreeNode.tsx`)
   - Add `draggable="true"`
   - Wire up drag event handlers
   - Apply drop indicator styles

8. **Styles** (`src/components/HierarchyPanel/HierarchyPanel.module.css`)
   - `.dropTarget` - Highlight valid container
   - `.dropBefore` / `.dropAfter` - Insertion lines
   - `.dragging` - Semi-transparent dragged item

### Phase 5: Keyboard Commands

9. **Group/Ungroup shortcuts**
   - Ctrl+G → Group selected views
   - Ctrl+Shift+G → Ungroup selected container

## Usage Examples

### Reparent via Drag

```typescript
// User drags "Button1" from Container1 onto Container2
// System:
// 1. Validates Container2 is a valid container
// 2. Calculates new origin to preserve absolute position
// 3. Creates HistoryOperation
// 4. Calls documentStore.reparentView()
// 5. Pushes operation to historyStore
```

### Reorder Siblings

```typescript
// User drags "ViewC" above "ViewA" in same container
// System:
// 1. Detects drop position is "before" ViewA
// 2. Creates ReorderOperation with newIndex = 0
// 3. Calls documentStore.reorderView()
// 4. Z-order now: ViewC, ViewA, ViewB
```

### Group Views

```typescript
// User selects ViewA and ViewB, presses Ctrl+G
// System:
// 1. Validates both are siblings
// 2. Calculates bounding box
// 3. Creates CViewContainer at bounding box origin
// 4. Moves views into container with adjusted origins
// 5. Selects new container
```

### Ungroup Container

```typescript
// User selects GroupContainer, presses Ctrl+Shift+G
// System:
// 1. Validates container is not root
// 2. Gets children (ViewA, ViewB)
// 3. Adjusts child origins to parent-relative
// 4. Moves children to parent at container's index
// 5. Deletes container
// 6. Selects ungrouped children
```

## Testing Strategy

### Unit Tests

- `reparent.spec.ts`: Validation, origin calculation, circular detection
- `reorder.spec.ts`: Index calculations, same-parent validation
- `group.spec.ts`: Bounds calculation, origin adjustment, ungroup

### Integration Tests

- `useHierarchyDrag.spec.ts`: Drag state transitions, event handling
- `HierarchyPanel.spec.tsx`: Full drag-drop flows, keyboard commands

### Test Patterns

```typescript
// Test circular hierarchy rejection
it('should reject drop when target is descendant of dragged', () => {
  const result = validateReparent('parent', 'child', document);
  expect(result.isValid).toBe(false);
  expect(result.invalidReason).toBe('circular');
});

// Test position preservation
it('should maintain absolute position after reparent', () => {
  const newOrigin = calculateNewOrigin(
    { x: 100, y: 100 }, // absolute position
    { x: 50, y: 30 }    // new parent absolute position
  );
  expect(newOrigin).toEqual({ x: 50, y: 70 });
});
```

## Existing Utilities to Reuse

| Utility | Location | Purpose |
|---------|----------|---------|
| `isContainerClass()` | `src/domain/views/viewClasses.ts` | Check if view class accepts children |
| `parsePoint()` | `src/domain/canvas/coordinates.ts` | Parse "x, y" string |
| `formatOrigin()` | `src/domain/canvas/move.ts` | Format Point as "x, y" |
| `historyStore` | `src/stores/historyStore.ts` | Undo/redo stack |
| `selectionStore` | `src/stores/selectionStore.ts` | Current selection |
| `buildTree()` | `src/domain/hierarchy/buildTree.ts` | Build TreeNode from ViewNode |

## Quality Checklist

- [ ] All tests written FIRST (TDD)
- [ ] 80%+ coverage on domain logic
- [ ] `npm run lint:css` passes
- [ ] `npm run check` passes
- [ ] `npm run typecheck` passes
- [ ] All 27 FRs verified in compliance table
- [ ] All 7 SCs verified in compliance table
