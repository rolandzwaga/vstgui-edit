/**
 * Lock/Hide API Contract
 * Type definitions and interfaces for the lock/hide feature
 *
 * This file defines the public API contract for the lock/hide feature.
 * Implementation must conform to these interfaces.
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Complete state for lock/hide feature.
 * Editor-only state - NOT persisted to uidesc files.
 */
export interface LockHideState {
  /** Set of view IDs that are currently locked */
  lockedIds: Set<string>;
  /** Set of view IDs that are currently hidden */
  hiddenIds: Set<string>;
}

/**
 * Lock state information for a selection.
 * Used for determining context menu display.
 */
export interface LockStateInfo {
  /** All selected views are locked */
  allLocked: boolean;
  /** At least one selected view is locked */
  anyLocked: boolean;
  /** None of the selected views are locked */
  noneLocked: boolean;
}

/**
 * Hide state information for a selection.
 * Used for determining context menu display.
 */
export interface HideStateInfo {
  /** All selected views are hidden */
  allHidden: boolean;
  /** At least one selected view is hidden */
  anyHidden: boolean;
  /** None of the selected views are hidden */
  noneHidden: boolean;
}

// =============================================================================
// STORE API
// =============================================================================

/**
 * Lock/Hide Store interface.
 * Reactive store for managing locked and hidden view state.
 */
export interface LockHideStoreAPI {
  // --- Reactive Getters ---

  /** Set of locked view IDs (reactive) */
  readonly lockedIds: Set<string>;

  /** Set of hidden view IDs (reactive) */
  readonly hiddenIds: Set<string>;
}

/**
 * Lock/Hide Store Actions
 */
export interface LockHideActions {
  // --- Query Functions ---

  /**
   * Check if a specific view is locked.
   * @param viewId - The view ID to check
   * @returns true if the view is locked
   */
  isLocked(viewId: string): boolean;

  /**
   * Check if a specific view is hidden.
   * @param viewId - The view ID to check
   * @returns true if the view is hidden
   */
  isHidden(viewId: string): boolean;

  /**
   * Check if a view or any of its ancestors is hidden.
   * @param viewId - The view ID to check
   * @param getParentId - Function to get parent ID
   * @returns true if view or any ancestor is hidden
   */
  isViewOrAncestorHidden(
    viewId: string,
    getParentId: (id: string) => string | null
  ): boolean;

  /**
   * Get lock state info for a collection of view IDs.
   * @param viewIds - Set of view IDs to check
   * @returns Lock state information
   */
  getLockStateInfo(viewIds: Set<string>): LockStateInfo;

  /**
   * Get hide state info for a collection of view IDs.
   * @param viewIds - Set of view IDs to check
   * @returns Hide state information
   */
  getHideStateInfo(viewIds: Set<string>): HideStateInfo;

  // --- Mutation Functions (without history) ---

  /**
   * Lock specified views.
   * @param viewIds - Array of view IDs to lock
   * @returns Map of viewId -> previous lock state
   */
  lockViews(viewIds: string[]): Map<string, boolean>;

  /**
   * Unlock specified views.
   * @param viewIds - Array of view IDs to unlock
   * @returns Map of viewId -> previous lock state
   */
  unlockViews(viewIds: string[]): Map<string, boolean>;

  /**
   * Hide specified views.
   * @param viewIds - Array of view IDs to hide
   * @returns Map of viewId -> previous hide state
   */
  hideViews(viewIds: string[]): Map<string, boolean>;

  /**
   * Show specified views.
   * @param viewIds - Array of view IDs to show
   * @returns Map of viewId -> previous hide state
   */
  showViews(viewIds: string[]): Map<string, boolean>;

  /**
   * Show all hidden views.
   * @returns Array of view IDs that were shown
   */
  showAllViews(): string[];

  // --- History-aware Functions ---

  /**
   * Lock selected views with undo/redo support.
   * @param selectedIds - Set of selected view IDs
   */
  lockSelectedWithHistory(selectedIds: Set<string>): void;

