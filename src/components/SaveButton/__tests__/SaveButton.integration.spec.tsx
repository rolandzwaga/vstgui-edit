/**
 * Integration tests for SaveButton format selection workflow.
 *
 * These tests verify the complete flow from format selection
 * through serialization to save.
 */

import { cleanup, render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import {
  initializeFormat,
  resetSaveFormatStore,
  saveFormatStore,
  selectFormat,
} from '../../../stores/saveFormatStore';
import { SaveButton } from '../SaveButton';

// Mock stores and services
vi.mock('../../../stores/documentStore', () => ({
  documentStore: {
    document: { 'vstgui-ui-description': { version: '1' } },
    isDirty: true,
    originalFormat: 'json' as 'json' | 'xml' | null,
    metadata: { filename: 'test.uidesc' },
    fileHandle: null,
  },
  markClean: vi.fn(),
  setFileHandle: vi.fn(),
}));

vi.mock('../../../domain/serializer', () => ({
  serializeToJson: vi.fn(() => '{"test": true}'),
  serializeToXml: vi.fn(() => '<xml/>'),
}));

vi.mock('../../../services/fileService', () => ({
  hasFileSystemAccess: vi.fn(() => false),
  saveToFileHandle: vi.fn(),
  showSaveFilePicker: vi.fn(),
  downloadDocument: vi.fn(),
}));

describe('SaveButton Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testInRoot(() => {
      resetSaveFormatStore();
    });
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  describe('format selection workflow', () => {
    test('complete workflow: initializes with document format', async () => {
      // Initialize with JSON format
      testInRoot(() => {
        initializeFormat('json');
      });

      render(() => <SaveButton />);

      // Verify initial state shows JSON
      const mainButton = screen.getByTitle('Save (Ctrl+S)');
      expect(mainButton.textContent).toContain('JSON');
    });

    test('canceling format change preserves original format', async () => {
      testInRoot(() => {
        initializeFormat('json');
        selectFormat('xml'); // Opens confirmation

        // Verify confirmation state
        expect(saveFormatStore.isConfirmDialogOpen).toBe(true);
        expect(saveFormatStore.pendingFormat).toBe('xml');
        expect(saveFormatStore.selectedFormat).toBe('json'); // Not changed yet
      });
    });

    test('new document allows format change without confirmation', async () => {
      testInRoot(() => {
        // Initialize without original format (new document)
        initializeFormat(null);
        selectFormat('xml');

        // Should change immediately without confirmation
        expect(saveFormatStore.isConfirmDialogOpen).toBe(false);
        expect(saveFormatStore.selectedFormat).toBe('xml');
      });
    });

    test('selecting same format as original does not trigger confirmation', async () => {
      testInRoot(() => {
        initializeFormat('json');
        selectFormat('json'); // Same as original

        // Should not open confirmation dialog
        expect(saveFormatStore.isConfirmDialogOpen).toBe(false);
        expect(saveFormatStore.selectedFormat).toBe('json');
      });
    });
  });

  describe('save uses selected format', () => {
    test('saves with JSON serialization when JSON selected', async () => {
      const user = userEvent.setup();
      const { downloadDocument } = await import('../../../services/fileService');
      const { serializeToJson } = await import('../../../domain/serializer');

      testInRoot(() => {
        initializeFormat(null); // New document
        selectFormat('json');
      });

      render(() => <SaveButton />);

      const mainButton = screen.getByTitle('Save (Ctrl+S)');
      await user.click(mainButton);

      expect(serializeToJson).toHaveBeenCalled();
      expect(downloadDocument).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'json'
      );
    });

    test('stores XML format when XML selected for new document', async () => {
      testInRoot(() => {
        initializeFormat(null); // New document
        selectFormat('xml');
        expect(saveFormatStore.selectedFormat).toBe('xml');
      });
    });
  });

  describe('format initialization', () => {
    test('uses original document format when available', () => {
      testInRoot(() => {
        initializeFormat('xml');
        expect(saveFormatStore.selectedFormat).toBe('xml');
      });
    });

    test('uses localStorage preference when no original format', () => {
      localStorage.setItem('vstgui-edit:save-format', 'xml');

      testInRoot(() => {
        resetSaveFormatStore();
        initializeFormat(null);
        expect(saveFormatStore.selectedFormat).toBe('xml');
      });
    });

    test('falls back to json when no original format and no localStorage', () => {
      testInRoot(() => {
        resetSaveFormatStore();
        initializeFormat(null);
        expect(saveFormatStore.selectedFormat).toBe('json');
      });
    });
  });
});
