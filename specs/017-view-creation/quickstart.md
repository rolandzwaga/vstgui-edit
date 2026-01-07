# Quickstart: View Creation & Deletion

**Feature**: 017-view-creation
**Date**: 2026-01-07

## Getting Started

### Prerequisites

1. Existing VSTGUI-Edit codebase with features 001-016 implemented
2. Node.js environment with npm
3. Understanding of SolidJS signals and stores

### Key Files to Understand First

Before implementing, read these existing files:

```bash
# State management
src/stores/documentStore.ts    # Document state, view data
src/stores/selectionStore.ts   # Selection tracking
src/stores/historyStore.ts     # Undo/redo stack

# Domain utilities
src/domain/canvas/move.ts      # formatOrigin, parsePoint
src/domain/canvas/index.ts     # flattenHierarchy

# Components
src/components/Canvas/Canvas.tsx           # Main canvas
src/components/Canvas/DragPreview.tsx      # Drag visualization
src/components/HierarchyPanel/             # Tree structure reference

# Types
src/types/uidesc.ts            # ViewNode, VSTGUIUIDescription
src/types/canvas.ts            # Point, Size, RenderableView
```

### Testing Guide

**CRITICAL**: Read `specs/TESTING-GUIDE.md` before writing any tests.

Key patterns:
- Use `testInRoot()` wrapper for component tests
- Flush microtasks with `await Promise.resolve()`
- Selection requires `mouseDown` + `mouseUp`, not `click`

## Implementation Order

### Phase 1: Core Operations (US1, US2)

1. **Delete Operation** (US1)
   - Add `removeView()` and `removeViews()` to documentStore
   - Add keyboard handler for Delete/Backspace
   - Create delete history operation
   - Tests: 5-8 test cases

2. **Duplicate Operation** (US2)  
   - Add `duplicateView()` to documentStore
   - Add keyboard handler for Ctrl+D
   - Create duplicate history operation
   - Tests: 6-8 test cases

### Phase 2: Clipboard (US3)

3. **Clipboard Store**
   - Create `clipboardStore.ts`
   - Implement copy, cut, paste, clear
   - Tests: 8-10 test cases

4. **Clipboard Keyboard Handlers**
   - Add Ctrl+C, Ctrl+X, Ctrl+V handlers
   - Integrate with history for cut/paste
   - Tests: 6-8 test cases

### Phase 3: View Palette (US4)

5. **View Class Registry**
   - Create `viewClasses.ts` with all 32 classes
   - Create `viewDefaults.ts` with default sizes
   - Tests: 3-5 test cases

6. **Palette Store**
   - Create `paletteStore.ts`
   - Implement expand/collapse and search
   - Tests: 5-7 test cases

7. **Palette Components**
   - Create `ViewPalette.tsx`
   - Create `PaletteCategory.tsx`
   - Create `PaletteItem.tsx`
   - Tests: 8-12 test cases

### Phase 4: Drag-to-Create (US5)

8. **Drag from Palette**
   - Add drag start handler to PaletteItem
   - Create `PaletteDragPreview.tsx`
   - Tests: 4-6 test cases

9. **Drop on Canvas**
   - Add drop handler to Canvas
   - Implement container detection
   - Create view on drop
   - Tests: 8-12 test cases

## Quick Code Examples

### Delete Operation

```typescript
// src/stores/documentStore.ts
export function removeView(viewId: string): SerializedView | null {
  const view = findViewById(viewId);
  if (!view || isRootTemplate(viewId)) return null;
  
  // Remove from parent's children
  const parentId = findParentId(viewId);
  setDocument('templates', parentId, 'children', (children) => {
    const { [viewId]: removed, ...rest } = children;
    return rest;
  });
  
  return serializeView(view);
}
```

### Clipboard Copy

```typescript
// src/stores/clipboardStore.ts
export function copy(viewIds: string[]): void {
  const views = viewIds.map(id => serializeViewWithChildren(id));
  const origins = Object.fromEntries(
    viewIds.map(id => [id, getViewOrigin(id)])
  );
  
  setClipboard({
    views,
    sourceOrigins: origins,
    copyTimestamp: Date.now(),
    pasteCount: 0,
  });
}
```

### View Palette Item

```typescript
// src/components/ViewPalette/PaletteItem.tsx
export function PaletteItem(props: { viewClass: ViewClass }) {
  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer?.setData('application/vstgui-view-class', props.viewClass.name);
  };

  return (
    <div
      class={styles.item}
      draggable={true}
      onDragStart={handleDragStart}
    >
      {props.viewClass.name}
    </div>
  );
}
```

## Common Patterns

### History Operation Pattern

```typescript
function createDeleteOperation(
  viewIds: string[],
  serialized: SerializedView[],
  parentIds: Record<string, string>,
): HistoryOperation {
  return {
    type: 'delete',
    description: `Delete ${viewIds.length} view(s)`,
    timestamp: Date.now(),
    undo: () => {
      // Restore views to their parents
      serialized.forEach((view, i) => {
        addViewToParent(parentIds[viewIds[i]], view);
      });
    },
    redo: () => {
      viewIds.forEach(removeView);
    },
  };
}
```

### Keyboard Handler Pattern

```typescript
function handleKeyDown(e: KeyboardEvent) {
  // Skip if text input focused
  if (isTextInputFocused()) return;
  
  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    deleteSelectedViews();
  } else if (e.ctrlKey && e.key === 'd') {
    e.preventDefault();
    duplicateSelectedViews();
  }
  // ... more shortcuts
}
```

## Testing Checklist

For each operation, test:

- [ ] Happy path (basic operation works)
- [ ] Empty selection (no-op)
- [ ] Multiple selection (all selected items affected)
- [ ] Container with children (hierarchy preserved)
- [ ] Undo restores original state
- [ ] Redo reapplies operation
- [ ] Keyboard shortcut triggers operation
- [ ] Text input focus blocks shortcut

## Debugging Tips

1. **View not deleting?** Check if it's the root template
2. **Duplicate offset wrong?** Verify 10px offset calculation
3. **Paste not working?** Check clipboard has content
4. **Drag preview not showing?** Verify dragStart sets data
5. **Drop target wrong?** Log container detection results
