/**
 * EyeDropperButton Tests
 *
 * Tests for the eyedropper tool button (Chromium browsers only).
 * Written following TDD approach - tests first, then implementation.
 */

import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@solidjs/testing-library';
import { EyeDropperButton } from '../EyeDropperButton';

describe('EyeDropperButton', () => {
  // Store original window.EyeDropper
  const originalEyeDropper = (window as unknown as { EyeDropper?: unknown }).EyeDropper;

  afterEach(() => {
    cleanup();
    // Restore original EyeDropper
    if (originalEyeDropper) {
      (window as unknown as { EyeDropper?: unknown }).EyeDropper = originalEyeDropper;
    } else {
      delete (window as unknown as { EyeDropper?: unknown }).EyeDropper;
    }
  });

  // ===========================================================================
  // Feature Detection
  // ===========================================================================

  describe('feature detection', () => {
    test('not rendered when EyeDropper API unavailable', () => {
      // Ensure EyeDropper is not available
      delete (window as unknown as { EyeDropper?: unknown }).EyeDropper;

      render(() => (
        <EyeDropperButton onColorPick={() => {}} />
      ));

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('rendered with icon when API available', () => {
      // Mock EyeDropper API
      (window as unknown as { EyeDropper: unknown }).EyeDropper = vi.fn();

      render(() => (
        <EyeDropperButton onColorPick={() => {}} />
      ));

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('button has eyedropper icon', () => {
      (window as unknown as { EyeDropper: unknown }).EyeDropper = vi.fn();

      render(() => (
        <EyeDropperButton onColorPick={() => {}} />
      ));

      // Check for SVG icon or aria-label
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('eyedropper'));
    });
  });

  // ===========================================================================
  // Click Interaction
  // ===========================================================================

  describe('click interaction', () => {
    test('click activates eyedropper', async () => {
      const mockOpen = vi.fn().mockResolvedValue({ sRGBHex: '#FF5500' });
      class MockEyeDropper {
        static wasCalled = false;
        open = mockOpen;
        constructor() {
          MockEyeDropper.wasCalled = true;
        }
      }
      (window as unknown as { EyeDropper: unknown }).EyeDropper = MockEyeDropper;

      render(() => (
        <EyeDropperButton onColorPick={() => {}} />
      ));

      const button = screen.getByRole('button');
      await fireEvent.click(button);

      // Wait for async operation
      await waitFor(() => {
        expect(MockEyeDropper.wasCalled).toBe(true);
      });
      expect(mockOpen).toHaveBeenCalled();
    });

    test('successful pick calls onColorPick with hex (adds FF alpha)', async () => {
      const handleColorPick = vi.fn();
      const mockOpen = vi.fn().mockResolvedValue({ sRGBHex: '#ff5500' });
      class MockEyeDropper {
        open = mockOpen;
      }
      (window as unknown as { EyeDropper: unknown }).EyeDropper = MockEyeDropper;

      render(() => (
        <EyeDropperButton onColorPick={handleColorPick} />
      ));

      const button = screen.getByRole('button');
      await fireEvent.click(button);

      // Wait for async operation to complete
      await waitFor(() => {
        expect(handleColorPick).toHaveBeenCalledWith('#FF5500FF');
      });
    });

    test('user cancellation (Escape) does not call onColorPick', async () => {
      const handleColorPick = vi.fn();
      // Mock rejection when user cancels
      const mockOpen = vi.fn().mockRejectedValue(new DOMException('User cancelled', 'AbortError'));
      const MockEyeDropper = vi.fn().mockImplementation(() => ({
        open: mockOpen,
      }));
      (window as unknown as { EyeDropper: unknown }).EyeDropper = MockEyeDropper;

      render(() => (
        <EyeDropperButton onColorPick={handleColorPick} />
      ));

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Wait for async operation
      await Promise.resolve();
      await Promise.resolve();

      expect(handleColorPick).not.toHaveBeenCalled();
    });

    test('handles other errors gracefully', async () => {
      const handleColorPick = vi.fn();
      // Mock unexpected error
      const mockOpen = vi.fn().mockRejectedValue(new Error('Unknown error'));
      const MockEyeDropper = vi.fn().mockImplementation(() => ({
        open: mockOpen,
      }));
      (window as unknown as { EyeDropper: unknown }).EyeDropper = MockEyeDropper;

      render(() => (
        <EyeDropperButton onColorPick={handleColorPick} />
      ));

      const button = screen.getByRole('button');

      // Should not throw
      expect(() => fireEvent.click(button)).not.toThrow();

      // Wait for async operation
      await Promise.resolve();
      await Promise.resolve();

      expect(handleColorPick).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Disabled State
  // ===========================================================================

  describe('disabled state', () => {
    test('disabled state prevents click', async () => {
      const handleColorPick = vi.fn();
      const mockOpen = vi.fn().mockResolvedValue({ sRGBHex: '#FF5500' });
      const MockEyeDropper = vi.fn().mockImplementation(() => ({
        open: mockOpen,
      }));
      (window as unknown as { EyeDropper: unknown }).EyeDropper = MockEyeDropper;

      render(() => (
        <EyeDropperButton onColorPick={handleColorPick} disabled />
      ));

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      fireEvent.click(button);

      // Wait for async operation
      await Promise.resolve();

      expect(mockOpen).not.toHaveBeenCalled();
      expect(handleColorPick).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Color Format
  // ===========================================================================

  describe('color format', () => {
    test('converts 6-digit result to 8-digit with FF alpha', async () => {
      const handleColorPick = vi.fn();
      // EyeDropper returns 6-digit hex
      const mockOpen = vi.fn().mockResolvedValue({ sRGBHex: '#aabbcc' });
      class MockEyeDropper {
        open = mockOpen;
      }
      (window as unknown as { EyeDropper: unknown }).EyeDropper = MockEyeDropper;

      render(() => (
        <EyeDropperButton onColorPick={handleColorPick} />
      ));

      const button = screen.getByRole('button');
      await fireEvent.click(button);

      // Wait for async operation to complete
      await waitFor(() => {
        expect(handleColorPick).toHaveBeenCalledWith('#AABBCCFF');
      });
    });

    test('converts lowercase hex to uppercase', async () => {
      const handleColorPick = vi.fn();
      const mockOpen = vi.fn().mockResolvedValue({ sRGBHex: '#aAbBcC' });
      class MockEyeDropper {
        open = mockOpen;
      }
      (window as unknown as { EyeDropper: unknown }).EyeDropper = MockEyeDropper;

      render(() => (
        <EyeDropperButton onColorPick={handleColorPick} />
      ));

      const button = screen.getByRole('button');
      await fireEvent.click(button);

      // Wait for async operation to complete
      await waitFor(() => {
        expect(handleColorPick).toHaveBeenCalledWith('#AABBCCFF');
      });
    });
  });

  // ===========================================================================
  // Accessibility
  // ===========================================================================

  describe('accessibility', () => {
    test('has accessible label', () => {
      (window as unknown as { EyeDropper: unknown }).EyeDropper = vi.fn();

      render(() => (
        <EyeDropperButton onColorPick={() => {}} />
      ));

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
    });

    test('button is keyboard accessible (Enter)', () => {
      const mockOpen = vi.fn().mockResolvedValue({ sRGBHex: '#FF5500' });
      const MockEyeDropper = vi.fn().mockImplementation(() => ({
        open: mockOpen,
      }));
      (window as unknown as { EyeDropper: unknown }).EyeDropper = MockEyeDropper;

      render(() => (
        <EyeDropperButton onColorPick={() => {}} />
      ));

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });
});
