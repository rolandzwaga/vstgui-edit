/**
 * Guides Store
 * State management for custom guide lines
 */

import { createSignal } from 'solid-js';
import {
  addGuideToCollection,
  getHorizontalGuides,
  getVerticalGuides,
  removeGuideFromCollection,
  updateGuidePosition,
} from '../domain/guides/guideOperations';
import {
  createGuideClearAllOperation,
  createGuideCreateOperation,
  createGuideDeleteOperation,
  createGuideRepositionOperation,
} from '../domain/guides/historyOperations';
import type {
  CustomGuide,
  GuideCreationDrag,
  GuideOrientation,
  GuideRepositionDrag,
} from '../types/guides';
import { pushOperation } from './historyStore';

// Signals for core state
const [guides, setGuides] = createSignal<CustomGuide[]>([]);
const [isVisible, setIsVisible] = createSignal<boolean>(true);
const [isSnapEnabledSignal, setIsSnapEnabledSignal] = createSignal<boolean>(true);

// Signals for drag states
const [creationDrag, setCreationDrag] = createSignal<GuideCreationDrag | null>(null);
const [repositionDrag, setRepositionDrag] = createSignal<GuideRepositionDrag | null>(null);

/**
 * Reactive store for custom guides state.
 */
export const guidesStore = {
  get guides(): CustomGuide[] {
    return guides();
  },
  get isVisible(): boolean {
    return isVisible();
  },
  /** isSnapEnabled returns false when guides are hidden (FR-013) */
  get isSnapEnabled(): boolean {
    return isVisible() && isSnapEnabledSignal();
  },
  get creationDrag(): GuideCreationDrag | null {
    return creationDrag();
  },
  get repositionDrag(): GuideRepositionDrag | null {
    return repositionDrag();
  },
  get horizontalGuides(): CustomGuide[] {
    return getHorizontalGuides(guides());
  },
  get verticalGuides(): CustomGuide[] {
    return getVerticalGuides(guides());
  },
  getGuideById(id: string): CustomGuide | undefined {
    return guides().find(g => g.id === id);
  },
};

// ============================================================================
// CRUD Actions (without history)
// ============================================================================

/**
 * Add a guide at the specified position.
 * Returns null if a guide already exists at that exact position+orientation.
 */
export function addGuide(orientation: GuideOrientation, position: number): CustomGuide | null {
  const current = guides();
  const [newGuides, created] = addGuideToCollection(current, orientation, position);
  if (created) {
    setGuides(newGuides);
  }
  return created;
}

/**
 * Delete a guide by ID.
 * Returns the deleted guide, or null if not found.
 */
export function deleteGuide(id: string): CustomGuide | null {
  const current = guides();
  const [newGuides, removed] = removeGuideFromCollection(current, id);
  if (removed) {
    setGuides(newGuides);
  }
  return removed;
}

/**
 * Reposition a guide to a new position.
 * Returns true if successful, false if guide not found or position unchanged.
 */
export function repositionGuide(id: string, newPosition: number): boolean {
  const current = guides();
  const [newGuides, success] = updateGuidePosition(current, id, newPosition);
  if (success) {
    setGuides(newGuides);
  }
  return success;
}

/**
 * Clear all guides.
 * Returns the list of deleted guides (for undo).
 */
export function clearAllGuides(): CustomGuide[] {
  const current = guides();
  setGuides([]);
  return current;
}

// ============================================================================
// CRUD Actions (with history)
// ============================================================================

/**
 * Add a guide and push operation to history stack.
 */
export function addGuideWithHistory(
  orientation: GuideOrientation,
  position: number
): CustomGuide | null {
  const created = addGuide(orientation, position);
  if (created) {
    const operation = createGuideCreateOperation(created, addGuide, deleteGuide);
    pushOperation(operation);
  }
  return created;
}

/**
 * Delete a guide and push operation to history stack.
 */
export function deleteGuideWithHistory(id: string): boolean {
  const guide = guidesStore.getGuideById(id);
  if (!guide) {
    return false;
  }

  const deleted = deleteGuide(id);
  if (deleted) {
    const operation = createGuideDeleteOperation(deleted, addGuide, deleteGuide);
    pushOperation(operation);
  }
  return deleted !== null;
}

/**
 * Reposition a guide and push operation to history stack.
 */
export function repositionGuideWithHistory(id: string, newPosition: number): boolean {
  const guide = guidesStore.getGuideById(id);
  if (!guide) {
    return false;
  }

  const oldPosition = guide.position;
  const success = repositionGuide(id, newPosition);
  if (success) {
    // Get the updated guide for the operation
    const updatedGuide = guidesStore.getGuideById(id)!;
    const operation = createGuideRepositionOperation(
      updatedGuide,
      oldPosition,
      newPosition,
      repositionGuide
    );
    pushOperation(operation);
  }
  return success;
}

