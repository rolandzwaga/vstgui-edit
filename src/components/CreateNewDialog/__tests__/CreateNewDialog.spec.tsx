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

  describe('container class dropdown', () => {
    it('dropdown shows default value "CViewContainer"', () => {
      renderDialog(true);
      const dropdown = screen.getByLabelText('Container Class') as HTMLSelectElement;
      expect(dropdown.value).toBe('CViewContainer');
    });

    it('dropdown shows all 7 container classes', () => {
      renderDialog(true);
      const dropdown = screen.getByLabelText('Container Class');
      const options = dropdown.querySelectorAll('option');
      expect(options.length).toBe(7);

      const optionValues = Array.from(options).map((o) => o.value);
      expect(optionValues).toContain('CViewContainer');
      expect(optionValues).toContain('CScrollView');
      expect(optionValues).toContain('CRowColumnView');
      expect(optionValues).toContain('CSplitView');
      expect(optionValues).toContain('CLayeredViewContainer');
      expect(optionValues).toContain('UIViewSwitchContainer');
      expect(optionValues).toContain('CShadowViewContainer');
    });

    it('selecting different container class passes it to onCreate', () => {
      renderDialog(true);

      const dropdown = screen.getByLabelText('Container Class');
      fireEvent.change(dropdown, { target: { value: 'CScrollView' } });

      const createButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(createButton);

      expect(mockOnCreate).toHaveBeenCalledWith({
        width: 400,
        height: 300,
        containerClass: 'CScrollView',
      });
    });

    it('CViewContainer is first in the dropdown order', () => {
      renderDialog(true);
      const dropdown = screen.getByLabelText('Container Class');
      const firstOption = dropdown.querySelector('option');
      expect(firstOption?.value).toBe('CViewContainer');
    });
  });

  describe('cancel and close', () => {
    it('Cancel button calls onClose', () => {
      renderDialog(true);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    it('X button calls onClose', () => {
      renderDialog(true);

      const closeButton = screen.getByRole('button', { name: 'Close' });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    it('Escape key calls onClose', () => {
      renderDialog(true);

      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    it('clicking backdrop calls onClose', () => {
      renderDialog(true);

      const backdrop = screen.getByTestId('dialog-backdrop');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    it('clicking dialog content does not call onClose', () => {
      renderDialog(true);

      const dialog = screen.getByRole('dialog');
      fireEvent.click(dialog);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('input validation', () => {
    it('shows error for empty width', () => {
      renderDialog(true);

      const widthInput = screen.getByLabelText('Width');
      fireEvent.input(widthInput, { target: { value: '' } });
      fireEvent.change(widthInput, { target: { value: '' } });

      const createButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(createButton);

      expect(screen.getByText('Width is required')).toBeInTheDocument();
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    it('shows error for empty height', () => {
      renderDialog(true);

      const heightInput = screen.getByLabelText('Height');
      fireEvent.input(heightInput, { target: { value: '' } });
      fireEvent.change(heightInput, { target: { value: '' } });

      const createButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(createButton);

      expect(screen.getByText('Height is required')).toBeInTheDocument();
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    it('shows error for value below minimum (0)', () => {
      renderDialog(true);

      const widthInput = screen.getByLabelText('Width');
      fireEvent.input(widthInput, { target: { value: '0' } });
      fireEvent.change(widthInput, { target: { value: '0' } });

      const createButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(createButton);

      expect(screen.getByText('Must be at least 1')).toBeInTheDocument();
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    it('shows error for value above maximum (10001)', () => {
      renderDialog(true);

      const widthInput = screen.getByLabelText('Width');
      fireEvent.input(widthInput, { target: { value: '10001' } });
      fireEvent.change(widthInput, { target: { value: '10001' } });

      const createButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(createButton);

      expect(screen.getByText('Must be at most 10000')).toBeInTheDocument();
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    it('shows error for non-numeric value', () => {
      renderDialog(true);

      const widthInput = screen.getByLabelText('Width');
      fireEvent.input(widthInput, { target: { value: 'abc' } });
      fireEvent.change(widthInput, { target: { value: 'abc' } });

      const createButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(createButton);

      expect(screen.getByText('Must be a number')).toBeInTheDocument();
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    it('clears error when user types in field', () => {
      renderDialog(true);

      const widthInput = screen.getByLabelText('Width');

      // Trigger error
      fireEvent.input(widthInput, { target: { value: '' } });
      fireEvent.change(widthInput, { target: { value: '' } });
      const createButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(createButton);
      expect(screen.getByText('Width is required')).toBeInTheDocument();

      // Type something - error should clear
      fireEvent.input(widthInput, { target: { value: '5' } });
      expect(screen.queryByText('Width is required')).not.toBeInTheDocument();
    });

    it('applies error styling to invalid input', () => {
      renderDialog(true);

      const widthInput = screen.getByLabelText('Width');
      fireEvent.input(widthInput, { target: { value: '' } });
      fireEvent.change(widthInput, { target: { value: '' } });

      const createButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(createButton);

      // Check for error styling (class contains 'inputError')
      expect(widthInput.className).toMatch(/inputError/);
    });

    it('validates both fields and shows multiple errors', () => {
      renderDialog(true);

      const widthInput = screen.getByLabelText('Width');
      const heightInput = screen.getByLabelText('Height');

      fireEvent.input(widthInput, { target: { value: '' } });
      fireEvent.change(widthInput, { target: { value: '' } });
      fireEvent.input(heightInput, { target: { value: '-5' } });
      fireEvent.change(heightInput, { target: { value: '-5' } });

      const createButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(createButton);

      expect(screen.getByText('Width is required')).toBeInTheDocument();
      expect(screen.getByText('Must be at least 1')).toBeInTheDocument();
      expect(mockOnCreate).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('dialog has role="dialog"', () => {
      renderDialog(true);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('dialog has aria-modal="true"', () => {
      renderDialog(true);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('dialog has aria-labelledby pointing to title', () => {
      renderDialog(true);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'create-new-dialog-title');

      const title = document.getElementById('create-new-dialog-title');
      expect(title).toHaveTextContent('Create New Document');
    });

    it('width input has associated label via id', () => {
      renderDialog(true);
      const widthInput = screen.getByLabelText('Width');
      expect(widthInput).toHaveAttribute('id', 'dialog-width');
    });

    it('height input has associated label via id', () => {
      renderDialog(true);
      const heightInput = screen.getByLabelText('Height');
      expect(heightInput).toHaveAttribute('id', 'dialog-height');
    });

    it('container class dropdown has associated label via id', () => {
      renderDialog(true);
      const dropdown = screen.getByLabelText('Container Class');
      expect(dropdown).toHaveAttribute('id', 'dialog-container-class');
    });

    it('close button has aria-label', () => {
      renderDialog(true);
      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toHaveAttribute('aria-label', 'Close');
    });
  });
});
