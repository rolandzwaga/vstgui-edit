import { describe, expect, test } from 'vitest';
import {
  calculateLineCount,
  getPatternId,
  isMajorLine,
  isValidGridSize,
} from '../grid';

describe('grid utilities', () => {
  describe('isMajorLine', () => {
    test('returns true for index 0', () => {
      expect(isMajorLine(0)).toBe(true);
    });

    test('returns true for index 5', () => {
      expect(isMajorLine(5)).toBe(true);
    });

    test('returns true for index 10', () => {
      expect(isMajorLine(10)).toBe(true);
    });

    test('returns true for index 15', () => {
      expect(isMajorLine(15)).toBe(true);
    });

    test('returns false for index 1', () => {
      expect(isMajorLine(1)).toBe(false);
    });

    test('returns false for index 2', () => {
      expect(isMajorLine(2)).toBe(false);
    });

    test('returns false for index 3', () => {
      expect(isMajorLine(3)).toBe(false);
    });

    test('returns false for index 4', () => {
      expect(isMajorLine(4)).toBe(false);
    });

    test('returns false for index 6', () => {
      expect(isMajorLine(6)).toBe(false);
    });

    test('handles large indices correctly', () => {
      expect(isMajorLine(100)).toBe(true);
      expect(isMajorLine(101)).toBe(false);
      expect(isMajorLine(105)).toBe(true);
    });
  });

  describe('calculateLineCount', () => {
    test('returns 0 for dimension 0', () => {
      expect(calculateLineCount(0, 10)).toBe(0);
    });

    test('returns correct count for exact division', () => {
      // 100px with 10px grid = 10 lines (0, 10, 20, ..., 90) + 1 at 100 = 11
      expect(calculateLineCount(100, 10)).toBe(11);
    });

    test('returns correct count for non-exact division', () => {
      // 95px with 10px grid = 10 lines at 0, 10, 20, ..., 90
      expect(calculateLineCount(95, 10)).toBe(10);
    });

    test('handles different grid sizes', () => {
      // 100px with 5px grid = 21 lines (0, 5, 10, ..., 100)
      expect(calculateLineCount(100, 5)).toBe(21);

      // 100px with 20px grid = 6 lines (0, 20, 40, 60, 80, 100)
      expect(calculateLineCount(100, 20)).toBe(6);
    });

    test('handles small dimensions', () => {
      // 5px with 10px grid = 1 line at 0
      expect(calculateLineCount(5, 10)).toBe(1);
    });

    test('handles large dimensions', () => {
      // 1000px with 10px grid = 101 lines
      expect(calculateLineCount(1000, 10)).toBe(101);
    });
  });

  describe('getPatternId', () => {
    test('returns correct pattern id for lines style', () => {
      expect(getPatternId('lines', 10)).toBe('grid-pattern-lines-10');
    });

    test('returns correct pattern id for dots style', () => {
      expect(getPatternId('dots', 10)).toBe('grid-pattern-dots-10');
    });

    test('returns correct pattern id for crosshairs style', () => {
      expect(getPatternId('crosshairs', 10)).toBe('grid-pattern-crosshairs-10');
    });

    test('includes size in pattern id', () => {
      expect(getPatternId('lines', 5)).toBe('grid-pattern-lines-5');
      expect(getPatternId('lines', 20)).toBe('grid-pattern-lines-20');
    });
  });

  describe('isValidGridSize', () => {
    test('returns true for valid preset 5', () => {
      expect(isValidGridSize(5)).toBe(true);
    });

    test('returns true for valid preset 8', () => {
      expect(isValidGridSize(8)).toBe(true);
    });

    test('returns true for valid preset 10', () => {
      expect(isValidGridSize(10)).toBe(true);
    });

    test('returns true for valid preset 12', () => {
      expect(isValidGridSize(12)).toBe(true);
    });

    test('returns true for valid preset 16', () => {
      expect(isValidGridSize(16)).toBe(true);
    });

    test('returns true for valid preset 20', () => {
      expect(isValidGridSize(20)).toBe(true);
    });

    test('returns false for invalid size 0', () => {
      expect(isValidGridSize(0)).toBe(false);
    });

    test('returns false for invalid size 1', () => {
      expect(isValidGridSize(1)).toBe(false);
    });

    test('returns false for invalid size 7', () => {
      expect(isValidGridSize(7)).toBe(false);
    });

    test('returns false for invalid size 15', () => {
      expect(isValidGridSize(15)).toBe(false);
    });

    test('returns false for invalid size 100', () => {
      expect(isValidGridSize(100)).toBe(false);
    });

    test('returns false for negative sizes', () => {
      expect(isValidGridSize(-1)).toBe(false);
      expect(isValidGridSize(-10)).toBe(false);
    });
  });
});
