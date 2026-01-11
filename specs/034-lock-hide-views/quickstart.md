# Quickstart: Lock and Hide Views

**Date**: 2026-01-10
**Feature**: 034-lock-hide-views

## Overview

This feature adds lock and hide functionality to the VSTGUI visual editor, enabling users to protect finalized views from accidental modifications and simplify complex layouts by temporarily hiding views.

## Quick Reference

### Keyboard Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+L` | Lock | Lock all selected views |
| `Ctrl+Shift+L` | Unlock | Unlock all selected views |
| `Ctrl+H` | Hide/Toggle | Hide selected (single: toggle) |
| `Ctrl+Shift+H` | Show All | Show all hidden views |

### Context Menu

Right-click a selected view to access:
- **Lock/Unlock** - Based on current selection state
- **Hide/Show** - Based on current selection state

## Implementation Checklist

### Phase 1: Types and Store

```bash
# Files to create:
src/types/lockHide.ts           # Type definitions
src/stores/lockHideStore.ts     # State management
src/types/history.ts            # Add new operation types
```

**Key Implementation Points:**
1. Use `createSignal<Set<string>>` for `lockedIds` and `hiddenIds`
2. Follow `hierarchyStore` pattern for Set operations
3. Export both store object and action functions

### Phase 2: Domain Logic

```bash
# Files to create:
src/domain/lockHide/index.ts              # Barrel exports
src/domain/lockHide/lockOperations.ts     # Lock/unlock logic
src/domain/lockHide/hideOperations.ts     # Hide/show logic
src/domain/lockHide/historyOperations.ts  # Undo/redo factories
```

**Key Implementation Points:**
1. Pure functions - no side effects
2. History operations capture previous state for accurate undo
3. Format descriptions: "Lock 3 views", "Show 5 views"

### Phase 3: Keyboard Integration

```bash
# File to modify:
src/hooks/canvas/useCanvasKeyboard.ts
```

**Add handlers for:**
```typescript
// Ctrl+L - Lock selected views
if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l' && !e.shiftKey) {
  e.preventDefault();
  lockSelectedWithHistory(selectionStore.selectedIds);
  return;
}

// Ctrl+Shift+L - Unlock selected views
if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l' && e.shiftKey) {
  e.preventDefault();
  unlockSelectedWithHistory(selectionStore.selectedIds);
  return;
}

// Ctrl+H - Hide selected (toggle for single)
if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h' && !e.shiftKey) {
  e.preventDefault();
  toggleHideSelectedWithHistory(selectionStore.selectedIds);
  return;
}

// Ctrl+Shift+H - Show all hidden
if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h' && e.shiftKey) {
  e.preventDefault();
  showAllWithHistory();
  return;
}
```

### Phase 4: Canvas Integration

```bash
# Files to modify:
src/components/Canvas/Canvas.tsx          # Filter hidden views
src/components/Canvas/SelectionOverlay.tsx # Hide handles for locked
src/components/Canvas/ViewRectangle.tsx   # Render lock indicator

# File to create:
src/components/Canvas/LockIndicator.tsx   # Lock icon overlay
```

**SelectionOverlay changes:**
```typescript
// Conditionally render resize handles
{!props.isLocked && HANDLE_POSITIONS_CONFIG.map((handle) => (
  <circle ... />
))}
```

**LockIndicator component:**
```typescript
export const LockIndicator: Component<LockIndicatorProps> = (props) => (
  <g transform={`translate(${props.x - 12}, ${props.y + 2})`}>
    <rect ... /> {/* Background */}
    <path ... /> {/* Lock icon SVG path */}
  </g>
);
```

### Phase 5: Hierarchy Panel Integration

```bash
# Files to modify:
src/components/HierarchyPanel/TreeNode.tsx  # Add status icons
src/components/HierarchyPanel/icons.ts      # Add faLock, faEyeSlash
```

**TreeNode icon additions:**
```typescript
<Show when={isLocked()}>
  <FontAwesomeIcon icon="lock" class={styles.statusIcon} />
</Show>
<Show when={isHidden()}>
  <FontAwesomeIcon icon="eye-slash" class={styles.statusIcon} />
</Show>
```

### Phase 6: Behavior Integration

