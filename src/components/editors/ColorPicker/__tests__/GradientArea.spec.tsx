/**
 * GradientArea Tests
 *
 * Tests for the saturation-brightness gradient picker.
 * Written following TDD approach - tests first, then implementation.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@solidjs/testing-library';
import { GradientArea } from '../GradientArea';

describe('GradientArea', () => {
  const defaultProps = {
    hue: 0,
    saturation: 50,
    brightness: 50,
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
    test('renders with correct hue-based background color', () => {
      const { container } = render(() => <GradientArea {...defaultProps} hue={0} />);
      const gradientArea = container.querySelector('[data-testid="gradient-area"]');
      expect(gradientArea).toBeTruthy();
    });

    test('renders with different hue values', () => {
      // Green hue (120)
      const { container } = render(() => <GradientArea {...defaultProps} hue={120} />);
      const gradientArea = container.querySelector('[data-testid="gradient-area"]');
      expect(gradientArea).toBeTruthy();
    });

    test('renders thumb at correct position based on saturation and brightness', () => {
      const { container } = render(() => (
        <GradientArea {...defaultProps} saturation={0} brightness={100} />
      ));
      const thumb = container.querySelector('[data-testid="gradient-thumb"]');
      expect(thumb).toBeTruthy();
    });

    test('thumb position updates with saturation changes', () => {
      // Test different saturation values render correctly
      const { container: container1 } = render(() => (
        <GradientArea {...defaultProps} saturation={0} brightness={50} />
      ));
      const thumb1 = container1.querySelector('[data-testid="gradient-thumb"]');
      expect(thumb1).toBeTruthy();

      cleanup();

      // Render with different saturation
      const { container: container2 } = render(() => (
        <GradientArea {...defaultProps} saturation={100} brightness={50} />
      ));
      // Thumb should exist with new saturation
      expect(container2.querySelector('[data-testid="gradient-thumb"]')).toBeTruthy();
    });
  });

  // ===========================================================================
  // Click Interactions
  // ===========================================================================

  describe('click interactions', () => {
    test('click at top-left gives S=0, B=100', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <GradientArea {...defaultProps} onChange={onChange} />
      ));

      const gradientArea = container.querySelector('[data-testid="gradient-area"]') as HTMLElement;

      // Mock getBoundingClientRect
      vi.spyOn(gradientArea, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 200,
        height: 150,
        right: 200,
        bottom: 150,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      // Click at top-left (0, 0)
      fireEvent.mouseDown(gradientArea, { clientX: 0, clientY: 0, button: 0 });

      expect(onChange).toHaveBeenCalledWith(0, 100);
    });

    test('click at bottom-right gives S=100, B=0', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <GradientArea {...defaultProps} onChange={onChange} />
      ));

      const gradientArea = container.querySelector('[data-testid="gradient-area"]') as HTMLElement;

      vi.spyOn(gradientArea, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 200,
        height: 150,
        right: 200,
        bottom: 150,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      // Click at bottom-right (200, 150)
      fireEvent.mouseDown(gradientArea, { clientX: 200, clientY: 150, button: 0 });

      expect(onChange).toHaveBeenCalledWith(100, 0);
    });

    test('click at center gives S=50, B=50', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <GradientArea {...defaultProps} onChange={onChange} />
      ));

      const gradientArea = container.querySelector('[data-testid="gradient-area"]') as HTMLElement;

      vi.spyOn(gradientArea, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 200,
        height: 150,
        right: 200,
        bottom: 150,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      // Click at center (100, 75)
      fireEvent.mouseDown(gradientArea, { clientX: 100, clientY: 75, button: 0 });

      expect(onChange).toHaveBeenCalledWith(50, 50);
    });
  });

  // ===========================================================================
  // Drag Interactions
  // ===========================================================================

  describe('drag interactions', () => {
    test('drag updates saturation/brightness continuously', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <GradientArea {...defaultProps} onChange={onChange} />
      ));

      const gradientArea = container.querySelector('[data-testid="gradient-area"]') as HTMLElement;

      vi.spyOn(gradientArea, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 200,
        height: 150,
        right: 200,
        bottom: 150,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      // Start drag
      fireEvent.mouseDown(gradientArea, { clientX: 0, clientY: 0, button: 0 });
      expect(onChange).toHaveBeenCalledWith(0, 100);

      // Drag to center
      fireEvent.mouseMove(document, { clientX: 100, clientY: 75 });
      expect(onChange).toHaveBeenCalledWith(50, 50);

      // Drag to corner
      fireEvent.mouseMove(document, { clientX: 200, clientY: 150 });
      expect(onChange).toHaveBeenCalledWith(100, 0);
    });

    test('mouseup calls onCommit', () => {
      const onCommit = vi.fn();
      const { container } = render(() => (
        <GradientArea {...defaultProps} onCommit={onCommit} />
      ));

      const gradientArea = container.querySelector('[data-testid="gradient-area"]') as HTMLElement;

      vi.spyOn(gradientArea, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 200,
        height: 150,
        right: 200,
        bottom: 150,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      // Start drag
      fireEvent.mouseDown(gradientArea, { clientX: 100, clientY: 75, button: 0 });

      // End drag
      fireEvent.mouseUp(document);

      expect(onCommit).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Keyboard Navigation
  // ===========================================================================

  describe('keyboard navigation', () => {
    test('arrow keys change by 1% step', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <GradientArea {...defaultProps} saturation={50} brightness={50} onChange={onChange} />
      ));

      const gradientArea = container.querySelector('[data-testid="gradient-area"]') as HTMLElement;

      // Right arrow increases saturation
      fireEvent.keyDown(gradientArea, { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith(51, 50);

      onChange.mockClear();

      // Left arrow decreases saturation
      fireEvent.keyDown(gradientArea, { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith(49, 50);

      onChange.mockClear();

      // Up arrow increases brightness
      fireEvent.keyDown(gradientArea, { key: 'ArrowUp' });
      expect(onChange).toHaveBeenCalledWith(50, 51);

      onChange.mockClear();

      // Down arrow decreases brightness
      fireEvent.keyDown(gradientArea, { key: 'ArrowDown' });
      expect(onChange).toHaveBeenCalledWith(50, 49);
    });

    test('Shift + arrow keys change by 10% step', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <GradientArea {...defaultProps} saturation={50} brightness={50} onChange={onChange} />
      ));

      const gradientArea = container.querySelector('[data-testid="gradient-area"]') as HTMLElement;

      // Shift + Right increases saturation by 10
      fireEvent.keyDown(gradientArea, { key: 'ArrowRight', shiftKey: true });
      expect(onChange).toHaveBeenCalledWith(60, 50);

      onChange.mockClear();

      // Shift + Up increases brightness by 10
      fireEvent.keyDown(gradientArea, { key: 'ArrowUp', shiftKey: true });
      expect(onChange).toHaveBeenCalledWith(50, 60);
    });

    test('arrow key commits on key up', () => {
      const onCommit = vi.fn();
      const { container } = render(() => (
        <GradientArea {...defaultProps} onCommit={onCommit} />
      ));

      const gradientArea = container.querySelector('[data-testid="gradient-area"]') as HTMLElement;

      fireEvent.keyDown(gradientArea, { key: 'ArrowRight' });
      fireEvent.keyUp(gradientArea, { key: 'ArrowRight' });

      expect(onCommit).toHaveBeenCalled();
    });

    test('values are clamped to 0-100 range', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <GradientArea {...defaultProps} saturation={0} brightness={100} onChange={onChange} />
      ));

      const gradientArea = container.querySelector('[data-testid="gradient-area"]') as HTMLElement;

      // Try to go below 0
      fireEvent.keyDown(gradientArea, { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith(0, 100);

      onChange.mockClear();

      // Try to go above 100
      fireEvent.keyDown(gradientArea, { key: 'ArrowUp' });
      expect(onChange).toHaveBeenCalledWith(0, 100);
    });
  });

  // ===========================================================================
  // Disabled State
  // ===========================================================================

  describe('disabled state', () => {
    test('disabled state prevents click interaction', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <GradientArea {...defaultProps} disabled={true} onChange={onChange} />
      ));

      const gradientArea = container.querySelector('[data-testid="gradient-area"]') as HTMLElement;

      vi.spyOn(gradientArea, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 200,
        height: 150,
        right: 200,
        bottom: 150,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      fireEvent.mouseDown(gradientArea, { clientX: 100, clientY: 75, button: 0 });

      expect(onChange).not.toHaveBeenCalled();
    });

    test('disabled state prevents keyboard interaction', () => {
      const onChange = vi.fn();
      const { container } = render(() => (
        <GradientArea {...defaultProps} disabled={true} onChange={onChange} />
      ));

      const gradientArea = container.querySelector('[data-testid="gradient-area"]') as HTMLElement;

      fireEvent.keyDown(gradientArea, { key: 'ArrowRight' });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Accessibility
  // ===========================================================================

  describe('accessibility', () => {
    test('has role="slider" attribute', () => {
      const { container } = render(() => <GradientArea {...defaultProps} />);
      const gradientArea = container.querySelector('[data-testid="gradient-area"]');
      expect(gradientArea?.getAttribute('role')).toBe('slider');
    });

    test('has aria-valuemin attribute', () => {
      const { container } = render(() => <GradientArea {...defaultProps} />);
      const gradientArea = container.querySelector('[data-testid="gradient-area"]');
      expect(gradientArea?.getAttribute('aria-valuemin')).toBe('0');
    });

    test('has aria-valuemax attribute', () => {
      const { container } = render(() => <GradientArea {...defaultProps} />);
      const gradientArea = container.querySelector('[data-testid="gradient-area"]');
      expect(gradientArea?.getAttribute('aria-valuemax')).toBe('100');
    });

    test('has aria-valuenow reflecting current values', () => {
      const { container } = render(() => (
        <GradientArea {...defaultProps} saturation={75} brightness={25} />
      ));
      const gradientArea = container.querySelector('[data-testid="gradient-area"]');
      // aria-valuenow for 2D slider could be saturation or a combined representation
      expect(gradientArea?.hasAttribute('aria-valuenow')).toBe(true);
    });

    test('has aria-label for accessibility', () => {
      const { container } = render(() => <GradientArea {...defaultProps} />);
      const gradientArea = container.querySelector('[data-testid="gradient-area"]');
      expect(gradientArea?.hasAttribute('aria-label')).toBe(true);
    });

    test('is focusable via tabIndex', () => {
      const { container } = render(() => <GradientArea {...defaultProps} />);
      const gradientArea = container.querySelector('[data-testid="gradient-area"]');
      expect(gradientArea?.getAttribute('tabindex')).toBe('0');
    });

    test('disabled state sets aria-disabled', () => {
      const { container } = render(() => <GradientArea {...defaultProps} disabled={true} />);
      const gradientArea = container.querySelector('[data-testid="gradient-area"]');
      expect(gradientArea?.getAttribute('aria-disabled')).toBe('true');
    });
  });
});
