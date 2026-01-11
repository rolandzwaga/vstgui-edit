/**
 * Tests for preferences persistence
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_PREFERENCES } from '../defaults';
import { isStorageAvailable, loadPreferences, STORAGE_KEY, savePreferences } from '../persistence';

describe('persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('STORAGE_KEY', () => {
    it('exports the correct storage key', () => {
      expect(STORAGE_KEY).toBe('vstgui-edit:preferences');
    });
  });

  describe('loadPreferences', () => {
    it('returns defaults when no stored preferences exist', () => {
      const prefs = loadPreferences();
      expect(prefs).toEqual(DEFAULT_PREFERENCES);
    });

    it('loads valid stored preferences', () => {
      const stored = {
        ...DEFAULT_PREFERENCES,
        grid: { ...DEFAULT_PREFERENCES.grid, size: 16 },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

      const prefs = loadPreferences();
      expect(prefs.grid.size).toBe(16);
    });

    it('merges stored preferences with defaults for missing fields', () => {
      // Store partial preferences
      const stored = {
        version: 1,
        grid: { size: 20 },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

      const prefs = loadPreferences();
      // Should have merged value
      expect(prefs.grid.size).toBe(20);
      // Should have default for missing field
      expect(prefs.grid.style).toBe(DEFAULT_PREFERENCES.grid.style);
      // Should have defaults for missing sections
      expect(prefs.snap).toEqual(DEFAULT_PREFERENCES.snap);
    });

    it('returns defaults when JSON is corrupted', () => {
      localStorage.setItem(STORAGE_KEY, 'not valid json{{{');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const prefs = loadPreferences();

      expect(prefs).toEqual(DEFAULT_PREFERENCES);
      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy.mock.calls[0][0]).toContain('[preferences]');
    });

    it('returns defaults when stored preferences are invalid', () => {
      const stored = {
        version: 1,
        grid: { size: 999 }, // Invalid size
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const prefs = loadPreferences();

      expect(prefs).toEqual(DEFAULT_PREFERENCES);
      expect(warnSpy).toHaveBeenCalled();
    });

    it('handles nested objects correctly', () => {
      const stored = {
        ...DEFAULT_PREFERENCES,
        ui: {
          alignmentToolbar: {
            isDocked: false,
            floatingPosition: { x: 100, y: 200 },
          },
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

      const prefs = loadPreferences();
      expect(prefs.ui.alignmentToolbar.isDocked).toBe(false);
      expect(prefs.ui.alignmentToolbar.floatingPosition).toEqual({ x: 100, y: 200 });
    });
  });

  describe('savePreferences', () => {
    it('saves preferences to localStorage', () => {
      const prefs = {
        ...DEFAULT_PREFERENCES,
        grid: { ...DEFAULT_PREFERENCES.grid, size: 8 as const },
      };

      savePreferences(prefs);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(stored.grid.size).toBe(8);
    });

    it('overwrites existing preferences', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));

      const newPrefs = {
        ...DEFAULT_PREFERENCES,
        theme: { mode: 'dark' as const },
      };
      savePreferences(newPrefs);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(stored.theme.mode).toBe('dark');
    });

    it('preserves complete structure', () => {
      savePreferences(DEFAULT_PREFERENCES);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(stored.version).toBe(1);
      expect(stored.grid).toBeDefined();
      expect(stored.snap).toBeDefined();
      expect(stored.smartGuides).toBeDefined();
      expect(stored.customGuides).toBeDefined();
      expect(stored.theme).toBeDefined();
      expect(stored.ui).toBeDefined();
      expect(stored.save).toBeDefined();
    });
  });

  describe('localStorage unavailability (private browsing mode)', () => {
    it('loadPreferences returns defaults when localStorage throws', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage is disabled');
      });

      const prefs = loadPreferences();

      expect(prefs).toEqual(DEFAULT_PREFERENCES);
      getItemSpy.mockRestore();
    });

    it('savePreferences silently fails when localStorage throws', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage is disabled');
      });

      // Should not throw
      expect(() => savePreferences(DEFAULT_PREFERENCES)).not.toThrow();

      setItemSpy.mockRestore();
    });

    it('savePreferences silently fails when localStorage quota exceeded', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      // Should not throw
      expect(() => savePreferences(DEFAULT_PREFERENCES)).not.toThrow();

      setItemSpy.mockRestore();
    });
  });

  describe('isStorageAvailable', () => {
    it('returns true when localStorage is available', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    it('returns false when localStorage.setItem throws', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage disabled');
      });

      expect(isStorageAvailable()).toBe(false);

      setItemSpy.mockRestore();
    });
  });

  describe('corruption handling with console.warn verification', () => {
    it('logs warning with prefix when JSON parsing fails', () => {
      localStorage.setItem(STORAGE_KEY, '{invalid json');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      loadPreferences();

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toBe('[preferences] Failed to load, resetting:');
    });

    it('logs warning with errors when validation fails', () => {
      const invalid = { version: 1, grid: { size: 'invalid' } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      loadPreferences();

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toBe('[preferences] Stored preferences invalid, resetting:');
      expect(Array.isArray(warnSpy.mock.calls[0][1])).toBe(true);
    });
  });
});
