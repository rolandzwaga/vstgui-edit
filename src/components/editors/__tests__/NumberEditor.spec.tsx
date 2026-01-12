import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { NumberEditor } from '../NumberEditor';

describe('NumberEditor', () => {
  const defaultProps = {
    value: '0.5',
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
    it('should render input with initial value', () => {
      render(() => <NumberEditor {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(0.5);
    });

    it('should render disabled input when disabled prop is true', () => {
      render(() => <NumberEditor {...defaultProps} disabled />);
      const input = screen.getByRole('spinbutton');
      expect(input).toBeDisabled();
    });

    it('should display error message when error prop is provided', () => {
      render(() => <NumberEditor {...defaultProps} error="Must be at least 0" />);
      expect(screen.getByText('Must be at least 0')).toBeInTheDocument();
    });

    it('should apply error styling to input when error prop is provided', () => {
      render(() => <NumberEditor {...defaultProps} error="Invalid" />);
      const input = screen.getByRole('spinbutton');
      expect(input.className).toContain('editorInputError');
    });

    it('should render increment and decrement buttons', () => {
      render(() => <NumberEditor {...defaultProps} />);
      expect(screen.getByRole('button', { name: /increment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /decrement/i })).toBeInTheDocument();
    });

    it('should set min attribute when provided', () => {
      render(() => <NumberEditor {...defaultProps} min={0} />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '0');
    });

    it('should set max attribute when provided', () => {
      render(() => <NumberEditor {...defaultProps} max={1} />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('max', '1');
    });

    it('should set step attribute when provided', () => {
      render(() => <NumberEditor {...defaultProps} step={0.1} />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('step', '0.1');
    });

    it('should default step to 1 when not provided', () => {
      render(() => <NumberEditor {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('step', '1');
    });
  });

  describe('input handling', () => {
    it('should call onChange when input value changes', () => {
      const onChange = vi.fn();
      render(() => <NumberEditor {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.input(input, { target: { value: '0.75' } });

      expect(onChange).toHaveBeenCalledWith('0.75');
    });

    it('should handle empty input', () => {
      const onChange = vi.fn();
      render(() => <NumberEditor {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.input(input, { target: { value: '' } });

      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('keyboard handling', () => {
    it('should call onCommit when Enter key is pressed', () => {
      const onCommit = vi.fn();
      render(() => <NumberEditor {...defaultProps} onCommit={onCommit} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when Escape key is pressed', () => {
      const onCancel = vi.fn();
      render(() => <NumberEditor {...defaultProps} onCancel={onCancel} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should increment value on ArrowUp key', () => {
      const onChange = vi.fn();
      render(() => <NumberEditor {...defaultProps} value="5" step={1} onChange={onChange} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(onChange).toHaveBeenCalledWith('6');
    });

    it('should decrement value on ArrowDown key', () => {
      const onChange = vi.fn();
      render(() => <NumberEditor {...defaultProps} value="5" step={1} onChange={onChange} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      expect(onChange).toHaveBeenCalledWith('4');
    });

    it('should respect step when incrementing with ArrowUp', () => {
      const onChange = vi.fn();
      render(() => <NumberEditor {...defaultProps} value="0.5" step={0.1} onChange={onChange} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(onChange).toHaveBeenCalledWith('0.6');
    });

    it('should not exceed max value on ArrowUp', () => {
      const onChange = vi.fn();
      render(() => (
        <NumberEditor {...defaultProps} value="0.9" step={0.1} max={1} onChange={onChange} />
      ));

      const input = screen.getByRole('spinbutton');
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(onChange).toHaveBeenCalledWith('1');
    });

    it('should not go below min value on ArrowDown', () => {
      const onChange = vi.fn();
      render(() => (
        <NumberEditor {...defaultProps} value="0.1" step={0.1} min={0} onChange={onChange} />
      ));

      const input = screen.getByRole('spinbutton');
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      expect(onChange).toHaveBeenCalledWith('0');
    });

    it('should not call onChange if at max and ArrowUp pressed', () => {
      const onChange = vi.fn();
      render(() => (
        <NumberEditor {...defaultProps} value="1" step={0.1} max={1} onChange={onChange} />
      ));

      const input = screen.getByRole('spinbutton');
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should not call onChange if at min and ArrowDown pressed', () => {
      const onChange = vi.fn();
      render(() => (
        <NumberEditor {...defaultProps} value="0" step={0.1} min={0} onChange={onChange} />
      ));

      const input = screen.getByRole('spinbutton');
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('blur handling', () => {
    it('should call onCancel when input loses focus (requires Enter to commit)', () => {
      const onCancel = vi.fn();
      render(() => <NumberEditor {...defaultProps} onCancel={onCancel} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.blur(input);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('increment/decrement buttons', () => {
    it('should increment value when increment button is clicked', () => {
      const onChange = vi.fn();
      render(() => <NumberEditor {...defaultProps} value="5" step={1} onChange={onChange} />);

      const incrementBtn = screen.getByRole('button', { name: /increment/i });
      fireEvent.click(incrementBtn);

      expect(onChange).toHaveBeenCalledWith('6');
    });

    it('should decrement value when decrement button is clicked', () => {
      const onChange = vi.fn();
      render(() => <NumberEditor {...defaultProps} value="5" step={1} onChange={onChange} />);

      const decrementBtn = screen.getByRole('button', { name: /decrement/i });
      fireEvent.click(decrementBtn);

      expect(onChange).toHaveBeenCalledWith('4');
    });

    it('should respect step when clicking increment button', () => {
      const onChange = vi.fn();
      render(() => <NumberEditor {...defaultProps} value="0.5" step={0.1} onChange={onChange} />);

      const incrementBtn = screen.getByRole('button', { name: /increment/i });
      fireEvent.click(incrementBtn);

      expect(onChange).toHaveBeenCalledWith('0.6');
    });

    it('should disable increment button when at max', () => {
      render(() => <NumberEditor {...defaultProps} value="1" max={1} />);
      const incrementBtn = screen.getByRole('button', { name: /increment/i });
      expect(incrementBtn).toBeDisabled();
    });

    it('should disable decrement button when at min', () => {
      render(() => <NumberEditor {...defaultProps} value="0" min={0} />);
      const decrementBtn = screen.getByRole('button', { name: /decrement/i });
      expect(decrementBtn).toBeDisabled();
    });

    it('should disable both buttons when editor is disabled', () => {
      render(() => <NumberEditor {...defaultProps} disabled />);
      const incrementBtn = screen.getByRole('button', { name: /increment/i });
      const decrementBtn = screen.getByRole('button', { name: /decrement/i });
      expect(incrementBtn).toBeDisabled();
      expect(decrementBtn).toBeDisabled();
    });

    it('should not call onCommit when clicking increment button (only on Enter/blur)', () => {
      const onCommit = vi.fn();
      render(() => <NumberEditor {...defaultProps} value="5" step={1} onCommit={onCommit} />);

      const incrementBtn = screen.getByRole('button', { name: /increment/i });
      fireEvent.click(incrementBtn);

      expect(onCommit).not.toHaveBeenCalled();
    });

    it('should not call onCommit when clicking decrement button (only on Enter/blur)', () => {
      const onCommit = vi.fn();
      render(() => <NumberEditor {...defaultProps} value="5" step={1} onCommit={onCommit} />);

      const decrementBtn = screen.getByRole('button', { name: /decrement/i });
      fireEvent.click(decrementBtn);

      expect(onCommit).not.toHaveBeenCalled();
    });
  });

  describe('precision handling', () => {
    it('should handle floating point precision correctly (0.1 + 0.1 = 0.2, not 0.20000001)', () => {
      const onChange = vi.fn();
      render(() => <NumberEditor {...defaultProps} value="0.1" step={0.1} onChange={onChange} />);

      const incrementBtn = screen.getByRole('button', { name: /increment/i });
      fireEvent.click(incrementBtn);

      expect(onChange).toHaveBeenCalledWith('0.2');
    });

    it('should preserve precision based on step', () => {
      const onChange = vi.fn();
      render(() => <NumberEditor {...defaultProps} value="0.55" step={0.01} onChange={onChange} />);

      const incrementBtn = screen.getByRole('button', { name: /increment/i });
      fireEvent.click(incrementBtn);

      expect(onChange).toHaveBeenCalledWith('0.56');
    });
  });

  describe('validation display', () => {
    it('should show validation error for out of range value', () => {
      render(() => <NumberEditor {...defaultProps} value="2" error="Must be at most 1" />);
      expect(screen.getByText('Must be at most 1')).toBeInTheDocument();
    });

    it('should show aria-invalid when error exists', () => {
      render(() => <NumberEditor {...defaultProps} error="Invalid" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
