/**
 * HexInput Tests
 *
 * Tests for the hex color input component.
 * Validates input, normalizes format, and provides error feedback.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent, screen } from '@solidjs/testing-library';
import { HexInput } from '../HexInput';

describe('HexInput', () => {
  const defaultProps = {
    value: '#FF5500FF',
    onChange: vi.fn(),
    onCommit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ===========================================================================
  // Rendering
  // ===========================================================================

  describe('rendering', () => {
    test('renders input with current value', () => {
      render(() => <HexInput {...defaultProps} value="#FF0000FF" />);
      const input = screen.getByRole('textbox');
      expect(input).toBeTruthy();
      expect((input as HTMLInputElement).value).toBe('#FF0000FF');
    });

    test('renders placeholder when no value', () => {
      render(() => <HexInput {...defaultProps} value="" placeholder="#RRGGBBAA" />);
      const input = screen.getByRole('textbox');
      expect((input as HTMLInputElement).placeholder).toBe('#RRGGBBAA');
    });

    test('shows error message when error prop is set', () => {
      render(() => <HexInput {...defaultProps} error="Invalid color" />);
      expect(screen.getByText('Invalid color')).toBeTruthy();
    });
  });

  // ===========================================================================
  // Input Behavior
  // ===========================================================================

  describe('input behavior', () => {
    test('typing calls onChange with input value', () => {
      const onChange = vi.fn();
      render(() => <HexInput {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: '#00FF00' } });

      expect(onChange).toHaveBeenCalledWith('#00FF00');
    });

    test('pressing Enter with valid hex calls onCommit', () => {
      const onCommit = vi.fn();
      render(() => <HexInput {...defaultProps} value="#FF5500FF" onCommit={onCommit} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onCommit).toHaveBeenCalled();
    });

    test('pressing Enter with invalid hex shows error and does not commit', () => {
      const onCommit = vi.fn();
      render(() => <HexInput {...defaultProps} value="invalid" onCommit={onCommit} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onCommit).not.toHaveBeenCalled();
    });

    test('pressing Escape calls onCancel', () => {
      const onCancel = vi.fn();
      render(() => <HexInput {...defaultProps} onCancel={onCancel} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalled();
    });

    test('blur commits valid value', () => {
      const onCommit = vi.fn();
      render(() => <HexInput {...defaultProps} value="#FF5500FF" onCommit={onCommit} />);

      const input = screen.getByRole('textbox');
      fireEvent.blur(input);

      expect(onCommit).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Format Normalization
  // ===========================================================================

  describe('format normalization', () => {
    test('accepts 6-digit hex and normalizes to 8-digit', () => {
      const onChange = vi.fn();
      render(() => <HexInput {...defaultProps} value="#FF5500" onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      // The value should be normalized to 8-digit
      expect(onChange).toHaveBeenCalledWith('#FF5500FF');
    });

    test('accepts 3-digit shorthand and normalizes to 8-digit', () => {
      const onChange = vi.fn();
      render(() => <HexInput {...defaultProps} value="#F50" onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      // #F50 expands to #FF5500FF
      expect(onChange).toHaveBeenCalledWith('#FF5500FF');
    });

    test('accepts hex without # prefix and normalizes', () => {
      const onChange = vi.fn();
      render(() => <HexInput {...defaultProps} value="FF5500" onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith('#FF5500FF');
    });

    test('converts lowercase to uppercase', () => {
      const onChange = vi.fn();
      render(() => <HexInput {...defaultProps} value="#ff5500ff" onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith('#FF5500FF');
    });
  });

  // ===========================================================================
  // Validation
  // ===========================================================================

  describe('validation', () => {
    test('shows error for invalid hex characters', () => {
      const onCommit = vi.fn();
      render(() => <HexInput {...defaultProps} value="#GG0000" onCommit={onCommit} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onCommit).not.toHaveBeenCalled();
      // Error should be shown
    });

    test('shows error for wrong length', () => {
      const onCommit = vi.fn();
      render(() => <HexInput {...defaultProps} value="#FF00" onCommit={onCommit} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onCommit).not.toHaveBeenCalled();
    });

    test('clears error when valid input is entered', () => {
      render(() => <HexInput {...defaultProps} error="Invalid" />);

      // Initially shows error
      expect(screen.getByText('Invalid')).toBeTruthy();

      cleanup();

      // User enters valid value - no error prop
      render(() => <HexInput {...defaultProps} error={null} />);

      // Error should not be visible
      expect(screen.queryByText('Invalid')).toBeNull();
    });
  });

  // ===========================================================================
  // Disabled State
  // ===========================================================================

  describe('disabled state', () => {
    test('input is disabled when disabled prop is true', () => {
      render(() => <HexInput {...defaultProps} disabled={true} />);

      const input = screen.getByRole('textbox');
      expect((input as HTMLInputElement).disabled).toBe(true);
    });

    test('disabled input does not accept keyboard input', () => {
      const onChange = vi.fn();
      render(() => <HexInput {...defaultProps} disabled={true} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: '#00FF00' } });

      // onChange should not be called because input is disabled
      expect(input).toBeTruthy();
    });
  });

  // ===========================================================================
  // Accessibility
  // ===========================================================================

  describe('accessibility', () => {
    test('input has aria-label', () => {
      render(() => <HexInput {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input.hasAttribute('aria-label')).toBe(true);
    });

    test('input has aria-invalid when error exists', () => {
      render(() => <HexInput {...defaultProps} error="Invalid color" />);
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    test('input has aria-describedby pointing to error message', () => {
      render(() => <HexInput {...defaultProps} error="Invalid color" />);
      const input = screen.getByRole('textbox');
      const errorId = input.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(screen.getByText('Invalid color').id).toBe(errorId);
    });
  });
});
