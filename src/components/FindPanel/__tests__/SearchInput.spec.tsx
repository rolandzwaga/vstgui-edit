/**
 * Tests for SearchInput component
 * Debounced input for search queries.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { SearchInput } from '../SearchInput';

describe('SearchInput', () => {
  const defaultProps = {
    value: '',
    onInput: vi.fn(),
    onDebouncedInput: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout'],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  describe('rendering', () => {
    it('should render input with provided value', () => {
      render(() => <SearchInput {...defaultProps} value="CKnob" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('CKnob');
    });

    it('should render placeholder text', () => {
      render(() => <SearchInput {...defaultProps} placeholder="Search views..." />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Search views...');
    });

    it('should have aria-label for accessibility', () => {
      render(() => <SearchInput {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label');
    });
  });

  describe('auto-focus', () => {
    it('should auto-focus on mount when autoFocus is true', () => {
      render(() => <SearchInput {...defaultProps} autoFocus />);
      const input = screen.getByRole('textbox');
      expect(document.activeElement).toBe(input);
    });

    it('should not auto-focus when autoFocus is not set', () => {
      render(() => <SearchInput {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(document.activeElement).not.toBe(input);
    });
  });

  describe('immediate input callback', () => {
    it('should call onInput immediately on input', () => {
      const onInput = vi.fn();
      render(() => <SearchInput {...defaultProps} onInput={onInput} />);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'test' } });

      expect(onInput).toHaveBeenCalledWith('test');
      expect(onInput).toHaveBeenCalledTimes(1);
    });

    it('should call onInput for each keystroke', () => {
      const onInput = vi.fn();
      render(() => <SearchInput {...defaultProps} onInput={onInput} />);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'C' } });
      fireEvent.input(input, { target: { value: 'CK' } });
      fireEvent.input(input, { target: { value: 'CKn' } });

      expect(onInput).toHaveBeenCalledTimes(3);
    });
  });

  describe('debounced input callback', () => {
    it('should not call onDebouncedInput immediately', () => {
      const onDebouncedInput = vi.fn();
      render(() => (
        <SearchInput {...defaultProps} onDebouncedInput={onDebouncedInput} />
      ));

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'test' } });

      expect(onDebouncedInput).not.toHaveBeenCalled();
    });

    it('should call onDebouncedInput after debounce delay', async () => {
      const onDebouncedInput = vi.fn();
      render(() => (
        <SearchInput {...defaultProps} onDebouncedInput={onDebouncedInput} debounceMs={150} />
      ));

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'test' } });

      expect(onDebouncedInput).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(150);
      await Promise.resolve();

      expect(onDebouncedInput).toHaveBeenCalledWith('test');
      expect(onDebouncedInput).toHaveBeenCalledTimes(1);
    });

    it('should reset debounce timer on subsequent input', async () => {
      const onDebouncedInput = vi.fn();
      render(() => (
        <SearchInput {...defaultProps} onDebouncedInput={onDebouncedInput} debounceMs={150} />
      ));

      const input = screen.getByRole('textbox');

      // First input
      fireEvent.input(input, { target: { value: 'C' } });
      await vi.advanceTimersByTimeAsync(100);

      // Second input (resets timer)
      fireEvent.input(input, { target: { value: 'CK' } });
      await vi.advanceTimersByTimeAsync(100);

      // Not called yet (only 100ms since last input)
      expect(onDebouncedInput).not.toHaveBeenCalled();

      // Wait remaining time
      await vi.advanceTimersByTimeAsync(50);
      await Promise.resolve();

      // Should only be called once with final value
      expect(onDebouncedInput).toHaveBeenCalledWith('CK');
      expect(onDebouncedInput).toHaveBeenCalledTimes(1);
    });

    it('should use default 150ms debounce when debounceMs not specified', async () => {
      const onDebouncedInput = vi.fn();
      render(() => <SearchInput {...defaultProps} onDebouncedInput={onDebouncedInput} />);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'test' } });

      await vi.advanceTimersByTimeAsync(149);
      expect(onDebouncedInput).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      await Promise.resolve();
      expect(onDebouncedInput).toHaveBeenCalled();
    });
  });

  describe('keyboard handling', () => {
    it('should call onEscape when Escape is pressed', () => {
      const onEscape = vi.fn();
      render(() => <SearchInput {...defaultProps} onEscape={onEscape} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(onEscape).toHaveBeenCalledTimes(1);
    });

    it('should call onEnter when Enter is pressed', () => {
      const onEnter = vi.fn();
      render(() => <SearchInput {...defaultProps} onEnter={onEnter} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it('should not trigger callbacks for other keys', () => {
      const onEscape = vi.fn();
      const onEnter = vi.fn();
      render(() => <SearchInput {...defaultProps} onEscape={onEscape} onEnter={onEnter} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Tab' });
      fireEvent.keyDown(input, { key: 'a' });

      expect(onEscape).not.toHaveBeenCalled();
      expect(onEnter).not.toHaveBeenCalled();
    });
  });

  describe('clear on escape', () => {
    it('should clear input when clearOnEscape is true', () => {
      const onInput = vi.fn();
      render(() => <SearchInput {...defaultProps} value="test" onInput={onInput} clearOnEscape />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(onInput).toHaveBeenCalledWith('');
    });
  });
});
