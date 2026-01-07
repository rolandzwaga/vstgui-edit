import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { PointEditor } from '../PointEditor';

describe('PointEditor', () => {
  const defaultProps = {
    value: '100, 200',
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
      render(() => <PointEditor {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('100, 200');
    });

    it('should render disabled input when disabled prop is true', () => {
      render(() => <PointEditor {...defaultProps} disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should display error message when error prop is provided', () => {
      render(() => <PointEditor {...defaultProps} error='Expected format: "x, y"' />);
      expect(screen.getByText('Expected format: "x, y"')).toBeInTheDocument();
    });

    it('should apply error styling to input when error prop is provided', () => {
      render(() => <PointEditor {...defaultProps} error="Invalid" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('editorInputError');
    });
  });

  describe('input handling', () => {
    it('should call onChange when input value changes', () => {
      const onChange = vi.fn();
      render(() => <PointEditor {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: '50, 75' } });

      expect(onChange).toHaveBeenCalledWith('50, 75');
    });
  });

  describe('keyboard handling', () => {
    it('should call onCommit when Enter key is pressed', () => {
      const onCommit = vi.fn();
      render(() => <PointEditor {...defaultProps} onCommit={onCommit} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when Escape key is pressed', () => {
      const onCancel = vi.fn();
      render(() => <PointEditor {...defaultProps} onCancel={onCancel} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('blur handling', () => {
    it('should call onCommit when input loses focus', () => {
      const onCommit = vi.fn();
      render(() => <PointEditor {...defaultProps} onCommit={onCommit} />);

      const input = screen.getByRole('textbox');
      fireEvent.blur(input);

      expect(onCommit).toHaveBeenCalledTimes(1);
    });
  });

  describe('validation display', () => {
    it('should show validation error for invalid format', () => {
      render(() => (
        <PointEditor {...defaultProps} value="invalid" error='Expected format: "x, y"' />
      ));
      expect(screen.getByText('Expected format: "x, y"')).toBeInTheDocument();
    });
  });
});
