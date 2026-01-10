/**
 * History Operations for Guides
 * Factory functions for creating guide-related history operations
 */

import type { HistoryOperation } from '../../types/history';
import type { CustomGuide, GuideOrientation } from '../../types/guides';

/**
 * History operation type for guide creation.
 */
export const GUIDE_CREATE_TYPE = 'guide-create' as const;

/**
 * History operation type for guide deletion.
 */
export const GUIDE_DELETE_TYPE = 'guide-delete' as const;

/**
 * History operation type for guide repositioning.
 */
export const GUIDE_REPOSITION_TYPE = 'guide-reposition' as const;

/**
 * History operation type for clearing all guides.
 */
export const GUIDE_CLEAR_ALL_TYPE = 'guide-clear-all' as const;

/**
 * Format description for guide create operation.
 */
export function formatGuideCreateDescription(guide: CustomGuide): string {
  return `Create ${guide.orientation} guide at ${guide.position}`;
}

/**
 * Format description for guide delete operation.
 */
export function formatGuideDeleteDescription(guide: CustomGuide): string {
  return `Delete ${guide.orientation} guide at ${guide.position}`;
}

/**
 * Format description for guide reposition operation.
 */
export function formatGuideRepositionDescription(
  guide: CustomGuide,
  oldPosition: number,
  newPosition: number
): string {
  return `Move ${guide.orientation} guide from ${oldPosition} to ${newPosition}`;
}

/**
 * Format description for clear all guides operation.
 */
export function formatGuideClearAllDescription(count: number): string {
  return `Clear ${count} guide${count === 1 ? '' : 's'}`;
}

/**
 * Create a history operation for guide creation.
 *
 * @param guide - The guide that was created
 * @param addFn - Function to re-add the guide (for redo)
 * @param deleteFn - Function to delete the guide (for undo)
 * @returns HistoryOperation ready to push to historyStore
 */
export function createGuideCreateOperation(
  guide: CustomGuide,
  addFn: (orientation: GuideOrientation, position: number) => void,
  deleteFn: (id: string) => void
): HistoryOperation {
  return {
    type: GUIDE_CREATE_TYPE,
    description: formatGuideCreateDescription(guide),
    undo: () => deleteFn(guide.id),
    redo: () => addFn(guide.orientation, guide.position),
    timestamp: Date.now(),
  };
}

/**
 * Create a history operation for guide deletion.
 *
 * @param guide - The guide that was deleted (for restoration)
 * @param addFn - Function to re-add the guide (for undo)
 * @param deleteFn - Function to delete the guide (for redo)
 * @returns HistoryOperation ready to push to historyStore
 */
export function createGuideDeleteOperation(
  guide: CustomGuide,
  addFn: (orientation: GuideOrientation, position: number) => void,
  deleteFn: (id: string) => void
): HistoryOperation {
  return {
    type: GUIDE_DELETE_TYPE,
    description: formatGuideDeleteDescription(guide),
    undo: () => addFn(guide.orientation, guide.position),
    redo: () => deleteFn(guide.id),
    timestamp: Date.now(),
  };
}

/**
 * Create a history operation for guide repositioning.
 *
 * @param guide - The guide that was repositioned
 * @param oldPosition - Original position before reposition
 * @param newPosition - New position after reposition
 * @param repositionFn - Function to set guide position
 * @returns HistoryOperation ready to push to historyStore
 */
export function createGuideRepositionOperation(
  guide: CustomGuide,
  oldPosition: number,
  newPosition: number,
  repositionFn: (id: string, position: number) => void
): HistoryOperation {
  return {
    type: GUIDE_REPOSITION_TYPE,
    description: formatGuideRepositionDescription(guide, oldPosition, newPosition),
    undo: () => repositionFn(guide.id, oldPosition),
    redo: () => repositionFn(guide.id, newPosition),
    timestamp: Date.now(),
  };
}

/**
 * Create a history operation for clearing all guides.
 *
 * @param guides - All guides that were cleared (for restoration)
 * @param addFn - Function to add guides back (for undo)
 * @param clearFn - Function to clear all guides (for redo)
 * @returns HistoryOperation ready to push to historyStore
 */
export function createGuideClearAllOperation(
  guides: CustomGuide[],
  addFn: (orientation: GuideOrientation, position: number) => void,
  clearFn: () => void
): HistoryOperation {
  return {
    type: GUIDE_CLEAR_ALL_TYPE,
    description: formatGuideClearAllDescription(guides.length),
    undo: () => {
      for (const guide of guides) {
        addFn(guide.orientation, guide.position);
      }
    },
    redo: () => clearFn(),
    timestamp: Date.now(),
  };
}