  /**
   * Unlock selected views with undo/redo support.
   * @param selectedIds - Set of selected view IDs
   */
  unlockSelectedWithHistory(selectedIds: Set<string>): void;

  /**
   * Hide selected views with undo/redo support.
   * @param selectedIds - Set of selected view IDs
   */
  hideSelectedWithHistory(selectedIds: Set<string>): void;

  /**
   * Show all hidden views with undo/redo support.
   */
  showAllWithHistory(): void;

  /**
   * Toggle hide state for selected views with undo/redo support.
   * Single selection: toggles hide state
   * Multi-selection: hides all if any visible, shows all if all hidden
   * @param selectedIds - Set of selected view IDs
   */
  toggleHideSelectedWithHistory(selectedIds: Set<string>): void;

  // --- Reset ---

  /**
   * Reset store to initial state.
   * Called when loading a new document.
   */
  resetLockHideStore(): void;
}

// =============================================================================
// DOMAIN OPERATIONS
// =============================================================================

/**
 * Lock operations - pure functions for lock/unlock logic.
 */
export interface LockOperationsAPI {
  /**
   * Calculate lock state info for a set of view IDs.
   */
  calculateLockStateInfo(
    viewIds: Set<string>,
    isLocked: (id: string) => boolean
  ): LockStateInfo;

  /**
   * Filter out locked views from a list of view IDs.
   */
  filterUnlockedViews(
    viewIds: string[],
    isLocked: (id: string) => boolean
  ): string[];

  /**
   * Check if all views in a set are locked.
   */
  areAllLocked(
    viewIds: Set<string>,
    isLocked: (id: string) => boolean
  ): boolean;

  /**
   * Check if any view in a set is locked.
   */
  isAnyLocked(
    viewIds: Set<string>,
    isLocked: (id: string) => boolean
  ): boolean;
}

/**
 * Hide operations - pure functions for hide/show logic.
 */
export interface HideOperationsAPI {
  /**
   * Calculate hide state info for a set of view IDs.
   */
  calculateHideStateInfo(
    viewIds: Set<string>,
    isHidden: (id: string) => boolean
  ): HideStateInfo;

  /**
   * Check if a view should be hidden (direct or via ancestor).
   */
  shouldViewBeHidden(
    viewId: string,
    isHidden: (id: string) => boolean,
    getParentId: (id: string) => string | null
  ): boolean;

  /**
   * Filter out hidden views from a list.
   */
  filterVisibleViews(
    viewIds: string[],
    isHidden: (id: string) => boolean,
    getParentId: (id: string) => string | null
  ): string[];
}

// =============================================================================
// HISTORY OPERATIONS
// =============================================================================

/**
 * History operation types for lock/hide.
 */
export type LockHideHistoryType = 'lock' | 'unlock' | 'hide' | 'show-all';

/**
 * History operation factory functions.
 */
export interface HistoryOperationsAPI {
  /**
   * Create lock operation for undo/redo.
   */
  createLockOperation(
    viewIds: string[],
    previousStates: Map<string, boolean>,
    lockFn: (ids: string[]) => void,
    unlockFn: (ids: string[]) => void
  ): {
    type: 'lock';
    description: string;
    undo: () => void;
    redo: () => void;
    timestamp: number;
  };

  /**
   * Create unlock operation for undo/redo.
   */
  createUnlockOperation(
    viewIds: string[],
    previousStates: Map<string, boolean>,
    lockFn: (ids: string[]) => void,
    unlockFn: (ids: string[]) => void
  ): {
    type: 'unlock';
    description: string;
    undo: () => void;
    redo: () => void;
    timestamp: number;
  };

  /**
   * Create hide operation for undo/redo.
   */
  createHideOperation(
    viewIds: string[],
    previousStates: Map<string, boolean>,
    hideFn: (ids: string[]) => void,
    showFn: (ids: string[]) => void
  ): {
    type: 'hide';
    description: string;
    undo: () => void;
    redo: () => void;
    timestamp: number;
  };

