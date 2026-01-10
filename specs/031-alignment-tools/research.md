# Research: Alignment Tools

**Feature**: 031-alignment-tools
**Date**: 2026-01-10
**Status**: Complete

## Research Questions Resolved

### 1. Alignment Algorithm for Multi-Select

**Question**: How should alignment work when multiple views are selected?

**Decision**: Align to the extreme edge of the selection bounding box.

**Rationale**:
- `Align Left`: All views move to match the leftmost view's left edge
- `Align Right`: All views move to match the rightmost view's right edge
- `Align Center`: All views move to the horizontal center of the bounding box
- Same pattern for vertical alignment

**Algorithm**:
```typescript
function alignLeft(views: ViewBounds[]): Point[] {
  const minLeft = Math.min(...views.map(v => v.left));
  return views.map(v => ({
    x: minLeft,  // New left edge
    y: v.top     // Y unchanged
  }));
}
```

**Alternatives Considered**:
- Align to first selected: Rejected - selection order not predictable
- Align to largest view: Rejected - not intuitive
- Align to average position: Rejected - moves all views, not standard behavior

---

### 2. Alignment for Single View (Align to Parent)

**Question**: How should alignment work with only one view selected?

**Decision**: Align relative to the parent container bounds.

**Rationale**:
- Single view cannot align to itself
- Parent container is the logical reference
- Matches Figma/Sketch behavior

**Algorithm**:
```typescript
function alignSingleViewToParent(viewId: string, type: AlignmentType): Point {
  const view = getView(viewId);
  const parentId = getParentId(viewId);
  const parent = getView(parentId);

  // Calculate new origin based on alignment type
  switch (type) {
    case 'center':
      return { x: (parentWidth - viewWidth) / 2, y: view.y };
    case 'left':
      return { x: 0, y: view.y };
    // ... etc
  }
}
```

**Edge Case**: Root template view cannot be aligned (has no parent).

---

### 3. Distribution Algorithm

**Question**: How should distribution calculate equal spacing?

**Decision**: Equal gaps between adjacent view edges.

**Rationale**:
- FR-011 specifies "equal horizontal gaps between adjacent edges"
- Outer views (leftmost/rightmost) remain fixed
- Inner views redistribute to create equal gaps

**Algorithm**:
```typescript
function distributeHorizontally(views: ViewBounds[]): Point[] {
  // Sort by left edge
  const sorted = [...views].sort((a, b) => a.left - b.left);

  // Calculate total gap space
  const totalSpan = sorted[sorted.length - 1].right - sorted[0].left;
  const totalViewWidth = sorted.reduce((sum, v) => sum + v.width, 0);
  const totalGap = totalSpan - totalViewWidth;
  const gapCount = sorted.length - 1;
  const equalGap = totalGap / gapCount;

  // Position inner views
  return sorted.map((view, i) => {
    if (i === 0 || i === sorted.length - 1) {
      return { x: view.left, y: view.top }; // Keep outer views fixed
    }
    const newLeft = sorted[i - 1].right + equalGap;
    return { x: newLeft, y: view.top };
  });
}
```

**Edge Cases**:
- 2 views: No distribution possible (need 3+)
- Overlapping views: May result in negative gaps (proceed anyway)
- Zero-size views: Use origin point for positioning

---

### 4. Coordinate System

**Question**: Should alignment use absolute or relative coordinates?

**Decision**: Use absolute canvas coordinates for calculation, convert to relative for storage.

**Rationale**:
- Views from different parents can be aligned
- Absolute coordinates are what users see
- `documentStore.updateViewOrigin()` expects relative coordinates

**Approach**:
```typescript
// From existing RenderableView (has absolute positions)
interface RenderableView {
  id: string;
  absoluteX: number;  // Used for alignment calculations
  absoluteY: number;
  relativeX: number;  // Stored via updateViewOrigin
  relativeY: number;
  width: number;
  height: number;
}
```

---

### 5. History Integration

**Question**: How to integrate with undo/redo system?

**Decision**: Reuse existing `createMoveOperation` pattern.

**Rationale**:
- Alignment is fundamentally a move operation
- Same data structure (viewIds, originalOrigins, newOrigins)
- Existing pattern handles multi-view moves

**Implementation**:
```typescript
function createAlignmentOperation(
  results: AlignmentResult[],
  description: string
): HistoryOperation {
  return createMoveOperation({
    viewIds: results.map(r => r.viewId),
    originalOrigins: Object.fromEntries(
      results.map(r => [r.viewId, r.originalOrigin])
    ),
    newOrigins: Object.fromEntries(
      results.map(r => [r.viewId, r.newOrigin])
    ),
  }, updateViewOrigin);
}
```

**Special Case**: If no views actually moved (all already aligned), skip history entry.

---

### 6. Toolbar State Persistence

**Question**: How to persist docked/floating toolbar state?

