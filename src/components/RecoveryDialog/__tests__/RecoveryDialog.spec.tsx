/**
 * RecoveryDialog component tests
 */

import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecoveryDialog } from '../RecoveryDialog';

describe('RecoveryDialog', () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    isOpen: true,
    projectName: 'My Project',
    errors: [],
    canRestore: true,
    onDelete: vi.fn(),
    onRestore: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders when isOpen is true', () => {
    render(() => <RecoveryDialog {...defaultProps} />);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Project Recovery')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(() => <RecoveryDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('displays corrupted project name', () => {
    render(() => <RecoveryDialog {...defaultProps} projectName="Test Plugin UI" />);

    expect(screen.getByText(/"Test Plugin UI"/)).toBeInTheDocument();
  });

  it('displays validation errors when provided', () => {
    const errors = ['Missing uidescContent field', 'Invalid editorState format'];
    render(() => <RecoveryDialog {...defaultProps} errors={errors} />);

    expect(screen.getByText('Issues found:')).toBeInTheDocument();
    expect(screen.getByText('Missing uidescContent field')).toBeInTheDocument();
    expect(screen.getByText('Invalid editorState format')).toBeInTheDocument();
  });

  it('does not show errors section when no errors', () => {
    render(() => <RecoveryDialog {...defaultProps} errors={[]} />);

    expect(screen.queryByText('Issues found:')).not.toBeInTheDocument();
  });

  it('shows restore button when canRestore is true', () => {
    render(() => <RecoveryDialog {...defaultProps} canRestore={true} />);

    expect(screen.getByRole('button', { name: 'Restore Project' })).toBeInTheDocument();
  });

  it('hides restore button when canRestore is false', () => {
    render(() => <RecoveryDialog {...defaultProps} canRestore={false} />);

    expect(screen.queryByRole('button', { name: 'Restore Project' })).not.toBeInTheDocument();
  });

  it('shows appropriate message when project cannot be restored', () => {
    render(() => <RecoveryDialog {...defaultProps} canRestore={false} />);

    expect(
      screen.getByText(/cannot be restored.*delete it to remove/i)
    ).toBeInTheDocument();
  });

  it('shows appropriate message when project can be restored', () => {
    render(() => <RecoveryDialog {...defaultProps} canRestore={true} />);

    expect(
      screen.getByText(/attempt to restore.*or delete it permanently/i)
    ).toBeInTheDocument();
  });

  it('calls onDelete when Delete button is clicked', () => {
    const onDelete = vi.fn();
    render(() => <RecoveryDialog {...defaultProps} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete Project' }));

    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('calls onRestore when Restore button is clicked', () => {
    const onRestore = vi.fn();
    render(() => <RecoveryDialog {...defaultProps} onRestore={onRestore} />);

    fireEvent.click(screen.getByRole('button', { name: 'Restore Project' }));

    expect(onRestore).toHaveBeenCalledOnce();
  });

  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(() => <RecoveryDialog {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when Escape key is pressed', () => {
    const onCancel = vi.fn();
    render(() => <RecoveryDialog {...defaultProps} onCancel={onCancel} />);

    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when backdrop is clicked', () => {
    const onCancel = vi.fn();
    render(() => <RecoveryDialog {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByTestId('recovery-dialog-backdrop'));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('does not call onCancel when dialog content is clicked', () => {
    const onCancel = vi.fn();
    render(() => <RecoveryDialog {...defaultProps} onCancel={onCancel} />);

    // Click on the dialog itself, not the backdrop
    fireEvent.click(screen.getByRole('alertdialog'));

    expect(onCancel).not.toHaveBeenCalled();
  });

  it('has correct ARIA attributes for accessibility', () => {
    render(() => <RecoveryDialog {...defaultProps} />);

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  it('renders all three buttons when canRestore is true', () => {
    render(() => <RecoveryDialog {...defaultProps} canRestore={true} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete Project' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restore Project' })).toBeInTheDocument();
  });

  it('renders only Cancel and Delete buttons when canRestore is false', () => {
    render(() => <RecoveryDialog {...defaultProps} canRestore={false} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete Project' })).toBeInTheDocument();
  });
});
