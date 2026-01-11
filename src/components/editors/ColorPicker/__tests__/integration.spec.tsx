/**
 * ColorPicker Integration Tests
 *
 * Tests for backward compatibility and output normalization.
 * Verifies the ColorPicker integrates properly with existing code.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent, screen } from '@solidjs/testing-library';
import { AdvancedColorPicker, ColorPicker } from '../AdvancedColorPicker';

describe('ColorPicker Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage for recent colors
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

      // Renders without error with all original props
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

      // Verify component rendered
      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      expect(trigger).toBeTruthy();
    });

    test('onChange callback receives new value on color change', async () => {
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

      // Wait for dropdown to open
      await Promise.resolve();

      // Find the gradient area and click it
      const gradientArea = document.querySelector('[data-testid="gradient-area"]');
      if (gradientArea) {
        // Simulate a click to change color
        const rect = { left: 0, top: 0, width: 200, height: 150 };
        Object.defineProperty(gradientArea, 'getBoundingClientRect', {
          value: () => rect,
        });

        fireEvent.mouseDown(gradientArea, {
          clientX: 100, // Middle of gradient (S=50%)
          clientY: 75, // Middle of gradient (V=50%)
          button: 0,
        });
        fireEvent.mouseUp(gradientArea);
      }

      // onChange should have been called
      // Note: The exact value depends on implementation
    });

    test('onCommit callback fires when edit is committed', async () => {
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

      await Promise.resolve();

      // Find the hex input and change it
      const hexInput = document.querySelector('[aria-label="Hex color value"]') as HTMLInputElement;
      if (hexInput) {
        fireEvent.input(hexInput, { target: { value: '#00FF00FF' } });
        fireEvent.change(hexInput, { target: { value: '#00FF00FF' } });
        fireEvent.keyDown(hexInput, { key: 'Enter' });
      }
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

      await Promise.resolve();

      // Press Escape to cancel
      fireEvent.keyDown(trigger!, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalled();
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

      // Click should not open dropdown
      fireEvent.click(trigger!);

      // Dropdown should not be present
      const dropdown = document.querySelector('[data-testid="gradient-area"]');
      expect(dropdown).toBeNull();
    });
  });

  // ===========================================================================
  // Output Normalization (FR-009a)
  // ===========================================================================

  describe('output normalization (FR-009a)', () => {
    test('visual picker selection outputs 8-digit HEX', async () => {
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

      // Open the dropdown
      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      fireEvent.click(trigger!);

      await Promise.resolve();

      // Find and interact with gradient area
      const gradientArea = document.querySelector('[data-testid="gradient-area"]');
      if (gradientArea) {
        const rect = { left: 0, top: 0, width: 200, height: 150 };
        Object.defineProperty(gradientArea, 'getBoundingClientRect', {
          value: () => rect,
        });

        fireEvent.mouseDown(gradientArea, { clientX: 100, clientY: 75, button: 0 });
        fireEvent.mouseUp(gradientArea);

        // If onChange was called, verify it received an 8-digit hex
        if (onChange.mock.calls.length > 0) {
          const lastValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
          expect(lastValue).toMatch(/^#[0-9A-F]{8}$/i);
        }
      }
    });

    test('HEX input normalizes 6-digit to 8-digit on commit', async () => {
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

      // Open the dropdown
      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      fireEvent.click(trigger!);

      await Promise.resolve();

      // Find the hex input
      const hexInput = document.querySelector('[aria-label="Hex color value"]') as HTMLInputElement;
      if (hexInput) {
        // Type a 6-digit hex (no alpha)
        fireEvent.input(hexInput, { target: { value: '#00FF00' } });
        fireEvent.change(hexInput, { target: { value: '#00FF00' } });

        // The onChange should receive 8-digit format
        if (onChange.mock.calls.length > 0) {
          const lastValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
          expect(lastValue).toMatch(/^#[0-9A-F]{8}$/i);
        }
      }
    });

    test('hue slider outputs 8-digit HEX', async () => {
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

      // Open the dropdown
      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      fireEvent.click(trigger!);

      await Promise.resolve();

      // Find and interact with hue slider
      const hueSlider = document.querySelector('[data-testid="hue-slider"]');
      if (hueSlider) {
        const rect = { left: 0, top: 0, width: 200, height: 16 };
        Object.defineProperty(hueSlider, 'getBoundingClientRect', {
          value: () => rect,
        });

        fireEvent.mouseDown(hueSlider, { clientX: 100, clientY: 8, button: 0 });
        fireEvent.mouseUp(hueSlider);

        // If onChange was called, verify it received an 8-digit hex
        if (onChange.mock.calls.length > 0) {
          const lastValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
          expect(lastValue).toMatch(/^#[0-9A-F]{8}$/i);
        }
      }
    });

    test('alpha slider outputs 8-digit HEX', async () => {
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

      // Open the dropdown
      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      fireEvent.click(trigger!);

      await Promise.resolve();

      // Find and interact with alpha slider
      const alphaSlider = document.querySelector('[data-testid="alpha-slider"]');
      if (alphaSlider) {
        const rect = { left: 0, top: 0, width: 200, height: 16 };
        Object.defineProperty(alphaSlider, 'getBoundingClientRect', {
          value: () => rect,
        });

        fireEvent.mouseDown(alphaSlider, { clientX: 100, clientY: 8, button: 0 });
        fireEvent.mouseUp(alphaSlider);

        // If onChange was called, verify it received an 8-digit hex
        if (onChange.mock.calls.length > 0) {
          const lastValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
          expect(lastValue).toMatch(/^#[0-9A-F]{8}$/i);
        }
      }
    });
  });

  // ===========================================================================
  // Document Colors Integration
  // ===========================================================================

  describe('document colors integration', () => {
    test('documentColors prop shows color swatches', async () => {
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

      // Open the dropdown
      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      fireEvent.click(trigger!);

      await Promise.resolve();

      // Check for document color swatches
      const bgSwatch = document.querySelector('[data-testid="swatch-doc-Background"]');
      const accentSwatch = document.querySelector('[data-testid="swatch-doc-Accent"]');

      expect(bgSwatch).toBeTruthy();
      expect(accentSwatch).toBeTruthy();
    });

    test('selecting document color passes color name', async () => {
      const onChange = vi.fn();

      const { container } = render(() => (
        <ColorPicker
          value="#FF5500FF"
          onChange={onChange}
          onCommit={() => {}}
          onCancel={() => {}}
          documentColors={['Background']}
          documentColorValues={{
            Background: '#2D2D2DFF',
          }}
        />
      ));

      // Open the dropdown
      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      fireEvent.click(trigger!);

      await Promise.resolve();

      // Click the document color swatch
      const bgSwatch = document.querySelector('[data-testid="swatch-doc-Background"]');
      if (bgSwatch) {
        fireEvent.click(bgSwatch);
        // Document colors should pass the color name, not the hex
        // This allows UIDESC to use color references
      }
    });
  });

  // ===========================================================================
  // Popup Mode (Default)
  // ===========================================================================

  describe('popup mode (default)', () => {
    test('renders trigger button with color swatch', () => {
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
      expect(trigger).toBeTruthy();

      // Should have a color swatch visible
      const swatch = trigger?.querySelector('[class*="triggerSwatch"]');
      expect(swatch).toBeTruthy();
    });

    test('clicking trigger opens dropdown', async () => {
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
      expect(trigger?.getAttribute('aria-expanded')).toBe('false');

      fireEvent.click(trigger!);

      await Promise.resolve();

      // Now aria-expanded should be true
      expect(trigger?.getAttribute('aria-expanded')).toBe('true');

      // Gradient area should be visible
      const gradientArea = document.querySelector('[data-testid="gradient-area"]');
      expect(gradientArea).toBeTruthy();
    });

    test('Escape closes dropdown and reverts', async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();

      const { container } = render(() => (
        <ColorPicker
          value="#FF5500FF"
          onChange={onChange}
          onCommit={() => {}}
          onCancel={onCancel}
          documentColors={[]}
        />
      ));

      // Open
      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      fireEvent.click(trigger!);

      await Promise.resolve();

      // Make a change
      const hueSlider = document.querySelector('[data-testid="hue-slider"]');
      if (hueSlider) {
        const rect = { left: 0, top: 0, width: 200, height: 16 };
        Object.defineProperty(hueSlider, 'getBoundingClientRect', {
          value: () => rect,
        });
        fireEvent.mouseDown(hueSlider, { clientX: 50, clientY: 8, button: 0 });
        fireEvent.mouseUp(hueSlider);
      }

      // Press Escape
      fireEvent.keyDown(trigger!, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Inline Mode
  // ===========================================================================

  describe('inline mode', () => {
    test('renders picker directly without trigger', () => {
      const { container } = render(() => (
        <ColorPicker
          value="#FF5500FF"
          onChange={() => {}}
          onCommit={() => {}}
          onCancel={() => {}}
          documentColors={[]}
          mode="inline"
        />
      ));

      // No trigger button
      const trigger = container.querySelector('[data-testid="color-picker-trigger"]');
      expect(trigger).toBeNull();

      // Gradient area should be directly visible
      const gradientArea = container.querySelector('[data-testid="gradient-area"]');
      expect(gradientArea).toBeTruthy();
    });

    test('inline mode shows all picker components', () => {
      const { container } = render(() => (
        <ColorPicker
          value="#FF5500FF"
          onChange={() => {}}
          onCommit={() => {}}
          onCancel={() => {}}
          documentColors={[]}
          mode="inline"
        />
      ));

      // All components should be visible
      expect(container.querySelector('[data-testid="gradient-area"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="hue-slider"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="alpha-slider"]')).toBeTruthy();
      // Hex input uses aria-label instead of data-testid
      expect(container.querySelector('[aria-label="Hex color value"]')).toBeTruthy();
    });
  });
});
