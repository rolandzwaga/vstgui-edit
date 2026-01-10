/**
 * guidesStore API Contract
 *
 * This file defines the public API for the guides store.
 * Implementation must match these signatures.
 */

import type { CustomGuide, GuideCreationDrag, GuideRepositionDrag, GuideOrientation } from '../../../src/types/guides';

// ============================================================================
// Store Object
// ============================================================================

/**
 * Reactive store for custom guides state.
 * All getters are reactive (backed by SolidJS signals).
 */
export interface GuidesStoreAPI {
  /** All custom guides */
  readonly guides: CustomGuide[];

  /** Whether guides are visible on canvas */
  readonly isVisible: boolean;

  /** Whether snapping to guides is enabled (false when hidden) */
  readonly isSnapEnabled: boolean;

  /** Active creation drag state (null when not dragging from ruler) */
  readonly creationDrag: GuideCreationDrag | null;

  /** Active reposition drag state (null when not repositioning) */
  readonly repositionDrag: GuideRepositionDrag | null;

  /** Horizontal guides only (convenience accessor) */
  readonly horizontalGuides: CustomGuide[];

  /** Vertical guides only (convenience accessor) */
  readonly verticalGuides: CustomGuide[];

  /** Get a guide by ID */
  getGuideById(id: string): CustomGuide | undefined;
}

// ============================================================================
// Actions - Guide CRUD
// ============================================================================

/**
 * Add a guide at the specified position.
 * Returns null if a guide already exists at that exact position+orientation.
 * Does NOT push to history stack - caller must handle history if needed.
 */
export function addGuide(orientation: GuideOrientation, position: number): CustomGuide | null;

/**
 * Delete a guide by ID.
 * Returns the deleted guide, or null if not found.
 * Does NOT push to history stack - caller must handle history if needed.
 */
export function deleteGuide(id: string): CustomGuide | null;

/**
 * Reposition a guide to a new position.
 * Returns true if successful, false if guide not found or position unchanged.
 * Does NOT push to history stack - caller must handle history if needed.
 */
export function repositionGuide(id: string, newPosition: number): boolean;

/**
 * Clear all guides.
 * Returns the list of deleted guides (for undo).
 * Does NOT push to history stack - caller must handle history if needed.
 */
export function clearAllGuides(): CustomGuide[];

// ============================================================================
// Actions - Guide CRUD with History
// ============================================================================

/**
 * Add a guide and push operation to history stack.
 */
export function addGuideWithHistory(orientation: GuideOrientation, position: number): CustomGuide | null;

/**
 * Delete a guide and push operation to history stack.
 */
export function deleteGuideWithHistory(id: string): boolean;

/**
 * Reposition a guide and push operation to history stack.
 */
export function repositionGuideWithHistory(id: string, newPosition: number): boolean;

/**
 * Clear all guides and push operation to history stack.
 */
export function clearAllGuidesWithHistory(): void;

// ============================================================================
// Actions - Visibility & Snapping
// ============================================================================

/**
 * Toggle guide visibility (Ctrl+;).
 */
export function toggleGuidesVisibility(): void;

/**
 * Set guide visibility explicitly.
 */
export function setGuidesVisibility(visible: boolean): void;

/**
 * Toggle guide snapping.
 */
export function toggleGuidesSnap(): void;

/**
 * Set guide snapping explicitly.
 */
export function setGuidesSnap(enabled: boolean): void;

// ============================================================================
// Actions - Creation Drag (from ruler)
// ============================================================================

/**
 * Start guide creation drag from ruler.
 */
export function startCreationDrag(orientation: GuideOrientation, position: number): void;

/**
 * Update creation drag position.
 */
export function updateCreationDrag(position: number, isOverCanvas: boolean): void;

/**
 * Complete creation drag - creates guide if over canvas, otherwise cancels.
 * Returns the created guide or null if cancelled.
 */
export function completeCreationDrag(): CustomGuide | null;

/**
 * Cancel creation drag (Escape key).
 */
export function cancelCreationDrag(): void;

// ============================================================================
// Actions - Reposition Drag
// ============================================================================

/**
 * Start guide reposition drag.
 */
export function startRepositionDrag(guideId: string, currentPosition: number): void;

/**
 * Update reposition drag position.
 */
export function updateRepositionDrag(position: number, isOverRuler: boolean): void;

/**
 * Complete reposition drag - repositions or deletes guide.
 * Returns 'repositioned' | 'deleted' | 'cancelled'.
 */
export function completeRepositionDrag(): 'repositioned' | 'deleted' | 'cancelled';

/**
 * Cancel reposition drag (Escape key) - restores original position.
 */
export function cancelRepositionDrag(): void;

// ============================================================================
// Actions - Reset
// ============================================================================

/**
 * Reset store to initial state.
 * Called when template is unloaded.
 */
export function resetGuidesStore(): void;
