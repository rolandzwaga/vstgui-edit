/**
 * ColorPreview Tests
 *
 * Tests for the color preview component showing old vs new color comparison.
 * Written following TDD approach - tests first, then implementation.
 */

import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { ColorPreview } from '../ColorPreview';

describe('ColorPreview', () => {
  // ===========================================================================
  // Rendering
  // ===========================================================================

  describe('rendering', () => {
    test('renders original color on left', () => {
      render(() => (
        <ColorPreview
          originalColor="#FF0000FF"
          currentColor="#00FF00FF"
          onRevert={() => {}}
        />
      ));

      const oldSwatch = screen.getByTestId('preview-old');
      expect(oldSwatch).toBeInTheDocument();
      expect(oldSwatch.style.backgroundColor).toContain('rgb(255, 0, 0)');
    });

    test('renders current color on right', () => {
      render(() => (
        <ColorPreview
          originalColor="#FF0000FF"
          currentColor="#00FF00FF"
          onRevert={() => {}}
        />
      ));

      const newSwatch = screen.getByTestId('preview-new');
      expect(newSwatch).toBeInTheDocument();
      expect(newSwatch.style.backgroundColor).toContain('rgb(0, 255, 0)');
    });

    test('shows checkerboard behind both swatches for transparency indication', () => {
      render(() => (
        <ColorPreview
          originalColor="#FF000080"
          currentColor="#00FF0080"
          onRevert={() => {}}
        />
      ));

      // Both swatches should have a checkerboard container
      const oldContainer = screen.getByTestId('preview-old-container');
      const newContainer = screen.getByTestId('preview-new-container');

      expect(oldContainer).toBeInTheDocument();
      expect(newContainer).toBeInTheDocument();
    });

    test('renders "Old" label for accessibility', () => {
      render(() => (
        <ColorPreview
          originalColor="#FF0000FF"
          currentColor="#00FF00FF"
          onRevert={() => {}}
        />
      ));

      expect(screen.getByText('Old')).toBeInTheDocument();
    });

    test('renders "New" label for accessibility', () => {
      render(() => (
        <ColorPreview
          originalColor="#FF0000FF"
          currentColor="#00FF00FF"
          onRevert={() => {}}
        />
      ));

      expect(screen.getByText('New')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Alpha/Transparency
  // ===========================================================================

  describe('alpha/transparency', () => {
    test('displays semi-transparent original color correctly', () => {
      render(() => (
        <ColorPreview
          originalColor="#FF000080"
          currentColor="#00FF00FF"
          onRevert={() => {}}
        />
      ));

      const oldSwatch = screen.getByTestId('preview-old');
      // Alpha 0x80 = 128 => 128/255 ~ 0.502
      expect(oldSwatch.style.backgroundColor).toMatch(/rgba?\(255,\s*0,\s*0/);
    });

    test('displays semi-transparent current color correctly', () => {
      render(() => (
        <ColorPreview
          originalColor="#FF0000FF"
          currentColor="#00FF0040"
          onRevert={() => {}}
        />
      ));

      const newSwatch = screen.getByTestId('preview-new');
      // Alpha 0x40 = 64 => 64/255 ~ 0.251
      expect(newSwatch.style.backgroundColor).toMatch(/rgba?\(0,\s*255,\s*0/);
    });

    test('displays fully transparent color', () => {
      render(() => (
        <ColorPreview
          originalColor="#FF000000"
          currentColor="#00FF00FF"
          onRevert={() => {}}
        />
      ));

      const oldSwatch = screen.getByTestId('preview-old');
      // Fully transparent should show through checkerboard
      expect(oldSwatch.style.backgroundColor).toMatch(/rgba?\(255,\s*0,\s*0,\s*0\)/);
    });
  });

  // ===========================================================================
  // Revert Interaction
  // ===========================================================================

  describe('revert interaction', () => {
    test('click on original color calls onRevert', () => {
      const handleRevert = vi.fn();
      render(() => (
        <ColorPreview
          originalColor="#FF0000FF"
          currentColor="#00FF00FF"
          onRevert={handleRevert}
        />
      ));

      const oldContainer = screen.getByTestId('preview-old-container');
      fireEvent.click(oldContainer);

      expect(handleRevert).toHaveBeenCalledTimes(1);
    });

    test('click on new color does not call onRevert', () => {
      const handleRevert = vi.fn();
      render(() => (
        <ColorPreview
          originalColor="#FF0000FF"
          currentColor="#00FF00FF"
          onRevert={handleRevert}
        />
      ));

      const newContainer = screen.getByTestId('preview-new-container');
      fireEvent.click(newContainer);

      expect(handleRevert).not.toHaveBeenCalled();
    });

    test('original color has cursor pointer for revert', () => {
      render(() => (
        <ColorPreview
          originalColor="#FF0000FF"
          currentColor="#00FF00FF"
          onRevert={() => {}}
        />
      ));

      const oldContainer = screen.getByTestId('preview-old-container');
      expect(oldContainer).toHaveStyle({ cursor: 'pointer' });
    });

    test('Enter key on original color triggers revert', () => {
      const handleRevert = vi.fn();
      render(() => (
        <ColorPreview
          originalColor="#FF0000FF"
          currentColor="#00FF00FF"
          onRevert={handleRevert}
        />
      ));

      const oldContainer = screen.getByTestId('preview-old-container');
      fireEvent.keyDown(oldContainer, { key: 'Enter' });

      expect(handleRevert).toHaveBeenCalledTimes(1);
    });

    test('Space key on original color triggers revert', () => {
      const handleRevert = vi.fn();
      render(() => (
        <ColorPreview
          originalColor="#FF0000FF"
          currentColor="#00FF00FF"
          onRevert={handleRevert}
        />
      ));

      const oldContainer = screen.getByTestId('preview-old-container');
      fireEvent.keyDown(oldContainer, { key: ' ' });

      expect(handleRevert).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Accessibility
  // ===========================================================================

  describe('accessibility', () => {
    test('original color container has role button', () => {
      render(() => (
        <ColorPreview
          originalColor="#FF0000FF"
          currentColor="#00FF00FF"
          onRevert={() => {}}
        />
      ));

      const oldContainer = screen.getByTestId('preview-old-container');
      expect(oldContainer).toHaveAttribute('role', 'button');
    });

    test('original color container has tabIndex for keyboard access', () => {
      render(() => (
        <ColorPreview
          originalColor="#FF0000FF"
          currentColor="#00FF00FF"
          onRevert={() => {}}
        />
      ));

      const oldContainer = screen.getByTestId('preview-old-container');
      expect(oldContainer).toHaveAttribute('tabIndex', '0');
    });

    test('original color has aria-label for revert action', () => {
      render(() => (
        <ColorPreview
          originalColor="#FF0000FF"
          currentColor="#00FF00FF"
          onRevert={() => {}}
        />
      ));

      const oldContainer = screen.getByTestId('preview-old-container');
      expect(oldContainer).toHaveAttribute('aria-label', expect.stringContaining('revert'));
    });
  });

  // ===========================================================================
  // Same Color
  // ===========================================================================

  describe('same color', () => {
    test('renders both colors even when they are the same', () => {
      render(() => (
        <ColorPreview
          originalColor="#FF0000FF"
          currentColor="#FF0000FF"
          onRevert={() => {}}
        />
      ));

      const oldSwatch = screen.getByTestId('preview-old');
      const newSwatch = screen.getByTestId('preview-new');

      expect(oldSwatch).toBeInTheDocument();
      expect(newSwatch).toBeInTheDocument();
    });
  });
});
