/**
 * Replace Operations
 * Functions for replacing attribute values in views.
 */

import type { ReplaceChange, ReplaceResult, ReplaceValidationError } from '../../types/search';
import { isLocked } from '../../stores/lockHideStore';
import { updateViewAttribute } from '../../stores/documentStore';

/**
 * Attributes that cannot be replaced (read-only).
 */
export const READ_ONLY_ATTRIBUTES = new Set([
  'class', // View type cannot be changed
]);

/**
 * Validate a replacement value for a specific attribute.
 *
 * @param attributeName - Attribute name being replaced
 * @param value - Replacement value
 * @returns Validation error or null if valid
 */
export function validateReplaceValue(
  attributeName: string,
  value: string
): ReplaceValidationError | null {
  if (READ_ONLY_ATTRIBUTES.has(attributeName)) {
    return {
      type: 'read-only-attribute',
      message: `Cannot replace read-only attribute "${attributeName}"`,
    };
  }

  // Additional validation could be added here based on attribute type
  // For now, accept any non-empty replacement

  return null;
}

/**
 * Replace attribute value in a single view.
 *
 * @param viewId - ID of view to update
 * @param attributeName - Attribute to replace
 * @param newValue - New value
 * @returns ReplaceChange for undo, or null if locked/failed
 */
export function replaceAttribute(
  viewId: string,
  attributeName: string,
  newValue: string
): ReplaceChange | null {
  // Check if view is locked
  if (isLocked(viewId)) {
    return null;
  }

  // Validate attribute can be replaced
  const error = validateReplaceValue(attributeName, newValue);
  if (error) {
    return null;
  }

  // Get old value and perform update
  const oldValue = updateViewAttribute(viewId, attributeName, newValue);

  if (oldValue === null || oldValue === undefined) {
    return null;
  }

  return {
    viewId,
    attributeName,
    oldValue,
    newValue,
  };
}

/**
 * Replace attribute value in all matching views.
 *
 * @param viewIds - IDs of views to update
 * @param attributeName - Attribute to replace
 * @param newValue - New value
 * @returns ReplaceResult with counts and changes
 */
export function replaceAll(
  viewIds: string[],
  attributeName: string,
  newValue: string
): ReplaceResult {
  const changes: ReplaceChange[] = [];
  let skippedLockedCount = 0;

  for (const viewId of viewIds) {
    if (isLocked(viewId)) {
      skippedLockedCount++;
      continue;
    }

    const change = replaceAttribute(viewId, attributeName, newValue);
    if (change) {
      changes.push(change);
    }
  }

  return {
    replacedCount: changes.length,
    skippedLockedCount,
    changes,
  };
}
