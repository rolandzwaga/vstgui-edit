import { describe, expect, test } from 'vitest';
import {
  areAllLocked,
  calculateLockStateInfo,
  filterUnlockedViews,
  getLockMenuItem,
  isAnyLocked,
} from '../lockOperations';

describe('lockOperations', () => {
  describe('calculateLockStateInfo', () => {
    test('returns noneLocked for empty set', () => {
      const isLocked = () => false;
      const result = calculateLockStateInfo(new Set<string>(), isLocked);
      expect(result).toEqual({
        allLocked: false,
        anyLocked: false,
        noneLocked: true,
      });
    });

    test('returns noneLocked when no views are locked', () => {
      const isLocked = () => false;
      const result = calculateLockStateInfo(new Set(['a', 'b', 'c']), isLocked);
      expect(result).toEqual({
        allLocked: false,
        anyLocked: false,
        noneLocked: true,
      });
    });

    test('returns allLocked when all views are locked', () => {
      const isLocked = () => true;
      const result = calculateLockStateInfo(new Set(['a', 'b', 'c']), isLocked);
      expect(result).toEqual({
        allLocked: true,
        anyLocked: true,
        noneLocked: false,
      });
    });

    test('returns anyLocked when some views are locked', () => {
      const locked = new Set(['a', 'c']);
      const isLocked = (id: string) => locked.has(id);
      const result = calculateLockStateInfo(new Set(['a', 'b', 'c']), isLocked);
      expect(result).toEqual({
        allLocked: false,
        anyLocked: true,
        noneLocked: false,
      });
    });

    test('handles single locked view in set of one', () => {
      const isLocked = () => true;
      const result = calculateLockStateInfo(new Set(['a']), isLocked);
      expect(result).toEqual({
        allLocked: true,
        anyLocked: true,
        noneLocked: false,
      });
    });

    test('handles single unlocked view in set of one', () => {
      const isLocked = () => false;
      const result = calculateLockStateInfo(new Set(['a']), isLocked);
      expect(result).toEqual({
        allLocked: false,
        anyLocked: false,
        noneLocked: true,
      });
    });
  });

  describe('filterUnlockedViews', () => {
    test('returns all views when none are locked', () => {
      const isLocked = () => false;
      const result = filterUnlockedViews(['a', 'b', 'c'], isLocked);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    test('returns empty array when all views are locked', () => {
      const isLocked = () => true;
      const result = filterUnlockedViews(['a', 'b', 'c'], isLocked);
      expect(result).toEqual([]);
    });

    test('filters out only locked views', () => {
      const locked = new Set(['a', 'c']);
      const isLocked = (id: string) => locked.has(id);
      const result = filterUnlockedViews(['a', 'b', 'c', 'd'], isLocked);
      expect(result).toEqual(['b', 'd']);
    });

    test('handles empty input array', () => {
      const isLocked = () => true;
      const result = filterUnlockedViews([], isLocked);
      expect(result).toEqual([]);
    });

    test('preserves order of unlocked views', () => {
      const locked = new Set(['b']);
      const isLocked = (id: string) => locked.has(id);
      const result = filterUnlockedViews(['a', 'b', 'c'], isLocked);
      expect(result).toEqual(['a', 'c']);
    });
  });

  describe('areAllLocked', () => {
    test('returns false for empty set', () => {
      const isLocked = () => true;
      expect(areAllLocked(new Set<string>(), isLocked)).toBe(false);
    });

    test('returns true when all views are locked', () => {
      const isLocked = () => true;
      expect(areAllLocked(new Set(['a', 'b', 'c']), isLocked)).toBe(true);
    });

    test('returns false when no views are locked', () => {
      const isLocked = () => false;
      expect(areAllLocked(new Set(['a', 'b', 'c']), isLocked)).toBe(false);
    });

    test('returns false when some views are locked', () => {
      const locked = new Set(['a']);
      const isLocked = (id: string) => locked.has(id);
      expect(areAllLocked(new Set(['a', 'b', 'c']), isLocked)).toBe(false);
    });

    test('returns true for single locked view', () => {
      const isLocked = () => true;
      expect(areAllLocked(new Set(['a']), isLocked)).toBe(true);
    });
  });

  describe('isAnyLocked', () => {
    test('returns false for empty set', () => {
      const isLocked = () => true;
      expect(isAnyLocked(new Set<string>(), isLocked)).toBe(false);
    });

    test('returns true when all views are locked', () => {
      const isLocked = () => true;
      expect(isAnyLocked(new Set(['a', 'b', 'c']), isLocked)).toBe(true);
    });

    test('returns false when no views are locked', () => {
      const isLocked = () => false;
      expect(isAnyLocked(new Set(['a', 'b', 'c']), isLocked)).toBe(false);
    });

    test('returns true when some views are locked', () => {
      const locked = new Set(['a']);
      const isLocked = (id: string) => locked.has(id);
      expect(isAnyLocked(new Set(['a', 'b', 'c']), isLocked)).toBe(true);
    });

    test('returns true when last view is locked', () => {
      const locked = new Set(['c']);
      const isLocked = (id: string) => locked.has(id);
      expect(isAnyLocked(new Set(['a', 'b', 'c']), isLocked)).toBe(true);
    });
  });

  describe('getLockMenuItem', () => {
    test('returns Lock when none are locked', () => {
      const stateInfo = { allLocked: false, anyLocked: false, noneLocked: true };
      const result = getLockMenuItem(stateInfo);
      expect(result).toEqual({
        label: 'Lock',
        action: 'lock',
        shortcut: 'Ctrl+L',
      });
    });

    test('returns Lock when some are locked', () => {
      const stateInfo = { allLocked: false, anyLocked: true, noneLocked: false };
      const result = getLockMenuItem(stateInfo);
      expect(result).toEqual({
        label: 'Lock',
        action: 'lock',
        shortcut: 'Ctrl+L',
      });
    });

    test('returns Unlock when all are locked', () => {
      const stateInfo = { allLocked: true, anyLocked: true, noneLocked: false };
      const result = getLockMenuItem(stateInfo);
      expect(result).toEqual({
        label: 'Unlock',
        action: 'unlock',
        shortcut: 'Ctrl+Shift+L',
      });
    });
  });
});
