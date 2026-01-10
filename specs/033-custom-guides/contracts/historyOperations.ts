/**
 * historyOperations API Contract (Guide-specific)
 *
 * This file defines the public API for creating guide-related history operations.
 * These operations integrate with the existing historyStore.
 */

import type { HistoryOperation } from '../../../src/types/history';
import type { CustomGuide } from '../../../src/types/guides';

// ============================================================================
// History Operation Factories
// ============================================================================

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
  addFn: (orientation: CustomGuide['orientation'], position: number) => void,
  deleteFn: (id: string) => void
): HistoryOperation;

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
  addFn: (orientation: CustomGuide['orientation'], position: number) => void,
  deleteFn: (id: string) => void
): HistoryOperation;

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
): HistoryOperation;

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
  addFn: (orientation: CustomGuide['orientation'], position: number) => void,
  clearFn: () => void
): HistoryOperation;

// ============================================================================
// History Operation Type Constants
// ============================================================================

/**
 * History operation type for guide creation.
 * Must be added to HistoryOperation.type union in src/types/history.ts
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

// ============================================================================
// Description Formatters
// ============================================================================

/**
 * Format description for guide create operation.
 */
export function formatGuideCreateDescription(guide: CustomGuide): string;

/**
 * Format description for guide delete operation.
 */
export function formatGuideDeleteDescription(guide: CustomGuide): string;

/**
 * Format description for guide reposition operation.
 */
export function formatGuideRepositionDescription(
  guide: CustomGuide,
  oldPosition: number,
  newPosition: number
): string;

/**
 * Format description for clear all guides operation.
 */
export function formatGuideClearAllDescription(count: number): string;