```bash
# Files to modify:
src/hooks/canvas/useCanvasInteractions.ts  # Filter locked from drag
src/domain/canvas/marquee.ts               # Exclude hidden from selection
src/domain/canvas/viewOperations.ts        # Block delete for locked
src/hooks/canvas/useCanvasKeyboard.ts      # Block nudge for locked
```

**Drag filtering:**
```typescript
// In drag start handler
const movableIds = filterUnlockedViews([...selectedIds], isLocked);
if (movableIds.length === 0) return; // All locked, no drag
startDrag(point, getOriginsForIds(movableIds));
```

**Delete filtering:**
```typescript
// In deleteSelectedViews
const deletableIds = filterUnlockedViews([...selectedIds], isLocked);
// ... delete only deletable views
```

**Nudge blocking:**
```typescript
// In arrow key handler
const movableIds = filterUnlockedViews([...selectedIds], isLocked);
if (movableIds.length === 0) return; // All locked, no nudge
```

### Phase 7: Properties Panel Integration

```bash
# File to modify:
src/components/PropertiesPanel/PropertiesPanel.tsx
src/components/PropertiesPanel/AttributeRow.tsx
```

**Block origin/size editing:**
```typescript
const lockedAttributes = createMemo(() => {
  const selected = Array.from(selectionStore.selectedIds);
  if (selected.some(id => isLocked(id))) {
    return ['origin', 'size'];
  }
  return [];
});

<AttributeRow
  disabled={lockedAttributes().includes(entry.name)}
  // ...
/>
```

### Phase 8: Context Menu Integration

```bash
# File to modify:
src/components/ContextMenu/ContextMenu.tsx
```

**Add menu items:**
```typescript
<button onClick={handleLockUnlock}>
  {getLockStateInfo(selectedIds).allLocked ? 'Unlock' : 'Lock'}
</button>
<button onClick={handleHideShow}>
  {getHideStateInfo(selectedIds).allHidden ? 'Show' : 'Hide'}
</button>
```

## Testing Strategy

### Unit Tests

1. **lockHideStore** - State management
   - Lock/unlock operations
   - Hide/show operations
   - Query functions
   - Reset behavior

2. **Domain functions** - Pure logic
   - `filterUnlockedViews`
   - `shouldViewBeHidden` (ancestor check)
   - History operation factories

3. **Components** - Integration
   - SelectionOverlay with `isLocked` prop
   - LockIndicator rendering
   - TreeNode with status icons

### Integration Tests

1. **Keyboard shortcuts** - End-to-end
2. **Drag with mixed selection** - Only unlocked move
3. **Marquee selection** - Excludes hidden
4. **Undo/redo** - Full cycle

## Common Patterns

### Checking Lock State

```typescript
import { isLocked, getLockStateInfo } from '../stores/lockHideStore';

// Single view
if (isLocked(viewId)) {
  // View is locked
}

// Selection
const info = getLockStateInfo(selectionStore.selectedIds);
if (info.anyLocked) {
  // At least one is locked
}
```

### Checking Hidden State with Ancestors

```typescript
import { isViewOrAncestorHidden } from '../stores/lockHideStore';
import { getParentId } from '../stores/documentStore';

if (isViewOrAncestorHidden(viewId, getParentId)) {
  // View should not render
}
```

### Creating History Operations

```typescript
import { createLockOperation } from '../domain/lockHide/historyOperations';
import { pushOperation } from '../stores/historyStore';

const previousStates = lockViews(viewIds);
const operation = createLockOperation(
  viewIds,
  previousStates,
  lockViews,
  unlockViews
);
pushOperation(operation);
```

## Gotchas

1. **Hidden containers**: When hiding a container, all children are implicitly hidden. Use `isViewOrAncestorHidden` to check effective visibility.

2. **Mixed selection drag**: When dragging a selection with locked views, only unlocked views should move. The locked views remain in place.

3. **Toggle behavior**: Ctrl+H on a single selection toggles hide state. On multi-selection, it hides all if any are visible.

4. **Property editing**: Origin and size are blocked for locked views, but other properties can still be edited.

5. **State reset**: Lock/hide state is editor-only and resets when loading a new document.