**Decision**: Use localStorage with key `vstgui-edit:alignment-toolbar`.

**Data Structure**:
```typescript
interface AlignmentToolbarState {
  isDocked: boolean;
  floatingPosition: { x: number; y: number } | null;
}
```

**Pattern**: Same as `saveFormatStore` which uses `vstgui-edit:save-format`.

---

### 7. Keyboard Shortcut Mapping

**Question**: What keyboard shortcuts to use?

**Decision**: Ctrl+Shift + mnemonic letter.

| Shortcut | Action | Mnemonic |
|----------|--------|----------|
| Ctrl+Shift+L | Align Left | **L**eft |
| Ctrl+Shift+C | Align Center | **C**enter |
| Ctrl+Shift+R | Align Right | **R**ight |
| Ctrl+Shift+T | Align Top | **T**op |
| Ctrl+Shift+M | Align Middle | **M**iddle |
| Ctrl+Shift+B | Align Bottom | **B**ottom |

**Conflict Check**:
- Existing shortcuts use Ctrl+Z/Y (undo/redo), Ctrl+A (select all), Ctrl+D (duplicate)
- Ctrl+Shift+G (ungroup) - different modifier combo
- No conflicts found

---

### 8. Button Enable/Disable Logic

**Question**: When should alignment/distribution buttons be enabled?

**Decision Matrix**:

| Selection State | Alignment Buttons | Distribution Buttons |
|-----------------|-------------------|----------------------|
| 0 views | Disabled | Disabled |
| 1 view (root) | Disabled | Disabled |
| 1 view (non-root) | Enabled | Disabled |
| 2 views | Enabled | Disabled |
| 3+ views | Enabled | Enabled |

**Implementation**:
```typescript
const isAlignmentEnabled = () => {
  const count = selectionStore.selectedIds.size;
  if (count === 0) return false;
  if (count === 1) {
    // Check if it's the root template
    const [id] = [...selectionStore.selectedIds];
    return getParentId(id) !== null;
  }
  return true;
};

const isDistributionEnabled = () => {
  return selectionStore.selectedIds.size >= 3;
};
```

---

### 9. Icon Design

**Question**: What icons to use for alignment buttons?

**Decision**: SVG icons showing alignment direction.

**Standard Patterns** (similar to Figma/Sketch):
- Align Left: Vertical bar on left, shapes aligned to it
- Align Center: Vertical bar in center, shapes centered
- Align Right: Vertical bar on right, shapes aligned to it
- Distribute Horizontal: Three shapes with equal spacing arrows

**Implementation**: Create `AlignmentIcons.tsx` with inline SVG components.

---

### 10. Floating Panel Positioning

**Question**: How to position the floating panel?

**Decision**: Use `@floating-ui/dom` with constraints.

**Approach**:
```typescript
import { computePosition, shift } from '@floating-ui/dom';

const updatePosition = async (dragEvent: MouseEvent) => {
  const position = await computePosition(anchor, panel, {
    middleware: [
      shift({ padding: 8, boundary: document.body })  // Keep within viewport
    ]
  });
  panel.style.transform = `translate(${position.x}px, ${position.y}px)`;
};
```

**Constraints**:
- Must stay within viewport
- Minimum distance from edges: 8px
- z-index: `--z-dropdown` (100)

---

## Existing Code Patterns to Follow

### 1. Domain Module Structure
From `src/domain/canvas/`:
```text
domain/alignment/
├── index.ts           # Barrel exports
├── types.ts           # Local types (if not in src/types/)
├── calculateBounds.ts # Pure functions
├── alignViews.ts      # Alignment logic
├── distributeViews.ts # Distribution logic
├── historyOperations.ts
└── __tests__/
```

### 2. Store Pattern
From `src/stores/saveFormatStore.ts`:
- Use `createSignal` for simple state
- Export store object with getters
- Export action functions separately
- Handle localStorage persistence

### 3. Component Pattern
From `src/components/GridToolbar/`:
- CSS Module for styles
- Barrel export in index.ts
- Props interface with JSDoc
- ARIA attributes for accessibility

### 4. Keyboard Handler Pattern
From `src/hooks/canvas/useCanvasKeyboard.ts`:
- Check `e.ctrlKey`, `e.shiftKey`
- Call `e.preventDefault()` for handled shortcuts
- Early return if target is input/textarea

---

## Performance Considerations

1. **Bounds Calculation**: O(n) where n = selected views
2. **Alignment**: O(n) for position updates
3. **Distribution**: O(n log n) due to sorting

For typical use (10-50 views), all operations complete in < 1ms.

---

## References

- Figma alignment behavior: https://help.figma.com/hc/en-us/articles/360039956914
- Existing codebase patterns in `src/domain/canvas/move.ts`
- `@floating-ui/dom` documentation: https://floating-ui.com/docs/computePosition
