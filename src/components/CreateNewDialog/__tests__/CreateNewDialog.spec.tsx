import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateNewDialog } from '../CreateNewDialog';

describe('CreateNewDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnCreate = vi.fn();

  const renderDialog = (isOpen = true) =>
    render(() => (
      <CreateNewDialog isOpen={isOpen} onClose={mockOnClose} onCreate={mockOnCreate} />
    ));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('renders when isOpen=true', () => {
      renderDialog(true);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render when isOpen=false', () => {
      renderDialog(false);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('shows dialog title', () => {
      renderDialog(true);
      expect(screen.getByText('Create New Document')).toBeInTheDocument();
    });
  });

  describe('default values', () => {
    it('width input shows default value "400"', () => {
      renderDialog(true);
      const widthInput = screen.getByLabelText('Width') as HTMLInputElement;
      expect(widthInput.value).toBe('400');
    });

    it('height input shows default value "300"', () => {
      renderDialog(true);
      const heightInput = screen.getByLabelText('Height') as HTMLInputElement;
      expect(heightInput.value).toBe('300');
    });
  });

  describe('form interaction', () => {
    it('Create button calls onCreate with parsed config when valid', () => {
      renderDialog(true);

      const widthInput = screen.getByLabelText('Width');
      const heightInput = screen.getByLabelText('Height');

      fireEvent.input(widthInput, { target: { value: '800' } });
      fireEvent.change(widthInput, { target: { value: '800' } });
      fireEvent.input(heightInput, { target: { value: '600' } });
      fireEvent.change(heightInput, { target: { value: '600' } });

      const createButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(createButton);

      expect(mockOnCreate).toHaveBeenCalledWith({
        width: 800,
        height: 600,
        containerClass: 'CViewContainer',
      });
    });

    it('Enter key triggers create action', () => {
      renderDialog(true);

      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Enter' });

      expect(mockOnCreate).toHaveBeenCalledWith({
        width: 400,
        height: 300,
        containerClass: 'CViewContainer',
      });
    });

    it('form resets to defaults when dialog reopens', () => {
      // Use a signal to control isOpen for reactivity
      const [isOpen, setIsOpen] = createSignal(true);

      render(() => (
        <CreateNewDialog isOpen={isOpen()} onClose={mockOnClose} onCreate={mockOnCreate} />
      ));

      // Change the width
      const widthInput = screen.getByLabelText('Width') as HTMLInputElement;
      fireEvent.input(widthInput, { target: { value: '999' } });
      fireEvent.change(widthInput, { target: { value: '999' } });
      expect(widthInput.value).toBe('999');

      // Close the dialog
      setIsOpen(false);

      // Reopen the dialog
      setIsOpen(true);

      // Should be reset to default
      const newWidthInput = screen.getByLabelText('Width') as HTMLInputElement;
      expect(newWidthInput.value).toBe('400');
    });
  });

  describe('focus management', () => {
    it('width input receives focus when dialog opens', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout'] });

      renderDialog(true);

      // Allow setTimeout(0) to execute
      await vi.advanceTimersByTimeAsync(1);

      const widthInput = screen.getByLabelText('Width');
      expect(document.activeElement).toBe(widthInput);

      vi.useRealTimers();
    });
  });
});
