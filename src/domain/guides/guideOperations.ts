/**
 * Guide Operations
 * Pure domain functions for guide CRUD operations
 */

import type { CustomGuide, GuideOrientation } from '../../types/guides';

/**
 * Maximum number of simultaneous guides supported.
 * Per FR-020 / SC-004.
 */
export const MAX_GUIDES = 50;

/**
 * Hit testing tolerance in pixels (either side of guide line).
 */
export const GUIDE_HIT_TOLERANCE = 4;

/**
 * Generate a unique ID for a new guide.
 * Format: 'guide-{timestamp}-{random}'
 */
export function generateGuideId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `guide-${timestamp}-${random}`;
}

/**
 * Round position to integer for pixel-perfect placement.
 */
export function roundGuidePosition(position: number): number {
  return Math.round(position);
}

/**
 * Create a new guide object.
 *
 * @param orientation - Guide orientation
 * @param position - Position in canvas coordinates
 * @returns New CustomGuide with generated ID
 */
export function createGuide(orientation: GuideOrientation, position: number): CustomGuide {
  return {
    id: generateGuideId(),
    orientation,
    position: roundGuidePosition(position),
  };
}

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
): boolean {
  const roundedPosition = roundGuidePosition(position);
  return guides.some(
    (g) => g.orientation === orientation && g.position === roundedPosition
  );
}

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
): CustomGuide | undefined {
  const roundedPosition = roundGuidePosition(position);
  return guides.find(
    (g) => g.orientation === orientation && g.position === roundedPosition
  );
}

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
): [CustomGuide[], CustomGuide | null] {
  if (guideExistsAtPosition(guides, orientation, position)) {
    return [guides, null];
  }

  const newGuide = createGuide(orientation, position);
  return [[...guides, newGuide], newGuide];
}

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
): [CustomGuide[], CustomGuide | null] {
  const guide = guides.find((g) => g.id === id);
  if (!guide) {
    return [guides, null];
  }

  return [guides.filter((g) => g.id !== id), guide];
}

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
): [CustomGuide[], boolean] {
  const roundedPosition = roundGuidePosition(newPosition);
  const guide = guides.find((g) => g.id === id);

  if (!guide) {
    return [guides, false];
  }

  if (guide.position === roundedPosition) {
    return [guides, false];
  }

  const newGuides = guides.map((g) =>
    g.id === id ? { ...g, position: roundedPosition } : g
  );

  return [newGuides, true];
}

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
} {
  if (guides.length >= MAX_GUIDES) {
    return { valid: false, reason: 'max-guides-exceeded' };
  }

  if (guideExistsAtPosition(guides, orientation, position)) {
    return { valid: false, reason: 'duplicate' };
  }

  return { valid: true, reason: 'ok' };
}

/**
 * Get horizontal guides only.
 */
export function getHorizontalGuides(guides: CustomGuide[]): CustomGuide[] {
  return guides.filter((g) => g.orientation === 'horizontal');
}

/**
 * Get vertical guides only.
 */
export function getVerticalGuides(guides: CustomGuide[]): CustomGuide[] {
  return guides.filter((g) => g.orientation === 'vertical');
}

/**
 * Sort guides by position for consistent rendering order.
 */
export function sortGuidesByPosition(guides: CustomGuide[]): CustomGuide[] {
  return [...guides].sort((a, b) => a.position - b.position);
}
