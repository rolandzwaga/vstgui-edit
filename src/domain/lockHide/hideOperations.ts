/**
 * Hide Operations
 * Pure functions for hide/show logic
 */

import type { HideMenuItemInfo, HideStateInfo } from '../../types/lockHide';

/**
 * Calculate hide state info for a set of view IDs.
 */
export function calculateHideStateInfo(
  viewIds: Set<string>,
  isHidden: (id: string) => boolean
): HideStateInfo {
  if (viewIds.size === 0) {
    return { allHidden: false, anyHidden: false, noneHidden: true };
  }

  let hiddenCount = 0;

  for (const id of viewIds) {
    if (isHidden(id)) {
      hiddenCount++;
    }
  }

  return {
    allHidden: hiddenCount === viewIds.size,
    anyHidden: hiddenCount > 0,
    noneHidden: hiddenCount === 0,
  };
}

/**
 * Check if a view should be hidden (either directly hidden or has hidden ancestor).
 */
export function shouldViewBeHidden(
  viewId: string,
  isHidden: (id: string) => boolean,
  getParentId: (id: string) => string | null
): boolean {
  let currentId: string | null = viewId;

  while (currentId !== null) {
    if (isHidden(currentId)) {
      return true;
    }
    currentId = getParentId(currentId);
  }

  return false;
}

/**
 * Filter out hidden views from a list (for marquee selection).
 */
export function filterVisibleViews(
  viewIds: string[],
  isHidden: (id: string) => boolean,
  getParentId: (id: string) => string | null
): string[] {
  return viewIds.filter(id => !shouldViewBeHidden(id, isHidden, getParentId));
}

/**
 * Get all view IDs that are currently hidden.
 */
export function getAllHiddenIds(hiddenIds: Set<string>): string[] {
  return Array.from(hiddenIds);
}

/**
 * Get the menu item configuration for hide/show action.
 * Returns appropriate label and action based on current selection state.
 */
export function getHideMenuItem(hideStateInfo: HideStateInfo): HideMenuItemInfo {
  // If all selected views are hidden, show "Show"
  if (hideStateInfo.allHidden) {
    return {
      label: 'Show',
      action: 'show',
      shortcut: 'Ctrl+H',
    };
  }

  // Otherwise show "Hide" (even if some are hidden)
  return {
    label: 'Hide',
    action: 'hide',
    shortcut: 'Ctrl+H',
  };
}
