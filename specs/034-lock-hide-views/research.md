# Research: Lock and Hide Views

**Date**: 2026-01-10
**Feature**: 034-lock-hide-views

## Research Questions Resolved

### 1. SolidJS Store Pattern for Set-based State

**Decision**: Use `createSignal<Set<string>>` with immutable updates

**Rationale**: The codebase consistently uses this pattern for tracking collections of IDs:
- `hierarchyStore.ts`: `expandedIds` as `Set<string>`
- `selectionStore.ts`: `selectedIds` as `Set<string>`
- Both use immutable updates: `setIds(new Set([...current, newId]))`

**Alternatives Considered**:
- `createStore` with array: Rejected - Set semantics better for membership checks
- Mutable Set updates: Rejected - Breaks SolidJS reactivity

**Example from codebase** (`hierarchyStore.ts`):
```typescript
const [expandedIds, setExpandedIds] = createSignal<Set<string>>(new Set());

export function toggleExpanded(nodeId: string): void {
  const current = expandedIds();
  const newSet = new Set(current);
  if (newSet.has(nodeId)) {
    newSet.delete(nodeId);
  } else {
    newSet.add(nodeId);
  }
  setExpandedIds(newSet);
}
```

### 2. History Operation Pattern for Bulk Actions

**Decision**: Single atomic operation capturing all affected view IDs and their previous states

**Rationale**: FR-019 explicitly requires "bulk lock/hide of N views = single undo step". The codebase has established patterns for this in:
- `domain/guides/historyOperations.ts`: `createGuideClearAllOperation` handles bulk
- `domain/alignment/historyOperations.ts`: `createAlignmentOperation` handles multiple views

**Implementation Pattern**:
```typescript
export function createLockOperation(
  viewIds: string[],
  previousLockedIds: Set<string>,
  lockFn: (ids: string[]) => void,
  unlockFn: (ids: string[]) => void
): HistoryOperation {
  return {
    type: 'lock',
    description: `Lock ${viewIds.length} view${viewIds.length === 1 ? '' : 's'}`,
    undo: () => {
      // Restore exact previous state
      const toUnlock = viewIds.filter(id => !previousLockedIds.has(id));
      unlockFn(toUnlock);
    },
    redo: () => lockFn(viewIds),
    timestamp: Date.now(),
  };
}
```

### 3. Keyboard Shortcut Integration

**Decision**: Extend `useCanvasKeyboard.ts` hook with new handlers

**Rationale**: All keyboard shortcuts are centralized in this hook. The pattern for Ctrl+modifier shortcuts is well-established:

```typescript
// Existing pattern from useCanvasKeyboard.ts
if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g' && !e.shiftKey) {
  // Ctrl+G handler
}
if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g' && e.shiftKey) {
  // Ctrl+Shift+G handler
}
```

**New shortcuts to add**:
- `Ctrl+L`: Lock selected views
- `Ctrl+Shift+L`: Unlock selected views
- `Ctrl+H`: Hide selected views (toggle for single selection)
- `Ctrl+Shift+H`: Show all hidden views

### 4. FontAwesome Icon Usage

**Decision**: Use `faLock` and `faEyeSlash` from `@fortawesome/free-solid-svg-icons`

**Rationale**: The project already uses FontAwesome via solid-fontawesome. The pattern is established in `HierarchyPanel/icons.ts`:

```typescript
import { library } from '@fortawesome/fontawesome-svg-core';
import { faFolder, faFont, faPuzzlePiece, faSliders } from '@fortawesome/free-solid-svg-icons';

library.add(faFolder, faSliders, faFont, faPuzzlePiece);

export const CATEGORY_ICON_NAMES: Record<ViewCategory, string> = {
  container: 'folder',
  // ...
};
```

**Icons to add**:
- `faLock` - For locked views indicator
- `faEyeSlash` - For hidden views indicator

### 5. Canvas Lock Icon Overlay Implementation

**Decision**: Pure SVG element rendered directly in ViewRectangle or as separate LockIndicator component

**Rationale**: FR-007a requires "small lock icon overlay in the top-right corner on the canvas, visible regardless of selection state". Options considered:

1. **SVG path inline in ViewRectangle** - Simple but mixes concerns
2. **Separate LockIndicator component** - Better separation, reusable
3. **CSS pseudo-element** - Not viable for SVG canvas

**Selected approach**: Separate `LockIndicator` component that receives view position and renders a small SVG lock icon. This follows the pattern of `SelectionOverlay` being a separate component.

### 6. Filter Hidden Views in Canvas Rendering

