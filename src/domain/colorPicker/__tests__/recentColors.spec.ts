/**
 * Recent Colors Tests
 *
 * Tests for localStorage persistence of recently used colors.
 * Written following TDD approach - tests first, then implementation.
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  addRecentColor,
  clearRecentColors,
  getRecentColors,
  isStorageAvailable,
  MAX_RECENT_COLORS,
  STORAGE_KEY,
} from '../recentColors';

describe('recentColors', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    // Reset mock storage
    mockStorage = {};

    // Mock localStorage
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
    });
  });

  // ===========================================================================
  // isStorageAvailable
  // ===========================================================================

  describe('isStorageAvailable', () => {
    test('returns true when localStorage is available', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    test('returns false when localStorage throws', () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => {
          throw new Error('Storage disabled');
        }),
        setItem: vi.fn(() => {
          throw new Error('Storage disabled');
        }),
      });

      expect(isStorageAvailable()).toBe(false);
    });

    test('returns false when localStorage is undefined', () => {
      vi.stubGlobal('localStorage', undefined);
      expect(isStorageAvailable()).toBe(false);
    });
  });

  // ===========================================================================
  // getRecentColors
  // ===========================================================================

  describe('getRecentColors', () => {
    test('returns empty array when storage is empty', () => {
      const result = getRecentColors();
      expect(result).toEqual([]);
    });

    test('returns empty array when key does not exist', () => {
      const result = getRecentColors();
      expect(result).toEqual([]);
      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    test('returns parsed colors from valid JSON', () => {
      mockStorage[STORAGE_KEY] = JSON.stringify(['#FF0000FF', '#00FF00FF']);

      const result = getRecentColors();
      expect(result).toEqual(['#FF0000FF', '#00FF00FF']);
    });

    test('returns empty array for invalid JSON', () => {
      mockStorage[STORAGE_KEY] = 'invalid json{';

      const result = getRecentColors();
      expect(result).toEqual([]);
    });

    test('returns empty array when stored value is not an array', () => {
      mockStorage[STORAGE_KEY] = JSON.stringify({ color: '#FF0000FF' });

      const result = getRecentColors();
      expect(result).toEqual([]);
    });

    test('filters out non-string values from array', () => {
      mockStorage[STORAGE_KEY] = JSON.stringify(['#FF0000FF', 123, '#00FF00FF', null]);

      const result = getRecentColors();
      expect(result).toEqual(['#FF0000FF', '#00FF00FF']);
    });

    test('returns empty array when localStorage is unavailable', () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => {
          throw new Error('Storage disabled');
        }),
      });

      const result = getRecentColors();
      expect(result).toEqual([]);
    });
  });

  // ===========================================================================
  // addRecentColor
  // ===========================================================================

  describe('addRecentColor', () => {
    test('adds color to front of list', () => {
      addRecentColor('#FF0000FF');

      const stored = JSON.parse(mockStorage[STORAGE_KEY]);
      expect(stored[0]).toBe('#FF0000FF');
    });

    test('adds multiple colors in order', () => {
      addRecentColor('#FF0000FF');
      addRecentColor('#00FF00FF');
      addRecentColor('#0000FFFF');

      const stored = JSON.parse(mockStorage[STORAGE_KEY]);
      expect(stored).toEqual(['#0000FFFF', '#00FF00FF', '#FF0000FF']);
    });

    test('moves duplicate to front without creating duplicate entry', () => {
      addRecentColor('#FF0000FF');
      addRecentColor('#00FF00FF');
      addRecentColor('#FF0000FF'); // Add duplicate

      const stored = JSON.parse(mockStorage[STORAGE_KEY]);
      expect(stored).toEqual(['#FF0000FF', '#00FF00FF']);
      expect(stored.length).toBe(2);
    });

    test('limits list to MAX_RECENT_COLORS (10) with FIFO', () => {
      // Add 12 colors
      for (let i = 0; i < 12; i++) {
        const hex = `#${i.toString(16).padStart(2, '0').toUpperCase()}0000FF`;
        addRecentColor(hex);
      }

      const stored = JSON.parse(mockStorage[STORAGE_KEY]);
      expect(stored.length).toBe(MAX_RECENT_COLORS);

      // Most recent should be first
      expect(stored[0]).toBe('#0B0000FF');
      // Oldest (first 2) should be removed
      expect(stored).not.toContain('#000000FF');
      expect(stored).not.toContain('#010000FF');
    });

    test('silently fails when localStorage is unavailable', () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => {
          throw new Error('Storage disabled');
        }),
        setItem: vi.fn(() => {
          throw new Error('Storage disabled');
        }),
      });

      // Should not throw
      expect(() => addRecentColor('#FF0000FF')).not.toThrow();
    });

    test('preserves existing colors when adding new one', () => {
      mockStorage[STORAGE_KEY] = JSON.stringify(['#AAAAAA00', '#BBBBBB00']);

      addRecentColor('#FF0000FF');

      const stored = JSON.parse(mockStorage[STORAGE_KEY]);
      expect(stored).toEqual(['#FF0000FF', '#AAAAAA00', '#BBBBBB00']);
    });
  });

  // ===========================================================================
  // clearRecentColors
  // ===========================================================================

  describe('clearRecentColors', () => {
    test('removes recent colors from storage', () => {
      mockStorage[STORAGE_KEY] = JSON.stringify(['#FF0000FF', '#00FF00FF']);

      clearRecentColors();

      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(mockStorage[STORAGE_KEY]).toBeUndefined();
    });

    test('silently fails when localStorage is unavailable', () => {
      vi.stubGlobal('localStorage', {
        removeItem: vi.fn(() => {
          throw new Error('Storage disabled');
        }),
      });

      // Should not throw
      expect(() => clearRecentColors()).not.toThrow();
    });

    test('getRecentColors returns empty after clear', () => {
      mockStorage[STORAGE_KEY] = JSON.stringify(['#FF0000FF', '#00FF00FF']);

      clearRecentColors();

      const result = getRecentColors();
      expect(result).toEqual([]);
    });
  });
});
