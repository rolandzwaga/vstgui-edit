/**
 * Lock Hide Store
 * State management for locked and hidden views (editor-only state)
 */

import { createSignal } from 'solid-js';
import {
  createHideOperation,
  createLockOperation,
  createShowAllOperation,
  createUnlockOperation,
} from '../domain/lockHide/historyOperations';
import type { HideStateInfo, LockStateInfo } from '../types/lockHide';
import { pushOperation } from './historyStore';

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
export function isLocked(viewId: string): boolean {
  return lockedIds().has(viewId);
}

/**
 * Check if a specific view is hidden.
 */
export function isHidden(viewId: string): boolean {
  return hiddenIds().has(viewId);
}

/**
 * Check if a view or any of its ancestors is hidden.
 * Used for filtering canvas rendering.
 */
export function isViewOrAncestorHidden(
  viewId: string,
  getParentId: (id: string) => string | null
): boolean {
  let currentId: string | null = viewId;
  const hidden = hiddenIds();

  while (currentId !== null) {
    if (hidden.has(currentId)) {
      return true;
    }
    currentId = getParentId(currentId);
  }

  return false;
}

/**
 * Get lock state info for a collection of view IDs.
 * Used for context menu display logic.
 */
export function getLockStateInfo(viewIds: Set<string>): LockStateInfo {
  if (viewIds.size === 0) {
    return { allLocked: false, anyLocked: false, noneLocked: true };
  }

  const locked = lockedIds();
  let lockedCount = 0;

  for (const id of viewIds) {
    if (locked.has(id)) {
      lockedCount++;
    }
  }

  return {
    allLocked: lockedCount === viewIds.size,
    anyLocked: lockedCount > 0,
    noneLocked: lockedCount === 0,
  };
}

/**
 * Get hide state info for a collection of view IDs.
 * Used for context menu display logic.
 */
export function getHideStateInfo(viewIds: Set<string>): HideStateInfo {
  if (viewIds.size === 0) {
    return { allHidden: false, anyHidden: false, noneHidden: true };
  }

  const hidden = hiddenIds();
  let hiddenCount = 0;

  for (const id of viewIds) {
    if (hidden.has(id)) {
      hiddenCount++;
    }
  }

  return {
    allHidden: hiddenCount === viewIds.size,
    anyHidden: hiddenCount > 0,
    noneHidden: hiddenCount === 0,
  };
}

// --- Mutation Functions (without history) ---

/**
 * Lock specified views.
 * @returns Map of viewId -> previousLockState (for undo)
 */
export function lockViews(viewIds: string[]): Map<string, boolean> {
  const previousStates = new Map<string, boolean>();
  const current = lockedIds();

  for (const id of viewIds) {
    previousStates.set(id, current.has(id));
  }

  setLockedIds(prev => {
    const next = new Set(prev);
    for (const id of viewIds) {
      next.add(id);
    }
    return next;
  });

  return previousStates;
}

/**
 * Unlock specified views.
 * @returns Map of viewId -> previousLockState (for undo)
 */
export function unlockViews(viewIds: string[]): Map<string, boolean> {
  const previousStates = new Map<string, boolean>();
  const current = lockedIds();

  for (const id of viewIds) {
    previousStates.set(id, current.has(id));
  }

  setLockedIds(prev => {
    const next = new Set(prev);
    for (const id of viewIds) {
      next.delete(id);
    }
    return next;
  });

  return previousStates;
}

/**
 * Hide specified views.
 * @returns Map of viewId -> previousHideState (for undo)
 */
export function hideViews(viewIds: string[]): Map<string, boolean> {
  const previousStates = new Map<string, boolean>();
  const current = hiddenIds();

  for (const id of viewIds) {
    previousStates.set(id, current.has(id));
  }

  setHiddenIds(prev => {
    const next = new Set(prev);
    for (const id of viewIds) {
      next.add(id);
    }
    return next;
  });

  return previousStates;
}

/**
 * Show specified views.
 * @returns Map of viewId -> previousHideState (for undo)
 */
export function showViews(viewIds: string[]): Map<string, boolean> {
  const previousStates = new Map<string, boolean>();
  const current = hiddenIds();

  for (const id of viewIds) {
    previousStates.set(id, current.has(id));
  }

  setHiddenIds(prev => {
    const next = new Set(prev);
    for (const id of viewIds) {
      next.delete(id);
    }
    return next;
  });

  return previousStates;
}