  /**
   * Create show-all operation for undo/redo.
   */
  createShowAllOperation(
    viewIds: string[],
    hideFn: (ids: string[]) => void,
    showAllFn: () => void
  ): {
    type: 'show-all';
    description: string;
    undo: () => void;
    redo: () => void;
    timestamp: number;
  };

  /**
   * Format lock operation description.
   */
  formatLockDescription(count: number): string;

  /**
   * Format unlock operation description.
   */
  formatUnlockDescription(count: number): string;

  /**
   * Format hide operation description.
   */
  formatHideDescription(count: number): string;

  /**
   * Format show-all operation description.
   */
  formatShowAllDescription(count: number): string;
}

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

/**
 * Keyboard shortcuts for lock/hide feature.
 * All shortcuts use Ctrl (or Cmd on Mac) modifier.
 */
export const LOCK_HIDE_SHORTCUTS = {
  /** Lock selected views */
  LOCK: { key: 'l', ctrl: true, shift: false },
  /** Unlock selected views */
  UNLOCK: { key: 'l', ctrl: true, shift: true },
  /** Hide selected views (toggle for single selection) */
  HIDE: { key: 'h', ctrl: true, shift: false },
  /** Show all hidden views */
  SHOW_ALL: { key: 'h', ctrl: true, shift: true },
} as const;

// =============================================================================
// COMPONENT PROPS
// =============================================================================

/**
 * Props for SelectionOverlay component (extended).
 */
export interface SelectionOverlayPropsExtended {
  view: {
    id: string;
    absoluteX: number;
    absoluteY: number;
    width: number;
    height: number;
    className: string;
  };
  onResizeStart?: (handle: string, view: unknown) => void;
  /** Whether this view is locked (hides resize handles) */
  isLocked?: boolean;
}

/**
 * Props for LockIndicator component.
 */
export interface LockIndicatorProps {
  /** X position (top-right corner of view) */
  x: number;
  /** Y position */
  y: number;
  /** Size of the indicator in pixels (default: 12) */
  size?: number;
}

// =============================================================================
// CONTEXT MENU
// =============================================================================

/**
 * Context menu item for lock/unlock.
 * Display logic based on FR-023:
 * - Show "Lock" if any view is unlocked (action locks all)
 * - Show "Unlock" only if all views are locked
 */
export interface LockMenuItem {
  /** Label to display */
  label: 'Lock' | 'Unlock';
  /** Action to perform */
  action: 'lock' | 'unlock';
  /** Keyboard shortcut hint */
  shortcut: string;
  /** Whether item is enabled */
  enabled: boolean;
}

/**
 * Context menu item for hide/show.
 * Display logic based on FR-024:
 * - Show "Hide" if any view is visible (action hides all)
 * - Show "Show" only if all views are hidden
 */
export interface HideMenuItem {
  /** Label to display */
  label: 'Hide' | 'Show';
  /** Action to perform */
  action: 'hide' | 'show';
  /** Keyboard shortcut hint */
  shortcut: string;
  /** Whether item is enabled */
  enabled: boolean;
}

/**
 * Get lock menu item configuration based on selection state.
 */
export function getLockMenuItem(stateInfo: LockStateInfo): LockMenuItem {
  if (stateInfo.allLocked) {
    return {
      label: 'Unlock',
      action: 'unlock',
      shortcut: 'Ctrl+Shift+L',
      enabled: true,
    };
  }
  return {
    label: 'Lock',
    action: 'lock',
    shortcut: 'Ctrl+L',
    enabled: true,
  };
}

/**
 * Get hide menu item configuration based on selection state.
 */
export function getHideMenuItem(stateInfo: HideStateInfo): HideMenuItem {
  if (stateInfo.allHidden) {
    return {
      label: 'Show',
      action: 'show',
      shortcut: 'Ctrl+H',
      enabled: true,
    };
  }
  return {
    label: 'Hide',
    action: 'hide',
    shortcut: 'Ctrl+H',
    enabled: true,
  };
}
