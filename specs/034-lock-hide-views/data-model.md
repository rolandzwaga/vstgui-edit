# Data Model: Lock and Hide Views

**Date**: 2026-01-10
**Feature**: 034-lock-hide-views

## Core Types

### `types/lockHide.ts`

```typescript
/**
 * Lock and Hide Types
 * Types for managing locked and hidden view state in the editor
 */

/**
 * Complete state for lock/hide feature.
 * This is editor-only state - NOT persisted to uidesc files.
 */
export interface LockHideState {
  /** Set of view IDs that are currently locked */
  lockedIds: Set<string>;

  /** Set of view IDs that are currently hidden */
  hiddenIds: Set<string>;
}

/**
 * Data for a lock operation (for history).
 */
export interface LockOperationData {
  /** View IDs that were locked */
  viewIds: string[];

  /** Previous lock state for each view (true = was locked, false = was unlocked) */
  previousStates: Map<string, boolean>;
}

/**
 * Data for an unlock operation (for history).
 */
export interface UnlockOperationData {
  /** View IDs that were unlocked */
  viewIds: string[];

  /** Previous lock state for each view (true = was locked, false = was unlocked) */
  previousStates: Map<string, boolean>;
}

/**
 * Data for a hide operation (for history).
 */
export interface HideOperationData {
  /** View IDs that were hidden */
  viewIds: string[];

  /** Previous hide state for each view (true = was hidden, false = was visible) */
  previousStates: Map<string, boolean>;
}

/**
 * Data for a show-all operation (for history).
 */
export interface ShowAllOperationData {
  /** All view IDs that were shown */
  viewIds: string[];
}

/**
 * Result of checking lock state for multi-selection.
 * Used to determine context menu display.
 */
export interface LockStateInfo {
  /** All selected views are locked */
  allLocked: boolean;

  /** At least one selected view is locked */
  anyLocked: boolean;

  /** None of the selected views are locked */
  noneLocked: boolean;
}

/**
 * Result of checking hide state for multi-selection.
 * Used to determine context menu display.
 */
export interface HideStateInfo {
  /** All selected views are hidden */
  allHidden: boolean;

  /** At least one selected view is hidden */
  anyHidden: boolean;

  /** None of the selected views are hidden */
  noneHidden: boolean;
}
```

### History Types Extension (`types/history.ts`)

Add the following operation types to the existing `HistoryOperation.type` union:

```typescript
// Add to existing type union
| 'lock'
| 'unlock'
| 'hide'
| 'show-all'
```

## Store Interface

### `stores/lockHideStore.ts`

```typescript
/**
 * Lock Hide Store
 * State management for locked and hidden views (editor-only state)
 */

import { createSignal } from 'solid-js';
import type { LockHideState, LockStateInfo, HideStateInfo } from '../types/lockHide';

// --- Signals ---

const [lockedIds, setLockedIds] = createSignal<Set<string>>(new Set());
const [hiddenIds, setHiddenIds] = createSignal<Set<string>>(new Set());

// --- Reactive Store ---

/**
 * Reactive store for lock/hide state.
 */
export const lockHideStore = {
  /** Set of locked view IDs */
  get lockedIds(): Set<string> {
    return lockedIds();
  },

  /** Set of hidden view IDs */
  get hiddenIds(): Set<string> {
    return hiddenIds();
  },
};

// --- Query Functions ---

/**
 * Check if a specific view is locked.
 */
export function isLocked(viewId: string): boolean;

/**
 * Check if a specific view is hidden.
 */
export function isHidden(viewId: string): boolean;

/**
 * Check if a view or any of its ancestors is hidden.
 * Used for filtering canvas rendering.
 */
export function isViewOrAncestorHidden(
  viewId: string,
  getParentId: (id: string) => string | null
): boolean;

/**
 * Get lock state info for a collection of view IDs.
 * Used for context menu display logic.
 */
export function getLockStateInfo(viewIds: Set<string>): LockStateInfo;

/**
 * Get hide state info for a collection of view IDs.
 * Used for context menu display logic.
 */
export function getHideStateInfo(viewIds: Set<string>): HideStateInfo;

// --- Mutation Functions (without history) ---

/**
 * Lock specified views.
 * @returns Map of viewId -> previousLockState (for undo)
 */
export function lockViews(viewIds: string[]): Map<string, boolean>;

/**
 * Unlock specified views.
 * @returns Map of viewId -> previousLockState (for undo)
 */
export function unlockViews(viewIds: string[]): Map<string, boolean>;

/**
 * Hide specified views.
 * @returns Map of viewId -> previousHideState (for undo)
 */
export function hideViews(viewIds: string[]): Map<string, boolean>;

/**
 * Show specified views.
 * @returns Map of viewId -> previousHideState (for undo)
 */
export function showViews(viewIds: string[]): Map<string, boolean>;

/**
 * Show all hidden views.
 * @returns Array of view IDs that were shown
 */
export function showAllViews(): string[];

/**
 * Toggle lock state for a single view.
 * @returns New lock state (true = locked)
 */
export function toggleLock(viewId: string): boolean;

/**
 * Toggle hide state for a single view.
 * @returns New hide state (true = hidden)
 */
export function toggleHide(viewId: string): boolean;

// --- History-aware Functions ---

/**
 * Lock selected views with history support.
 */
export function lockSelectedWithHistory(selectedIds: Set<string>): void;

/**
 * Unlock selected views with history support.
 */
export function unlockSelectedWithHistory(selectedIds: Set<string>): void;

/**
 * Hide selected views with history support.
 */
export function hideSelectedWithHistory(selectedIds: Set<string>): void;

/**
 * Show all hidden views with history support.
 */
export function showAllWithHistory(): void;

/**
 * Toggle hide state for selected views with history support.
 * If single selection: toggles hide state
 * If multi-selection: hides all if any visible, shows all if all hidden
 */
export function toggleHideSelectedWithHistory(selectedIds: Set<string>): void;

// --- Reset ---

/**
 * Reset store to initial state.
 * Called when loading a new document (FR-018).
 */
export function resetLockHideStore(): void;
```

