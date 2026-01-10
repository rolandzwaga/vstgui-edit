# Quickstart: Alignment Tools Implementation

**Feature**: 031-alignment-tools
**Date**: 2026-01-10

This guide provides a step-by-step implementation path for the alignment tools feature.

---

## Prerequisites

Before starting:
1. Read `specs/TESTING-GUIDE.md` for SolidJS testing patterns
2. Review existing patterns in:
   - `src/domain/canvas/move.ts` (history operations)
   - `src/stores/saveFormatStore.ts` (localStorage persistence)
   - `src/components/GridToolbar/` (toolbar component structure)
   - `src/hooks/canvas/useCanvasKeyboard.ts` (keyboard shortcuts)

---

## Phase 1: Domain Logic

### Step 1.1: Create Type Definitions

File: `src/types/alignment.ts`

```typescript
export type AlignmentType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
export type DistributionDirection = 'horizontal' | 'vertical';

export interface ViewBounds {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export interface SelectionBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export interface AlignmentResult {
  viewId: string;
  originalOrigin: Point;
  newOrigin: Point;
}
```

### Step 1.2: Implement Bounds Calculation

File: `src/domain/alignment/calculateBounds.ts`

Test first: `src/domain/alignment/__tests__/calculateBounds.spec.ts`

```typescript
// Test cases to implement:
// - viewToBounds: converts RenderableView to ViewBounds
// - calculateSelectionBounds: returns correct bounding box for multiple views
// - calculateSelectionBounds: returns null for empty array
// - calculateParentBounds: returns parent bounds for non-root view
// - calculateParentBounds: returns null for root view
```

### Step 1.3: Implement Alignment Functions

File: `src/domain/alignment/alignViews.ts`

Test first: `src/domain/alignment/__tests__/alignViews.spec.ts`

```typescript
// Test cases for multi-select alignment:
// - alignLeft: all views move to leftmost left edge
// - alignCenter: all views move to center of bounding box
// - alignRight: all views move to rightmost right edge
// - alignTop: all views move to topmost top edge
// - alignMiddle: all views move to center of bounding box vertically
// - alignBottom: all views move to bottommost bottom edge

// Test cases for single-select (parent alignment):
// - alignLeft: view moves to parent left edge (x=0)
// - alignCenter: view centers in parent
// - No results returned if view already in position
```

### Step 1.4: Implement Distribution Functions

File: `src/domain/alignment/distributeViews.ts`

Test first: `src/domain/alignment/__tests__/distributeViews.spec.ts`

```typescript
// Test cases:
// - distributeHorizontally: 3 views, creates equal gaps
// - distributeHorizontally: 4 views, outer views unchanged
// - distributeVertically: same pattern for vertical
// - Returns empty array for < 3 views
// - Returns empty array if already evenly distributed
```

### Step 1.5: Implement History Operations

File: `src/domain/alignment/historyOperations.ts`

```typescript
import { createMoveOperation } from '../canvas/move';
import type { HistoryOperation, MoveOperationData } from '../../types/history';
import type { AlignmentResult } from '../../types/alignment';

export function createAlignmentHistoryOperation(
  results: AlignmentResult[],
  description: string,
  updateViewOrigin: (viewId: string, origin: Point) => void
): HistoryOperation {
  const data: MoveOperationData = {
    viewIds: results.map(r => r.viewId),
    originalOrigins: Object.fromEntries(
      results.map(r => [r.viewId, r.originalOrigin])
    ),
    newOrigins: Object.fromEntries(
      results.map(r => [r.viewId, r.newOrigin])
    ),
  };

  const op = createMoveOperation(data, updateViewOrigin);
  return { ...op, description };
}
```

---

## Phase 2: Store Layer

### Step 2.1: Create Alignment Toolbar Store

File: `src/stores/alignmentToolbarStore.ts`

```typescript
import { createSignal } from 'solid-js';
import type { Point } from '../types/canvas';

const STORAGE_KEY = 'vstgui-edit:alignment-toolbar';

interface AlignmentToolbarState {
  isDocked: boolean;
  floatingPosition: Point | null;
}

const initialState: AlignmentToolbarState = {
  isDocked: true,
  floatingPosition: null,
};

const [state, setState] = createSignal<AlignmentToolbarState>(initialState);

export const alignmentToolbarStore = {
  get isDocked() { return state().isDocked; },
  get floatingPosition() { return state().floatingPosition; },
};

export function dock(): void {
  setState({ isDocked: true, floatingPosition: null });
  saveToStorage();
}

export function undock(position: Point): void {
  setState({ isDocked: false, floatingPosition: position });
  saveToStorage();
}

export function updateFloatingPosition(position: Point): void {
  setState(prev => ({ ...prev, floatingPosition: position }));
  saveToStorage();
}

export function loadFromStorage(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setState(JSON.parse(stored));
    }
  } catch {
    // Ignore parse errors
  }
}

function saveToStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state()));
  } catch {
    // Ignore storage errors
  }
}

export function resetAlignmentToolbarStore(): void {
  setState(initialState);
}
```

