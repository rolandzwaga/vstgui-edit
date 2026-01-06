# Quickstart: View Selection

**Feature**: 008-view-selection
**Date**: 2026-01-06

## Integration Scenarios

### Scenario 1: Single Click Selection

**User Action**: Click on a view in the canvas

**Code Path**:
```
Canvas.onClick(e)
  → mouseToCanvas(e.clientX, e.clientY, wrapperRect, panOffset, zoom)
  → hitTest(canvasPoint, renderableViews)
  → selectionStore.select(viewId)
  → ViewRectangle re-renders with selection style
  → SelectionOverlay renders with border + handles
```

**Expected Result**:
- Clicked view shows selection border (2px solid accent color)
- 8 resize handles appear at corners and edge midpoints
- Previously selected views are deselected

### Scenario 2: Multi-Selection with Shift+Click

**User Action**: Shift+click on another view while one is selected

**Code Path**:
```
Canvas.onClick(e) [e.shiftKey === true]
  → mouseToCanvas(...)
  → hitTest(...)
  → selectionStore.toggleSelect(viewId)
  → Multiple ViewRectangles show selection style
  → Multiple SelectionOverlays render
```

**Expected Result**:
- Both views show selection borders and handles
- Shift+clicking selected view removes it from selection

### Scenario 3: Select All (Ctrl+A)

**User Action**: Press Ctrl+A (or Cmd+A on Mac) with canvas focused

**Code Path**:
```
Canvas.onKeyDown(e) [e.key === 'a' && (e.ctrlKey || e.metaKey)]
  → e.preventDefault()
  → selectionStore.selectAll(renderableViews)
  → All ViewRectangles show selection style
```

**Expected Result**:
- All views in the current template are selected
- Selection overlays appear on all views

### Scenario 4: Deselect All (Escape)

**User Action**: Press Escape key

**Code Path**:
```
Canvas.onKeyDown(e) [e.key === 'Escape']
  → selectionStore.clearSelection()
  → All selection overlays removed
```

**Expected Result**:
- No views are selected
- No selection overlays visible

### Scenario 5: Hover with Tooltip

**User Action**: Hover mouse over a view and wait 500ms

**Code Path**:
```
ViewRectangle.onMouseEnter(e)
  → selectionStore.setHovered(view.id)
  → Start 500ms timer
  → After delay: selectionStore.showTooltipNow()
  → HoverTooltip renders with view info

ViewRectangle.onMouseLeave(e)
  → selectionStore.setHovered(null)
  → HoverTooltip unmounts
```

**Expected Result**:
- Subtle hover highlight appears immediately
- After 500ms, tooltip shows: `CTextButton (100×30)`
- Moving mouse away removes both highlight and tooltip

### Scenario 6: Click Empty Canvas

**User Action**: Click on canvas area with no views

**Code Path**:
```
Canvas.onClick(e)
  → mouseToCanvas(...)
  → hitTest(...) returns null
  → selectionStore.clearSelection()
```

**Expected Result**:
- All views deselected
- No selection overlays visible

### Scenario 7: Parent Highlight

**User Action**: Select a child view nested inside a container

**Code Path**:
```
selectionStore.select(childId)
  → Compute ancestor IDs via getAncestorIds()
  → Parent ViewRectangle applies parent-highlight style
```

**Expected Result**:
- Child view shows full selection border + handles
- Parent container shows subtle highlight (lighter color)

## Usage Examples

### Using Selection Store

```typescript
import { selectionStore, select, clearSelection, toggleSelect } from './stores/selectionStore';

// Check if a view is selected
const isSelected = selectionStore.selectedIds.has('view-1');

// Select a single view
select('view-1');

// Toggle selection (for Shift+click)
toggleSelect('view-2');

// Clear all selection
clearSelection();

// Get all selected IDs as array
const selectedArray = Array.from(selectionStore.selectedIds);
```

### Using Hit Test

```typescript
import { hitTest } from './domain/canvas/hitTest';
import { mouseToCanvas } from './domain/canvas/mouseToCanvas';

function handleCanvasClick(e: MouseEvent) {
  const wrapperRect = canvasWrapper.getBoundingClientRect();
  const canvasPoint = mouseToCanvas(
    e.clientX,
    e.clientY,
    wrapperRect,
    canvasStore.panOffset,
    canvasStore.zoomLevel
  );

  const viewId = hitTest(canvasPoint, renderableViews());
  if (viewId) {
    if (e.shiftKey) {
      toggleSelect(viewId);
    } else {
      select(viewId);
    }
  } else {
    clearSelection();
  }
}
```

### Rendering Selection Overlay

```tsx
import { For, Show } from 'solid-js';
import { selectionStore } from './stores/selectionStore';
import { SelectionOverlay } from './components/Canvas/SelectionOverlay';

// Inside Canvas component
<For each={renderableViews()}>
  {(view) => (
    <Show when={selectionStore.selectedIds.has(view.id)}>
      <SelectionOverlay
        bounds={{
          x: view.absoluteX,
          y: view.absoluteY,
          width: view.width,
          height: view.height,
        }}
      />
    </Show>
  )}
</For>
```

### Hover Tooltip

```tsx
import { Show } from 'solid-js';
import { selectionStore } from './stores/selectionStore';
import { HoverTooltip } from './components/Canvas/HoverTooltip';

// Inside Canvas component
<Show when={selectionStore.showTooltip && selectionStore.hoveredId}>
  {(hoveredId) => {
    const view = renderableViews().find(v => v.id === hoveredId());
    return view && (
      <HoverTooltip
        content={{ className: view.className, width: view.width, height: view.height }}
        referenceElement={document.querySelector(`[data-view-id="${hoveredId()}"]`)!}
        isVisible={true}
      />
    );
  }}
</Show>
```

## Test Scenarios

### Unit Tests

| Test | Input | Expected Output |
|------|-------|-----------------|
| hitTest - point inside view | Point (50, 50), view at (0,0,100,100) | View ID |
| hitTest - point outside all views | Point (500, 500), views at (0-100) | null |
| hitTest - overlapping views | Point in overlap area | Highest z-index view ID |
| mouseToCanvas - no transform | Mouse (100, 100), pan (0,0), zoom 1 | Canvas (100, 100) |
| mouseToCanvas - with pan | Mouse (100, 100), pan (50, 50), zoom 1 | Canvas (50, 50) |
| mouseToCanvas - with zoom | Mouse (100, 100), pan (0, 0), zoom 2 | Canvas (50, 50) |
| select - single | select('A') | selectedIds = {'A'} |
| toggleSelect - add | toggle('B') when {'A'} | selectedIds = {'A', 'B'} |
| toggleSelect - remove | toggle('A') when {'A', 'B'} | selectedIds = {'B'} |
| clearSelection | clear() when {'A', 'B'} | selectedIds = {} |

### Integration Tests

| Test | User Action | Verification |
|------|-------------|--------------|
| Click selects view | Click on view | View has selection class |
| Click deselects others | Click view B when A selected | Only B has selection class |
| Shift+click adds | Shift+click B when A selected | Both A and B selected |
| Escape clears | Press Escape | No views selected |
| Ctrl+A selects all | Press Ctrl+A | All views selected |
| Click empty clears | Click empty canvas | No views selected |
| Hover shows highlight | Mouse enter view | View has hover class |
| Tooltip appears | Hover 500ms | Tooltip element visible |
