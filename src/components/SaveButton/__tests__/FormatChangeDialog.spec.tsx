import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { FormatChangeDialog } from '../FormatChangeDialog';

describe('FormatChangeDialog', () => {
  const defaultProps = {
    isOpen: true,
    originalFormat: 'json' as const,
    newFormat: 'xml' as const,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    test('renders when isOpen is true', () => {
      render(() => <FormatChangeDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('does not render when isOpen is false', () => {
      render(() => <FormatChangeDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('displays original and new format names', () => {
      render(() => <FormatChangeDialog {...defaultProps} />);

      expect(screen.getByText(/json/i)).toBeInTheDocument();
      expect(screen.getByText(/xml/i)).toBeInTheDocument();
    });

    test('renders Change Format button', () => {
      render(() => <FormatChangeDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /change format/i })).toBeInTheDocument();
    });

    test('renders Cancel button', () => {
      render(() => <FormatChangeDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    test('calls onConfirm when Change Format button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(() => <FormatChangeDialog {...defaultProps} onConfirm={onConfirm} />);

      await user.click(screen.getByRole('button', { name: /change format/i }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    test('calls onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      render(() => <FormatChangeDialog {...defaultProps} onCancel={onCancel} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    test('calls onCancel when Escape key is pressed', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      render(() => <FormatChangeDialog {...defaultProps} onCancel={onCancel} />);

      await user.keyboard('{Escape}');

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    test('dialog has role="dialog"', () => {
      render(() => <FormatChangeDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('dialog has aria-modal attribute', () => {
      render(() => <FormatChangeDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    test('dialog has aria-labelledby pointing to heading', () => {
      render(() => <FormatChangeDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      const labelId = dialog.getAttribute('aria-labelledby');
      expect(labelId).toBeTruthy();
      expect(document.getElementById(labelId!)).toBeInTheDocument();
    });
  });
});