## Domain Functions

### `domain/lockHide/lockOperations.ts`

```typescript
/**
 * Lock Operations
 * Pure functions for lock/unlock logic
 */

import type { LockStateInfo } from '../../types/lockHide';

/**
 * Calculate lock state info for a set of view IDs.
 */
export function calculateLockStateInfo(
  viewIds: Set<string>,
  isLocked: (id: string) => boolean
): LockStateInfo;

/**
 * Filter out locked views from a list of view IDs.
 * Used when initiating drag/move operations.
 */
export function filterUnlockedViews(
  viewIds: string[],
  isLocked: (id: string) => boolean
): string[];

/**
 * Check if all views in a set are locked.
 */
export function areAllLocked(
  viewIds: Set<string>,
  isLocked: (id: string) => boolean
): boolean;

/**
 * Check if any view in a set is locked.
 */
export function isAnyLocked(
  viewIds: Set<string>,
  isLocked: (id: string) => boolean
): boolean;
```

### `domain/lockHide/hideOperations.ts`

```typescript
/**
 * Hide Operations
 * Pure functions for hide/show logic
 */

import type { HideStateInfo } from '../../types/lockHide';

/**
 * Calculate hide state info for a set of view IDs.
 */
export function calculateHideStateInfo(
  viewIds: Set<string>,
  isHidden: (id: string) => boolean
): HideStateInfo;

/**
 * Check if a view should be hidden (either directly hidden or has hidden ancestor).
 */
export function shouldViewBeHidden(
  viewId: string,
  isHidden: (id: string) => boolean,
  getParentId: (id: string) => string | null
): boolean;

/**
 * Filter out hidden views from a list (for marquee selection).
 */
export function filterVisibleViews(
  viewIds: string[],
  isHidden: (id: string) => boolean,
  getParentId: (id: string) => string | null
): string[];

/**
 * Get all view IDs that are currently hidden.
 */
export function getAllHiddenIds(hiddenIds: Set<string>): string[];
```

### `domain/lockHide/historyOperations.ts`

```typescript
/**
 * History Operations for Lock/Hide
 * Factory functions for creating undo/redo operations
 */

import type { HistoryOperation } from '../../types/history';

/**
 * Create a history operation for locking views.
 */
export function createLockOperation(
  viewIds: string[],
  previousStates: Map<string, boolean>,
  lockFn: (ids: string[]) => void,
  unlockFn: (ids: string[]) => void
): HistoryOperation;

/**
 * Create a history operation for unlocking views.
 */
export function createUnlockOperation(
  viewIds: string[],
  previousStates: Map<string, boolean>,
  lockFn: (ids: string[]) => void,
  unlockFn: (ids: string[]) => void
): HistoryOperation;

/**
 * Create a history operation for hiding views.
 */
export function createHideOperation(
  viewIds: string[],
  previousStates: Map<string, boolean>,
  hideFn: (ids: string[]) => void,
  showFn: (ids: string[]) => void
): HistoryOperation;

/**
 * Create a history operation for showing all views.
 */
export function createShowAllOperation(
  viewIds: string[],
  hideFn: (ids: string[]) => void,
  showAllFn: () => void
): HistoryOperation;

/**
 * Format description for lock operation.
 */
export function formatLockDescription(count: number): string;

/**
 * Format description for unlock operation.
 */
export function formatUnlockDescription(count: number): string;

/**
 * Format description for hide operation.
 */
export function formatHideDescription(count: number): string;

/**
 * Format description for show all operation.
 */
export function formatShowAllDescription(count: number): string;
```

