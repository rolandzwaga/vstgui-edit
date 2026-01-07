import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@solidjs/testing-library';
import { ColorPicker } from '../ColorPicker';

describe('ColorPicker', () => {
  const defaultProps = {
    value: 'Background',
    documentColors: ['Background', 'Accent', 'Text'],
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
      render(() => <ColorPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');
      expect(button).toHaveTextContent('Background');
    });

    it('should render disabled button when disabled prop is true', () => {
      render(() => <ColorPicker {...defaultProps} disabled />);
      const button = screen.getByRole('combobox');
      expect(button).toBeDisabled();
    });

    it('should show color preview swatch for hex color', () => {
      render(() => <ColorPicker {...defaultProps} value="#FF5500FF" />);
      const swatch = screen.getByTestId('color-swatch');
      expect(swatch).toHaveStyle({ backgroundColor: '#FF5500FF' });
    });

    it('should not show dropdown initially', () => {
      render(() => <ColorPicker {...defaultProps} />);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('dropdown interaction', () => {
    it('should show dropdown when button is clicked', async () => {
      render(() => <ColorPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should show document colors as options', async () => {
      render(() => <ColorPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /Background/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /Accent/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /Text/i })).toBeInTheDocument();
      });
    });

    it('should mark current value as selected', async () => {
      render(() => <ColorPicker {...defaultProps} value="Accent" />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        const accentOption = screen.getByRole('option', { name: /Accent/i });
        expect(accentOption).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should call onChange and onCommit when color is selected', async () => {
      const onChange = vi.fn();
      const onCommit = vi.fn();
      render(() => <ColorPicker {...defaultProps} onChange={onChange} onCommit={onCommit} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const accentOption = screen.getByRole('option', { name: /Accent/i });
      fireEvent.click(accentOption);

      expect(onChange).toHaveBeenCalledWith('Accent');
      expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it('should close dropdown after selection', async () => {
      render(() => <ColorPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const accentOption = screen.getByRole('option', { name: /Accent/i });
      fireEvent.click(accentOption);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('hex color input', () => {
    it('should show hex input field in dropdown', async () => {
      render(() => <ColorPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('#RRGGBB')).toBeInTheDocument();
      });
    });

    it('should allow entering hex color directly', async () => {
      const onChange = vi.fn();
      render(() => <ColorPicker {...defaultProps} onChange={onChange} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('#RRGGBB')).toBeInTheDocument();
      });

      const hexInput = screen.getByPlaceholderText('#RRGGBB');
      fireEvent.input(hexInput, { target: { value: '#FF0000' } });

      expect(onChange).toHaveBeenCalledWith('#FF0000');
    });

    it('should call onCommit when Enter is pressed in hex input with valid value', async () => {
      const onCommit = vi.fn();
      render(() => <ColorPicker {...defaultProps} onCommit={onCommit} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('#RRGGBB')).toBeInTheDocument();
      });

      const hexInput = screen.getByPlaceholderText('#RRGGBB');
      fireEvent.input(hexInput, { target: { value: '#FF0000' } });
      fireEvent.keyDown(hexInput, { key: 'Enter' });

      expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it('should show validation error for invalid hex', async () => {
      render(() => <ColorPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('#RRGGBB')).toBeInTheDocument();
      });

      const hexInput = screen.getByPlaceholderText('#RRGGBB');
      fireEvent.input(hexInput, { target: { value: 'xyz' } });
      fireEvent.keyDown(hexInput, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Must be a defined color/i)).toBeInTheDocument();
      });
    });
  });

  describe('predefined colors', () => {
    it('should accept predefined color notation (~)', async () => {
      const onChange = vi.fn();
      render(() => <ColorPicker {...defaultProps} onChange={onChange} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('#RRGGBB')).toBeInTheDocument();
      });

      const hexInput = screen.getByPlaceholderText('#RRGGBB');
      fireEvent.input(hexInput, { target: { value: '~BlackCColor' } });
      fireEvent.keyDown(hexInput, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith('~BlackCColor');
    });
  });

  describe('keyboard handling', () => {
    it('should open dropdown on Enter key', async () => {
      render(() => <ColorPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.keyDown(button, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should close dropdown on Escape key', async () => {
      render(() => <ColorPicker {...defaultProps} />);
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
      render(() => <ColorPicker {...defaultProps} onCancel={onCancel} />);
      const button = screen.getByRole('combobox');

      fireEvent.keyDown(button, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have aria-expanded attribute', () => {
      render(() => <ColorPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when dropdown opens', async () => {
      render(() => <ColorPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('empty document colors', () => {
    it('should still render hex input when no document colors', async () => {
      render(() => <ColorPicker {...defaultProps} documentColors={[]} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('#RRGGBB')).toBeInTheDocument();
      });
    });
  });
});