/**
 * Clear all guides and push operation to history stack.
 */
export function clearAllGuidesWithHistory(): void {
  const current = guides();
  if (current.length === 0) {
    return;
  }

  const cleared = clearAllGuides();
  const operation = createGuideClearAllOperation(cleared, addGuide, clearAllGuides);
  pushOperation(operation);
}

// ============================================================================
// Visibility & Snapping
// ============================================================================

/**
 * Toggle guide visibility (Ctrl+;).
 */
export function toggleGuidesVisibility(): void {
  setIsVisible(current => !current);
}

/**
 * Set guide visibility explicitly.
 */
export function setGuidesVisibility(visible: boolean): void {
  setIsVisible(visible);
}

/**
 * Toggle guide snapping.
 */
export function toggleGuidesSnap(): void {
  setIsSnapEnabledSignal(current => !current);
}

/**
 * Set guide snapping explicitly.
 */
export function setGuidesSnap(enabled: boolean): void {
  setIsSnapEnabledSignal(enabled);
}

// ============================================================================
// Creation Drag (from ruler)
// ============================================================================

/**
 * Start guide creation drag from ruler.
 */
export function startCreationDrag(orientation: GuideOrientation, position: number): void {
  setCreationDrag({
    orientation,
    currentPosition: position,
    isOverCanvas: false,
  });
}

/**
 * Update creation drag position.
 */
export function updateCreationDrag(position: number, isOverCanvas: boolean): void {
  const current = creationDrag();
  if (!current) {
    return;
  }

  setCreationDrag({
    ...current,
    currentPosition: position,
    isOverCanvas,
  });
}

/**
 * Complete creation drag - creates guide if over canvas, otherwise cancels.
 * Returns the created guide or null if cancelled.
 */
export function completeCreationDrag(): CustomGuide | null {
  const current = creationDrag();
  if (!current) {
    return null;
  }

  setCreationDrag(null);

  if (current.isOverCanvas) {
    return addGuideWithHistory(current.orientation, current.currentPosition);
  }

  return null;
}

/**
 * Cancel creation drag (Escape key).
 */
export function cancelCreationDrag(): void {
  setCreationDrag(null);
}

// ============================================================================
// Reposition Drag
// ============================================================================

/**
 * Start guide reposition drag.
 */
export function startRepositionDrag(guideId: string, currentPosition: number): void {
  const guide = guidesStore.getGuideById(guideId);
  if (!guide) {
    return;
  }

  setRepositionDrag({
    guideId,
    originalPosition: guide.position,
    currentPosition,
    isOverRuler: false,
  });
}

/**
 * Update reposition drag position.
 */
export function updateRepositionDrag(position: number, isOverRuler: boolean): void {
  const current = repositionDrag();
  if (!current) {
    return;
  }

  setRepositionDrag({
    ...current,
    currentPosition: position,
    isOverRuler,
  });
}

/**
 * Complete reposition drag - repositions or deletes guide.
 * Returns 'repositioned' | 'deleted' | 'cancelled'.
 */
export function completeRepositionDrag(): 'repositioned' | 'deleted' | 'cancelled' {
  const current = repositionDrag();
  if (!current) {
    return 'cancelled';
  }

  const guide = guidesStore.getGuideById(current.guideId);
  setRepositionDrag(null);

  if (!guide) {
    return 'cancelled';
  }

  if (current.isOverRuler) {
    // Delete the guide
    deleteGuideWithHistory(current.guideId);
    return 'deleted';
  }

  // Reposition the guide
  if (current.currentPosition !== current.originalPosition) {
    repositionGuideWithHistory(current.guideId, current.currentPosition);
  }
  return 'repositioned';
}

/**
 * Cancel reposition drag (Escape key) - restores original position.
 */
export function cancelRepositionDrag(): void {
  const current = repositionDrag();
  if (!current) {
    return;
  }

  // Restore original position if it was changed during drag
  repositionGuide(current.guideId, current.originalPosition);
  setRepositionDrag(null);
}

// ============================================================================
// Reset
// ============================================================================

/**
 * Reset store to initial state.
 * Called when template is unloaded.
 */
export function resetGuidesStore(): void {
  setGuides([]);
  setIsVisible(true);
  setIsSnapEnabledSignal(true);
  setCreationDrag(null);
  setRepositionDrag(null);
}
