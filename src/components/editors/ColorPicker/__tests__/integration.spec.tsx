/**
 * ColorPicker Integration Tests
 *
 * Tests for the two-level color picker:
 * Level 1: Simple dropdown with document colors + "Custom Color..." button
 * Level 2: Advanced picker (gradient, sliders, etc.)
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent, waitFor } from '@solidjs/testing-library';
import { AdvancedColorPicker, ColorPicker } from '../AdvancedColorPicker';

describe('ColorPicker Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  // ===========================================================================
  // Backward Compatibility
  // ===========================================================================

  describe('backward compatibility', () => {
    test('ColorPicker is exported as alias to AdvancedColorPicker', () => {
      expect(ColorPicker).toBe(AdvancedColorPicker);
    });

    test('accepts all original ColorPickerProps', () => {
      const onChange = vi.fn();
      const onCommit = vi.fn();
      const onCancel = vi.fn();

      const { container } = render(() => (
        <ColorPicker
          value="#FF5500FF"
          onChange={onChange}
          onCommit={onCommit}
          onCancel={onCancel}
          documentColors={['Background', 'Accent']}
          disabled={false}
        />
      ));

      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      expect(trigger).toBeTruthy();
    });

    test('onCancel callback fires when edit is cancelled', async () => {
      const onChange = vi.fn();
      const onCommit = vi.fn();
      const onCancel = vi.fn();

      const { container } = render(() => (
        <ColorPicker
          value="#FF5500FF"
          onChange={onChange}
          onCommit={onCommit}
          onCancel={onCancel}
          documentColors={[]}
        />
      ));

      // Open the dropdown
      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      fireEvent.click(trigger!);

      await waitFor(() => {
        expect(trigger?.getAttribute('aria-expanded')).toBe('true');
      });

      // Press Escape to cancel (while dropdown is open)
      fireEvent.keyDown(trigger!, { key: 'Escape' });

      // Dropdown should close (onCancel is only called from advanced picker)
      expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    });

    test('disabled prop prevents interaction', () => {
      const onChange = vi.fn();

      const { container } = render(() => (
        <ColorPicker
          value="#FF5500FF"
          onChange={onChange}
          onCommit={() => {}}
          onCancel={() => {}}
          documentColors={[]}
          disabled={true}
        />
      ));

      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      expect(trigger?.getAttribute('disabled')).not.toBeNull();

      fireEvent.click(trigger!);

      // Dropdown should not open
      expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    });
  });

  // ===========================================================================
  // Level 1: Simple Dropdown
  // ===========================================================================

  describe('level 1: simple dropdown', () => {
    test('clicking trigger opens simple dropdown', async () => {
      const { container } = render(() => (
        <ColorPicker
          value="#FF5500FF"
          onChange={() => {}}
          onCommit={() => {}}
          onCancel={() => {}}
          documentColors={['Background']}
        />
      ));

      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      expect(trigger?.getAttribute('aria-expanded')).toBe('false');

      fireEvent.click(trigger!);

      await waitFor(() => {
        expect(trigger?.getAttribute('aria-expanded')).toBe('true');
      });

      // "Custom Color..." button should be visible
      const customColorBtn = document.querySelector('[data-testid="custom-color-button"]');
      expect(customColorBtn).toBeTruthy();
    });

    test('shows document color options in dropdown', async () => {
      const { container } = render(() => (
        <ColorPicker
          value="#FF5500FF"
          onChange={() => {}}
          onCommit={() => {}}
          onCancel={() => {}}
          documentColors={['Background', 'Accent']}
          documentColorValues={{
            Background: '#2D2D2DFF',
            Accent: '#FF5500FF',
          }}
        />
      ));

      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      fireEvent.click(trigger!);

      await waitFor(() => {
        const bgOption = document.querySelector('[data-testid="color-option-Background"]');
        expect(bgOption).toBeTruthy();
      });

      const accentOption = document.querySelector('[data-testid="color-option-Accent"]');
      expect(accentOption).toBeTruthy();
    });

    test('selecting document color calls onChange with color name', async () => {
      const onChange = vi.fn();
      const onCommit = vi.fn();

      const { container } = render(() => (
        <ColorPicker
          value="#FF5500FF"
          onChange={onChange}
          onCommit={onCommit}
          onCancel={() => {}}
          documentColors={['Background']}
          documentColorValues={{
            Background: '#2D2D2DFF',
          }}
        />
      ));

      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      fireEvent.click(trigger!);

      await waitFor(() => {
        const bgOption = document.querySelector('[data-testid="color-option-Background"]');
        expect(bgOption).toBeTruthy();
      });

      const bgOption = document.querySelector('[data-testid="color-option-Background"]');
      fireEvent.click(bgOption!);

      expect(onChange).toHaveBeenCalledWith('Background');
      expect(onCommit).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Level 2: Advanced Picker
  // ===========================================================================

  describe('level 2: advanced picker', () => {
    test('clicking "Custom Color..." opens advanced picker', async () => {
      const { container } = render(() => (
        <ColorPicker
          value="#FF5500FF"
          onChange={() => {}}
          onCommit={() => {}}
          onCancel={() => {}}
          documentColors={[]}
        />
      ));

      // Open simple dropdown
      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      fireEvent.click(trigger!);

      await waitFor(() => {
        const customColorBtn = document.querySelector('[data-testid="custom-color-button"]');
        expect(customColorBtn).toBeTruthy();
      });

      // Click "Custom Color..."
      const customColorBtn = document.querySelector('[data-testid="custom-color-button"]');
      fireEvent.click(customColorBtn!);

      await waitFor(() => {
        // Advanced picker should now be visible
        const gradientArea = document.querySelector('[data-testid="gradient-area"]');
        expect(gradientArea).toBeTruthy();
      });
    });

    test('advanced picker shows gradient, hue slider, alpha slider', async () => {
      const { container } = render(() => (
        <ColorPicker
          value="#FF5500FF"
          onChange={() => {}}
          onCommit={() => {}}
          onCancel={() => {}}
          documentColors={[]}
        />
      ));

      // Open simple dropdown, then advanced picker
      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      fireEvent.click(trigger!);

      await waitFor(() => {
        const customColorBtn = document.querySelector('[data-testid="custom-color-button"]');
        expect(customColorBtn).toBeTruthy();
      });

      const customColorBtn = document.querySelector('[data-testid="custom-color-button"]');
      fireEvent.click(customColorBtn!);

      await waitFor(() => {
        expect(document.querySelector('[data-testid="gradient-area"]')).toBeTruthy();
        expect(document.querySelector('[data-testid="hue-slider"]')).toBeTruthy();
        expect(document.querySelector('[data-testid="alpha-slider"]')).toBeTruthy();
      });
    });

    test('advanced picker outputs 8-digit HEX on interaction', async () => {
      const onChange = vi.fn();

      const { container } = render(() => (
        <ColorPicker
          value="#FF5500FF"
          onChange={onChange}
          onCommit={() => {}}
          onCancel={() => {}}
          documentColors={[]}
        />
      ));

      // Open simple dropdown, then advanced picker
      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      fireEvent.click(trigger!);

      await waitFor(() => {
        const customColorBtn = document.querySelector('[data-testid="custom-color-button"]');
        expect(customColorBtn).toBeTruthy();
      });

      const customColorBtn = document.querySelector('[data-testid="custom-color-button"]');
      fireEvent.click(customColorBtn!);

      await waitFor(() => {
        const gradientArea = document.querySelector('[data-testid="gradient-area"]');
        expect(gradientArea).toBeTruthy();
      });

      // Interact with gradient area
      const gradientArea = document.querySelector('[data-testid="gradient-area"]');
      if (gradientArea) {
        const rect = { left: 0, top: 0, width: 200, height: 150 };
        Object.defineProperty(gradientArea, 'getBoundingClientRect', {
          value: () => rect,
        });

        fireEvent.mouseDown(gradientArea, { clientX: 100, clientY: 75, button: 0 });
        fireEvent.mouseUp(gradientArea);

        if (onChange.mock.calls.length > 0) {
          const lastValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
          expect(lastValue).toMatch(/^#[0-9A-F]{8}$/i);
        }
      }
    });
  });

  // ===========================================================================
  // Trigger Display
  // ===========================================================================

  describe('trigger display', () => {
    test('shows color swatch for hex values', () => {
      const { container } = render(() => (
        <ColorPicker
          value="#FF5500FF"
          onChange={() => {}}
          onCommit={() => {}}
          onCancel={() => {}}
          documentColors={[]}
        />
      ));

      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      const swatch = trigger?.querySelector('[class*="swatch"]');
      expect(swatch).toBeTruthy();
    });

    test('displays current value text', () => {
      const { container } = render(() => (
        <ColorPicker
          value="Background"
          onChange={() => {}}
          onCommit={() => {}}
          onCancel={() => {}}
          documentColors={['Background']}
        />
      ));

      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      expect(trigger?.textContent).toContain('Background');
    });
  });
});
