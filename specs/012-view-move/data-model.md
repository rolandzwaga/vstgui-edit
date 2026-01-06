# Data Model: View Move

**Feature**: 012-view-move
**Date**: 2026-01-06

## Entities

### HistoryOperation

Represents a single undoable/redoable operation.

```typescript
interface HistoryOperation {
  /** Operation type for debugging/display */
  type: 'move';
  /** Human-readable description (e.g., "Move CTextButton") */
  description: string;
  /** Function to reverse this operation */
  undo: () => void;
  /** Function to replay this operation */
  redo: () => void;
  /** Timestamp for ordering/debugging */
  timestamp: number;
}
```

**Validation Rules**:
- `undo` and `redo` must be inverse operations
- `description` should be concise (<50 chars)

### MoveOperationData

Data captured for a move operation (used to construct HistoryOperation).

```typescript
interface MoveOperationData {
  /** View IDs that were moved */
  viewIds: string[];
  /** Original origins before move (keyed by viewId) */
  originalOrigins: Record<string, Point>;
  /** New origins after move (keyed by viewId) */
  newOrigins: Record<string, Point>;
}
```

**Validation Rules**:
- `viewIds` must be non-empty
- Every viewId in `viewIds` must have entry in both `originalOrigins` and `newOrigins`

### DragState

Transient state during a drag operation (not persisted).

```typescript
interface DragState {
  /** Whether a drag is currently active */
  isDragging: boolean;
  /** Starting mouse position in canvas coordinates */
  startPoint: Point | null;
  /** Current mouse position in canvas coordinates */
  currentPoint: Point | null;
  /** Original origins of selected views when drag started */
  originalOrigins: Record<string, Point>;
  /** Locked axis when Shift is held ('horizontal' | 'vertical' | null) */
  constrainedAxis: 'horizontal' | 'vertical' | null;
}
```

### Point (existing)

Already defined in `src/types/canvas.ts`:

```typescript
interface Point {
  x: number;
  y: number;
}
```

## State Management

### historyStore (NEW)

New store for undo/redo history management.

```typescript
// Signals
const [undoStack, setUndoStack] = createSignal<HistoryOperation[]>([]);
const [redoStack, setRedoStack] = createSignal<HistoryOperation[]>([]);

// Exported store
export const historyStore = {
  get canUndo(): boolean;
  get canRedo(): boolean;
  get undoDescription(): string | null;  // Description of next undo
  get redoDescription(): string | null;  // Description of next redo
};

// Actions
export function pushOperation(op: HistoryOperation): void;
export function undo(): void;
export function redo(): void;
export function clearHistory(): void;
export function resetHistory(): void;  // For testing
```

**Behavior**:
- `pushOperation`: Adds to undoStack, clears redoStack
- `undo`: Pops from undoStack, calls `op.undo()`, pushes to redoStack
- `redo`: Pops from redoStack, calls `op.redo()`, pushes to undoStack
- Stack size limit: 100 operations (oldest dropped when exceeded)

### documentStore (MODIFY)

Add action for updating view origins.

```typescript
// New action
export function updateViewOrigin(viewId: string, newOrigin: Point): Point | null;
```

**Behavior**:
- Parses composite viewId to find view in document tree
- Updates `attributes.origin` to formatted string `"${x}, ${y}"`
- Returns previous origin (for undo) or null if view not found

### dragStore (NEW - transient)

Transient store for drag operation state (similar to marqueeStore).

```typescript
// Signals
const [isDragging, setIsDragging] = createSignal(false);
const [startPoint, setStartPoint] = createSignal<Point | null>(null);
const [currentPoint, setCurrentPoint] = createSignal<Point | null>(null);
const [originalOrigins, setOriginalOrigins] = createSignal<Record<string, Point>>({});
const [constrainedAxis, setConstrainedAxis] = createSignal<'horizontal' | 'vertical' | null>(null);

// Exported store
export const dragStore = {
  get isDragging(): boolean;
  get startPoint(): Point | null;
  get currentPoint(): Point | null;
  get originalOrigins(): Record<string, Point>;
  get constrainedAxis(): 'horizontal' | 'vertical' | null;
  get delta(): Point;  // Computed: currentPoint - startPoint (constrained if applicable)
};

// Actions
export function startDrag(point: Point, origins: Record<string, Point>): void;
export function updateDrag(point: Point, shiftHeld: boolean): void;
export function endDrag(): void;
export function cancelDrag(): void;
export function resetDrag(): void;  // For testing
```

## Relationships

```
┌─────────────────┐     triggers      ┌──────────────────┐
│   dragStore     │ ───────────────► │   historyStore   │
│  (transient)    │   on endDrag     │   (persistent)   │
└─────────────────┘                   └──────────────────┘
        │                                     │
        │ reads                               │ calls
        ▼                                     ▼
┌─────────────────┐                   ┌──────────────────┐
│ selectionStore  │                   │  documentStore   │
│ (selected IDs)  │                   │ (view origins)   │
└─────────────────┘                   └──────────────────┘
```

## State Transitions

### Drag Operation Lifecycle

```
IDLE ──[mousedown on selected view]──► PENDING
PENDING ──[movement < 3px]──► IDLE (click, not drag)
PENDING ──[movement >= 3px]──► DRAGGING
DRAGGING ──[mousemove]──► DRAGGING (update position)
DRAGGING ──[mouseup]──► IDLE (commit move, push to history)
DRAGGING ──[Escape]──► IDLE (cancel, revert positions)
```

### History Stack Transitions

```
[initial: undoStack=[], redoStack=[]]

──[move operation]──►
   undoStack=[op1], redoStack=[]

──[another move]──►
   undoStack=[op1, op2], redoStack=[]

──[Ctrl+Z (undo)]──►
   undoStack=[op1], redoStack=[op2]

──[Ctrl+Y (redo)]──►
   undoStack=[op1, op2], redoStack=[]

──[new move after undo]──►
   undoStack=[op1, op3], redoStack=[]  // op2 lost
```

## Domain Utilities

### src/domain/canvas/move.ts (NEW)

```typescript
/** Calculate delta between two points */
export function calculateDelta(start: Point, current: Point): Point;

/** Apply delta to a point */
export function applyDelta(origin: Point, delta: Point): Point;

/** Apply delta to multiple origins */
export function applyDeltaToAll(
  origins: Record<string, Point>,
  delta: Point
): Record<string, Point>;

/** Format point as origin string "x, y" */
export function formatOrigin(point: Point): string;
```

### src/domain/canvas/constrainAxis.ts (NEW)

```typescript
/** Minimum distance before axis lock engages */
export const AXIS_LOCK_THRESHOLD = 5;

/** Determine which axis to constrain based on initial movement */
export function determineConstraintAxis(
  delta: Point
): 'horizontal' | 'vertical' | null;

/** Apply axis constraint to a delta */
export function constrainDelta(
  delta: Point,
  axis: 'horizontal' | 'vertical' | null
): Point;
```

## Integration Points

### Canvas.tsx Modifications

1. **Mouse handlers**: Detect drag on selected view vs empty canvas
2. **Keyboard handlers**: Add arrow key nudge (1px/10px)
3. **Render**: Add DragPreview component during drag

### Keyboard Shortcuts

| Key | Modifier | Action |
|-----|----------|--------|
| Arrow keys | None | Nudge 1px |
| Arrow keys | Shift | Nudge 10px |
| Z | Ctrl | Undo |
| Y | Ctrl | Redo |
| Z | Ctrl+Shift | Redo (alternative) |
| Escape | None | Cancel drag (if dragging) |
