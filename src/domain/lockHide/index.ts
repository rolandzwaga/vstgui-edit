/**
 * Lock/Hide Domain Module
 * Pure functions for lock and hide operations
 */

export {
  areAllLocked,
  calculateLockStateInfo,
  filterUnlockedViews,
  getLockMenuItem,
  isAnyLocked,
} from './lockOperations';

export {
  calculateHideStateInfo,
  filterVisibleViews,
  getAllHiddenIds,
  getHideMenuItem,
  shouldViewBeHidden,
} from './hideOperations';

export {
  createHideOperation,
  createLockOperation,
  createShowAllOperation,
  createUnlockOperation,
  formatHideDescription,
  formatLockDescription,
  formatShowAllDescription,
  formatUnlockDescription,
} from './historyOperations';
