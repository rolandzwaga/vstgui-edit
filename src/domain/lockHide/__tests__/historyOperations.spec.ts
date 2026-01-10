import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Mock } from 'vitest';
import { useMockDate } from '../../../__tests__/helpers/time';
import {
  createHideOperation,
  createLockOperation,
  createShowAllOperation,
  createUnlockOperation,
  formatHideDescription,
  formatLockDescription,
  formatShowAllDescription,
  formatUnlockDescription,
} from '../historyOperations';

describe('historyOperations', () => {
  // Mock date for consistent timestamp testing
  useMockDate('2026-01-10T12:00:00Z');

  describe('formatLockDescription', () => {
    test('returns singular for count of 1', () => {
      expect(formatLockDescription(1)).toBe('Lock view');
    });

    test('returns plural for count of 2', () => {
      expect(formatLockDescription(2)).toBe('Lock 2 views');
    });

    test('returns plural for count greater than 2', () => {
      expect(formatLockDescription(10)).toBe('Lock 10 views');
    });
  });

  describe('formatUnlockDescription', () => {
    test('returns singular for count of 1', () => {
      expect(formatUnlockDescription(1)).toBe('Unlock view');
    });

    test('returns plural for count of 2', () => {
      expect(formatUnlockDescription(2)).toBe('Unlock 2 views');
    });

    test('returns plural for count greater than 2', () => {
      expect(formatUnlockDescription(10)).toBe('Unlock 10 views');
    });
  });

  describe('formatHideDescription', () => {
    test('returns singular for count of 1', () => {
      expect(formatHideDescription(1)).toBe('Hide view');
    });

    test('returns plural for count of 2', () => {
      expect(formatHideDescription(2)).toBe('Hide 2 views');
    });

    test('returns plural for count greater than 2', () => {
      expect(formatHideDescription(10)).toBe('Hide 10 views');
    });
  });

  describe('formatShowAllDescription', () => {
    test('returns singular for count of 1', () => {
      expect(formatShowAllDescription(1)).toBe('Show view');
    });

    test('returns plural for count of 2', () => {
      expect(formatShowAllDescription(2)).toBe('Show 2 views');
    });

    test('returns plural for count greater than 2', () => {
      expect(formatShowAllDescription(10)).toBe('Show 10 views');
    });
  });

  describe('createLockOperation', () => {
    let lockFn: Mock<(ids: string[]) => void>;
    let unlockFn: Mock<(ids: string[]) => void>;

    beforeEach(() => {
      lockFn = vi.fn<(ids: string[]) => void>();
      unlockFn = vi.fn<(ids: string[]) => void>();
    });

    test('creates operation with correct type', () => {
      const op = createLockOperation(['a'], new Map(), lockFn, unlockFn);
      expect(op.type).toBe('lock');
    });

    test('creates operation with correct description', () => {
      const op = createLockOperation(['a', 'b'], new Map(), lockFn, unlockFn);
      expect(op.description).toBe('Lock 2 views');
    });

    test('creates operation with timestamp', () => {
      const op = createLockOperation(['a'], new Map(), lockFn, unlockFn);
      expect(op.timestamp).toBe(new Date('2026-01-10T12:00:00Z').getTime());
    });

    test('redo calls lockFn with viewIds', () => {
      const op = createLockOperation(['a', 'b'], new Map(), lockFn, unlockFn);
      op.redo();
      expect(lockFn).toHaveBeenCalledWith(['a', 'b']);
    });

    test('undo restores views that were not previously locked', () => {
      const previousStates = new Map([
        ['a', false], // was NOT locked
        ['b', false], // was NOT locked
      ]);
      const op = createLockOperation(['a', 'b'], previousStates, lockFn, unlockFn);
      op.undo();
      expect(unlockFn).toHaveBeenCalledWith(['a', 'b']);
      expect(lockFn).not.toHaveBeenCalled();
    });

    test('undo restores views that were previously locked', () => {
      const previousStates = new Map([
        ['a', true], // was locked
        ['b', false], // was NOT locked
      ]);
      const op = createLockOperation(['a', 'b'], previousStates, lockFn, unlockFn);
      op.undo();
      expect(unlockFn).toHaveBeenCalledWith(['b']);
      expect(lockFn).toHaveBeenCalledWith(['a']);
    });

    test('undo handles all views previously locked', () => {
      const previousStates = new Map([
        ['a', true],
        ['b', true],
      ]);
      const op = createLockOperation(['a', 'b'], previousStates, lockFn, unlockFn);
      op.undo();
      expect(lockFn).toHaveBeenCalledWith(['a', 'b']);
      expect(unlockFn).not.toHaveBeenCalled();
    });
  });

  describe('createUnlockOperation', () => {
    let lockFn: Mock<(ids: string[]) => void>;
    let unlockFn: Mock<(ids: string[]) => void>;

    beforeEach(() => {
      lockFn = vi.fn<(ids: string[]) => void>();
      unlockFn = vi.fn<(ids: string[]) => void>();
    });

    test('creates operation with correct type', () => {
      const op = createUnlockOperation(['a'], new Map(), lockFn, unlockFn);
      expect(op.type).toBe('unlock');
    });

    test('creates operation with correct description', () => {
      const op = createUnlockOperation(['a', 'b', 'c'], new Map(), lockFn, unlockFn);
      expect(op.description).toBe('Unlock 3 views');
    });

    test('redo calls unlockFn with viewIds', () => {
      const op = createUnlockOperation(['a', 'b'], new Map(), lockFn, unlockFn);
      op.redo();
      expect(unlockFn).toHaveBeenCalledWith(['a', 'b']);
    });

    test('undo re-locks views that were previously locked', () => {
      const previousStates = new Map([
        ['a', true], // was locked
        ['b', true], // was locked
      ]);
      const op = createUnlockOperation(['a', 'b'], previousStates, lockFn, unlockFn);
      op.undo();
      expect(lockFn).toHaveBeenCalledWith(['a', 'b']);
    });

    test('undo handles mixed previous states', () => {
      const previousStates = new Map([
        ['a', true], // was locked
        ['b', false], // was NOT locked (shouldn't happen, but handle it)
      ]);
      const op = createUnlockOperation(['a', 'b'], previousStates, lockFn, unlockFn);
      op.undo();
      expect(lockFn).toHaveBeenCalledWith(['a']);
      expect(unlockFn).toHaveBeenCalledWith(['b']);
    });
  });

  describe('createHideOperation', () => {
    let hideFn: Mock<(ids: string[]) => void>;
    let showFn: Mock<(ids: string[]) => void>;

    beforeEach(() => {
      hideFn = vi.fn<(ids: string[]) => void>();
      showFn = vi.fn<(ids: string[]) => void>();
    });

    test('creates operation with correct type', () => {
      const op = createHideOperation(['a'], new Map(), hideFn, showFn);
      expect(op.type).toBe('hide');
    });

    test('creates operation with correct description', () => {
      const op = createHideOperation(['a', 'b'], new Map(), hideFn, showFn);
      expect(op.description).toBe('Hide 2 views');
    });

    test('redo calls hideFn with viewIds', () => {
      const op = createHideOperation(['a', 'b'], new Map(), hideFn, showFn);
      op.redo();
      expect(hideFn).toHaveBeenCalledWith(['a', 'b']);
    });

    test('undo shows views that were not previously hidden', () => {
      const previousStates = new Map([
        ['a', false], // was NOT hidden
        ['b', false], // was NOT hidden
      ]);
      const op = createHideOperation(['a', 'b'], previousStates, hideFn, showFn);
      op.undo();
      expect(showFn).toHaveBeenCalledWith(['a', 'b']);
      expect(hideFn).not.toHaveBeenCalled();
    });

    test('undo handles mixed previous states', () => {
      const previousStates = new Map([
        ['a', true], // was hidden
        ['b', false], // was NOT hidden
      ]);
      const op = createHideOperation(['a', 'b'], previousStates, hideFn, showFn);
      op.undo();
      expect(showFn).toHaveBeenCalledWith(['b']);
      expect(hideFn).toHaveBeenCalledWith(['a']);
    });
  });

  describe('createShowAllOperation', () => {
    let hideFn: Mock<(ids: string[]) => void>;
    let showAllFn: Mock<() => void>;

    beforeEach(() => {
      hideFn = vi.fn<(ids: string[]) => void>();
      showAllFn = vi.fn<() => void>();
    });

    test('creates operation with correct type', () => {
      const op = createShowAllOperation(['a'], hideFn, showAllFn);
      expect(op.type).toBe('show-all');
    });

    test('creates operation with correct description for single view', () => {
      const op = createShowAllOperation(['a'], hideFn, showAllFn);
      expect(op.description).toBe('Show view');
    });

    test('creates operation with correct description for multiple views', () => {
      const op = createShowAllOperation(['a', 'b', 'c'], hideFn, showAllFn);
      expect(op.description).toBe('Show 3 views');
    });

    test('redo calls showAllFn', () => {
      const op = createShowAllOperation(['a', 'b'], hideFn, showAllFn);
      op.redo();
      expect(showAllFn).toHaveBeenCalled();
    });

    test('undo re-hides all views that were shown', () => {
      const op = createShowAllOperation(['a', 'b', 'c'], hideFn, showAllFn);
      op.undo();
      expect(hideFn).toHaveBeenCalledWith(['a', 'b', 'c']);
    });

    test('handles empty viewIds array', () => {
      const op = createShowAllOperation([], hideFn, showAllFn);
      op.undo();
      expect(hideFn).toHaveBeenCalledWith([]);
    });
  });
});
