/**
 * guideOperations API Contract
 *
 * This file defines the public API for guide CRUD operations.
 * These are pure functions that return new state without side effects.
 */

import type { CustomGuide, GuideOrientation } from '../../../src/types/guides';

// ============================================================================
// Guide Creation
// ============================================================================

/**
 * Generate a unique ID for a new guide.
 * Format: 'guide-{timestamp}-{random}'
 */
export function generateGuideId(): string;

/**
 * Create a new guide object.
 *
 * @param orientation - Guide orientation
 * @param position - Position in canvas coordinates
 * @returns New CustomGuide with generated ID
 */
export function createGuide(orientation: GuideOrientation, position: number): CustomGuide;

/**
 * Check if a guide already exists at the given position.
 *
 * @param guides - Current guides collection
 * @param orientation - Orientation to check
 * @param position - Position to check
 * @returns True if a guide exists at this position
 */
export function guideExistsAtPosition(
  guides: CustomGuide[],
  orientation: GuideOrientation,
  position: number
): boolean;

/**
 * Find a guide by position.
 *
 * @param guides - Current guides collection
 * @param orientation - Orientation to match
 * @param position - Position to match
 * @returns The guide if found, undefined otherwise
 */
export function findGuideByPosition(
  guides: CustomGuide[],
  orientation: GuideOrientation,
  position: number
): CustomGuide | undefined;

// ============================================================================
// Guide Modification
// ============================================================================

/**
 * Add a guide to the collection.
 * Returns null if duplicate position+orientation.
 *
 * @param guides - Current guides collection
 * @param orientation - New guide orientation
 * @param position - New guide position
 * @returns Tuple of [newGuides, createdGuide] or [guides, null] if duplicate
 */
export function addGuideToCollection(
  guides: CustomGuide[],
  orientation: GuideOrientation,
  position: number
): [CustomGuide[], CustomGuide | null];

/**
 * Remove a guide from the collection.
 *
 * @param guides - Current guides collection
 * @param id - ID of guide to remove
 * @returns Tuple of [newGuides, removedGuide] or [guides, null] if not found
 */
export function removeGuideFromCollection(
  guides: CustomGuide[],
  id: string
): [CustomGuide[], CustomGuide | null];

/**
 * Update a guide's position.
 *
 * @param guides - Current guides collection
 * @param id - ID of guide to update
 * @param newPosition - New position value
 * @returns Tuple of [newGuides, success] where success is false if not found or position unchanged
 */
export function updateGuidePosition(
  guides: CustomGuide[],
  id: string,
  newPosition: number
): [CustomGuide[], boolean];

// ============================================================================
// Validation
// ============================================================================

/**
 * Check if guide count is within limits.
 * Max 50 guides per FR-020 / SC-004.
 */
export const MAX_GUIDES = 50;

/**
 * Validate whether a new guide can be added.
 *
 * @param guides - Current guides collection
 * @param orientation - Proposed guide orientation
 * @param position - Proposed guide position
 * @returns Object with validation result and reason
 */
export function canAddGuide(
  guides: CustomGuide[],
  orientation: GuideOrientation,
  position: number
): {
  valid: boolean;
  reason: 'ok' | 'duplicate' | 'max-guides-exceeded';
};

// ============================================================================
// Utilities
// ============================================================================

/**
 * Round position to integer for pixel-perfect placement.
 */
export function roundGuidePosition(position: number): number;

/**
 * Get horizontal guides only.
 */
export function getHorizontalGuides(guides: CustomGuide[]): CustomGuide[];

/**
 * Get vertical guides only.
 */
export function getVerticalGuides(guides: CustomGuide[]): CustomGuide[];

/**
 * Sort guides by position for consistent rendering order.
 */
export function sortGuidesByPosition(guides: CustomGuide[]): CustomGuide[];
