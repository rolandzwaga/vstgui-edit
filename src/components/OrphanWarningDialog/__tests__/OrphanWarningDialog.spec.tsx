import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { OrphanWarningDialog } from '../OrphanWarningDialog';
import type { OrphanedBitmap } from '../../../domain/project/types';

const createOrphanedBitmaps = (count: number): OrphanedBitmap[] => {
  return Array.from({ length: count }, (_, i) => ({
    name: `bitmap${i + 1}`,
    size: (i + 1) * 1024, // 1KB, 2KB, etc.
  }));
};

describe('OrphanWarningDialog', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders when isOpen is true', () => {
    const orphanedBitmaps = createOrphanedBitmaps(2);

    render(() => (
      <OrphanWarningDialog
        isOpen={true}
        orphanedBitmaps={orphanedBitmaps}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    const orphanedBitmaps = createOrphanedBitmaps(2);

    render(() => (
      <OrphanWarningDialog
        isOpen={false}
        orphanedBitmaps={orphanedBitmaps}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('lists orphaned bitmap names', () => {
    const orphanedBitmaps = createOrphanedBitmaps(3);

    render(() => (
      <OrphanWarningDialog
        isOpen={true}
        orphanedBitmaps={orphanedBitmaps}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ));

    expect(screen.getByText('bitmap1')).toBeInTheDocument();
    expect(screen.getByText('bitmap2')).toBeInTheDocument();
    expect(screen.getByText('bitmap3')).toBeInTheDocument();
  });

  test('shows bitmap sizes', () => {
    const orphanedBitmaps: OrphanedBitmap[] = [
      { name: 'small', size: 1024 },
      { name: 'large', size: 1024 * 1024 },
    ];

    render(() => (
      <OrphanWarningDialog
        isOpen={true}
        orphanedBitmaps={orphanedBitmaps}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ));

    // Should show formatted sizes (use getAllBy since total also shows)
    expect(screen.getAllByText(/1.*KB/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1.*MB/i).length).toBeGreaterThan(0);
  });

  test('shows Confirm and Cancel buttons', () => {
    const orphanedBitmaps = createOrphanedBitmaps(1);

    render(() => (
      <OrphanWarningDialog
        isOpen={true}
        orphanedBitmaps={orphanedBitmaps}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ));

    expect(screen.getByRole('button', { name: /continue|confirm|proceed/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('calls onConfirm when Confirm button is clicked', () => {
    const orphanedBitmaps = createOrphanedBitmaps(1);
    const onConfirm = vi.fn();

    render(() => (
      <OrphanWarningDialog
        isOpen={true}
        orphanedBitmaps={orphanedBitmaps}
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    ));

    const confirmButton = screen.getByRole('button', { name: /continue|confirm|proceed/i });
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when Cancel button is clicked', () => {
    const orphanedBitmaps = createOrphanedBitmaps(1);
    const onCancel = vi.fn();

    render(() => (
      <OrphanWarningDialog
        isOpen={true}
        orphanedBitmaps={orphanedBitmaps}
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    ));

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when Escape is pressed', () => {
    const orphanedBitmaps = createOrphanedBitmaps(1);
    const onCancel = vi.fn();

    render(() => (
      <OrphanWarningDialog
        isOpen={true}
        orphanedBitmaps={orphanedBitmaps}
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    ));

    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when backdrop is clicked', () => {
    const orphanedBitmaps = createOrphanedBitmaps(1);
    const onCancel = vi.fn();

    render(() => (
      <OrphanWarningDialog
        isOpen={true}
        orphanedBitmaps={orphanedBitmaps}
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    ));

    const backdrop = screen.getByTestId('dialog-backdrop');
    fireEvent.click(backdrop);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('shows explanation text about orphaned bitmaps', () => {
    const orphanedBitmaps = createOrphanedBitmaps(2);

    render(() => (
      <OrphanWarningDialog
        isOpen={true}
        orphanedBitmaps={orphanedBitmaps}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ));

    // Should have the explanation text (use querySelector for more specific search)
    const explanation = screen.getByText(/no longer referenced/i);
    expect(explanation).toBeInTheDocument();
  });

  test('shows total size of orphaned bitmaps', () => {
    const orphanedBitmaps: OrphanedBitmap[] = [
      { name: 'bitmap1', size: 1024 },
      { name: 'bitmap2', size: 2048 },
    ];

    render(() => (
      <OrphanWarningDialog
        isOpen={true}
        orphanedBitmaps={orphanedBitmaps}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ));

    // Total is 3KB
    expect(screen.getByText(/total.*3.*KB/i)).toBeInTheDocument();
  });
});
