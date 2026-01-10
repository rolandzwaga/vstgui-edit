# Data Model: Alignment Tools

**Feature**: 031-alignment-tools
**Date**: 2026-01-10

## Type Definitions

### Alignment Types

```typescript
// src/types/alignment.ts

/**
 * Types of horizontal and vertical alignment operations.
 */
export type AlignmentType =
  | 'left'
  | 'center'
  | 'right'
  | 'top'
  | 'middle'
  | 'bottom';

/**
 * Direction for distribution operations.
 */
export type DistributionDirection = 'horizontal' | 'vertical';

/**
 * Bounding box for a single view in absolute canvas coordinates.
 */
export interface ViewBounds {
  /** View ID */
  id: string;
  /** Left edge X coordinate (absolute) */
  left: number;
  /** Right edge X coordinate (absolute) */
  right: number;
  /** Top edge Y coordinate (absolute) */
  top: number;
  /** Bottom edge Y coordinate (absolute) */
  bottom: number;
  /** Horizontal center X coordinate */
  centerX: number;
  /** Vertical center Y coordinate */
  centerY: number;
  /** View width */
  width: number;
  /** View height */
  height: number;
}

/**
 * Bounding box encompassing all selected views.
 */
export interface SelectionBounds {
  /** Leftmost edge of selection */
  left: number;
  /** Rightmost edge of selection */
  right: number;
  /** Topmost edge of selection */
  top: number;
  /** Bottommost edge of selection */
  bottom: number;
  /** Horizontal center of selection */
  centerX: number;
  /** Vertical center of selection */
  centerY: number;
  /** Total width of selection */
  width: number;
  /** Total height of selection */
  height: number;
}

/**
 * Result of an alignment operation for a single view.
 */
export interface AlignmentResult {
  /** View that was moved */
  viewId: string;
  /** Original position (relative to parent) */
  originalOrigin: Point;
  /** New position (relative to parent) */
  newOrigin: Point;
}

/**
 * Configuration for alignment toolbar state persistence.
 */
export interface AlignmentToolbarState {
  /** Whether the toolbar is docked in the main toolbar */
  isDocked: boolean;
  /** Position when floating (null when docked) */
  floatingPosition: Point | null;
}
```

### Existing Types Used

```typescript
// From src/types/canvas.ts
export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface RenderableView {
  id: string;
  absoluteX: number;  // Used for alignment calculations
  absoluteY: number;
  relativeX: number;  // Stored via updateViewOrigin
  relativeY: number;
  width: number;
  height: number;
  className: string;  // View class name for identification
  category: ViewCategory;
  zIndex: number;
  parentId: string | null;  // Parent view ID for hierarchy tracking
  title?: string;     // Optional title text
  fontSize?: number;  // Optional font size
  fontColor?: string; // Optional font color
}

// From src/types/history.ts
export interface HistoryOperation {
  type: string;
  description: string;
  undo: () => void;
  redo: () => void;
  timestamp: number;
}

export interface MoveOperationData {
  viewIds: string[];
  originalOrigins: Record<string, Point>;
  newOrigins: Record<string, Point>;
}
```

---

## Entity Relationships

```
┌─────────────────────┐
│   selectionStore    │
│  ────────────────   │
│  selectedIds: Set   │──────────┐
└─────────────────────┘          │
                                 │ provides selected view IDs
                                 ▼
┌─────────────────────┐     ┌─────────────────────┐
│   documentStore     │     │  AlignmentToolbar   │
│  ────────────────   │     │  ────────────────   │
│  getView(id)        │◄────│  onClick handlers   │
│  getParentId(id)    │     │  button states      │
│  updateViewOrigin() │     └─────────────────────┘
└─────────────────────┘                │
         │                             │ triggers alignment
         │ reads view data             ▼
         ▼                  ┌─────────────────────┐
┌─────────────────────┐     │  domain/alignment   │
│   RenderableView    │────►│  ────────────────   │
│  ────────────────   │     │  alignViews()       │
│  absoluteX/Y        │     │  distributeViews()  │
│  relativeX/Y        │     │  calculateBounds()  │
│  width/height       │     └─────────────────────┘
└─────────────────────┘                │
                                       │ produces
                                       ▼
                          ┌─────────────────────┐
                          │  AlignmentResult[]  │
                          │  ────────────────   │
                          │  viewId             │
                          │  originalOrigin     │
                          │  newOrigin          │
                          └─────────────────────┘
                                       │
                                       │ used to create
                                       ▼
                          ┌─────────────────────┐
                          │  HistoryOperation   │────► historyStore
                          │  ────────────────   │
                          │  undo/redo closures │
                          └─────────────────────┘
```

