/**
 * Lock Operations
 * Pure functions for lock/unlock logic
 */

import type { LockMenuItemInfo, LockStateInfo } from '../../types/lockHide';

/**
 * Calculate lock state info for a set of view IDs.
 */
export function calculateLockStateInfo(
  viewIds: Set<string>,
  isLocked: (id: string) => boolean
): LockStateInfo {
  if (viewIds.size === 0) {
    return { allLocked: false, anyLocked: false, noneLocked: true };
  }

  let lockedCount = 0;

  for (const id of viewIds) {
    if (isLocked(id)) {
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
 * Filter out locked views from a list of view IDs.
 * Used when initiating drag/move operations.
 */
export function filterUnlockedViews(
  viewIds: string[],
  isLocked: (id: string) => boolean
): string[] {
  return viewIds.filter(id => !isLocked(id));
}

/**
 * Check if all views in a set are locked.
 */
export function areAllLocked(
  viewIds: Set<string>,
  isLocked: (id: string) => boolean
): boolean {
  if (viewIds.size === 0) {
    return false;
  }

  for (const id of viewIds) {
    if (!isLocked(id)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if any view in a set is locked.
 */
export function isAnyLocked(
  viewIds: Set<string>,
  isLocked: (id: string) => boolean
): boolean {
  for (const id of viewIds) {
    if (isLocked(id)) {
      return true;
    }
  }

  return false;
}

/**
 * Get the menu item configuration for lock/unlock action.
 * Returns appropriate label and action based on current selection state.
 */
export function getLockMenuItem(lockStateInfo: LockStateInfo): LockMenuItemInfo {
  // If all selected views are locked, show "Unlock"
  if (lockStateInfo.allLocked) {
    return {
      label: 'Unlock',
      action: 'unlock',
      shortcut: 'Ctrl+Shift+L',
    };
  }

  // Otherwise show "Lock" (even if some are locked)
  return {
    label: 'Lock',
    action: 'lock',
    shortcut: 'Ctrl+L',
  };
}
