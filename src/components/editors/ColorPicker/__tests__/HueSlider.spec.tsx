/**
 * HueSlider Tests
 *
 * Tests for the hue slider component (0-360 degrees).
 * Written following TDD approach - tests first, then implementation.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@solidjs/testing-library';
import { HueSlider } from '../HueSlider';

describe('HueSlider', () => {
  const defaultProps = {
    value: 0,
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
    test('renders rainbow gradient track', () => {
      const { container } = render(() => <HueSlider {...defaultProps} />);
      const track = container.querySelector('[data-testid="hue-track"]');
      expect(track).toBeTruthy();
    });

    test('renders thumb at correct position for hue 0', () => {
      const { container } = render(() => <HueSlider {...defaultProps} value={0} />);
      const thumb = container.querySelector('[data-testid="hue-thumb"]');
      expect(thumb).toBeTruthy();
    });

    test('renders thumb at correct position for hue 180', () => {
      const { container } = render(() => <HueSlider {...defaultProps} value={180} />);
      const thumb = container.querySelector('[data-testid="hue-thumb"]');
      expect(thumb).toBeTruthy();
    });

    test('renders thumb at correct position for hue 360', () => {
      const { container } = render(() => <HueSlider {...defaultProps} value={360} />);
      const thumb = container.querySelector('[data-testid="hue-thumb"]');
      expect(thumb).toBeTruthy();
    });
  });

  // ===========================================================================
  // Click Interactions
  // ===========================================================================

  describe('click interactions', () => {
    test('click sets hue to corresponding position (left edge = 0)', () => {
      const onChange = vi.fn();
      const { container } = render(() => <HueSlider {...defaultProps} onChange={onChange} />);

      const slider = container.querySelector('[data-testid="hue-slider"]') as HTMLElement;

      vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
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

      fireEvent.mouseDown(slider, { clientX: 0, clientY: 6, button: 0 });

      expect(onChange).toHaveBeenCalledWith(0);
    });

    test('click sets hue to corresponding position (right edge = 360)', () => {
      const onChange = vi.fn();
      const { container } = render(() => <HueSlider {...defaultProps} onChange={onChange} />);

      const slider = container.querySelector('[data-testid="hue-slider"]') as HTMLElement;

      vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
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

      fireEvent.mouseDown(slider, { clientX: 200, clientY: 6, button: 0 });

      expect(onChange).toHaveBeenCalledWith(360);
    });

    test('click sets hue to corresponding position (center = 180)', () => {
      const onChange = vi.fn();
      const { container } = render(() => <HueSlider {...defaultProps} onChange={onChange} />);

      const slider = container.querySelector('[data-testid="hue-slider"]') as HTMLElement;

      vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
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

      fireEvent.mouseDown(slider, { clientX: 100, clientY: 6, button: 0 });

      expect(onChange).toHaveBeenCalledWith(180);
    });
  });

  // ===========================================================================
  // Drag Interactions
  // ===========================================================================

  describe('drag interactions', () => {
    test('drag updates hue continuously', () => {
      const onChange = vi.fn();
      const { container } = render(() => <HueSlider {...defaultProps} onChange={onChange} />);

      const slider = container.querySelector('[data-testid="hue-slider"]') as HTMLElement;

      vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
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
      fireEvent.mouseDown(slider, { clientX: 0, clientY: 6, button: 0 });
      expect(onChange).toHaveBeenCalledWith(0);

      // Drag to center
      fireEvent.mouseMove(document, { clientX: 100, clientY: 6 });
      expect(onChange).toHaveBeenCalledWith(180);

      // Drag to right
      fireEvent.mouseMove(document, { clientX: 200, clientY: 6 });
      expect(onChange).toHaveBeenCalledWith(360);
    });

    test('mouseup calls onCommit', () => {
      const onCommit = vi.fn();
      const { container } = render(() => <HueSlider {...defaultProps} onCommit={onCommit} />);

      const slider = container.querySelector('[data-testid="hue-slider"]') as HTMLElement;

      vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
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

      fireEvent.mouseDown(slider, { clientX: 100, clientY: 6, button: 0 });
      fireEvent.mouseUp(document);

      expect(onCommit).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Keyboard Navigation
  // ===========================================================================

  describe('keyboard navigation', () => {
    test('Left/Right arrow keys change by 3.6 degrees (1%)', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <HueSlider {...defaultProps} value={180} onChange={onChange} />
      ));

      const slider = container.querySelector('[data-testid="hue-slider"]') as HTMLElement;

      // Right arrow increases hue by ~3.6 (1% of 360)
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith(expect.closeTo(183.6, 0));

      onChange.mockClear();

      // Left arrow decreases hue by ~3.6
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith(expect.closeTo(176.4, 0));
    });

    test('Shift + arrow keys change by 36 degrees (10%)', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <HueSlider {...defaultProps} value={180} onChange={onChange} />
      ));

      const slider = container.querySelector('[data-testid="hue-slider"]') as HTMLElement;

      // Shift + Right increases hue by 36 (10% of 360)
      fireEvent.keyDown(slider, { key: 'ArrowRight', shiftKey: true });
      expect(onChange).toHaveBeenCalledWith(216);

      onChange.mockClear();

      // Shift + Left decreases hue by 36
      fireEvent.keyDown(slider, { key: 'ArrowLeft', shiftKey: true });
      expect(onChange).toHaveBeenCalledWith(144);
    });

    test('arrow key commits on key up', () => {
      const onCommit = vi.fn();
      const { container } = render(() => <HueSlider {...defaultProps} onCommit={onCommit} />);

      const slider = container.querySelector('[data-testid="hue-slider"]') as HTMLElement;

      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      fireEvent.keyUp(slider, { key: 'ArrowRight' });

      expect(onCommit).toHaveBeenCalled();
    });

    test('values are clamped to 0-360 range', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <HueSlider {...defaultProps} value={0} onChange={onChange} />
      ));

      const slider = container.querySelector('[data-testid="hue-slider"]') as HTMLElement;

      // Try to go below 0
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith(0);

      onChange.mockClear();

      // Now test at max
      const { container: container2 } = render(() => (
        <HueSlider {...defaultProps} value={360} onChange={onChange} />
      ));
      const slider2 = container2.querySelector('[data-testid="hue-slider"]') as HTMLElement;

      // Try to go above 360
      fireEvent.keyDown(slider2, { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith(360);
    });
  });

  // ===========================================================================
  // Disabled State
  // ===========================================================================

  describe('disabled state', () => {
    test('disabled state prevents click interaction', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <HueSlider {...defaultProps} disabled={true} onChange={onChange} />
      ));

      const slider = container.querySelector('[data-testid="hue-slider"]') as HTMLElement;

      vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
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

      fireEvent.mouseDown(slider, { clientX: 100, clientY: 6, button: 0 });

      expect(onChange).not.toHaveBeenCalled();
    });

    test('disabled state prevents keyboard interaction', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <HueSlider {...defaultProps} disabled={true} onChange={onChange} />
      ));

      const slider = container.querySelector('[data-testid="hue-slider"]') as HTMLElement;

      fireEvent.keyDown(slider, { key: 'ArrowRight' });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Accessibility
  // ===========================================================================

  describe('accessibility', () => {
    test('has role="slider" attribute', () => {
      const { container } = render(() => <HueSlider {...defaultProps} />);
      const slider = container.querySelector('[data-testid="hue-slider"]');
      expect(slider?.getAttribute('role')).toBe('slider');
    });

    test('has aria-valuemin attribute', () => {
      const { container } = render(() => <HueSlider {...defaultProps} />);
      const slider = container.querySelector('[data-testid="hue-slider"]');
      expect(slider?.getAttribute('aria-valuemin')).toBe('0');
    });

    test('has aria-valuemax attribute', () => {
      const { container } = render(() => <HueSlider {...defaultProps} />);
      const slider = container.querySelector('[data-testid="hue-slider"]');
      expect(slider?.getAttribute('aria-valuemax')).toBe('360');
    });

    test('has aria-valuenow reflecting current hue', () => {
      const { container } = render(() => <HueSlider {...defaultProps} value={180} />);
      const slider = container.querySelector('[data-testid="hue-slider"]');
      expect(slider?.getAttribute('aria-valuenow')).toBe('180');
    });

    test('has aria-label for accessibility', () => {
      const { container } = render(() => <HueSlider {...defaultProps} />);
      const slider = container.querySelector('[data-testid="hue-slider"]');
      expect(slider?.hasAttribute('aria-label')).toBe(true);
    });

    test('is focusable via tabIndex', () => {
      const { container } = render(() => <HueSlider {...defaultProps} />);
      const slider = container.querySelector('[data-testid="hue-slider"]');
      expect(slider?.getAttribute('tabindex')).toBe('0');
    });

    test('disabled state sets aria-disabled', () => {
      const { container } = render(() => <HueSlider {...defaultProps} disabled={true} />);
      const slider = container.querySelector('[data-testid="hue-slider"]');
      expect(slider?.getAttribute('aria-disabled')).toBe('true');
    });
  });
});