---

## State Management

### Selection State (existing)
```typescript
// src/stores/selectionStore.ts
export const selectionStore = {
  get selectedIds(): Set<string>,
  get hoveredId(): string | null,
};
```

### Alignment Toolbar State (new)
```typescript
// src/stores/alignmentToolbarStore.ts
const STORAGE_KEY = 'vstgui-edit:alignment-toolbar';

const [state, setState] = createSignal<AlignmentToolbarState>({
  isDocked: true,
  floatingPosition: null,
});

export const alignmentToolbarStore = {
  get isDocked() { return state().isDocked; },
  get floatingPosition() { return state().floatingPosition; },
};

// Actions
export function dock(): void;
export function undock(position: Point): void;
export function updateFloatingPosition(position: Point): void;
export function loadFromStorage(): void;
export function saveToStorage(): void;
export function resetAlignmentToolbarStore(): void;
```

---

## Validation Rules

### Alignment Operation Preconditions

| Condition | Validation |
|-----------|------------|
| At least 1 view selected | `selectedIds.size >= 1` |
| Single view not root | `getParentId(viewId) !== null` |
| View exists | `getView(viewId) !== null` |

### Distribution Operation Preconditions

| Condition | Validation |
|-----------|------------|
| At least 3 views selected | `selectedIds.size >= 3` |
| All views exist | `viewIds.every(id => getView(id) !== null)` |

### Position Validation

| Field | Type | Constraints |
|-------|------|-------------|
| `Point.x` | number | Finite, can be negative |
| `Point.y` | number | Finite, can be negative |
| `ViewBounds.width` | number | >= 0 |
| `ViewBounds.height` | number | >= 0 |

---

## Computed Values

### Button Enable States

```typescript
/**
 * Determines if alignment buttons should be enabled.
 */
function isAlignmentEnabled(selectedIds: Set<string>): boolean {
  if (selectedIds.size === 0) return false;
  if (selectedIds.size === 1) {
    const [viewId] = [...selectedIds];
    return getParentId(viewId) !== null; // Not root
  }
  return true;
}

/**
 * Determines if distribution buttons should be enabled.
 */
function isDistributionEnabled(selectedIds: Set<string>): boolean {
  return selectedIds.size >= 3;
}
```

### Alignment Reference Point

```typescript
/**
 * Calculates the reference value for alignment.
 * For multi-select: edge of selection bounding box
 * For single-select: edge of parent bounds
 */
function getAlignmentReference(
  viewIds: string[],
  type: AlignmentType
): number {
  if (viewIds.length === 1) {
    const parentBounds = calculateParentBounds(viewIds[0]);
    // Return parent edge based on type
  } else {
    const selectionBounds = calculateSelectionBounds(viewIds);
    // Return selection edge based on type
  }
}
```

---

## Storage Format

### localStorage: `vstgui-edit:alignment-toolbar`

```json
{
  "isDocked": true,
  "floatingPosition": null
}
```

Or when floating:
```json
{
  "isDocked": false,
  "floatingPosition": { "x": 400, "y": 100 }
}
```

---

## History Entry Format

Alignment operations create move-type history entries:

```typescript
{
  type: 'move',
  description: 'Align 3 views left',  // Dynamic based on count and type
  timestamp: 1704844800000,
  undo: () => {
    // Restore original origins
    for (const result of results) {
      updateViewOrigin(result.viewId, result.originalOrigin);
    }
  },
  redo: () => {
    // Apply new origins
    for (const result of results) {
      updateViewOrigin(result.viewId, result.newOrigin);
    }
  }
}
```

**Description Templates**:
- "Align 3 views left"
- "Align view to parent center"
- "Distribute 5 views horizontally"
