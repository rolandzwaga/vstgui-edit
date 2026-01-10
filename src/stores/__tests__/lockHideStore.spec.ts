import { describe, expect, test } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  getHideStateInfo,
  getLockStateInfo,
  hideViews,
  isHidden,
  isLocked,
  isViewOrAncestorHidden,
  lockHideStore,
  lockViews,
  resetLockHideStore,
  showAllViews,
  showViews,
  toggleHide,
  toggleLock,
  unlockViews,
} from '../lockHideStore';

describe('lockHideStore', () => {
  describe('initial state', () => {
    test('lockedIds is empty by default', () => {
      testInRoot(() => {
        resetLockHideStore();
        expect(lockHideStore.lockedIds.size).toBe(0);
      });
    });

    test('hiddenIds is empty by default', () => {
      testInRoot(() => {
        resetLockHideStore();
        expect(lockHideStore.hiddenIds.size).toBe(0);
      });
    });
  });

  describe('isLocked', () => {
    test('returns false for view that is not locked', () => {
      testInRoot(() => {
        resetLockHideStore();
        expect(isLocked('view-1')).toBe(false);
      });
    });

    test('returns true for view that is locked', () => {
      testInRoot(() => {
        resetLockHideStore();
        lockViews(['view-1']);
        expect(isLocked('view-1')).toBe(true);
      });
    });

    test('returns false for different view when one is locked', () => {
      testInRoot(() => {
        resetLockHideStore();
        lockViews(['view-1']);
        expect(isLocked('view-2')).toBe(false);
      });
    });
  });

  describe('isHidden', () => {
    test('returns false for view that is not hidden', () => {
      testInRoot(() => {
        resetLockHideStore();
        expect(isHidden('view-1')).toBe(false);
      });
    });

    test('returns true for view that is hidden', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['view-1']);
        expect(isHidden('view-1')).toBe(true);
      });
    });

    test('returns false for different view when one is hidden', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['view-1']);
        expect(isHidden('view-2')).toBe(false);
      });
    });
  });

  describe('lockViews', () => {
    test('locks a single view', () => {
      testInRoot(() => {
        resetLockHideStore();
        lockViews(['view-1']);
        expect(lockHideStore.lockedIds.has('view-1')).toBe(true);
      });
    });

    test('locks multiple views', () => {
      testInRoot(() => {
        resetLockHideStore();
        lockViews(['view-1', 'view-2', 'view-3']);
        expect(lockHideStore.lockedIds.has('view-1')).toBe(true);
        expect(lockHideStore.lockedIds.has('view-2')).toBe(true);
        expect(lockHideStore.lockedIds.has('view-3')).toBe(true);
      });
    });

    test('returns previous states for all views', () => {
      testInRoot(() => {
        resetLockHideStore();
        lockViews(['view-1']);
        const previousStates = lockViews(['view-1', 'view-2']);
        expect(previousStates.get('view-1')).toBe(true); // was locked
        expect(previousStates.get('view-2')).toBe(false); // was not locked
      });
    });

    test('is idempotent for already locked views', () => {
      testInRoot(() => {
        resetLockHideStore();
        lockViews(['view-1']);
        lockViews(['view-1']);
        expect(lockHideStore.lockedIds.size).toBe(1);
        expect(lockHideStore.lockedIds.has('view-1')).toBe(true);
      });
    });
  });

  describe('unlockViews', () => {
    test('unlocks a single view', () => {
      testInRoot(() => {
        resetLockHideStore();
        lockViews(['view-1']);
        unlockViews(['view-1']);
        expect(lockHideStore.lockedIds.has('view-1')).toBe(false);
      });
    });

    test('unlocks multiple views', () => {
      testInRoot(() => {
        resetLockHideStore();
        lockViews(['view-1', 'view-2', 'view-3']);
        unlockViews(['view-1', 'view-3']);
        expect(lockHideStore.lockedIds.has('view-1')).toBe(false);
        expect(lockHideStore.lockedIds.has('view-2')).toBe(true);
        expect(lockHideStore.lockedIds.has('view-3')).toBe(false);
      });
    });

    test('returns previous states for all views', () => {
      testInRoot(() => {
        resetLockHideStore();
        lockViews(['view-1']);
        const previousStates = unlockViews(['view-1', 'view-2']);
        expect(previousStates.get('view-1')).toBe(true); // was locked
        expect(previousStates.get('view-2')).toBe(false); // was not locked
      });
    });

    test('is safe to call on unlocked views', () => {
      testInRoot(() => {
        resetLockHideStore();
        unlockViews(['view-1']);
        expect(lockHideStore.lockedIds.size).toBe(0);
      });
    });
  });

  describe('hideViews', () => {
    test('hides a single view', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['view-1']);
        expect(lockHideStore.hiddenIds.has('view-1')).toBe(true);
      });
    });

    test('hides multiple views', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['view-1', 'view-2', 'view-3']);
        expect(lockHideStore.hiddenIds.has('view-1')).toBe(true);
        expect(lockHideStore.hiddenIds.has('view-2')).toBe(true);
        expect(lockHideStore.hiddenIds.has('view-3')).toBe(true);
      });
    });

    test('returns previous states for all views', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['view-1']);
        const previousStates = hideViews(['view-1', 'view-2']);
        expect(previousStates.get('view-1')).toBe(true); // was hidden
        expect(previousStates.get('view-2')).toBe(false); // was not hidden
      });
    });

    test('is idempotent for already hidden views', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['view-1']);
        hideViews(['view-1']);
        expect(lockHideStore.hiddenIds.size).toBe(1);
        expect(lockHideStore.hiddenIds.has('view-1')).toBe(true);
      });
    });
  });

  describe('showViews', () => {
    test('shows a single hidden view', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['view-1']);
        showViews(['view-1']);
        expect(lockHideStore.hiddenIds.has('view-1')).toBe(false);
      });
    });

    test('shows multiple hidden views', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['view-1', 'view-2', 'view-3']);
        showViews(['view-1', 'view-3']);
        expect(lockHideStore.hiddenIds.has('view-1')).toBe(false);
        expect(lockHideStore.hiddenIds.has('view-2')).toBe(true);
        expect(lockHideStore.hiddenIds.has('view-3')).toBe(false);
      });
    });

    test('returns previous states for all views', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['view-1']);
        const previousStates = showViews(['view-1', 'view-2']);
        expect(previousStates.get('view-1')).toBe(true); // was hidden
        expect(previousStates.get('view-2')).toBe(false); // was not hidden
      });
    });
  });

  describe('showAllViews', () => {
    test('shows all hidden views', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['view-1', 'view-2', 'view-3']);
        showAllViews();
        expect(lockHideStore.hiddenIds.size).toBe(0);
      });
    });

    test('returns list of views that were shown', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['view-1', 'view-2']);
        const shownIds = showAllViews();
        expect(shownIds).toHaveLength(2);
        expect(shownIds).toContain('view-1');
        expect(shownIds).toContain('view-2');
      });
    });

    test('returns empty array when no views are hidden', () => {
      testInRoot(() => {
        resetLockHideStore();
        const shownIds = showAllViews();
        expect(shownIds).toHaveLength(0);
      });
    });
  });

  describe('toggleLock', () => {
    test('locks unlocked view and returns true', () => {
      testInRoot(() => {
        resetLockHideStore();
        const newState = toggleLock('view-1');
        expect(newState).toBe(true);
        expect(isLocked('view-1')).toBe(true);
      });
    });

    test('unlocks locked view and returns false', () => {
      testInRoot(() => {
        resetLockHideStore();
        lockViews(['view-1']);
        const newState = toggleLock('view-1');
        expect(newState).toBe(false);
        expect(isLocked('view-1')).toBe(false);
      });
    });

    test('handles multiple toggles', () => {
      testInRoot(() => {
        resetLockHideStore();
        toggleLock('view-1'); // lock
        toggleLock('view-1'); // unlock
        toggleLock('view-1'); // lock
        expect(isLocked('view-1')).toBe(true);
      });
    });
  });

  describe('toggleHide', () => {
    test('hides visible view and returns true', () => {
      testInRoot(() => {
        resetLockHideStore();
        const newState = toggleHide('view-1');
        expect(newState).toBe(true);
        expect(isHidden('view-1')).toBe(true);
      });
    });

    test('shows hidden view and returns false', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['view-1']);
        const newState = toggleHide('view-1');
        expect(newState).toBe(false);
        expect(isHidden('view-1')).toBe(false);
      });
    });

    test('handles multiple toggles', () => {
      testInRoot(() => {
        resetLockHideStore();
        toggleHide('view-1'); // hide
        toggleHide('view-1'); // show
        toggleHide('view-1'); // hide
        expect(isHidden('view-1')).toBe(true);
      });
    });
  });

  describe('isViewOrAncestorHidden', () => {
    const getParentId = (id: string): string | null => {
      const hierarchy: Record<string, string | null> = {
        'child-1': 'parent-1',
        'child-2': 'parent-1',
        'grandchild-1': 'child-1',
        'parent-1': 'root',
        root: null,
      };
      return hierarchy[id] ?? null;
    };

    test('returns false when view and ancestors are visible', () => {
      testInRoot(() => {
        resetLockHideStore();
        expect(isViewOrAncestorHidden('child-1', getParentId)).toBe(false);
      });
    });

    test('returns true when view is hidden', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['child-1']);
        expect(isViewOrAncestorHidden('child-1', getParentId)).toBe(true);
      });
    });

    test('returns true when parent is hidden', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['parent-1']);
        expect(isViewOrAncestorHidden('child-1', getParentId)).toBe(true);
      });
    });

    test('returns true when grandparent is hidden', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['root']);
        expect(isViewOrAncestorHidden('grandchild-1', getParentId)).toBe(true);
      });
    });

    test('handles unknown view ID', () => {
      testInRoot(() => {
        resetLockHideStore();
        expect(isViewOrAncestorHidden('unknown', getParentId)).toBe(false);
      });
    });
  });

  describe('getLockStateInfo', () => {
    test('returns noneLocked for empty selection', () => {
      testInRoot(() => {
        resetLockHideStore();
        const info = getLockStateInfo(new Set<string>());
        expect(info).toEqual({
          allLocked: false,
          anyLocked: false,
          noneLocked: true,
        });
      });
    });

    test('returns noneLocked when no views are locked', () => {
      testInRoot(() => {
        resetLockHideStore();
        const info = getLockStateInfo(new Set(['view-1', 'view-2']));
        expect(info).toEqual({
          allLocked: false,
          anyLocked: false,
          noneLocked: true,
        });
      });
    });

    test('returns allLocked when all views are locked', () => {
      testInRoot(() => {
        resetLockHideStore();
        lockViews(['view-1', 'view-2']);
        const info = getLockStateInfo(new Set(['view-1', 'view-2']));
        expect(info).toEqual({
          allLocked: true,
          anyLocked: true,
          noneLocked: false,
        });
      });
    });

    test('returns anyLocked when some views are locked', () => {
      testInRoot(() => {
        resetLockHideStore();
        lockViews(['view-1']);
        const info = getLockStateInfo(new Set(['view-1', 'view-2']));
        expect(info).toEqual({
          allLocked: false,
          anyLocked: true,
          noneLocked: false,
        });
      });
    });
  });

  describe('getHideStateInfo', () => {
    test('returns noneHidden for empty selection', () => {
      testInRoot(() => {
        resetLockHideStore();
        const info = getHideStateInfo(new Set<string>());
        expect(info).toEqual({
          allHidden: false,
          anyHidden: false,
          noneHidden: true,
        });
      });
    });

    test('returns noneHidden when no views are hidden', () => {
      testInRoot(() => {
        resetLockHideStore();
        const info = getHideStateInfo(new Set(['view-1', 'view-2']));
        expect(info).toEqual({
          allHidden: false,
          anyHidden: false,
          noneHidden: true,
        });
      });
    });

    test('returns allHidden when all views are hidden', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['view-1', 'view-2']);
        const info = getHideStateInfo(new Set(['view-1', 'view-2']));
        expect(info).toEqual({
          allHidden: true,
          anyHidden: true,
          noneHidden: false,
        });
      });
    });

    test('returns anyHidden when some views are hidden', () => {
      testInRoot(() => {
        resetLockHideStore();
        hideViews(['view-1']);
        const info = getHideStateInfo(new Set(['view-1', 'view-2']));
        expect(info).toEqual({
          allHidden: false,
          anyHidden: true,
          noneHidden: false,
        });
      });
    });
  });

  describe('resetLockHideStore', () => {
    test('clears all locked views', () => {
      testInRoot(() => {
        lockViews(['view-1', 'view-2']);
        resetLockHideStore();
        expect(lockHideStore.lockedIds.size).toBe(0);
      });
    });

    test('clears all hidden views', () => {
      testInRoot(() => {
        hideViews(['view-1', 'view-2']);
        resetLockHideStore();
        expect(lockHideStore.hiddenIds.size).toBe(0);
      });
    });

    test('can be called multiple times safely', () => {
      testInRoot(() => {
        lockViews(['view-1']);
        hideViews(['view-2']);
        resetLockHideStore();
        resetLockHideStore();
        resetLockHideStore();
        expect(lockHideStore.lockedIds.size).toBe(0);
        expect(lockHideStore.hiddenIds.size).toBe(0);
      });
    });
  });

  describe('lock and hide are independent', () => {
    test('a view can be both locked and hidden', () => {
      testInRoot(() => {
        resetLockHideStore();
        lockViews(['view-1']);
        hideViews(['view-1']);
        expect(isLocked('view-1')).toBe(true);
        expect(isHidden('view-1')).toBe(true);
      });
    });

    test('unlocking does not affect hidden state', () => {
      testInRoot(() => {
        resetLockHideStore();
        lockViews(['view-1']);
        hideViews(['view-1']);
        unlockViews(['view-1']);
        expect(isLocked('view-1')).toBe(false);
        expect(isHidden('view-1')).toBe(true);
      });
    });

    test('showing does not affect locked state', () => {
      testInRoot(() => {
        resetLockHideStore();
        lockViews(['view-1']);
        hideViews(['view-1']);
        showViews(['view-1']);
        expect(isLocked('view-1')).toBe(true);
        expect(isHidden('view-1')).toBe(false);
      });
    });
  });
});
