/**
 * History Operations for Alignment
 *
 * Functions for creating undo/redo operations from alignment results.
 */

import type { AlignmentResult, AlignmentType, DistributionDirection } from '../../types/alignment';
import type { Point } from '../../types/canvas';
import type { HistoryOperation } from '../../types/history';

/**
 * Generates description for alignment operation.
 *
 * @param count - Number of views aligned
 * @param type - Type of alignment
 * @param isParentAlign - Whether this is single-view align to parent
 * @returns Human-readable description
 */
export function getAlignmentDescription(
  count: number,
  type: AlignmentType,
  isParentAlign: boolean
): string {
  if (isParentAlign) {
    return `Align view to parent ${type}`;
  }
  return `Align ${count} views ${type}`;
}

/**
 * Generates description for distribution operation.
 *
 * @param count - Number of views distributed
 * @param direction - Distribution direction
 * @returns Human-readable description
 */
export function getDistributionDescription(
  count: number,
  direction: DistributionDirection
): string {
  return `Distribute ${count} views ${direction === 'horizontal' ? 'horizontally' : 'vertically'}`;
}

/**
 * Creates a history operation from alignment results.
 *
 * @param results - Array of alignment/distribution results
 * @param description - Human-readable description for undo UI
 * @param updateViewOrigin - Function to update view positions
 * @returns HistoryOperation for undo/redo stack
 */
export function createAlignmentOperation(
  results: AlignmentResult[],
  description: string,
  updateViewOrigin: (viewId: string, origin: Point) => void
): HistoryOperation {
  return {
    type: 'move',
    description,
    timestamp: Date.now(),
    undo: () => {
      for (const result of results) {
        updateViewOrigin(result.viewId, result.originalOrigin);
      }
    },
    redo: () => {
      for (const result of results) {
        updateViewOrigin(result.viewId, result.newOrigin);
      }
    },
  };
}