## Component Props Extensions

### SelectionOverlay Props

```typescript
export interface SelectionOverlayProps {
  view: RenderableView;
  onResizeStart?: (handle: HandlePosition, view: RenderableView) => void;
  /** NEW: Whether this view is locked (hides resize handles) */
  isLocked?: boolean;
}
```

### LockIndicator Component (NEW)

```typescript
export interface LockIndicatorProps {
  /** X position (top-right corner of view) */
  x: number;
  /** Y position */
  y: number;
  /** Size of the indicator in pixels */
  size?: number;
}
```

### TreeNode Extension

The TreeNode component will receive lock/hide state via context or direct prop:

```typescript
// Additional state in TreeNode
const isLocked = () => isLockedFn(props.node.id);
const isHidden = () => isHiddenFn(props.node.id);
```

### ContextMenu Props

```typescript
export interface ContextMenuProps {
  onDelete: () => void;
  /** NEW: Callback for lock/unlock action */
  onLock?: () => void;
  onUnlock?: () => void;
  /** NEW: Callback for hide/show action */
  onHide?: () => void;
  onShowAll?: () => void;
}
```

## State Flow Diagrams

### Lock Operation Flow

```
User presses Ctrl+L
    |
    v
useCanvasKeyboard.handleKeyDown
    |
    v
Check: selectedIds.size > 0?
    |-- No --> return (no-op)
    |-- Yes
    v
lockSelectedWithHistory(selectedIds)
    |
    v
lockViews(viewIds) --> returns previousStates
    |
    v
createLockOperation(viewIds, previousStates, ...)
    |
    v
pushOperation(operation)
    |
    v
UI Updates:
  - SelectionOverlay hides resize handles
  - ViewRectangle shows lock icon
  - TreeNode shows lock icon
```

### Hide Operation Flow

```
User presses Ctrl+H
    |
    v
useCanvasKeyboard.handleKeyDown
    |
    v
Check: selectedIds.size > 0?
    |-- No --> return (no-op)
    |-- Yes
    v
toggleHideSelectedWithHistory(selectedIds)
    |
    v
If single selection:
    toggleHide(viewId) --> returns newState
Else:
    If any visible: hideViews(viewIds)
    Else: showViews(viewIds)
    |
    v
createHideOperation(...) or createShowAllOperation(...)
    |
    v
pushOperation(operation)
    |
    v
UI Updates:
  - Canvas filters out hidden views
  - TreeNode shows eye-slash icon
  - Clicks pass through hidden areas
```

### Undo Lock Flow

```
User presses Ctrl+Z
    |
    v
historyStore.undo()
    |
    v
operation.undo() called
    |
    v
For each viewId in previousStates:
    If was locked: lockViews([viewId])
    Else: unlockViews([viewId])
    |
    v
UI Updates automatically via reactivity
```

## Validation Rules

### Lock Constraints
1. Locked views MUST remain selectable (FR-006)
2. Locked views MUST NOT be movable via drag (FR-003)
3. Locked views MUST NOT be resizable (FR-004)
4. Locked views MUST NOT be deletable (FR-005)
5. Locked views allow property editing EXCEPT origin/size (FR-007b)

### Hide Constraints
1. Hidden views MUST NOT render on canvas (FR-010)
2. Hidden views MUST NOT be selectable on canvas (FR-011)
3. Hidden views MUST remain visible in hierarchy (FR-012)
4. Hidden container children MUST also be hidden (FR-013)
5. Hidden views CAN be selected via hierarchy panel (User Story 6)

### State Constraints
1. Lock and hide states are independent (Assumptions)
2. A view CAN be both locked AND hidden (FR-016)
3. States reset on document load (FR-018)
4. States are NOT persisted to uidesc (FR-017)
