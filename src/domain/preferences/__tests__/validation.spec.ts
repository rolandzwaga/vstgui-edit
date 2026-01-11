/**
 * Tests for preferences validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { validatePreferences } from '../validation';
import { DEFAULT_PREFERENCES } from '../defaults';

describe('validatePreferences', () => {
  describe('valid preferences', () => {
    it('validates default preferences as valid', () => {
      const result = validatePreferences(DEFAULT_PREFERENCES);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates complete valid preferences', () => {
      const prefs = {
        version: 1,
        grid: { size: 16, style: 'dots', visibleByDefault: false },
        snap: { enabledByDefault: false, threshold: 15 },
        smartGuides: { enabledByDefault: false },
        customGuides: { snapEnabledByDefault: false },
        theme: { mode: 'dark' },
        ui: { alignmentToolbar: { isDocked: false, floatingPosition: { x: 100, y: 200 } } },
        save: { format: 'xml' },
      };
      const result = validatePreferences(prefs);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates preferences with null save format', () => {
      const prefs = { ...DEFAULT_PREFERENCES, save: { format: null } };
      const result = validatePreferences(prefs);
      expect(result.valid).toBe(true);
    });

    it('validates all grid size presets', () => {
      const sizes = [5, 8, 10, 12, 16, 20];
      sizes.forEach(size => {
        const prefs = {
          ...DEFAULT_PREFERENCES,
          grid: { ...DEFAULT_PREFERENCES.grid, size },
        };
        const result = validatePreferences(prefs);
        expect(result.valid).toBe(true);
      });
    });

    it('validates all grid styles', () => {
      const styles = ['lines', 'dots', 'crosshairs'];
      styles.forEach(style => {
        const prefs = {
          ...DEFAULT_PREFERENCES,
          grid: { ...DEFAULT_PREFERENCES.grid, style },
        };
        const result = validatePreferences(prefs);
        expect(result.valid).toBe(true);
      });
    });

    it('validates all theme modes', () => {
      const modes = ['light', 'dark', 'system'];
      modes.forEach(mode => {
        const prefs = {
          ...DEFAULT_PREFERENCES,
          theme: { mode },
        };
        const result = validatePreferences(prefs);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('invalid data handling', () => {
    it('rejects null input', () => {
      const result = validatePreferences(null);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejects undefined input', () => {
      const result = validatePreferences(undefined);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejects non-object input', () => {
      const result = validatePreferences('not an object');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejects invalid version', () => {
      const prefs = { ...DEFAULT_PREFERENCES, version: 2 };
      const result = validatePreferences(prefs);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('version'))).toBe(true);
    });

    it('rejects invalid grid size', () => {
      const prefs = {
        ...DEFAULT_PREFERENCES,
        grid: { ...DEFAULT_PREFERENCES.grid, size: 15 },
      };
      const result = validatePreferences(prefs);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('grid'))).toBe(true);
    });

    it('rejects invalid grid style', () => {
      const prefs = {
        ...DEFAULT_PREFERENCES,
        grid: { ...DEFAULT_PREFERENCES.grid, style: 'circles' },
      };
      const result = validatePreferences(prefs);
      expect(result.valid).toBe(false);
    });

    it('rejects snap threshold below minimum', () => {
      const prefs = {
        ...DEFAULT_PREFERENCES,
        snap: { ...DEFAULT_PREFERENCES.snap, threshold: 0 },
      };
      const result = validatePreferences(prefs);
      expect(result.valid).toBe(false);
    });

    it('rejects snap threshold above maximum', () => {
      const prefs = {
        ...DEFAULT_PREFERENCES,
        snap: { ...DEFAULT_PREFERENCES.snap, threshold: 21 },
      };
      const result = validatePreferences(prefs);
      expect(result.valid).toBe(false);
    });

    it('rejects invalid theme mode', () => {
      const prefs = {
        ...DEFAULT_PREFERENCES,
        theme: { mode: 'midnight' },
      };
      const result = validatePreferences(prefs);
      expect(result.valid).toBe(false);
    });

    it('rejects invalid save format', () => {
      const prefs = {
        ...DEFAULT_PREFERENCES,
        save: { format: 'yaml' },
      };
      const result = validatePreferences(prefs);
      expect(result.valid).toBe(false);
    });

    it('rejects floating position without required fields', () => {
      const prefs = {
        ...DEFAULT_PREFERENCES,
        ui: {
          alignmentToolbar: {
            isDocked: false,
            floatingPosition: { x: 100 }, // missing y
          },
        },
      };
      const result = validatePreferences(prefs);
      expect(result.valid).toBe(false);
    });
  });

  describe('partial data handling', () => {
    it('rejects preferences missing required version', () => {
      const prefs = { grid: DEFAULT_PREFERENCES.grid };
      const result = validatePreferences(prefs);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('version'))).toBe(true);
    });

    it('validates preferences with only version (other fields optional in schema)', () => {
      // The schema only requires version - other fields are validated if present
      const prefs = { version: 1 };
      const result = validatePreferences(prefs);
      expect(result.valid).toBe(true);
    });

    it('validates preferences with partial grid (size only)', () => {
      const prefs = {
        version: 1,
        grid: { size: 16 },
      };
      const result = validatePreferences(prefs);
      expect(result.valid).toBe(true);
    });
  });

  describe('error messages', () => {
    it('provides descriptive error for invalid type', () => {
      const prefs = {
        ...DEFAULT_PREFERENCES,
        grid: { ...DEFAULT_PREFERENCES.grid, size: 'large' },
      };
      const result = validatePreferences(prefs);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('includes path in error message', () => {
      const prefs = {
        ...DEFAULT_PREFERENCES,
        snap: { ...DEFAULT_PREFERENCES.snap, threshold: 'invalid' },
      };
      const result = validatePreferences(prefs);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('snap') || e.includes('threshold'))).toBe(true);
    });
  });
});