---

## Phase 3: UI Components

### Step 3.1: Create Alignment Icons

File: `src/components/AlignmentToolbar/AlignmentIcons.tsx`

```typescript
import type { Component } from 'solid-js';

export const AlignLeftIcon: Component = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <rect x="3" y="4" width="2" height="16" />
    <rect x="7" y="6" width="10" height="4" />
    <rect x="7" y="14" width="14" height="4" />
  </svg>
);

// Similar for: AlignCenterIcon, AlignRightIcon, AlignTopIcon,
// AlignMiddleIcon, AlignBottomIcon, DistributeHorizontalIcon, DistributeVerticalIcon
```

### Step 3.2: Create Alignment Button

File: `src/components/AlignmentToolbar/AlignmentButton.tsx`

```typescript
import type { Component, JSX } from 'solid-js';
import styles from './AlignmentToolbar.module.css';

export interface AlignmentButtonProps {
  icon: () => JSX.Element;
  label: string;
  shortcut?: string;
  disabled: boolean;
  onClick: () => void;
}

export const AlignmentButton: Component<AlignmentButtonProps> = (props) => {
  const tooltip = () => props.shortcut
    ? `${props.label} (${props.shortcut})`
    : props.label;

  return (
    <button
      type="button"
      class={styles.button}
      disabled={props.disabled}
      onClick={() => props.onClick()}
      aria-label={props.label}
      title={tooltip()}
    >
      {props.icon()}
    </button>
  );
};
```

### Step 3.3: Create Alignment Toolbar

File: `src/components/AlignmentToolbar/AlignmentToolbar.tsx`

```typescript
import type { Component } from 'solid-js';
import { selectionStore } from '../../stores/selectionStore';
import { documentStore, getParentId, getView, updateViewOrigin } from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import { alignViews, distributeViews } from '../../domain/alignment';
import { createAlignmentHistoryOperation } from '../../domain/alignment/historyOperations';
import { AlignmentButton } from './AlignmentButton';
import { AlignLeftIcon, /* ... */ } from './AlignmentIcons';
import styles from './AlignmentToolbar.module.css';

export const AlignmentToolbar: Component = () => {
  const isAlignmentEnabled = () => {
    const count = selectionStore.selectedIds.size;
    if (count === 0) return false;
    if (count === 1) {
      const [id] = [...selectionStore.selectedIds];
      return getParentId(id) !== null;
    }
    return true;
  };

  const isDistributionEnabled = () => selectionStore.selectedIds.size >= 3;

  const handleAlign = (type: AlignmentType) => {
    const viewIds = [...selectionStore.selectedIds];
    const results = alignViews(viewIds, type, getView, getParentId);

    if (results.length > 0) {
      // Apply changes
      for (const result of results) {
        updateViewOrigin(result.viewId, result.newOrigin);
      }

      // Create history entry
      const description = viewIds.length === 1
        ? `Align view to parent ${type}`
        : `Align ${viewIds.length} views ${type}`;
      const operation = createAlignmentHistoryOperation(results, description, updateViewOrigin);
      pushOperation(operation);
    }
  };

  const handleDistribute = (direction: DistributionDirection) => {
    const viewIds = [...selectionStore.selectedIds];
    const results = distributeViews(viewIds, direction, getView);

    if (results.length > 0) {
      // Apply changes
      for (const result of results) {
        updateViewOrigin(result.viewId, result.newOrigin);
      }

      // Create history entry
      const description = `Distribute ${viewIds.length} views ${direction}ly`;
      const operation = createAlignmentHistoryOperation(results, description, updateViewOrigin);
      pushOperation(operation);
    }
  };

  return (
    <div class={styles.toolbar} role="toolbar" aria-label="Alignment tools">
      {/* Horizontal alignment group */}
      <div class={styles.group} role="group" aria-label="Horizontal alignment">
        <AlignmentButton
          icon={AlignLeftIcon}
          label="Align Left"
          shortcut="Ctrl+Shift+L"
          disabled={!isAlignmentEnabled()}
          onClick={() => handleAlign('left')}
        />
        {/* ... more buttons */}
      </div>

      <div class={styles.separator} />

      {/* Vertical alignment group */}
      {/* ... */}

      <div class={styles.separator} />

      {/* Distribution group */}
      {/* ... */}
    </div>
  );
};
```

