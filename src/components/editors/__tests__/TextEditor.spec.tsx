import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { TextEditor } from '../TextEditor';

describe('TextEditor', () => {
  const defaultProps = {
    value: 'initial value',
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
      render(() => <TextEditor {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('initial value');
    });

    it('should render disabled input when disabled prop is true', () => {
      render(() => <TextEditor {...defaultProps} disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should display error message when error prop is provided', () => {
      render(() => <TextEditor {...defaultProps} error="Invalid value" />);
      expect(screen.getByText('Invalid value')).toBeInTheDocument();
    });

    it('should apply error styling to input when error prop is provided', () => {
      render(() => <TextEditor {...defaultProps} error="Invalid value" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('editorInputError');
    });
  });

  describe('input handling', () => {
    it('should call onChange when input value changes', () => {
      const onChange = vi.fn();
      render(() => <TextEditor {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'new value' } });

      expect(onChange).toHaveBeenCalledWith('new value');
    });

    it('should call onChange on each keystroke', () => {
      const onChange = vi.fn();
      render(() => <TextEditor {...defaultProps} value="" onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'a' } });
      fireEvent.input(input, { target: { value: 'ab' } });
      fireEvent.input(input, { target: { value: 'abc' } });

      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenNthCalledWith(1, 'a');
      expect(onChange).toHaveBeenNthCalledWith(2, 'ab');
      expect(onChange).toHaveBeenNthCalledWith(3, 'abc');
    });
  });

  describe('keyboard handling', () => {
    it('should call onCommit when Enter key is pressed', () => {
      const onCommit = vi.fn();
      render(() => <TextEditor {...defaultProps} onCommit={onCommit} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when Escape key is pressed', () => {
      const onCancel = vi.fn();
      render(() => <TextEditor {...defaultProps} onCancel={onCancel} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should not trigger commit/cancel on other keys', () => {
      const onCommit = vi.fn();
      const onCancel = vi.fn();
      render(() => (
        <TextEditor {...defaultProps} onCommit={onCommit} onCancel={onCancel} />
      ));

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Tab' });
      fireEvent.keyDown(input, { key: 'a' });

      expect(onCommit).not.toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe('blur handling', () => {
    it('should call onCommit when input loses focus', () => {
      const onCommit = vi.fn();
      render(() => <TextEditor {...defaultProps} onCommit={onCommit} />);

      const input = screen.getByRole('textbox');
      fireEvent.blur(input);

      expect(onCommit).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have proper aria attributes', () => {
      render(() => <TextEditor {...defaultProps} error="Invalid value" />);
      const input = screen.getByRole('textbox');

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not have aria-invalid when no error', () => {
      render(() => <TextEditor {...defaultProps} />);
      const input = screen.getByRole('textbox');

      expect(input).not.toHaveAttribute('aria-invalid');
    });
  });
});
