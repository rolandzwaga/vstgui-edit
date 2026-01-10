import { cleanup, render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { SaveButton } from '../SaveButton';

let mockDocumentStore = {
  document: { 'vstgui-ui-description': { version: '1' } },
  isDirty: true,
  originalFormat: 'json' as 'json' | 'xml' | null,
  metadata: { filename: 'test.uidesc' },
  fileHandle: null,
};

vi.mock('../../../stores/documentStore', () => ({
  get documentStore() {
    return mockDocumentStore;
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

vi.mock('../../../stores/saveFormatStore', () => ({
  saveFormatStore: {
    selectedFormat: 'json',
    isDropdownOpen: false,
    isConfirmDialogOpen: false,
    pendingFormat: null,
  },
  initializeFormat: vi.fn(),
  openDropdown: vi.fn(),
  closeDropdown: vi.fn(),
  selectFormat: vi.fn(),
  confirmFormatChange: vi.fn(),
  cancelFormatChange: vi.fn(),
  resetSaveFormatStore: vi.fn(),
}));

describe('SaveButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // Helper to get the main save button (the one with title)
  const getMainButton = () => screen.getByTitle('Save (Ctrl+S)');

  // Helper to get the chevron button
  const getChevronButton = () => screen.getByRole('button', { name: /select save format/i });

  describe('rendering', () => {
    test('renders save button with correct label', () => {
      render(() => <SaveButton />);
      const button = getMainButton();
      expect(button).toBeInTheDocument();
      expect(button.textContent).toMatch(/save/i);
    });

    test('shows save icon when not saving', () => {
      render(() => <SaveButton />);
      const button = getMainButton();
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    test('has correct title for keyboard shortcut', () => {
      render(() => <SaveButton />);
      const button = getMainButton();
      expect(button).toHaveAttribute('title', 'Save (Ctrl+S)');
    });
  });

  describe('disabled state', () => {
    test('is enabled when document is dirty', async () => {
      const { documentStore } = await import('../../../stores/documentStore');
      Object.defineProperty(documentStore, 'isDirty', { value: true, configurable: true });

      render(() => <SaveButton />);
      const button = getMainButton();
      expect(button).not.toBeDisabled();
    });
  });

  describe('click behavior', () => {
    test('calls downloadDocument when File System Access API not available', async () => {
      const user = userEvent.setup();
      const { downloadDocument } = await import('../../../services/fileService');

      render(() => <SaveButton />);
      const button = getMainButton();
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

  describe('split button structure', () => {
    test('renders main button and chevron button', () => {
      render(() => <SaveButton />);

      const mainButton = getMainButton();
      expect(mainButton).toBeInTheDocument();

      const chevronButton = getChevronButton();
      expect(chevronButton).toBeInTheDocument();
    });

    test('main button triggers save action', async () => {
      const user = userEvent.setup();
      const { downloadDocument } = await import('../../../services/fileService');

      render(() => <SaveButton />);
      const mainButton = getMainButton();
      await user.click(mainButton);

      expect(downloadDocument).toHaveBeenCalled();
    });

    test('chevron button has aria-haspopup attribute', () => {
      render(() => <SaveButton />);
      const chevronButton = getChevronButton();
      expect(chevronButton).toHaveAttribute('aria-haspopup', 'menu');
    });

    test('button group has proper role and aria-label', () => {
      render(() => <SaveButton />);
      const group = screen.getByRole('group', { name: /save options/i });
      expect(group).toBeInTheDocument();
    });
  });

  describe('format-based serialization', () => {
    test('saves as JSON when JSON format selected', async () => {
      const user = userEvent.setup();
      const { downloadDocument } = await import('../../../services/fileService');
      const { serializeToJson } = await import('../../../domain/serializer');

      render(() => <SaveButton />);
      const mainButton = getMainButton();
      await user.click(mainButton);

      expect(serializeToJson).toHaveBeenCalled();
      expect(downloadDocument).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'json'
      );
    });

    test('button label shows current format (JSON)', () => {
      render(() => <SaveButton />);
      const mainButton = getMainButton();
      expect(mainButton.textContent).toContain('JSON');
    });
  });

  describe('dropdown behavior', () => {
    test('chevron click opens dropdown', async () => {
      const user = userEvent.setup();
      const { openDropdown } = await import('../../../stores/saveFormatStore');

      render(() => <SaveButton />);
      const chevronButton = getChevronButton();
      await user.click(chevronButton);

      expect(openDropdown).toHaveBeenCalled();
    });

    test('clicking main button while dropdown is open closes dropdown and triggers save', async () => {
      const user = userEvent.setup();
      const { closeDropdown, saveFormatStore } = await import('../../../stores/saveFormatStore');
      const { downloadDocument } = await import('../../../services/fileService');

      // Mock dropdown as open
      Object.defineProperty(saveFormatStore, 'isDropdownOpen', {
        value: true,
        configurable: true,
      });

      render(() => <SaveButton />);
      const mainButton = getMainButton();
      await user.click(mainButton);

      expect(closeDropdown).toHaveBeenCalled();
      expect(downloadDocument).toHaveBeenCalled();
    });
  });
});