### Step 3.4: Add to MainToolbar

File: `src/components/MainToolbar/MainToolbar.tsx`

```typescript
import { AlignmentToolbar } from '../AlignmentToolbar';

export const MainToolbar: Component<MainToolbarProps> = (props) => {
  return (
    <div class={styles.container} role="toolbar" aria-label="Main toolbar">
      <SaveButton />
      <ZoomToolbar onFitToView={props.onFitToView} />
      <GridToolbar />
      <AlignmentToolbar />  {/* NEW */}
    </div>
  );
};
```

---

## Phase 4: Keyboard Shortcuts

### Step 4.1: Extend useCanvasKeyboard

File: `src/hooks/canvas/useCanvasKeyboard.ts`

Add after existing Ctrl+Shift handlers:

```typescript
// Alignment shortcuts (Ctrl+Shift+L/C/R/T/M/B)
if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
  const selectedIds = selectionStore.selectedIds;
  if (selectedIds.size === 0) return;

  // Check if single view is root
  if (selectedIds.size === 1) {
    const [id] = [...selectedIds];
    if (getParentId(id) === null) return;
  }

  let alignmentType: AlignmentType | null = null;

  switch (e.key.toLowerCase()) {
    case 'l': alignmentType = 'left'; break;
    case 'c': alignmentType = 'center'; break;
    case 'r': alignmentType = 'right'; break;
    case 't': alignmentType = 'top'; break;
    case 'm': alignmentType = 'middle'; break;
    case 'b': alignmentType = 'bottom'; break;
  }

  if (alignmentType) {
    e.preventDefault();
    const viewIds = [...selectedIds];
    const results = alignViews(viewIds, alignmentType, getViewForAlignment, getParentId);

    if (results.length > 0) {
      for (const result of results) {
        updateViewOrigin(result.viewId, result.newOrigin);
      }

      const description = viewIds.length === 1
        ? `Align view to parent ${alignmentType}`
        : `Align ${viewIds.length} views ${alignmentType}`;
      const operation = createAlignmentHistoryOperation(results, description, updateViewOrigin);
      pushOperation(operation);
    }
    return;
  }
}
```

---

## Phase 5: Floating Panel (P3)

This phase implements the dockable/floating toolbar behavior.

### Key Implementation Points:

1. **Drag Handle**: Add a drag handle icon/area at the start of the toolbar
2. **Drag Detection**: On mousedown on handle, track mouse movement
3. **Undock Trigger**: When dragged beyond threshold, call `undock(position)`
4. **Floating Rendering**: When `!alignmentToolbarStore.isDocked`, render as fixed-position portal
5. **Redock Trigger**: Double-click on floating panel header or drag back to toolbar area

```typescript
// Simplified floating panel logic
const FloatingAlignmentToolbar: Component = () => {
  let panelRef: HTMLDivElement | undefined;

  const handleDrag = (e: MouseEvent) => {
    updateFloatingPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <Portal>
      <div
        ref={panelRef}
        class={styles.floatingPanel}
        style={{
          position: 'fixed',
          left: `${alignmentToolbarStore.floatingPosition?.x ?? 0}px`,
          top: `${alignmentToolbarStore.floatingPosition?.y ?? 0}px`,
          'z-index': 'var(--z-dropdown)',
        }}
      >
        <div class={styles.dragHandle} onMouseDown={startDrag}>
          <GripIcon />
        </div>
        {/* ... toolbar buttons */}
        <button onClick={dock}>Dock</button>
      </div>
    </Portal>
  );
};
```

---

## Testing Checklist

Before completing each phase:

- [ ] All unit tests pass
- [ ] All new code has > 80% coverage
- [ ] Run `npm run lint:css`
- [ ] Run `npm run check`
- [ ] Run `npm run typecheck`

---

## Common Pitfalls

1. **SolidJS Reactivity**: Don't destructure props in components
2. **Store Access**: Access store values inside tracked scope (JSX, createEffect)
3. **Test Selection**: Use `fireEvent.mouseDown` + `fireEvent.mouseUp`, not `fireEvent.click`
4. **Keyboard Events**: Check target element to avoid firing in inputs
5. **History Skip**: Don't create history entry if no views actually moved

---

## Files to Update at Completion

1. `src/components/MainToolbar/MainToolbar.tsx` - Add AlignmentToolbar
2. `src/hooks/canvas/useCanvasKeyboard.ts` - Add shortcuts
3. `CLAUDE.md` - Document new utilities and stores
