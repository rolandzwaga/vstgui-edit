import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  clearFormatPreference,
  getFormatPreference,
  isValidSaveFormat,
  STORAGE_KEY,
  setFormatPreference,
} from '../formatPreference';

describe('formatPreference', () => {
  describe('STORAGE_KEY', () => {
    test('has correct value', () => {
      expect(STORAGE_KEY).toBe('vstgui-edit:save-format');
    });
  });

  describe('isValidSaveFormat', () => {
    test('returns true for "json"', () => {
      expect(isValidSaveFormat('json')).toBe(true);
    });

    test('returns true for "xml"', () => {
      expect(isValidSaveFormat('xml')).toBe(true);
    });

    test('returns false for other strings', () => {
      expect(isValidSaveFormat('yaml')).toBe(false);
      expect(isValidSaveFormat('txt')).toBe(false);
      expect(isValidSaveFormat('')).toBe(false);
      expect(isValidSaveFormat('JSON')).toBe(false); // case-sensitive
      expect(isValidSaveFormat('XML')).toBe(false);
    });

    test('returns false for non-strings', () => {
      expect(isValidSaveFormat(null)).toBe(false);
      expect(isValidSaveFormat(undefined)).toBe(false);
      expect(isValidSaveFormat(123)).toBe(false);
      expect(isValidSaveFormat({})).toBe(false);
      expect(isValidSaveFormat([])).toBe(false);
    });
  });

  describe('getFormatPreference', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    test('returns null when no preference is saved', () => {
      expect(getFormatPreference()).toBe(null);
    });

    test('returns "json" when json is saved', () => {
      localStorage.setItem(STORAGE_KEY, 'json');
      expect(getFormatPreference()).toBe('json');
    });

    test('returns "xml" when xml is saved', () => {
      localStorage.setItem(STORAGE_KEY, 'xml');
      expect(getFormatPreference()).toBe('xml');
    });

    test('returns null for invalid stored value', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid');
      expect(getFormatPreference()).toBe(null);
    });

    test('returns null for empty stored value', () => {
      localStorage.setItem(STORAGE_KEY, '');
      expect(getFormatPreference()).toBe(null);
    });

    test('handles localStorage unavailable (throws)', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = () => {
        throw new Error('localStorage unavailable');
      };

      expect(getFormatPreference()).toBe(null);

      localStorage.getItem = originalGetItem;
    });
  });

  describe('setFormatPreference', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    test('saves "json" to localStorage', () => {
      setFormatPreference('json');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('json');
    });

    test('saves "xml" to localStorage', () => {
      setFormatPreference('xml');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('xml');
    });

    test('overwrites previous value', () => {
      setFormatPreference('json');
      setFormatPreference('xml');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('xml');
    });

    test('handles localStorage unavailable (silently fails)', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('localStorage unavailable');
      };

      // Should not throw
      expect(() => setFormatPreference('json')).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('clearFormatPreference', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    test('removes preference from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, 'json');
      clearFormatPreference();
      expect(localStorage.getItem(STORAGE_KEY)).toBe(null);
    });

    test('handles no existing preference', () => {
      expect(() => clearFormatPreference()).not.toThrow();
      expect(localStorage.getItem(STORAGE_KEY)).toBe(null);
    });

    test('handles localStorage unavailable (silently fails)', () => {
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = () => {
        throw new Error('localStorage unavailable');
      };

      // Should not throw
      expect(() => clearFormatPreference()).not.toThrow();

      localStorage.removeItem = originalRemoveItem;
    });
  });
});
