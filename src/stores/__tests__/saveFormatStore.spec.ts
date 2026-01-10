import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import * as formatPreference from '../../domain/save/formatPreference';
import {
  cancelFormatChange,
  closeDropdown,
  confirmFormatChange,
  initializeFormat,
  openDropdown,
  resetSaveFormatStore,
  saveFormatStore,
  selectFormat,
} from '../saveFormatStore';

// Mock formatPreference module
vi.mock('../../domain/save/formatPreference', () => ({
  getFormatPreference: vi.fn(() => null),
  setFormatPreference: vi.fn(),
  clearFormatPreference: vi.fn(),
  isValidSaveFormat: vi.fn((value) => value === 'json' || value === 'xml'),
  STORAGE_KEY: 'vstgui-edit:save-format',
}));

describe('saveFormatStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    testInRoot(() => {
      resetSaveFormatStore();
    });
  });

  describe('initial state', () => {
    test('selectedFormat is "json" by default', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        expect(saveFormatStore.selectedFormat).toBe('json');
      });
    });

    test('isDropdownOpen is false by default', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        expect(saveFormatStore.isDropdownOpen).toBe(false);
      });
    });

    test('isConfirmDialogOpen is false by default', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        expect(saveFormatStore.isConfirmDialogOpen).toBe(false);
      });
    });

    test('pendingFormat is null by default', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        expect(saveFormatStore.pendingFormat).toBe(null);
      });
    });
  });

  describe('initializeFormat', () => {
    test('uses originalFormat when provided', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        initializeFormat('xml');
        expect(saveFormatStore.selectedFormat).toBe('xml');
      });
    });

    test('uses localStorage preference when originalFormat is null', () => {
      vi.mocked(formatPreference.getFormatPreference).mockReturnValue('xml');

      testInRoot(() => {
        resetSaveFormatStore();
        initializeFormat(null);
        expect(saveFormatStore.selectedFormat).toBe('xml');
      });
    });

    test('uses "json" default when no originalFormat and no localStorage preference', () => {
      vi.mocked(formatPreference.getFormatPreference).mockReturnValue(null);

      testInRoot(() => {
        resetSaveFormatStore();
        initializeFormat(null);
        expect(saveFormatStore.selectedFormat).toBe('json');
      });
    });

    test('priority: originalFormat > localStorage > default', () => {
      vi.mocked(formatPreference.getFormatPreference).mockReturnValue('xml');

      testInRoot(() => {
        resetSaveFormatStore();
        // originalFormat takes precedence over localStorage
        initializeFormat('json');
        expect(saveFormatStore.selectedFormat).toBe('json');
      });
    });
  });

  describe('openDropdown', () => {
    test('sets isDropdownOpen to true', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        expect(saveFormatStore.isDropdownOpen).toBe(false);
        openDropdown();
        expect(saveFormatStore.isDropdownOpen).toBe(true);
      });
    });

    test('can be called multiple times', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        openDropdown();
        openDropdown();
        expect(saveFormatStore.isDropdownOpen).toBe(true);
      });
    });
  });

  describe('closeDropdown', () => {
    test('sets isDropdownOpen to false', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        openDropdown();
        closeDropdown();
        expect(saveFormatStore.isDropdownOpen).toBe(false);
      });
    });

    test('can be called when already closed', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        closeDropdown();
        expect(saveFormatStore.isDropdownOpen).toBe(false);
      });
    });
  });

  describe('selectFormat', () => {
    describe('without confirmation needed', () => {
      test('selects format when originalFormat is null (new document)', () => {
        testInRoot(() => {
          resetSaveFormatStore();
          initializeFormat(null); // No original format
          openDropdown();
          selectFormat('xml');

          expect(saveFormatStore.selectedFormat).toBe('xml');
          expect(saveFormatStore.isDropdownOpen).toBe(false);
          expect(saveFormatStore.isConfirmDialogOpen).toBe(false);
        });
      });

      test('selects same format as original without confirmation', () => {
        testInRoot(() => {
          resetSaveFormatStore();
          initializeFormat('xml');
          openDropdown();
          selectFormat('xml');

          expect(saveFormatStore.selectedFormat).toBe('xml');
          expect(saveFormatStore.isDropdownOpen).toBe(false);
          expect(saveFormatStore.isConfirmDialogOpen).toBe(false);
        });
      });

      test('closes dropdown after selecting format', () => {
        testInRoot(() => {
          resetSaveFormatStore();
          initializeFormat(null);
          openDropdown();
          expect(saveFormatStore.isDropdownOpen).toBe(true);
          selectFormat('xml');
          expect(saveFormatStore.isDropdownOpen).toBe(false);
        });
      });
    });

    describe('with confirmation needed', () => {
      test('opens confirmation dialog when selecting different format than original', () => {
        testInRoot(() => {
          resetSaveFormatStore();
          initializeFormat('json');
          openDropdown();
          selectFormat('xml');

          expect(saveFormatStore.isConfirmDialogOpen).toBe(true);
          expect(saveFormatStore.pendingFormat).toBe('xml');
          expect(saveFormatStore.selectedFormat).toBe('json'); // Unchanged until confirmed
        });
      });

      test('closes dropdown when opening confirmation dialog', () => {
        testInRoot(() => {
          resetSaveFormatStore();
          initializeFormat('json');
          openDropdown();
          selectFormat('xml');

          expect(saveFormatStore.isDropdownOpen).toBe(false);
          expect(saveFormatStore.isConfirmDialogOpen).toBe(true);
        });
      });

      test('sets pendingFormat to selected format', () => {
        testInRoot(() => {
          resetSaveFormatStore();
          initializeFormat('xml');
          openDropdown();
          selectFormat('json');

          expect(saveFormatStore.pendingFormat).toBe('json');
        });
      });
    });
  });

  describe('confirmFormatChange', () => {
    test('applies pendingFormat to selectedFormat', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        initializeFormat('json');
        openDropdown();
        selectFormat('xml'); // Opens dialog with pendingFormat=xml

        confirmFormatChange();

        expect(saveFormatStore.selectedFormat).toBe('xml');
      });
    });

    test('clears pendingFormat', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        initializeFormat('json');
        openDropdown();
        selectFormat('xml');

        confirmFormatChange();

        expect(saveFormatStore.pendingFormat).toBe(null);
      });
    });

    test('closes confirmation dialog', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        initializeFormat('json');
        openDropdown();
        selectFormat('xml');

        confirmFormatChange();

        expect(saveFormatStore.isConfirmDialogOpen).toBe(false);
      });
    });

    test('persists format to localStorage', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        initializeFormat('json');
        openDropdown();
        selectFormat('xml');

        confirmFormatChange();

        expect(formatPreference.setFormatPreference).toHaveBeenCalledWith('xml');
      });
    });

    test('does nothing if no pendingFormat', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        initializeFormat('json');

        confirmFormatChange();

        expect(saveFormatStore.selectedFormat).toBe('json');
        expect(formatPreference.setFormatPreference).not.toHaveBeenCalled();
      });
    });
  });

  describe('cancelFormatChange', () => {
    test('clears pendingFormat', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        initializeFormat('json');
        openDropdown();
        selectFormat('xml');

        cancelFormatChange();

        expect(saveFormatStore.pendingFormat).toBe(null);
      });
    });

    test('closes confirmation dialog', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        initializeFormat('json');
        openDropdown();
        selectFormat('xml');

        cancelFormatChange();

        expect(saveFormatStore.isConfirmDialogOpen).toBe(false);
      });
    });

    test('leaves selectedFormat unchanged', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        initializeFormat('json');
        openDropdown();
        selectFormat('xml');

        cancelFormatChange();

        expect(saveFormatStore.selectedFormat).toBe('json');
      });
    });

    test('does not persist to localStorage', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        initializeFormat('json');
        openDropdown();
        selectFormat('xml');

        cancelFormatChange();

        expect(formatPreference.setFormatPreference).not.toHaveBeenCalled();
      });
    });
  });

  describe('resetSaveFormatStore', () => {
    test('resets selectedFormat to "json"', () => {
      testInRoot(() => {
        initializeFormat('xml');
        resetSaveFormatStore();
        expect(saveFormatStore.selectedFormat).toBe('json');
      });
    });

    test('resets isDropdownOpen to false', () => {
      testInRoot(() => {
        openDropdown();
        resetSaveFormatStore();
        expect(saveFormatStore.isDropdownOpen).toBe(false);
      });
    });

    test('resets isConfirmDialogOpen to false', () => {
      testInRoot(() => {
        initializeFormat('json');
        selectFormat('xml');
        resetSaveFormatStore();
        expect(saveFormatStore.isConfirmDialogOpen).toBe(false);
      });
    });

    test('resets pendingFormat to null', () => {
      testInRoot(() => {
        initializeFormat('json');
        selectFormat('xml');
        resetSaveFormatStore();
        expect(saveFormatStore.pendingFormat).toBe(null);
      });
    });

    test('clears originalFormat tracking', () => {
      // Reset the mock to return null (no localStorage preference)
      vi.mocked(formatPreference.getFormatPreference).mockReturnValue(null);

      testInRoot(() => {
        initializeFormat('xml');
        resetSaveFormatStore();
        initializeFormat(null);
        // After reset, initializing with null should use localStorage/default
        // Since mock returns null, should default to 'json'
        expect(saveFormatStore.selectedFormat).toBe('json');
      });
    });
  });

  describe('workflow scenarios', () => {
    test('complete format change flow with confirmation', () => {
      testInRoot(() => {
        resetSaveFormatStore();

        // Load a JSON file
        initializeFormat('json');
        expect(saveFormatStore.selectedFormat).toBe('json');

        // Open dropdown and select XML
        openDropdown();
        expect(saveFormatStore.isDropdownOpen).toBe(true);

        selectFormat('xml');
        expect(saveFormatStore.isDropdownOpen).toBe(false);
        expect(saveFormatStore.isConfirmDialogOpen).toBe(true);
        expect(saveFormatStore.pendingFormat).toBe('xml');
        expect(saveFormatStore.selectedFormat).toBe('json');

        // Confirm the change
        confirmFormatChange();
        expect(saveFormatStore.isConfirmDialogOpen).toBe(false);
        expect(saveFormatStore.pendingFormat).toBe(null);
        expect(saveFormatStore.selectedFormat).toBe('xml');
        expect(formatPreference.setFormatPreference).toHaveBeenCalledWith('xml');
      });
    });

    test('format change flow with cancellation', () => {
      testInRoot(() => {
        resetSaveFormatStore();

        // Load a JSON file
        initializeFormat('json');

        // Open dropdown and select XML
        openDropdown();
        selectFormat('xml');

        // Cancel the change
        cancelFormatChange();
        expect(saveFormatStore.isConfirmDialogOpen).toBe(false);
        expect(saveFormatStore.pendingFormat).toBe(null);
        expect(saveFormatStore.selectedFormat).toBe('json');
        expect(formatPreference.setFormatPreference).not.toHaveBeenCalled();
      });
    });

    test('new document does not require confirmation', () => {
      testInRoot(() => {
        resetSaveFormatStore();

        // No original format (new document)
        initializeFormat(null);

        // Select XML directly
        openDropdown();
        selectFormat('xml');

        // No confirmation needed
        expect(saveFormatStore.isConfirmDialogOpen).toBe(false);
        expect(saveFormatStore.selectedFormat).toBe('xml');
      });
    });
  });
});
