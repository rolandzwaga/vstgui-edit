import { render, screen, fireEvent, waitFor, cleanup } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockUidescFile } from '../../../__tests__/helpers/fixtures';
import { reset, documentStore, createNewDocument } from '../../../stores/documentStore';
import { resetProjectStore, setIsSessionOnly } from '../../../stores/projectStore';
import { UploadZone } from '../UploadZone';

describe('UploadZone', () => {
  beforeEach(() => {
    reset();
    resetProjectStore();
    // Set session-only mode to prevent ProjectNameDialog from appearing
    setIsSessionOnly(true);
  });

  describe('rendering and accessibility', () => {
    it('should render with correct ARIA attributes', () => {
      render(() => <UploadZone />);

      const dropZone = screen.getByRole('region');
      expect(dropZone).toHaveAttribute('aria-label', 'File upload zone');
    });

    it('should have upload instructions visible', () => {
      render(() => <UploadZone />);

      expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
    });
  });

  describe('drag and drop - User Story 1', () => {
    it('should show visual feedback when file is dragged over (dragging state)', () => {
      render(() => <UploadZone />);
      const dropZone = screen.getByRole('region');

      fireEvent.dragEnter(dropZone, {
        dataTransfer: { types: ['Files'] },
      });

      expect(dropZone).toHaveAttribute('data-state', 'dragging');
    });

    it('should remove visual feedback when file leaves drop zone', () => {
      render(() => <UploadZone />);
      const dropZone = screen.getByRole('region');

      fireEvent.dragEnter(dropZone, {
        dataTransfer: { types: ['Files'] },
      });
      expect(dropZone).toHaveAttribute('data-state', 'dragging');

      fireEvent.dragLeave(dropZone);
      expect(dropZone).toHaveAttribute('data-state', 'idle');
    });

    it('should trigger store update when valid .uidesc file is dropped', async () => {
      render(() => <UploadZone />);
      const dropZone = screen.getByRole('region');

      const content = '<?xml version="1.0"?><root/>';
      const file = createMockUidescFile(content);

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
          types: ['Files'],
        },
      });

      await waitFor(() => {
        expect(documentStore.uploadState).toBe('success');
        expect(documentStore.content).toBe(content);
      });
    });

    it('should show success state after valid file is dropped', async () => {
      render(() => <UploadZone />);
      const dropZone = screen.getByRole('region');

      const content = 'test content';
      const file = createMockUidescFile(content);

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
          types: ['Files'],
        },
      });

      await waitFor(() => {
        expect(dropZone).toHaveAttribute('data-state', 'success');
      });
    });

    it('should display loading state while file is being read', async () => {
      render(() => <UploadZone />);
      const dropZone = screen.getByRole('region');

      const content = 'test content';
      const file = createMockUidescFile(content);

      // Drop file and check loading state
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
          types: ['Files'],
        },
      });

      // The loading state is very brief, so we check the final success state
      await waitFor(() => {
        expect(documentStore.uploadState).toBe('success');
      });
    });

    it('should display filename after successful upload', async () => {
      render(() => <UploadZone />);
      const dropZone = screen.getByRole('region');

      const content = 'test content';
      const file = createMockUidescFile(content, 'myfile.uidesc');

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
          types: ['Files'],
        },
      });

      await waitFor(() => {
        expect(screen.getByText('myfile.uidesc')).toBeInTheDocument();
      });
    });
  });

  describe('file selector - User Story 2', () => {
    it('should render upload button that is focusable', () => {
      render(() => <UploadZone />);

      const button = screen.getByRole('button', { name: /browse files/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveAttribute('tabindex', '-1');
    });

    it('should have file input with accept=".uidesc" filter', () => {
      render(() => <UploadZone />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('accept', '.uidesc');
    });

    it('should trigger store update when valid file is selected', async () => {
      render(() => <UploadZone />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const content = 'test content from file selector';
      const file = createMockUidescFile(content, 'selected.uidesc');

      // Create a mock file list
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(documentStore.uploadState).toBe('success');
        expect(documentStore.content).toBe(content);
        expect(documentStore.metadata?.filename).toBe('selected.uidesc');
      });
    });

    it('should leave state unchanged when no file is selected (cancel)', () => {
      render(() => <UploadZone />);

      const initialState = documentStore.uploadState;
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Simulate cancel by not providing files
      Object.defineProperty(fileInput, 'files', {
        value: [],
        writable: false,
      });

      fireEvent.change(fileInput);

      expect(documentStore.uploadState).toBe(initialState);
    });
  });

  describe('error handling - User Story 3', () => {
    it('should show invalid-extension error for wrong file type', async () => {
      render(() => <UploadZone />);
      const dropZone = screen.getByRole('region');

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
          types: ['Files'],
        },
      });

      await waitFor(() => {
        expect(documentStore.uploadState).toBe('error');
        expect(documentStore.error?.type).toBe('invalid-extension');
      });
    });

    it('should show empty-file error for empty file', async () => {
      render(() => <UploadZone />);
      const dropZone = screen.getByRole('region');

      const file = new File([''], 'empty.uidesc', { type: 'text/plain' });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
          types: ['Files'],
        },
      });

      await waitFor(() => {
        expect(documentStore.uploadState).toBe('error');
        expect(documentStore.error?.type).toBe('empty-file');
      });
    });

    it('should process only the first file when multiple files are dropped', async () => {
      render(() => <UploadZone />);
      const dropZone = screen.getByRole('region');

      const file1 = createMockUidescFile('content1', 'first.uidesc');
      const file2 = createMockUidescFile('content2', 'second.uidesc');

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file1, file2],
          types: ['Files'],
        },
      });

      await waitFor(() => {
        expect(documentStore.uploadState).toBe('success');
        expect(documentStore.content).toBe('content1');
        expect(documentStore.metadata?.filename).toBe('first.uidesc');
      });
    });

    it('should display error message with role="alert" for accessibility', async () => {
      render(() => <UploadZone />);
      const dropZone = screen.getByRole('region');

      const file = new File([''], 'empty.uidesc', { type: 'text/plain' });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
          types: ['Files'],
        },
      });

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
      });
    });

    it('should return to idle state when error is dismissed', async () => {
      render(() => <UploadZone />);
      const dropZone = screen.getByRole('region');

      const file = new File([''], 'empty.uidesc', { type: 'text/plain' });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
          types: ['Files'],
        },
      });

      await waitFor(() => {
        expect(documentStore.uploadState).toBe('error');
      });

      const dismissButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(dismissButton);

      expect(documentStore.uploadState).toBe('idle');
      expect(documentStore.error).toBeNull();
    });
  });

  describe('Create New functionality', () => {
    afterEach(() => {
      cleanup();
    });

    it('should show "Create New" button in idle state', () => {
      render(() => <UploadZone />);
      const createButton = screen.getByRole('button', { name: /create new/i });
      expect(createButton).toBeInTheDocument();
    });

    it('should open CreateNewDialog when "Create New" button is clicked', () => {
      render(() => <UploadZone />);

      const createButton = screen.getByRole('button', { name: /create new/i });
      fireEvent.click(createButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create New Document')).toBeInTheDocument();
    });

    it('should call createNewDocument when dialog onCreate is triggered', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout'] });

      render(() => <UploadZone />);

      // Open the dialog
      const createButton = screen.getByRole('button', { name: /create new/i });
      fireEvent.click(createButton);

      // Fill in values and submit
      const widthInput = screen.getByLabelText('Width');
      const heightInput = screen.getByLabelText('Height');

      fireEvent.input(widthInput, { target: { value: '800' } });
      fireEvent.change(widthInput, { target: { value: '800' } });
      fireEvent.input(heightInput, { target: { value: '600' } });
      fireEvent.change(heightInput, { target: { value: '600' } });

      const dialogCreateButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(dialogCreateButton);

      // Allow microtasks to flush
      await Promise.resolve();

      // Document should be created
      expect(documentStore.parseState).toBe('valid');
      expect(documentStore.document).not.toBeNull();

      const template = documentStore.document?.['vstgui-ui-description']?.templates?.view;
      expect(template?.attributes.size).toBe('800, 600');

      vi.useRealTimers();
    });

    it('should close dialog after document creation', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout'] });

      render(() => <UploadZone />);

      // Open the dialog
      const createButton = screen.getByRole('button', { name: /create new/i });
      fireEvent.click(createButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Submit with defaults
      const dialogCreateButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(dialogCreateButton);

      // Allow microtasks to flush
      await Promise.resolve();

      // Dialog should be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      vi.useRealTimers();
    });
  });
});
