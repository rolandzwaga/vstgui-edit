import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@solidjs/testing-library';
import { FontPicker } from '../FontPicker';

describe('FontPicker', () => {
  const defaultProps = {
    value: 'default-font',
    documentFonts: ['default-font', 'title-font', 'small-font'],
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
      render(() => <FontPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');
      expect(button).toHaveTextContent('default-font');
    });

    it('should render disabled button when disabled prop is true', () => {
      render(() => <FontPicker {...defaultProps} disabled />);
      const button = screen.getByRole('combobox');
      expect(button).toBeDisabled();
    });

    it('should not show dropdown initially', () => {
      render(() => <FontPicker {...defaultProps} />);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('dropdown interaction', () => {
    it('should show dropdown when button is clicked', async () => {
      render(() => <FontPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should show document fonts as options', async () => {
      render(() => <FontPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /default-font/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /title-font/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /small-font/i })).toBeInTheDocument();
      });
    });

    it('should mark current value as selected', async () => {
      render(() => <FontPicker {...defaultProps} value="title-font" />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        const titleOption = screen.getByRole('option', { name: /title-font/i });
        expect(titleOption).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should call onChange and onCommit when font is selected', async () => {
      const onChange = vi.fn();
      const onCommit = vi.fn();
      render(() => <FontPicker {...defaultProps} onChange={onChange} onCommit={onCommit} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const titleOption = screen.getByRole('option', { name: /title-font/i });
      fireEvent.click(titleOption);

      expect(onChange).toHaveBeenCalledWith('title-font');
      expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it('should close dropdown after selection', async () => {
      render(() => <FontPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const titleOption = screen.getByRole('option', { name: /title-font/i });
      fireEvent.click(titleOption);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should not call onChange when same font is selected', async () => {
      const onChange = vi.fn();
      render(() => <FontPicker {...defaultProps} value="default-font" onChange={onChange} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const defaultOption = screen.getByRole('option', { name: /default-font/i });
      fireEvent.click(defaultOption);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard handling', () => {
    it('should open dropdown on Enter key', async () => {
      render(() => <FontPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.keyDown(button, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should close dropdown on Escape key', async () => {
      render(() => <FontPicker {...defaultProps} />);
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
      render(() => <FontPicker {...defaultProps} onCancel={onCancel} />);
      const button = screen.getByRole('combobox');

      fireEvent.keyDown(button, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should navigate options with ArrowDown', async () => {
      render(() => <FontPicker {...defaultProps} value="default-font" />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      fireEvent.keyDown(button, { key: 'ArrowDown' });

      await waitFor(() => {
        const titleOption = screen.getByRole('option', { name: /title-font/i });
        expect(titleOption.className).toContain('highlighted');
      });
    });

    it('should select highlighted option on Enter', async () => {
      const onChange = vi.fn();
      const onCommit = vi.fn();
      render(() => (
        <FontPicker {...defaultProps} value="default-font" onChange={onChange} onCommit={onCommit} />
      ));
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      fireEvent.keyDown(button, { key: 'ArrowDown' });
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith('title-font');
      expect(onCommit).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have aria-expanded attribute', () => {
      render(() => <FontPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when dropdown opens', async () => {
      render(() => <FontPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('empty document fonts', () => {
    it('should render empty state when no document fonts', async () => {
      render(() => <FontPicker {...defaultProps} documentFonts={[]} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/no fonts defined/i)).toBeInTheDocument();
      });
    });
  });
});