**Decision**: Filter in `useCanvasData` hook before returning `renderableViews`

**Rationale**: The `useCanvasData` hook already computes `renderableViews` from the document. Adding a filter step is natural:

```typescript
const visibleViews = createMemo(() => {
  const views = renderableViews();
  return views.filter(view => !isViewHidden(view.id));
});
```

**Container children handling**: When a container is hidden, check `isAnyAncestorHidden(viewId)` which walks up the parent chain.

### 7. Blocking Spatial Property Editing for Locked Views

**Decision**: Pass `lockedAttributeNames` to `AttributeGroup` component

**Rationale**: FR-007b requires blocking origin/size editing for locked views. The `PropertiesPanel` already passes an `editable` prop. Extending this to specific attributes:

```typescript
// In PropertiesPanel
const lockedAttributeNames = createMemo(() => {
  if (!hasAnyLockedSelection()) return [];
  return ['origin', 'size'];
});

<AttributeGroup
  lockedAttributeNames={lockedAttributeNames()}
  // ...
/>
```

The `AttributeRow` component would check if its attribute name is in the locked list and render as disabled.

### 8. Context Menu Integration Pattern

**Decision**: Extend existing `ContextMenu` component with conditional menu items

**Rationale**: The `ContextMenu.tsx` already has a pattern for conditional menu items based on state:

```typescript
const hasSelection = () => selectionStore.selectedIds.size > 0;
const hasGuides = () => guidesStore.guides.length > 0;
```

**Menu item logic** (from spec clarifications):
- "Lock" shown if any selected view is unlocked (action locks all)
- "Unlock" shown only if ALL selected views are locked
- Same pattern for Hide/Show

### 9. Multi-Selection with Mixed Lock States (Drag)

**Decision**: Only move unlocked views when dragging mixed selection

**Rationale**: FR-021 states "only unlocked views MUST move". This is implemented by filtering in the drag start handler:

```typescript
// In useCanvasInteractions or drag handler
const movableViewIds = selectedIds.filter(id => !isLocked(id));
if (movableViewIds.length > 0) {
  startDrag(point, getOriginsForIds(movableViewIds));
}
```

### 10. State Reset on Document Load

**Decision**: Hook into document loading to reset lock/hide state

**Rationale**: FR-018 requires state reset on new document load. The pattern exists in other stores:

```typescript
// In lockHideStore.ts
export function resetLockHideStore(): void {
  setLockedIds(new Set<string>());
  setHiddenIds(new Set<string>());
}
```

This function will be called from `documentStore.loadFile` or a dedicated reset orchestration point.

## Performance Considerations

### Set Operations for 100+ Views (SC-007)

**Analysis**: JavaScript `Set.has()` is O(1) average case. Even with 100+ views:
- Lock check per view: O(1)
- Filter operations: O(n) where n is view count
- This is acceptable for 100+ views at 60fps

**Optimization if needed**: Use `createMemo` to cache filtered view lists, only recomputing when lock/hide state or views change.

## Integration Points Summary

| Area | File | Modification |
|------|------|--------------|
| State | `stores/lockHideStore.ts` | NEW - Lock/hide state management |
| Types | `types/lockHide.ts` | NEW - Type definitions |
| Types | `types/history.ts` | ADD - 'lock', 'unlock', 'hide', 'show' operation types |
| Domain | `domain/lockHide/` | NEW - Operations and history factories |
| Keyboard | `hooks/canvas/useCanvasKeyboard.ts` | ADD - Ctrl+L/H shortcuts |
| Canvas | `components/Canvas/Canvas.tsx` | MODIFY - Filter hidden views |
| Canvas | `components/Canvas/SelectionOverlay.tsx` | MODIFY - Hide handles for locked |
| Canvas | `components/Canvas/ViewRectangle.tsx` | MODIFY - Render lock indicator |
| Canvas | `components/Canvas/LockIndicator.tsx` | NEW - Lock icon overlay |
| Hierarchy | `components/HierarchyPanel/TreeNode.tsx` | MODIFY - Add status icons |
| Hierarchy | `components/HierarchyPanel/icons.ts` | ADD - faLock, faEyeSlash |
| Context | `components/ContextMenu/ContextMenu.tsx` | ADD - Lock/Hide menu items |
| Properties | `components/PropertiesPanel/PropertiesPanel.tsx` | MODIFY - Block spatial attrs |
| Interactions | `hooks/canvas/useCanvasInteractions.ts` | MODIFY - Filter locked from drag |
| Marquee | `domain/canvas/marquee.ts` | MODIFY - Exclude hidden views |
