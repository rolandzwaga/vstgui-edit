# Research: Clipboard Operations

**Feature**: 020-clipboard-operations
**Date**: 2026-01-07

## Discovery: Existing Implementation

During plan creation, analysis revealed that **clipboard operations are already implemented** in the codebase. This research documents what exists and identifies gaps.

## Existing Components

### 1. Clipboard Store (`src/stores/clipboardStore.ts`)

```typescript
// Signal-based clipboard state
const [clipboardData, setClipboardData] = createSignal<ClipboardData | null>(null);

// Store with getters
export const clipboardStore = {
  get data() { return clipboardData(); },
  get hasContent() { return clipboardData() !== null; },
};

// Functions
export function copyToClipboard(views: SerializedView[], sourceOrigins: Record<string, Point>): void
export function clearClipboard(): void
export function incrementPasteCount(): void
export function getClipboardContent(): ClipboardData | null
export function resetClipboard(): void
```

**Decision**: Store is complete and follows SolidJS patterns correctly.

### 2. View Serialization (`src/domain/views/serialization.ts`)

```typescript
// Serialize view tree for clipboard
export function serializeView(viewId: string, viewNode: ViewNode): SerializedView

// Deserialize back to ViewNode
export function deserializeView(serialized: SerializedView): ViewNode

// Extract origin from serialized view
export function extractOrigin(serialized: SerializedView): Point

// Apply offset to serialized view (for paste)
export function applyOffsetToSerialized(serialized: SerializedView, offset: Point): SerializedView

// Collect origins from multiple views
export function collectOriginsFromSerialized(serializedViews: SerializedView[]): Record<string, Point>
```

**Decision**: Serialization handles recursive children correctly.

### 3. View Operations (`src/domain/canvas/viewOperations.ts`)

```typescript
const DUPLICATE_OFFSET = 10;
const PASTE_OFFSET = 10;

// Delete selected views
export function deleteSelectedViews(): RemovedViewInfo[]
export function createDeleteOperation(removedViews: RemovedViewInfo[]): HistoryOperation

// Duplicate selected views
export function duplicateSelectedViews(): string[]
export function createDuplicateOperation(duplicatedViewIds: string[]): HistoryOperation

// Copy to clipboard
export function copySelectedViews(): boolean

// Cut (copy + delete)
export function cutSelectedViews(): RemovedViewInfo[]

// Paste from clipboard
export function pasteViews(): string[]
export function createPasteOperation(pastedViewIds: string[]): HistoryOperation

// Check if can paste
export function canPaste(): boolean
```

**Decision**: Core operations are implemented. Need to verify paste-into-container behavior.

### 4. Keyboard Handlers (`src/hooks/canvas/useCanvasKeyboard.ts`)

All shortcuts are wired:
- `Ctrl+C`: Calls `copySelectedViews()` (line 108-112)
- `Ctrl+X`: Calls `cutSelectedViews()`, creates history operation (line 114-122)
- `Ctrl+V`: Calls `pasteViews()`, creates history operation (line 124-132)
- `Ctrl+D`: Calls `duplicateSelectedViews()`, creates history operation (line 94-106)

**Decision**: Keyboard shortcuts are complete.

### 5. Types (`src/types/views.ts`)

```typescript
export interface SerializedView {
  originalId: string;
  class: string;
  attributes: Record<string, string>;
  children?: SerializedView[];
}

export interface ClipboardData {
  views: SerializedView[];
  sourceOrigins: Record<string, Point>;
  copyTimestamp: number;
  pasteCount: number;
}
```

**Decision**: Types are well-defined.

## Gap Analysis

### 1. Paste-into-Container (FR-010, FR-011)

**Current behavior** (from `pasteViews()`):
```typescript
const parentId = extractParentId(serialized.originalId);
if (parentId) {
  const newId = addView(parentId, viewNode);
  ...
}
```

This uses the **original parent ID** from the copied view, NOT the currently selected container.

**Gap**: FR-010 requires "paste views as children of selected container when one is selected."

**Fix needed**: Check if a container is selected and use it as parent instead.

### 2. Redo Operations (partial)

Looking at `createDuplicateOperation`:
```typescript
redo: () => {},  // Empty!
```

And `createPasteOperation`:
```typescript
redo: () => {},  // Empty!
```

**Gap**: Redo handlers are no-ops. After undo, redo won't work properly.

**Reasoning**: This might be intentional since duplicate/paste create new IDs each time, making exact redo impossible. Need to verify expected behavior.

### 3. Incremental Paste Offset

Current implementation:
```typescript
const offset = (clipboardContent.pasteCount + 1) * PASTE_OFFSET;
```

This correctly creates incremental offsets for multiple pastes. ✅

### 4. Paste at Cursor Position (FR - P3 Priority)

Not implemented. Views paste at offset from original position, not at cursor.

**Decision**: This is P3 priority per spec, can be deferred.

## Test Coverage Status

### Existing Tests to Check

- `src/stores/__tests__/clipboardStore.spec.ts` - Store tests
- `src/domain/canvas/__tests__/viewOperations.spec.ts` - May include copy/paste tests
- `src/hooks/canvas/__tests__/useCanvasKeyboard.spec.ts` - Keyboard shortcut tests

### Tests Needed

1. Copy single view → verify clipboard has data
2. Copy multiple views → verify all serialized
3. Copy container with children → verify recursive serialization
4. Paste once → verify offset applied
5. Paste twice → verify incremental offset
6. Cut → verify clipboard has data AND view removed
7. Cut → undo → verify view restored
8. Duplicate → verify new ID, offset applied
9. Duplicate → undo → verify duplicate removed
10. Empty selection → copy/cut/duplicate return early
11. Root template → cut blocked

## Alternatives Considered

### System Clipboard Integration

**Rejected because**:
1. Would require JSON serialization to text
2. Cross-template paste would need format detection
3. Security concerns with clipboard API
4. Internal clipboard is simpler and sufficient

### Relative vs Absolute Offset

**Current**: Absolute offset from original position
**Alternative**: Offset from selection bounding box center

**Decision**: Current approach is simpler and matches user expectations.

## Recommendations

1. **Implement paste-into-container** - Check for selected container before using original parent
2. **Evaluate redo handlers** - Decide if they should be no-ops or attempt recreation
3. **Add comprehensive tests** - Cover all FR-xxx requirements
4. **Defer cursor paste** - P3 priority, not needed for MVP completion