/**
 * Show all hidden views.
 * @returns Array of view IDs that were shown
 */
export function showAllViews(): string[] {
  const current = hiddenIds();
  const shownIds = Array.from(current);
  setHiddenIds(new Set<string>());
  return shownIds;
}

/**
 * Toggle lock state for a single view.
 * @returns New lock state (true = locked)
 */
export function toggleLock(viewId: string): boolean {
  const wasLocked = lockedIds().has(viewId);

  setLockedIds(prev => {
    const next = new Set(prev);
    if (wasLocked) {
      next.delete(viewId);
    } else {
      next.add(viewId);
    }
    return next;
  });

  return !wasLocked;
}

/**
 * Toggle hide state for a single view.
 * @returns New hide state (true = hidden)
 */
export function toggleHide(viewId: string): boolean {
  const wasHidden = hiddenIds().has(viewId);

  setHiddenIds(prev => {
    const next = new Set(prev);
    if (wasHidden) {
      next.delete(viewId);
    } else {
      next.add(viewId);
    }
    return next;
  });

  return !wasHidden;
}

// --- History-aware Functions ---

/**
 * Lock selected views with history support.
 */
export function lockSelectedWithHistory(selectedIds: Set<string>): void {
  if (selectedIds.size === 0) {
    return;
  }

  const viewIds = Array.from(selectedIds);
  const previousStates = lockViews(viewIds);

  const operation = createLockOperation(
    viewIds,
    previousStates,
    (ids: string[]) => lockViews(ids),
    (ids: string[]) => unlockViews(ids)
  );

  pushOperation(operation);
}

/**
 * Unlock selected views with history support.
 */
export function unlockSelectedWithHistory(selectedIds: Set<string>): void {
  if (selectedIds.size === 0) {
    return;
  }

  const viewIds = Array.from(selectedIds);
  const previousStates = unlockViews(viewIds);

  const operation = createUnlockOperation(
    viewIds,
    previousStates,
    (ids: string[]) => lockViews(ids),
    (ids: string[]) => unlockViews(ids)
  );

  pushOperation(operation);
}

/**
 * Show all hidden views with history support.
 */
export function showAllWithHistory(): void {
  const current = hiddenIds();
  if (current.size === 0) {
    return;
  }

  const viewIds = showAllViews();

  const operation = createShowAllOperation(
    viewIds,
    (ids: string[]) => hideViews(ids),
    () => showAllViews()
  );

  pushOperation(operation);
}

/**
 * Toggle hide state for selected views with history support.
 * If single selection: toggles hide state
 * If multi-selection: hides all if any visible, shows all if all hidden
 */
export function toggleHideSelectedWithHistory(selectedIds: Set<string>): void {
  if (selectedIds.size === 0) {
    return;
  }

  const viewIds = Array.from(selectedIds);
  const hideInfo = getHideStateInfo(selectedIds);

  if (selectedIds.size === 1) {
    // Single selection: toggle
    const viewId = viewIds[0];
    const wasHidden = isHidden(viewId);

    if (wasHidden) {
      // Show the view
      const previousStates = showViews([viewId]);
      const operation = createHideOperation(
        [viewId],
        previousStates,
        (ids: string[]) => hideViews(ids),
        (ids: string[]) => showViews(ids)
      );
      pushOperation(operation);
    } else {
      // Hide the view
      const previousStates = hideViews([viewId]);
      const operation = createHideOperation(
        [viewId],
        previousStates,
        (ids: string[]) => hideViews(ids),
        (ids: string[]) => showViews(ids)
      );
      pushOperation(operation);
    }
  } else {
    // Multi-selection: hide all if any visible, show all if all hidden
    if (hideInfo.allHidden) {
      // Show all
      const previousStates = showViews(viewIds);
      const operation = createHideOperation(
        viewIds,
        previousStates,
        (ids: string[]) => hideViews(ids),
        (ids: string[]) => showViews(ids)
      );
      pushOperation(operation);
    } else {
      // Hide all
      const previousStates = hideViews(viewIds);
      const operation = createHideOperation(
        viewIds,
        previousStates,
        (ids: string[]) => hideViews(ids),
        (ids: string[]) => showViews(ids)
      );
      pushOperation(operation);
    }
  }
}

// --- Reset ---

/**
 * Reset store to initial state.
 * Called when loading a new document (FR-018).
 */
export function resetLockHideStore(): void {
  setLockedIds(new Set<string>());
  setHiddenIds(new Set<string>());
}
