import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@solidjs/testing-library';
import { EnumEditor } from '../EnumEditor';

// Helper to wait for next animation frame (click-outside listener is added after rAF)
const waitForAnimationFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

describe('EnumEditor', () => {
  const defaultProps = {
    value: 'center',
    options: ['left', 'center', 'right'],
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
      render(() => <EnumEditor {...defaultProps} />);
      const button = screen.getByRole('combobox');
      expect(button).toHaveTextContent('center');
    });

    it('should render disabled button when disabled prop is true', () => {
      render(() => <EnumEditor {...defaultProps} disabled />);
      const button = screen.getByRole('combobox');
      expect(button).toBeDisabled();
    });

    it('should show dropdown indicator', () => {
      render(() => <EnumEditor {...defaultProps} />);
      const button = screen.getByRole('combobox');
      expect(button.textContent).toContain('▾');
    });

    it('should not show dropdown initially', () => {
      render(() => <EnumEditor {...defaultProps} />);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('dropdown interaction', () => {
    it('should show dropdown when button is clicked', async () => {
      render(() => <EnumEditor {...defaultProps} />);
      const button = screen.getByRole('combobox');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should show all options in dropdown', async () => {
      render(() => <EnumEditor {...defaultProps} />);
      const button = screen.getByRole('combobox');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'left' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'center' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'right' })).toBeInTheDocument();
      });
    });

    it('should mark current value as selected in dropdown', async () => {
      render(() => <EnumEditor {...defaultProps} value="center" />);
      const button = screen.getByRole('combobox');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        const centerOption = screen.getByRole('option', { name: 'center' });
        expect(centerOption).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should close dropdown when option is selected', async () => {
      render(() => <EnumEditor {...defaultProps} />);
      const button = screen.getByRole('combobox');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      const leftOption = screen.getByRole('option', { name: 'left' });
      fireEvent.click(leftOption);
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should call onChange and onCommit when option is selected', async () => {
      const onChange = vi.fn();
      const onCommit = vi.fn();
      render(() => <EnumEditor {...defaultProps} onChange={onChange} onCommit={onCommit} />);
      const button = screen.getByRole('combobox');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      const leftOption = screen.getByRole('option', { name: 'left' });
      fireEvent.click(leftOption);
      
      expect(onChange).toHaveBeenCalledWith('left');
      expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it('should not call onChange when same option is selected', async () => {
      const onChange = vi.fn();
      render(() => <EnumEditor {...defaultProps} value="center" onChange={onChange} />);
      const button = screen.getByRole('combobox');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      const centerOption = screen.getByRole('option', { name: 'center' });
      fireEvent.click(centerOption);
      
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard handling', () => {
    it('should open dropdown on Enter key', async () => {
      render(() => <EnumEditor {...defaultProps} />);
      const button = screen.getByRole('combobox');
      
      fireEvent.keyDown(button, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should open dropdown on Space key', async () => {
      render(() => <EnumEditor {...defaultProps} />);
      const button = screen.getByRole('combobox');
      
      fireEvent.keyDown(button, { key: ' ' });
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should open dropdown on ArrowDown key', async () => {
      render(() => <EnumEditor {...defaultProps} />);
      const button = screen.getByRole('combobox');
      
      fireEvent.keyDown(button, { key: 'ArrowDown' });
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should close dropdown on Escape key', async () => {
      render(() => <EnumEditor {...defaultProps} />);
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

    it('should call onCancel when Escape is pressed with dropdown closed', () => {
      const onCancel = vi.fn();
      render(() => <EnumEditor {...defaultProps} onCancel={onCancel} />);
      const button = screen.getByRole('combobox');
      
      fireEvent.keyDown(button, { key: 'Escape' });
      
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should navigate options with ArrowDown in open dropdown', async () => {
      render(() => <EnumEditor {...defaultProps} value="left" />);
      const button = screen.getByRole('combobox');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(button, { key: 'ArrowDown' });
      
      await waitFor(() => {
        const centerOption = screen.getByRole('option', { name: 'center' });
        expect(centerOption.className).toContain('highlighted');
      });
    });

    it('should navigate options with ArrowUp in open dropdown', async () => {
      render(() => <EnumEditor {...defaultProps} value="right" />);
      const button = screen.getByRole('combobox');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(button, { key: 'ArrowUp' });
      
      await waitFor(() => {
        const centerOption = screen.getByRole('option', { name: 'center' });
        expect(centerOption.className).toContain('highlighted');
      });
    });

    it('should select highlighted option on Enter in open dropdown', async () => {
      const onChange = vi.fn();
      const onCommit = vi.fn();
      render(() => (
        <EnumEditor {...defaultProps} value="left" onChange={onChange} onCommit={onCommit} />
      ));
      const button = screen.getByRole('combobox');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(button, { key: 'ArrowDown' });
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(onChange).toHaveBeenCalledWith('center');
      expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it('should wrap around when navigating past last option', async () => {
      render(() => <EnumEditor {...defaultProps} value="right" />);
      const button = screen.getByRole('combobox');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(button, { key: 'ArrowDown' });
      
      await waitFor(() => {
        const leftOption = screen.getByRole('option', { name: 'left' });
        expect(leftOption.className).toContain('highlighted');
      });
    });

    it('should wrap around when navigating before first option', async () => {
      render(() => <EnumEditor {...defaultProps} value="left" />);
      const button = screen.getByRole('combobox');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(button, { key: 'ArrowUp' });
      
      await waitFor(() => {
        const rightOption = screen.getByRole('option', { name: 'right' });
        expect(rightOption.className).toContain('highlighted');
      });
    });
  });

  describe('blur handling', () => {
    it('should close dropdown when clicking outside component', async () => {
      render(() => (
        <div>
          <EnumEditor {...defaultProps} />
          <button data-testid="other-button">Other</button>
        </div>
      ));
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Wait for click-outside listener to be added (uses requestAnimationFrame)
      await waitForAnimationFrame();

      const otherButton = screen.getByTestId('other-button');
      fireEvent.mouseDown(otherButton);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('should have aria-expanded attribute', () => {
      render(() => <EnumEditor {...defaultProps} />);
      const button = screen.getByRole('combobox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when dropdown opens', async () => {
      render(() => <EnumEditor {...defaultProps} />);
      const button = screen.getByRole('combobox');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have aria-haspopup attribute', () => {
      render(() => <EnumEditor {...defaultProps} />);
      const button = screen.getByRole('combobox');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    });
  });
});
