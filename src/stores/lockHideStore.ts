/**
 * Lock Hide Store
 * State management for locked and hidden views (editor-only state)
 */

import { createSignal } from 'solid-js';
import type { HideStateInfo, LockStateInfo } from '../types/lockHide';

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

// --- Reset ---

/**
 * Reset store to initial state.
 * Called when loading a new document (FR-018).
 */
export function resetLockHideStore(): void {
  setLockedIds(new Set<string>());
  setHiddenIds(new Set<string>());
}
