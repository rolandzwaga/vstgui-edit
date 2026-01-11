/**
 * Tests for ReplaceControls component
 * Replace input and action buttons.
 */

import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { ReplaceControls } from '../ReplaceControls';

describe('ReplaceControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('should render replace input', () => {
      render(() => (
        <ReplaceControls
          value=""
          onInput={vi.fn()}
          onReplace={vi.fn()}
          onReplaceAll={vi.fn()}
          hasResults={true}
          attributeName="background-color"
        />
      ));

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render Replace button', () => {
      render(() => (
        <ReplaceControls
          value=""
          onInput={vi.fn()}
          onReplace={vi.fn()}
          onReplaceAll={vi.fn()}
          hasResults={true}
          attributeName="background-color"
        />
      ));

      expect(screen.getByRole('button', { name: 'Replace' })).toBeInTheDocument();
    });

    it('should render Replace All button', () => {
      render(() => (
        <ReplaceControls
          value=""
          onInput={vi.fn()}
          onReplace={vi.fn()}
          onReplaceAll={vi.fn()}
          hasResults={true}
          attributeName="background-color"
        />
      ));

      expect(screen.getByRole('button', { name: 'Replace All' })).toBeInTheDocument();
    });

    it('should show placeholder with attribute name', () => {
      render(() => (
        <ReplaceControls
          value=""
          onInput={vi.fn()}
          onReplace={vi.fn()}
          onReplaceAll={vi.fn()}
          hasResults={true}
          attributeName="background-color"
        />
      ));

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Replace background-color with...');
    });

    it('should show generic placeholder when no attribute name', () => {
      render(() => (
        <ReplaceControls
          value=""
          onInput={vi.fn()}
          onReplace={vi.fn()}
          onReplaceAll={vi.fn()}
          hasResults={true}
        />
      ));

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Replace with...');
    });
  });

  describe('input handling', () => {
    it('should call onInput when text is entered', () => {
      const onInput = vi.fn();
      render(() => (
        <ReplaceControls
          value=""
          onInput={onInput}
          onReplace={vi.fn()}
          onReplaceAll={vi.fn()}
          hasResults={true}
        />
      ));

      fireEvent.input(screen.getByRole('textbox'), { target: { value: '#00FF00' } });

      expect(onInput).toHaveBeenCalledWith('#00FF00');
    });

    it('should display current value', () => {
      render(() => (
        <ReplaceControls
          value="#FF0000"
          onInput={vi.fn()}
          onReplace={vi.fn()}
          onReplaceAll={vi.fn()}
          hasResults={true}
        />
      ));

      expect(screen.getByRole('textbox')).toHaveValue('#FF0000');
    });
  });

  describe('button states', () => {
    it('should disable buttons when no results', () => {
      render(() => (
        <ReplaceControls
          value="#00FF00"
          onInput={vi.fn()}
          onReplace={vi.fn()}
          onReplaceAll={vi.fn()}
          hasResults={false}
        />
      ));

      expect(screen.getByRole('button', { name: 'Replace' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Replace All' })).toBeDisabled();
    });

    it('should disable buttons when value is empty', () => {
      render(() => (
        <ReplaceControls
          value=""
          onInput={vi.fn()}
          onReplace={vi.fn()}
          onReplaceAll={vi.fn()}
          hasResults={true}
        />
      ));

      expect(screen.getByRole('button', { name: 'Replace' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Replace All' })).toBeDisabled();
    });

    it('should enable buttons when value and results exist', () => {
      render(() => (
        <ReplaceControls
          value="#00FF00"
          onInput={vi.fn()}
          onReplace={vi.fn()}
          onReplaceAll={vi.fn()}
          hasResults={true}
        />
      ));

      expect(screen.getByRole('button', { name: 'Replace' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: 'Replace All' })).not.toBeDisabled();
    });
  });

  describe('button actions', () => {
    it('should call onReplace when Replace button is clicked', () => {
      const onReplace = vi.fn();
      render(() => (
        <ReplaceControls
          value="#00FF00"
          onInput={vi.fn()}
          onReplace={onReplace}
          onReplaceAll={vi.fn()}
          hasResults={true}
        />
      ));

      fireEvent.click(screen.getByRole('button', { name: 'Replace' }));

      expect(onReplace).toHaveBeenCalledTimes(1);
    });

    it('should call onReplaceAll when Replace All button is clicked', () => {
      const onReplaceAll = vi.fn();
      render(() => (
        <ReplaceControls
          value="#00FF00"
          onInput={vi.fn()}
          onReplace={vi.fn()}
          onReplaceAll={onReplaceAll}
          hasResults={true}
        />
      ));

      fireEvent.click(screen.getByRole('button', { name: 'Replace All' }));

      expect(onReplaceAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('error display', () => {
    it('should display error message when provided', () => {
      render(() => (
        <ReplaceControls
          value="#00FF00"
          onInput={vi.fn()}
          onReplace={vi.fn()}
          onReplaceAll={vi.fn()}
          hasResults={true}
          error="Cannot replace read-only attribute"
        />
      ));

      expect(screen.getByText('Cannot replace read-only attribute')).toBeInTheDocument();
    });

    it('should add error styling to input when error exists', () => {
      render(() => (
        <ReplaceControls
          value="#00FF00"
          onInput={vi.fn()}
          onReplace={vi.fn()}
          onReplaceAll={vi.fn()}
          hasResults={true}
          error="Invalid value"
        />
      ));

      const input = screen.getByRole('textbox');
      expect(input.className).toContain('Error');
    });
  });

  describe('accessibility', () => {
    it('should have aria-label for replace input', () => {
      render(() => (
        <ReplaceControls
          value=""
          onInput={vi.fn()}
          onReplace={vi.fn()}
          onReplaceAll={vi.fn()}
          hasResults={true}
        />
      ));

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Replacement value');
    });

    it('should have aria-invalid when error exists', () => {
      render(() => (
        <ReplaceControls
          value="#00FF00"
          onInput={vi.fn()}
          onReplace={vi.fn()}
          onReplaceAll={vi.fn()}
          hasResults={true}
          error="Invalid"
        />
      ));

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
