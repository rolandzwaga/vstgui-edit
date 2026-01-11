/**
 * Tests for preferencesStore
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRoot } from 'solid-js';
import {
  preferencesStore,
  openPreferences,
  closePreferences,
  setActiveSection,
  openResetDialog,
  closeResetDialog,
  setGridSizePreference,
  setGridStylePreference,
  setGridVisibleByDefaultPreference,
  setSnapEnabledByDefaultPreference,
  setSnapThresholdPreference,
  setSmartGuidesEnabledByDefaultPreference,
  setCustomGuidesSnapEnabledByDefaultPreference,
  setThemeModePreference,
  setSaveFormatPreference,
  setAlignmentToolbarPreference,
  initializePreferences,
  resetToDefaults,
  resetPreferencesStore,
} from '../preferencesStore';
import { STORAGE_KEY } from '../../domain/preferences/persistence';
import { DEFAULT_PREFERENCES } from '../../domain/preferences/defaults';
import { gridStore, setGridSize, setGridStyle, setSnapThreshold, resetGrid } from '../gridStore';

// Helper to run tests in SolidJS reactive context
function testInRoot(fn: () => void): void {
  createRoot((dispose) => {
    fn();
    dispose();
  });
}

describe('preferencesStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetPreferencesStore();
    resetGrid();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('initializes with default preferences when no stored preferences exist', () => {
      testInRoot(() => {
        initializePreferences();
        expect(preferencesStore.preferences.version).toBe(1);
        expect(preferencesStore.preferences.grid.size).toBe(DEFAULT_PREFERENCES.grid.size);
        expect(preferencesStore.preferences.grid.style).toBe(DEFAULT_PREFERENCES.grid.style);
      });
    });

    it('initializes with default panel state (closed)', () => {
      testInRoot(() => {
        expect(preferencesStore.isOpen).toBe(false);
        expect(preferencesStore.activeSection).toBe('grid');
        expect(preferencesStore.isResetDialogOpen).toBe(false);
      });
    });

    it('loads stored preferences on initialization', () => {
      const stored = {
        ...DEFAULT_PREFERENCES,
        grid: { ...DEFAULT_PREFERENCES.grid, size: 16 },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

      testInRoot(() => {
        initializePreferences();
        expect(preferencesStore.preferences.grid.size).toBe(16);
      });
    });

    it('migrates legacy keys on first initialization', () => {
      localStorage.setItem('vstgui-edit:save-format', 'xml');

      testInRoot(() => {
        initializePreferences();
        expect(preferencesStore.preferences.save.format).toBe('xml');
        expect(localStorage.getItem('vstgui-edit:save-format')).toBeNull();
      });
    });
  });

  describe('panel state', () => {
    it('opens preferences panel', () => {
      testInRoot(() => {
        expect(preferencesStore.isOpen).toBe(false);
        openPreferences();
        expect(preferencesStore.isOpen).toBe(true);
      });
    });

    it('closes preferences panel', () => {
      testInRoot(() => {
        openPreferences();
        expect(preferencesStore.isOpen).toBe(true);
        closePreferences();
        expect(preferencesStore.isOpen).toBe(false);
      });
    });

    it('changes active section', () => {
      testInRoot(() => {
        expect(preferencesStore.activeSection).toBe('grid');
        setActiveSection('snap');
        expect(preferencesStore.activeSection).toBe('snap');
        setActiveSection('shortcuts');
        expect(preferencesStore.activeSection).toBe('shortcuts');
      });
    });

    it('opens reset dialog', () => {
      testInRoot(() => {
        expect(preferencesStore.isResetDialogOpen).toBe(false);
        openResetDialog();
        expect(preferencesStore.isResetDialogOpen).toBe(true);
      });
    });

    it('closes reset dialog', () => {
      testInRoot(() => {
        openResetDialog();
        expect(preferencesStore.isResetDialogOpen).toBe(true);
        closeResetDialog();
        expect(preferencesStore.isResetDialogOpen).toBe(false);
      });
    });
  });

  describe('preference setters', () => {
    describe('grid preferences', () => {
      it('sets grid size', () => {
        testInRoot(() => {
          initializePreferences();
          setGridSizePreference(20);
          expect(preferencesStore.preferences.grid.size).toBe(20);
        });
      });

      it('sets grid style', () => {
        testInRoot(() => {
          initializePreferences();
          setGridStylePreference('dots');
          expect(preferencesStore.preferences.grid.style).toBe('dots');
        });
      });

      it('sets grid visible by default', () => {
        testInRoot(() => {
          initializePreferences();
          setGridVisibleByDefaultPreference(false);
          expect(preferencesStore.preferences.grid.visibleByDefault).toBe(false);
        });
      });
    });

    describe('snap preferences', () => {
      it('sets snap enabled by default', () => {
        testInRoot(() => {
          initializePreferences();
          setSnapEnabledByDefaultPreference(false);
          expect(preferencesStore.preferences.snap.enabledByDefault).toBe(false);
        });
      });

      it('sets snap threshold', () => {
        testInRoot(() => {
          initializePreferences();
          setSnapThresholdPreference(15);
          expect(preferencesStore.preferences.snap.threshold).toBe(15);
        });
      });
    });

    describe('smart guides preferences', () => {
      it('sets smart guides enabled by default', () => {
        testInRoot(() => {
          initializePreferences();
          setSmartGuidesEnabledByDefaultPreference(false);
          expect(preferencesStore.preferences.smartGuides.enabledByDefault).toBe(false);
        });
      });
    });

    describe('custom guides preferences', () => {
      it('sets custom guides snap enabled by default', () => {
        testInRoot(() => {
          initializePreferences();
          setCustomGuidesSnapEnabledByDefaultPreference(false);
          expect(preferencesStore.preferences.customGuides.snapEnabledByDefault).toBe(false);
        });
      });
    });

    describe('theme preferences', () => {
      it('sets theme mode', () => {
        testInRoot(() => {
          initializePreferences();
          setThemeModePreference('dark');
          expect(preferencesStore.preferences.theme.mode).toBe('dark');
        });
      });
    });

    describe('save preferences', () => {
      it('sets save format', () => {
        testInRoot(() => {
          initializePreferences();
          setSaveFormatPreference('xml');
          expect(preferencesStore.preferences.save.format).toBe('xml');
        });
      });

      it('sets save format to null', () => {
        testInRoot(() => {
          initializePreferences();
          setSaveFormatPreference('json');
          setSaveFormatPreference(null);
          expect(preferencesStore.preferences.save.format).toBeNull();
        });
      });
    });

    describe('alignment toolbar preferences', () => {
      it('sets alignment toolbar docked state', () => {
        testInRoot(() => {
          initializePreferences();
          setAlignmentToolbarPreference({ isDocked: false, floatingPosition: { x: 100, y: 200 } });
          expect(preferencesStore.preferences.ui.alignmentToolbar.isDocked).toBe(false);
          expect(preferencesStore.preferences.ui.alignmentToolbar.floatingPosition).toEqual({ x: 100, y: 200 });
        });
      });
    });
  });

  describe('reset to defaults', () => {
    it('resets all preferences to defaults', () => {
      testInRoot(() => {
        initializePreferences();
        setGridSizePreference(20);
        setThemeModePreference('dark');

        expect(preferencesStore.preferences.grid.size).toBe(20);
        expect(preferencesStore.preferences.theme.mode).toBe('dark');

        resetToDefaults();

        expect(preferencesStore.preferences.grid.size).toBe(DEFAULT_PREFERENCES.grid.size);
        expect(preferencesStore.preferences.theme.mode).toBe(DEFAULT_PREFERENCES.theme.mode);
      });
    });

    it('clears localStorage on reset', () => {
      testInRoot(() => {
        initializePreferences();
        setGridSizePreference(20);

        // Should be saved
        expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

        resetToDefaults();

        // Should be saved with defaults
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        expect(stored.grid.size).toBe(DEFAULT_PREFERENCES.grid.size);
      });
    });

    it('closes reset dialog after reset', () => {
      testInRoot(() => {
        initializePreferences();
        openResetDialog();
        expect(preferencesStore.isResetDialogOpen).toBe(true);

        resetToDefaults();

        expect(preferencesStore.isResetDialogOpen).toBe(false);
      });
    });
  });

  describe('auto-save effect', () => {
    it('saves preferences to localStorage when changed', async () => {
      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          initializePreferences();
          setGridSizePreference(16);

          // Allow effect to run
          await Promise.resolve();

          const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
          expect(stored.grid.size).toBe(16);

          dispose();
          resolve();
        });
      });
    });
  });

  describe('store sync', () => {
    it('applies grid size to gridStore immediately', () => {
      testInRoot(() => {
        initializePreferences();
        setGridSizePreference(20);
        expect(gridStore.size).toBe(20);
      });
    });

    it('applies grid style to gridStore immediately', () => {
      testInRoot(() => {
        initializePreferences();
        setGridStylePreference('crosshairs');
        expect(gridStore.style).toBe('crosshairs');
      });
    });

    it('applies snap threshold to gridStore immediately', () => {
      testInRoot(() => {
        initializePreferences();
        setSnapThresholdPreference(15);
        expect(gridStore.snapThreshold).toBe(15);
      });
    });

    it('applies stored preferences to gridStore on initialization', () => {
      const stored = {
        ...DEFAULT_PREFERENCES,
        grid: { ...DEFAULT_PREFERENCES.grid, size: 8, style: 'dots' },
        snap: { ...DEFAULT_PREFERENCES.snap, threshold: 12 },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

      testInRoot(() => {
        initializePreferences();
        expect(gridStore.size).toBe(8);
        expect(gridStore.style).toBe('dots');
        expect(gridStore.snapThreshold).toBe(12);
      });
    });
  });

  describe('resetPreferencesStore', () => {
    it('resets store to initial state', () => {
      testInRoot(() => {
        initializePreferences();
        openPreferences();
        setActiveSection('theme');
        setGridSizePreference(20);

        resetPreferencesStore();

        expect(preferencesStore.isOpen).toBe(false);
        expect(preferencesStore.activeSection).toBe('grid');
        expect(preferencesStore.preferences.grid.size).toBe(DEFAULT_PREFERENCES.grid.size);
      });
    });
  });
});
