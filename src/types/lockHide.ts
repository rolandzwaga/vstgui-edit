/**
 * Lock and Hide Types
 * Types for managing locked and hidden view state in the editor
 */

/**
 * Complete state for lock/hide feature.
 * This is editor-only state - NOT persisted to uidesc files.
 */
export interface LockHideState {
  /** Set of view IDs that are currently locked */
  lockedIds: Set<string>;

  /** Set of view IDs that are currently hidden */
  hiddenIds: Set<string>;
}

/**
 * Data for a lock operation (for history).
 */
export interface LockOperationData {
  /** View IDs that were locked */
  viewIds: string[];

  /** Previous lock state for each view (true = was locked, false = was unlocked) */
  previousStates: Map<string, boolean>;
}

/**
 * Data for an unlock operation (for history).
 */
export interface UnlockOperationData {
  /** View IDs that were unlocked */
  viewIds: string[];

  /** Previous lock state for each view (true = was locked, false = was unlocked) */
  previousStates: Map<string, boolean>;
}

/**
 * Data for a hide operation (for history).
 */
export interface HideOperationData {
  /** View IDs that were hidden */
  viewIds: string[];

  /** Previous hide state for each view (true = was hidden, false = was visible) */
  previousStates: Map<string, boolean>;
}

/**
 * Data for a show-all operation (for history).
 */
export interface ShowAllOperationData {
  /** All view IDs that were shown */
  viewIds: string[];
}

/**
 * Result of checking lock state for multi-selection.
 * Used to determine context menu display.
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
 * Result of checking hide state for multi-selection.
 * Used to determine context menu display.
 */
export interface HideStateInfo {
  /** All selected views are hidden */
  allHidden: boolean;

  /** At least one selected view is hidden */
  anyHidden: boolean;

  /** None of the selected views are hidden */
  noneHidden: boolean;
}

/**
 * Menu item info for context menu rendering.
 */
export interface LockMenuItemInfo {
  /** Label to display */
  label: string;

  /** Action to perform */
  action: 'lock' | 'unlock';

  /** Keyboard shortcut hint */
  shortcut: string;
}

/**
 * Menu item info for hide context menu.
 */
export interface HideMenuItemInfo {
  /** Label to display */
  label: string;

  /** Action to perform */
  action: 'hide' | 'show';

  /** Keyboard shortcut hint */
  shortcut: string;
}
