/**
 * Tests for preferences migration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { needsMigration, migratePreferences, LEGACY_KEYS } from '../migration';
import { STORAGE_KEY } from '../persistence';
import { DEFAULT_PREFERENCES } from '../defaults';

describe('migration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('LEGACY_KEYS', () => {
    it('exports the expected legacy keys', () => {
      expect(LEGACY_KEYS).toContain('vstgui-edit:alignment-toolbar');
      expect(LEGACY_KEYS).toContain('vstgui-edit:save-format');
      expect(LEGACY_KEYS).toHaveLength(2);
    });
  });

  describe('needsMigration', () => {
    it('returns false when no legacy keys exist', () => {
      expect(needsMigration()).toBe(false);
    });

    it('returns false when new preferences key exists', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
      localStorage.setItem('vstgui-edit:save-format', 'json');

      expect(needsMigration()).toBe(false);
    });

    it('returns true when alignment-toolbar key exists without new key', () => {
      localStorage.setItem('vstgui-edit:alignment-toolbar', JSON.stringify({ isDocked: true }));

      expect(needsMigration()).toBe(true);
    });

    it('returns true when save-format key exists without new key', () => {
      localStorage.setItem('vstgui-edit:save-format', 'xml');

      expect(needsMigration()).toBe(true);
    });

    it('returns true when multiple legacy keys exist', () => {
      localStorage.setItem('vstgui-edit:alignment-toolbar', JSON.stringify({ isDocked: false }));
      localStorage.setItem('vstgui-edit:save-format', 'json');

      expect(needsMigration()).toBe(true);
    });
  });

  describe('migratePreferences', () => {
    it('returns no migration when no legacy keys exist', () => {
      const result = migratePreferences();

      expect(result.migrated).toBe(false);
      expect(result.migratedKeys).toHaveLength(0);
      expect(result.failedKeys).toHaveLength(0);
    });

    it('returns no migration when new key already exists', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
      localStorage.setItem('vstgui-edit:save-format', 'xml');

      const result = migratePreferences();

      expect(result.migrated).toBe(false);
    });

    it('migrates alignment toolbar state', () => {
      const toolbarState = { isDocked: false, floatingPosition: { x: 150, y: 250 } };
      localStorage.setItem('vstgui-edit:alignment-toolbar', JSON.stringify(toolbarState));

      const result = migratePreferences();

      expect(result.migrated).toBe(true);
      expect(result.migratedKeys).toContain('vstgui-edit:alignment-toolbar');

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(stored.ui.alignmentToolbar.isDocked).toBe(false);
      expect(stored.ui.alignmentToolbar.floatingPosition).toEqual({ x: 150, y: 250 });
    });

    it('migrates save format json', () => {
      localStorage.setItem('vstgui-edit:save-format', 'json');

      const result = migratePreferences();

      expect(result.migrated).toBe(true);
      expect(result.migratedKeys).toContain('vstgui-edit:save-format');

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(stored.save.format).toBe('json');
    });

    it('migrates save format xml', () => {
      localStorage.setItem('vstgui-edit:save-format', 'xml');

      const result = migratePreferences();

      expect(result.migrated).toBe(true);
      expect(result.migratedKeys).toContain('vstgui-edit:save-format');

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(stored.save.format).toBe('xml');
    });

    it('migrates multiple legacy keys', () => {
      localStorage.setItem('vstgui-edit:alignment-toolbar', JSON.stringify({ isDocked: true, floatingPosition: null }));
      localStorage.setItem('vstgui-edit:save-format', 'xml');

      const result = migratePreferences();

      expect(result.migrated).toBe(true);
      expect(result.migratedKeys).toHaveLength(2);
      expect(result.migratedKeys).toContain('vstgui-edit:alignment-toolbar');
      expect(result.migratedKeys).toContain('vstgui-edit:save-format');
    });

    it('handles missing fields in alignment toolbar with defaults', () => {
      localStorage.setItem('vstgui-edit:alignment-toolbar', JSON.stringify({}));

      migratePreferences();

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(stored.ui.alignmentToolbar.isDocked).toBe(true);
      expect(stored.ui.alignmentToolbar.floatingPosition).toBeNull();
    });
  });

  describe('legacy key deletion verification', () => {
    it('deletes alignment-toolbar key after migration', () => {
      localStorage.setItem('vstgui-edit:alignment-toolbar', JSON.stringify({ isDocked: true }));

      migratePreferences();

      expect(localStorage.getItem('vstgui-edit:alignment-toolbar')).toBeNull();
    });

    it('deletes save-format key after migration', () => {
      localStorage.setItem('vstgui-edit:save-format', 'json');

      migratePreferences();

      expect(localStorage.getItem('vstgui-edit:save-format')).toBeNull();
    });

    it('deletes all legacy keys after migration', () => {
      localStorage.setItem('vstgui-edit:alignment-toolbar', JSON.stringify({ isDocked: false }));
      localStorage.setItem('vstgui-edit:save-format', 'xml');

      migratePreferences();

      LEGACY_KEYS.forEach(key => {
        expect(localStorage.getItem(key)).toBeNull();
      });
    });

    it('deletes legacy keys even when migration partially fails', () => {
      // Valid alignment-toolbar, invalid save-format (will be ignored)
      localStorage.setItem('vstgui-edit:alignment-toolbar', JSON.stringify({ isDocked: true }));
      localStorage.setItem('vstgui-edit:save-format', 'invalid-format');

      migratePreferences();

      // Both keys should be deleted regardless of migration success
      expect(localStorage.getItem('vstgui-edit:alignment-toolbar')).toBeNull();
      expect(localStorage.getItem('vstgui-edit:save-format')).toBeNull();
    });
  });

  describe('partial migration', () => {
    it('handles corrupted alignment-toolbar JSON', () => {
      localStorage.setItem('vstgui-edit:alignment-toolbar', 'not json');

      const result = migratePreferences();

      expect(result.failedKeys).toContain('vstgui-edit:alignment-toolbar');
    });

    it('ignores invalid save-format values', () => {
      localStorage.setItem('vstgui-edit:save-format', 'yaml');

      const result = migratePreferences();

      // Not migrated but not in failedKeys (just ignored)
      expect(result.migratedKeys).not.toContain('vstgui-edit:save-format');
      // New preferences should use defaults
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(stored.save.format).toBeNull();
    });

    it('migrates valid keys even when others fail', () => {
      localStorage.setItem('vstgui-edit:alignment-toolbar', 'invalid json');
      localStorage.setItem('vstgui-edit:save-format', 'json');

      const result = migratePreferences();

      expect(result.migrated).toBe(true);
      expect(result.migratedKeys).toContain('vstgui-edit:save-format');
      expect(result.failedKeys).toContain('vstgui-edit:alignment-toolbar');
    });
  });

  describe('alignmentToolbarStore state round-trip persistence', () => {
    it('preserves docked state through migration', () => {
      const original = { isDocked: true, floatingPosition: null };
      localStorage.setItem('vstgui-edit:alignment-toolbar', JSON.stringify(original));

      migratePreferences();

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(stored.ui.alignmentToolbar.isDocked).toBe(true);
      expect(stored.ui.alignmentToolbar.floatingPosition).toBeNull();
    });

    it('preserves floating state with position through migration', () => {
      const original = { isDocked: false, floatingPosition: { x: 42, y: 84 } };
      localStorage.setItem('vstgui-edit:alignment-toolbar', JSON.stringify(original));

      migratePreferences();

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(stored.ui.alignmentToolbar.isDocked).toBe(false);
      expect(stored.ui.alignmentToolbar.floatingPosition).toEqual({ x: 42, y: 84 });
    });
  });

  describe('console logging', () => {
    it('logs migration info on successful migration', () => {
      localStorage.setItem('vstgui-edit:save-format', 'json');
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      migratePreferences();

      expect(infoSpy).toHaveBeenCalledWith(
        '[preferences] Migrated keys:',
        expect.arrayContaining(['vstgui-edit:save-format'])
      );
    });

    it('does not log when no migration occurs', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      migratePreferences();

      expect(infoSpy).not.toHaveBeenCalled();
    });
  });
});
