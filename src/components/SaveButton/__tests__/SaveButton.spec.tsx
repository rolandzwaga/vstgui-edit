import { cleanup, render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { SaveButton } from '../SaveButton';

vi.mock('../../../stores/documentStore', () => ({
  documentStore: {
    document: { 'vstgui-ui-description': { version: '1' } },
    isDirty: true,
    originalFormat: 'json',
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

describe('SaveButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    test('renders save button with correct label', () => {
      render(() => <SaveButton />);
      const button = screen.getByRole('button', { name: /save/i });
      expect(button).toBeInTheDocument();
    });

    test('shows save icon when not saving', () => {
      render(() => <SaveButton />);
      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    test('has correct title for keyboard shortcut', () => {
      render(() => <SaveButton />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Save (Ctrl+S)');
    });
  });

  describe('disabled state', () => {
    test('is enabled when document is dirty', async () => {
      const { documentStore } = await import('../../../stores/documentStore');
      Object.defineProperty(documentStore, 'isDirty', { value: true, configurable: true });

      render(() => <SaveButton />);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('click behavior', () => {
    test('calls downloadDocument when File System Access API not available', async () => {
      const user = userEvent.setup();
      const { downloadDocument } = await import('../../../services/fileService');

      render(() => <SaveButton />);
      const button = screen.getByRole('button');
      await user.click(button);

      expect(downloadDocument).toHaveBeenCalled();
    });
  });

  describe('keyboard shortcut', () => {
    test('registers keydown listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      render(() => <SaveButton />);

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      addEventListenerSpy.mockRestore();
    });

    test('removes keydown listener on cleanup', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      const { unmount } = render(() => <SaveButton />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });
});
