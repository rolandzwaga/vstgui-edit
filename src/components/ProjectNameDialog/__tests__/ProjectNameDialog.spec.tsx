import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ProjectNameDialog } from '../ProjectNameDialog';

describe('ProjectNameDialog', () => {
  const mockOnCreate = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    test('renders dialog when isOpen is true', () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="create"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('does not render when isOpen is false', () => {
      render(() => (
        <ProjectNameDialog
          isOpen={false}
          mode="create"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('displays create mode title', () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="create"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      expect(screen.getByText('Create Project')).toBeInTheDocument();
    });

    test('displays rename mode title', () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="rename"
          initialName="Old Name"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      expect(screen.getByText('Rename Project')).toBeInTheDocument();
    });

    test('displays duplicate mode title', () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="duplicate"
          initialName="Original"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      expect(screen.getByText('Duplicate Project')).toBeInTheDocument();
    });
  });

  describe('input handling', () => {
    test('shows empty input for create mode', () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="create"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      const input = screen.getByTestId('project-name-input') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    test('populates input with initial name for rename mode', () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="rename"
          initialName="My Project"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      const input = screen.getByTestId('project-name-input') as HTMLInputElement;
      expect(input.value).toBe('My Project');
    });

    test('updates input value on type', async () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="create"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      const input = screen.getByTestId('project-name-input') as HTMLInputElement;
      fireEvent.input(input, { target: { value: 'New Name' } });

      expect(input.value).toBe('New Name');
    });
  });

  describe('validation', () => {
    test('shows error for empty name on submit', async () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="create"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      const confirmButton = screen.getByTestId('dialog-confirm-button');
      fireEvent.click(confirmButton);

      expect(screen.getByText('Project name is required')).toBeInTheDocument();
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    test('shows error for invalid characters', async () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="create"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      const input = screen.getByTestId('project-name-input');
      fireEvent.input(input, { target: { value: 'Invalid!@#Name' } });

      const confirmButton = screen.getByTestId('dialog-confirm-button');
      fireEvent.click(confirmButton);

      expect(
        screen.getByText('Name can only contain letters, numbers, spaces, hyphens, and underscores')
      ).toBeInTheDocument();
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    test('clears error on input change', async () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="create"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      // Trigger error first
      const confirmButton = screen.getByTestId('dialog-confirm-button');
      fireEvent.click(confirmButton);
      expect(screen.getByText('Project name is required')).toBeInTheDocument();

      // Type valid name
      const input = screen.getByTestId('project-name-input');
      fireEvent.input(input, { target: { value: 'Valid Name' } });

      expect(screen.queryByText('Project name is required')).not.toBeInTheDocument();
    });
  });

  describe('confirm action', () => {
    test('calls onConfirm with trimmed name on valid submit', async () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="create"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      const input = screen.getByTestId('project-name-input');
      fireEvent.input(input, { target: { value: '  My New Project  ' } });

      const confirmButton = screen.getByTestId('dialog-confirm-button');
      fireEvent.click(confirmButton);

      expect(mockOnCreate).toHaveBeenCalledWith('My New Project');
    });

    test('submits on Enter key', async () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="create"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      const input = screen.getByTestId('project-name-input');
      fireEvent.input(input, { target: { value: 'My Project' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnCreate).toHaveBeenCalledWith('My Project');
    });
  });

  describe('cancel action', () => {
    test('calls onClose on Cancel button click', () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="create"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      const cancelButton = screen.getByTestId('dialog-cancel-button');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test('calls onClose on Escape key', () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="create"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      const input = screen.getByTestId('project-name-input');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });

    test('calls onClose on backdrop click', () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="create"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      const backdrop = screen.getByTestId('dialog-backdrop');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test('does not close on dialog content click', () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="create"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      const dialog = screen.getByRole('dialog');
      fireEvent.click(dialog);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('close button', () => {
    test('calls onClose when close button clicked', () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="create"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('mode-specific button labels', () => {
    test('shows Create button for create mode', () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="create"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      expect(screen.getByTestId('dialog-confirm-button')).toHaveTextContent('Create');
    });

    test('shows Rename button for rename mode', () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="rename"
          initialName="Test"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      expect(screen.getByTestId('dialog-confirm-button')).toHaveTextContent('Rename');
    });

    test('shows Duplicate button for duplicate mode', () => {
      render(() => (
        <ProjectNameDialog
          isOpen={true}
          mode="duplicate"
          initialName="Test"
          onConfirm={mockOnCreate}
          onClose={mockOnClose}
        />
      ));

      expect(screen.getByTestId('dialog-confirm-button')).toHaveTextContent('Duplicate');
    });
  });
});
