import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders title and message', () => {
    render(() => (
      <ConfirmDialog
        isOpen={true}
        title="Delete Project"
        message="Are you sure you want to delete this project?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ));

    expect(screen.getByText('Delete Project')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this project?')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    render(() => (
      <ConfirmDialog
        isOpen={false}
        title="Delete Project"
        message="Are you sure?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ));

    expect(screen.queryByText('Delete Project')).not.toBeInTheDocument();
  });

  test('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(() => (
      <ConfirmDialog
        isOpen={true}
        title="Delete"
        message="Confirm?"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    ));

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  test('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(() => (
      <ConfirmDialog
        isOpen={true}
        title="Delete"
        message="Confirm?"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    ));

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledOnce();
  });

  test('calls onCancel when Escape is pressed', () => {
    const onCancel = vi.fn();
    render(() => (
      <ConfirmDialog
        isOpen={true}
        title="Delete"
        message="Confirm?"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    ));

    const dialog = screen.getByRole('alertdialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledOnce();
  });

  test('calls onCancel when backdrop is clicked', () => {
    const onCancel = vi.fn();
    render(() => (
      <ConfirmDialog
        isOpen={true}
        title="Delete"
        message="Confirm?"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    ));

    const backdrop = screen.getByTestId('confirm-dialog-backdrop');
    fireEvent.click(backdrop);

    expect(onCancel).toHaveBeenCalledOnce();
  });

  test('renders custom confirm text', () => {
    render(() => (
      <ConfirmDialog
        isOpen={true}
        title="Delete"
        message="Confirm?"
        confirmText="Yes, Delete"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ));

    expect(screen.getByRole('button', { name: /yes, delete/i })).toBeInTheDocument();
  });

  test('renders custom cancel text', () => {
    render(() => (
      <ConfirmDialog
        isOpen={true}
        title="Delete"
        message="Confirm?"
        cancelText="No, Keep"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ));

    expect(screen.getByRole('button', { name: /no, keep/i })).toBeInTheDocument();
  });

  test('has destructive variant styling', () => {
    render(() => (
      <ConfirmDialog
        isOpen={true}
        title="Delete"
        message="Confirm?"
        variant="destructive"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ));

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    // CSS module class name contains 'danger'
    expect(confirmButton.className).toContain('danger');
  });

  test('has correct aria attributes', () => {
    render(() => (
      <ConfirmDialog
        isOpen={true}
        title="Delete Project"
        message="Are you sure?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ));

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });
});
