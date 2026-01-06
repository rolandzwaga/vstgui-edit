/**
 * Ancestor Utilities
 * Functions for traversing view hierarchy to find ancestors
 */
import type { RenderableView } from '../../types/canvas';

/**
 * Get all ancestor IDs for a given view, from immediate parent up to root.
 * Returns empty array if view not found or has no parent.
 *
 * @param viewId - The ID of the view to find ancestors for
 * @param allViews - Array of all renderable views in the hierarchy
 * @returns Array of ancestor IDs, ordered from immediate parent to root
 */
export function getAncestorIds(viewId: string, allViews: RenderableView[]): string[] {
  if (allViews.length === 0) {
    return [];
  }

  // Build a lookup map for efficient parent traversal
  const viewMap = new Map<string, RenderableView>();
  for (const view of allViews) {
    viewMap.set(view.id, view);
  }

  // Find the target view
  const targetView = viewMap.get(viewId);
  if (!targetView) {
    return [];
  }

  // Traverse up the parent chain
  const ancestors: string[] = [];
  let currentParentId = targetView.parentId;

  while (currentParentId !== null) {
    ancestors.push(currentParentId);
    const parentView = viewMap.get(currentParentId);
    if (!parentView) {
      break;
    }
    currentParentId = parentView.parentId;
  }

  return ancestors;
}

/**
 * Check if a view is an ancestor of any selected view.
 *
 * @param viewId - The ID of the view to check
 * @param selectedIds - Set of selected view IDs
 * @param allViews - Array of all renderable views in the hierarchy
 * @returns True if the view is an ancestor of any selected view
 */
export function isAncestorOfSelected(
  viewId: string,
  selectedIds: Set<string>,
  allViews: RenderableView[]
): boolean {
  // For each selected view, check if viewId is in its ancestor chain
  for (const selectedId of selectedIds) {
    const ancestors = getAncestorIds(selectedId, allViews);
    if (ancestors.includes(viewId)) {
      return true;
    }
  }
  return false;
}
