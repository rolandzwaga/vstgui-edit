import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@solidjs/testing-library';
import { BitmapPicker } from '../BitmapPicker';

describe('BitmapPicker', () => {
  const defaultProps = {
    value: 'background.png',
    documentBitmaps: ['background.png', 'button.png', 'knob.png'],
    onChange: vi.fn(),
    onCommit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('should render a button with current value', () => {
      render(() => <BitmapPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');
      expect(button).toHaveTextContent('background.png');
    });

    it('should render disabled button when disabled prop is true', () => {
      render(() => <BitmapPicker {...defaultProps} disabled />);
      const button = screen.getByRole('combobox');
      expect(button).toBeDisabled();
    });

    it('should not show dropdown initially', () => {
      render(() => <BitmapPicker {...defaultProps} />);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('dropdown interaction', () => {
    it('should show dropdown when button is clicked', async () => {
      render(() => <BitmapPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should show document bitmaps as options', async () => {
      render(() => <BitmapPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /background\.png/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /button\.png/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /knob\.png/i })).toBeInTheDocument();
      });
    });

    it('should mark current value as selected', async () => {
      render(() => <BitmapPicker {...defaultProps} value="button.png" />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        const buttonOption = screen.getByRole('option', { name: /button\.png/i });
        expect(buttonOption).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should call onChange and onCommit when bitmap is selected', async () => {
      const onChange = vi.fn();
      const onCommit = vi.fn();
      render(() => <BitmapPicker {...defaultProps} onChange={onChange} onCommit={onCommit} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const buttonOption = screen.getByRole('option', { name: /button\.png/i });
      fireEvent.click(buttonOption);

      expect(onChange).toHaveBeenCalledWith('button.png');
      expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it('should close dropdown after selection', async () => {
      render(() => <BitmapPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const buttonOption = screen.getByRole('option', { name: /button\.png/i });
      fireEvent.click(buttonOption);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should not call onChange when same bitmap is selected', async () => {
      const onChange = vi.fn();
      render(() => <BitmapPicker {...defaultProps} value="background.png" onChange={onChange} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const bgOption = screen.getByRole('option', { name: /background\.png/i });
      fireEvent.click(bgOption);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard handling', () => {
    it('should open dropdown on Enter key', async () => {
      render(() => <BitmapPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.keyDown(button, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should close dropdown on Escape key', async () => {
      render(() => <BitmapPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      fireEvent.keyDown(button, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should call onCancel when Escape pressed with dropdown closed', () => {
      const onCancel = vi.fn();
      render(() => <BitmapPicker {...defaultProps} onCancel={onCancel} />);
      const button = screen.getByRole('combobox');

      fireEvent.keyDown(button, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should navigate options with ArrowDown', async () => {
      render(() => <BitmapPicker {...defaultProps} value="background.png" />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      fireEvent.keyDown(button, { key: 'ArrowDown' });

      await waitFor(() => {
        const buttonOption = screen.getByRole('option', { name: /button\.png/i });
        expect(buttonOption.className).toContain('highlighted');
      });
    });

    it('should select highlighted option on Enter', async () => {
      const onChange = vi.fn();
      const onCommit = vi.fn();
      render(() => (
        <BitmapPicker {...defaultProps} value="background.png" onChange={onChange} onCommit={onCommit} />
      ));
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      fireEvent.keyDown(button, { key: 'ArrowDown' });
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith('button.png');
      expect(onCommit).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have aria-expanded attribute', () => {
      render(() => <BitmapPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when dropdown opens', async () => {
      render(() => <BitmapPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('empty document bitmaps', () => {
    it('should render empty state when no document bitmaps', async () => {
      render(() => <BitmapPicker {...defaultProps} documentBitmaps={[]} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/no bitmaps defined/i)).toBeInTheDocument();
      });
    });
  });
});
