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
): HistoryOperation {
  const description = formatLockDescription(viewIds.length);

  return {
    type: 'lock',
    description,
    timestamp: Date.now(),
    undo: () => {
      // Restore previous states: unlock those that weren't locked, keep those that were
      const toUnlock: string[] = [];
      const toLock: string[] = [];

      for (const [id, wasLocked] of previousStates) {
        if (wasLocked) {
          toLock.push(id);
        } else {
          toUnlock.push(id);
        }
      }

      if (toUnlock.length > 0) {
        unlockFn(toUnlock);
      }
      if (toLock.length > 0) {
        lockFn(toLock);
      }
    },
    redo: () => {
      lockFn(viewIds);
    },
  };
}

/**
 * Create a history operation for unlocking views.
 */
export function createUnlockOperation(
  viewIds: string[],
  previousStates: Map<string, boolean>,
  lockFn: (ids: string[]) => void,
  unlockFn: (ids: string[]) => void
): HistoryOperation {
  const description = formatUnlockDescription(viewIds.length);

  return {
    type: 'unlock',
    description,
    timestamp: Date.now(),
    undo: () => {
      // Restore previous states: lock those that were locked, unlock those that weren't
      const toUnlock: string[] = [];
      const toLock: string[] = [];

      for (const [id, wasLocked] of previousStates) {
        if (wasLocked) {
          toLock.push(id);
        } else {
          toUnlock.push(id);
        }
      }

      if (toLock.length > 0) {
        lockFn(toLock);
      }
      if (toUnlock.length > 0) {
        unlockFn(toUnlock);
      }
    },
    redo: () => {
      unlockFn(viewIds);
    },
  };
}

/**
 * Create a history operation for hiding views.
 */
export function createHideOperation(
  viewIds: string[],
  previousStates: Map<string, boolean>,
  hideFn: (ids: string[]) => void,
  showFn: (ids: string[]) => void
): HistoryOperation {
  const description = formatHideDescription(viewIds.length);

  return {
    type: 'hide',
    description,
    timestamp: Date.now(),
    undo: () => {
      // Restore previous states: show those that weren't hidden, hide those that were
      const toShow: string[] = [];
      const toHide: string[] = [];

      for (const [id, wasHidden] of previousStates) {
        if (wasHidden) {
          toHide.push(id);
        } else {
          toShow.push(id);
        }
      }

      if (toShow.length > 0) {
        showFn(toShow);
      }
      if (toHide.length > 0) {
        hideFn(toHide);
      }
    },
    redo: () => {
      hideFn(viewIds);
    },
  };
}

/**
 * Create a history operation for showing all views.
 */
export function createShowAllOperation(
  viewIds: string[],
  hideFn: (ids: string[]) => void,
  showAllFn: () => void
): HistoryOperation {
  const description = formatShowAllDescription(viewIds.length);

  return {
    type: 'show-all',
    description,
    timestamp: Date.now(),
    undo: () => {
      // Re-hide all the views that were shown
      hideFn(viewIds);
    },
    redo: () => {
      showAllFn();
    },
  };
}

/**
 * Format description for lock operation.
 */
export function formatLockDescription(count: number): string {
  if (count === 1) {
    return 'Lock view';
  }
  return `Lock ${count} views`;
}

/**
 * Format description for unlock operation.
 */
export function formatUnlockDescription(count: number): string {
  if (count === 1) {
    return 'Unlock view';
  }
  return `Unlock ${count} views`;
}

/**
 * Format description for hide operation.
 */
export function formatHideDescription(count: number): string {
  if (count === 1) {
    return 'Hide view';
  }
  return `Hide ${count} views`;
}

/**
 * Format description for show all operation.
 */
export function formatShowAllDescription(count: number): string {
  if (count === 1) {
    return 'Show view';
  }
  return `Show ${count} views`;
}
