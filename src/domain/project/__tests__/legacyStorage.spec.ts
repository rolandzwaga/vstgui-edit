/**
 * Legacy storage cleanup tests
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  cleanupLegacyStorage,
  getExistingLegacyKeys,
  hasLegacyStorage,
  LEGACY_KEYS,
} from '../legacyStorage';

describe('legacyStorage', () => {
  beforeEach(() => {
    // Clear all localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after tests
    localStorage.clear();
  });

  describe('LEGACY_KEYS', () => {
    it('contains expected keys', () => {
      expect(LEGACY_KEYS).toContain('vstgui-edit:preferences');
      expect(LEGACY_KEYS).toContain('vstgui-edit:alignment-toolbar');
      expect(LEGACY_KEYS).toContain('vstgui-edit:save-format');
      expect(LEGACY_KEYS).toContain('vstgui-edit:recent-colors');
    });

    it('has exactly 4 keys', () => {
      expect(LEGACY_KEYS).toHaveLength(4);
    });
  });

  describe('hasLegacyStorage', () => {
    it('returns false when no legacy keys exist', () => {
      expect(hasLegacyStorage()).toBe(false);
    });

    it('returns true when preferences key exists', () => {
      localStorage.setItem('vstgui-edit:preferences', '{}');
      expect(hasLegacyStorage()).toBe(true);
    });

    it('returns true when alignment-toolbar key exists', () => {
      localStorage.setItem('vstgui-edit:alignment-toolbar', '{}');
      expect(hasLegacyStorage()).toBe(true);
    });

    it('returns true when save-format key exists', () => {
      localStorage.setItem('vstgui-edit:save-format', 'json');
      expect(hasLegacyStorage()).toBe(true);
    });

    it('returns true when recent-colors key exists', () => {
      localStorage.setItem('vstgui-edit:recent-colors', '[]');
      expect(hasLegacyStorage()).toBe(true);
    });

    it('returns true when multiple legacy keys exist', () => {
      localStorage.setItem('vstgui-edit:preferences', '{}');
      localStorage.setItem('vstgui-edit:recent-colors', '[]');
      expect(hasLegacyStorage()).toBe(true);
    });

    it('ignores non-legacy keys', () => {
      localStorage.setItem('some-other-key', 'value');
      expect(hasLegacyStorage()).toBe(false);
    });
  });

  describe('getExistingLegacyKeys', () => {
    it('returns empty array when no legacy keys exist', () => {
      expect(getExistingLegacyKeys()).toEqual([]);
    });

    it('returns array with existing keys only', () => {
      localStorage.setItem('vstgui-edit:preferences', '{}');
      localStorage.setItem('vstgui-edit:save-format', 'json');

      const result = getExistingLegacyKeys();
      expect(result).toHaveLength(2);
      expect(result).toContain('vstgui-edit:preferences');
      expect(result).toContain('vstgui-edit:save-format');
    });

    it('returns all legacy keys when all exist', () => {
      for (const key of LEGACY_KEYS) {
        localStorage.setItem(key, 'value');
      }

      const result = getExistingLegacyKeys();
      expect(result).toHaveLength(LEGACY_KEYS.length);
      for (const key of LEGACY_KEYS) {
        expect(result).toContain(key);
      }
    });
  });

  describe('cleanupLegacyStorage', () => {
    it('does nothing when no legacy keys exist', () => {
      localStorage.setItem('other-key', 'value');

      cleanupLegacyStorage();

      expect(localStorage.getItem('other-key')).toBe('value');
    });

    it('removes all legacy keys', () => {
      for (const key of LEGACY_KEYS) {
        localStorage.setItem(key, 'value');
      }

      cleanupLegacyStorage();

      for (const key of LEGACY_KEYS) {
        expect(localStorage.getItem(key)).toBeNull();
      }
    });

    it('preserves non-legacy keys', () => {
      localStorage.setItem('vstgui-edit:preferences', '{}');
      localStorage.setItem('other-app:data', 'important');

      cleanupLegacyStorage();

      expect(localStorage.getItem('vstgui-edit:preferences')).toBeNull();
      expect(localStorage.getItem('other-app:data')).toBe('important');
    });

    it('is idempotent (can be called multiple times safely)', () => {
      localStorage.setItem('vstgui-edit:preferences', '{}');

      cleanupLegacyStorage();
      cleanupLegacyStorage();
      cleanupLegacyStorage();

      expect(localStorage.getItem('vstgui-edit:preferences')).toBeNull();
    });
  });
});
