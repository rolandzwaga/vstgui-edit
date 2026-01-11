/**
 * AlphaSlider Tests
 *
 * Tests for the alpha/opacity slider component (0-255).
 * Written following TDD approach - tests first, then implementation.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@solidjs/testing-library';
import { AlphaSlider } from '../AlphaSlider';

describe('AlphaSlider', () => {
  const defaultProps = {
    value: 255,
    color: { r: 255, g: 0, b: 0 },
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
    test('renders checkerboard pattern background', () => {
      const { container } = render(() => <AlphaSlider {...defaultProps} />);
      const track = container.querySelector('[data-testid="alpha-track"]');
      expect(track).toBeTruthy();
    });

    test('shows gradient from transparent to current color', () => {
      const { container } = render(() => (
        <AlphaSlider {...defaultProps} color={{ r: 0, g: 255, b: 0 }} />
      ));
      const gradient = container.querySelector('[data-testid="alpha-gradient"]');
      expect(gradient).toBeTruthy();
    });

    test('renders thumb at correct position for alpha 255', () => {
      const { container } = render(() => <AlphaSlider {...defaultProps} value={255} />);
      const thumb = container.querySelector('[data-testid="alpha-thumb"]');
      expect(thumb).toBeTruthy();
    });

    test('renders thumb at correct position for alpha 0', () => {
      const { container } = render(() => <AlphaSlider {...defaultProps} value={0} />);
      const thumb = container.querySelector('[data-testid="alpha-thumb"]');
      expect(thumb).toBeTruthy();
    });

    test('renders thumb at correct position for alpha 128', () => {
      const { container } = render(() => <AlphaSlider {...defaultProps} value={128} />);
      const thumb = container.querySelector('[data-testid="alpha-thumb"]');
      expect(thumb).toBeTruthy();
    });
  });

  // ===========================================================================
  // Click Interactions
  // ===========================================================================

  describe('click interactions', () => {
    test('click sets alpha to corresponding position (left edge = 0)', () => {
      const onChange = vi.fn();
      const { container } = render(() => <AlphaSlider {...defaultProps} onChange={onChange} />);

      const track = container.querySelector('[data-testid="alpha-track"]') as HTMLElement;

      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 200,
        height: 12,
        right: 200,
        bottom: 12,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      fireEvent.mouseDown(track, { clientX: 0, clientY: 6, button: 0 });

      expect(onChange).toHaveBeenCalledWith(0);
    });

    test('click sets alpha to corresponding position (right edge = 255)', () => {
      const onChange = vi.fn();
      const { container } = render(() => <AlphaSlider {...defaultProps} onChange={onChange} />);

      const track = container.querySelector('[data-testid="alpha-track"]') as HTMLElement;

      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 200,
        height: 12,
        right: 200,
        bottom: 12,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      fireEvent.mouseDown(track, { clientX: 200, clientY: 6, button: 0 });

      expect(onChange).toHaveBeenCalledWith(255);
    });

    test('click sets alpha to corresponding position (center = ~128)', () => {
      const onChange = vi.fn();
      const { container } = render(() => <AlphaSlider {...defaultProps} onChange={onChange} />);

      const track = container.querySelector('[data-testid="alpha-track"]') as HTMLElement;

      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 200,
        height: 12,
        right: 200,
        bottom: 12,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      fireEvent.mouseDown(track, { clientX: 100, clientY: 6, button: 0 });

      // 100/200 * 255 = 127.5, rounded to 128
      expect(onChange).toHaveBeenCalledWith(128);
    });
  });

  // ===========================================================================
  // Drag Interactions
  // ===========================================================================

  describe('drag interactions', () => {
    test('drag updates alpha continuously', () => {
      const onChange = vi.fn();
      const { container } = render(() => <AlphaSlider {...defaultProps} onChange={onChange} />);

      const track = container.querySelector('[data-testid="alpha-track"]') as HTMLElement;

      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 200,
        height: 12,
        right: 200,
        bottom: 12,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      // Start drag at left
      fireEvent.mouseDown(track, { clientX: 0, clientY: 6, button: 0 });
      expect(onChange).toHaveBeenCalledWith(0);

      // Drag to center
      fireEvent.mouseMove(document, { clientX: 100, clientY: 6 });
      expect(onChange).toHaveBeenCalledWith(128);

      // Drag to right
      fireEvent.mouseMove(document, { clientX: 200, clientY: 6 });
      expect(onChange).toHaveBeenCalledWith(255);
    });

    test('mouseup calls onCommit', () => {
      const onCommit = vi.fn();
      const { container } = render(() => <AlphaSlider {...defaultProps} onCommit={onCommit} />);

      const track = container.querySelector('[data-testid="alpha-track"]') as HTMLElement;

      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 200,
        height: 12,
        right: 200,
        bottom: 12,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      fireEvent.mouseDown(track, { clientX: 100, clientY: 6, button: 0 });
      fireEvent.mouseUp(document);

      expect(onCommit).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Keyboard Navigation
  // ===========================================================================

  describe('keyboard navigation', () => {
    test('arrow keys change by ~1% (~3 units)', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <AlphaSlider {...defaultProps} value={128} onChange={onChange} />
      ));

      const slider = container.querySelector('[data-testid="alpha-slider"]') as HTMLElement;

      // Right arrow increases alpha by ~2.55 (1% of 255), rounded to 3
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith(131);

      onChange.mockClear();

      // Left arrow decreases alpha
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith(125);
    });

    test('Shift + arrow keys change by ~10% (~26 units)', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <AlphaSlider {...defaultProps} value={128} onChange={onChange} />
      ));

      const slider = container.querySelector('[data-testid="alpha-slider"]') as HTMLElement;

      // Shift + Right increases alpha by ~25.5 (10% of 255), rounded to 26
      fireEvent.keyDown(slider, { key: 'ArrowRight', shiftKey: true });
      expect(onChange).toHaveBeenCalledWith(154);

      onChange.mockClear();

      // Shift + Left decreases alpha
      fireEvent.keyDown(slider, { key: 'ArrowLeft', shiftKey: true });
      expect(onChange).toHaveBeenCalledWith(102);
    });

    test('arrow key commits on key up', () => {
      const onCommit = vi.fn();
      const { container } = render(() => <AlphaSlider {...defaultProps} onCommit={onCommit} />);

      const slider = container.querySelector('[data-testid="alpha-slider"]') as HTMLElement;

      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      fireEvent.keyUp(slider, { key: 'ArrowRight' });

      expect(onCommit).toHaveBeenCalled();
    });

    test('values are clamped to 0-255 range', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <AlphaSlider {...defaultProps} value={0} onChange={onChange} />
      ));

      const slider = container.querySelector('[data-testid="alpha-slider"]') as HTMLElement;

      // Try to go below 0
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith(0);

      onChange.mockClear();

      // Now test at max
      const { container: container2 } = render(() => (
        <AlphaSlider {...defaultProps} value={255} onChange={onChange} />
      ));
      const slider2 = container2.querySelector('[data-testid="alpha-slider"]') as HTMLElement;

      // Try to go above 255
      fireEvent.keyDown(slider2, { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith(255);
    });
  });

  // ===========================================================================
  // Disabled State
  // ===========================================================================

  describe('disabled state', () => {
    test('disabled state prevents click interaction', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <AlphaSlider {...defaultProps} disabled={true} onChange={onChange} />
      ));

      const track = container.querySelector('[data-testid="alpha-track"]') as HTMLElement;

      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 200,
        height: 12,
        right: 200,
        bottom: 12,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      fireEvent.mouseDown(track, { clientX: 100, clientY: 6, button: 0 });

      expect(onChange).not.toHaveBeenCalled();
    });

    test('disabled state prevents keyboard interaction', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <AlphaSlider {...defaultProps} disabled={true} onChange={onChange} />
      ));

      const slider = container.querySelector('[data-testid="alpha-slider"]') as HTMLElement;

      fireEvent.keyDown(slider, { key: 'ArrowRight' });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Accessibility
  // ===========================================================================

  describe('accessibility', () => {
    test('has role="slider" attribute', () => {
      const { container } = render(() => <AlphaSlider {...defaultProps} />);
      const slider = container.querySelector('[data-testid="alpha-slider"]');
      expect(slider?.getAttribute('role')).toBe('slider');
    });

    test('has aria-valuemin attribute', () => {
      const { container } = render(() => <AlphaSlider {...defaultProps} />);
      const slider = container.querySelector('[data-testid="alpha-slider"]');
      expect(slider?.getAttribute('aria-valuemin')).toBe('0');
    });

    test('has aria-valuemax attribute', () => {
      const { container } = render(() => <AlphaSlider {...defaultProps} />);
      const slider = container.querySelector('[data-testid="alpha-slider"]');
      expect(slider?.getAttribute('aria-valuemax')).toBe('255');
    });

    test('has aria-valuenow reflecting current alpha', () => {
      const { container } = render(() => <AlphaSlider {...defaultProps} value={128} />);
      const slider = container.querySelector('[data-testid="alpha-slider"]');
      expect(slider?.getAttribute('aria-valuenow')).toBe('128');
    });

    test('has aria-label for accessibility', () => {
      const { container } = render(() => <AlphaSlider {...defaultProps} />);
      const slider = container.querySelector('[data-testid="alpha-slider"]');
      expect(slider?.hasAttribute('aria-label')).toBe(true);
    });

    test('is focusable via tabIndex', () => {
      const { container } = render(() => <AlphaSlider {...defaultProps} />);
      const slider = container.querySelector('[data-testid="alpha-slider"]');
      expect(slider?.getAttribute('tabindex')).toBe('0');
    });

    test('disabled state sets aria-disabled', () => {
      const { container } = render(() => <AlphaSlider {...defaultProps} disabled={true} />);
      const slider = container.querySelector('[data-testid="alpha-slider"]');
      expect(slider?.getAttribute('aria-disabled')).toBe('true');
    });
  });
});
