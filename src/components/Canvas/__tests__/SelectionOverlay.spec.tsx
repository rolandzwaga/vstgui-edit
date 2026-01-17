/**
 * SelectionOverlay Tests
 * Tests for the selection overlay component (border + 8 resize handles)
 */
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@solidjs/testing-library';
import { SelectionOverlay } from '../SelectionOverlay';
import { resetViewModeStore, setViewMode } from '../../../stores/viewModeStore';
import type { RenderableView } from '../../../types/canvas';
import type { OverlayStyle } from '../../../types/viewMode';

const createMockView = (overrides: Partial<RenderableView> = {}): RenderableView => ({
  id: 'test-view',
  absoluteX: 100,
  absoluteY: 50,
  relativeX: 100,
  relativeY: 50,
  width: 200,
  height: 100,
  className: 'CTextButton',
  category: 'control',
  zIndex: 0,
  parentId: null,
  ...overrides,
});

describe('SelectionOverlay', () => {
  describe('Given a selected view (FR-008, FR-009)', () => {
    it('should render an SVG group element', () => {
      const view = createMockView();

      render(() => (
        <svg>
          <SelectionOverlay view={view} />
        </svg>
      ));

      const group = screen.getByTestId('selection-overlay-test-view');
      expect(group).toBeInTheDocument();
    });

    it('should render a selection border rect', () => {
      const view = createMockView();

      render(() => (
        <svg>
          <SelectionOverlay view={view} />
        </svg>
      ));

      const group = screen.getByTestId('selection-overlay-test-view');
      const rect = group.querySelector('rect[data-role="selection-border"]');

      expect(rect).toBeInTheDocument();
      expect(rect).toHaveAttribute('x', '100');
      expect(rect).toHaveAttribute('y', '50');
      expect(rect).toHaveAttribute('width', '200');
      expect(rect).toHaveAttribute('height', '100');
    });

    it('should render 8 resize handles', () => {
      const view = createMockView();

      render(() => (
        <svg>
          <SelectionOverlay view={view} />
        </svg>
      ));

      const group = screen.getByTestId('selection-overlay-test-view');
      const handles = group.querySelectorAll('[data-role="resize-handle"]');

      expect(handles).toHaveLength(8);
    });

    it('should render handles at correct positions (corners and edge midpoints)', () => {
      const view = createMockView({
        absoluteX: 0,
        absoluteY: 0,
        width: 100,
        height: 100,
      });

      render(() => (
        <svg>
          <SelectionOverlay view={view} />
        </svg>
      ));

      const group = screen.getByTestId('selection-overlay-test-view');

      // Check each handle position by data-position attribute (compass directions)
      const positions = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];

      for (const pos of positions) {
        const handle = group.querySelector(`[data-position="${pos}"]`);
        expect(handle).toBeInTheDocument();
      }
    });

    it('should position nw (top-left) handle at view origin', () => {
      const view = createMockView({
        absoluteX: 50,
        absoluteY: 30,
        width: 100,
        height: 80,
      });

      render(() => (
        <svg>
          <SelectionOverlay view={view} />
        </svg>
      ));

      const group = screen.getByTestId('selection-overlay-test-view');
      const handle = group.querySelector('[data-position="nw"]');

      // Handle should be centered at (50, 30)
      const cx = Number(handle?.getAttribute('cx'));
      const cy = Number(handle?.getAttribute('cy'));

      expect(cx).toBe(50);
      expect(cy).toBe(30);
    });

    it('should position se (bottom-right) handle at view corner', () => {
      const view = createMockView({
        absoluteX: 50,
        absoluteY: 30,
        width: 100,
        height: 80,
      });

      render(() => (
        <svg>
          <SelectionOverlay view={view} />
        </svg>
      ));

      const group = screen.getByTestId('selection-overlay-test-view');
      const handle = group.querySelector('[data-position="se"]');

      // Handle should be centered at (150, 110)
      const cx = Number(handle?.getAttribute('cx'));
      const cy = Number(handle?.getAttribute('cy'));

      expect(cx).toBe(150); // 50 + 100
      expect(cy).toBe(110); // 30 + 80
    });

    it('should position edge midpoint handles correctly', () => {
      const view = createMockView({
        absoluteX: 0,
        absoluteY: 0,
        width: 100,
        height: 80,
      });

      render(() => (
        <svg>
          <SelectionOverlay view={view} />
        </svg>
      ));

      const group = screen.getByTestId('selection-overlay-test-view');

      // n (top center) at (50, 0)
      const topCenter = group.querySelector('[data-position="n"]');
      expect(Number(topCenter?.getAttribute('cx'))).toBe(50);
      expect(Number(topCenter?.getAttribute('cy'))).toBe(0);

      // w (middle left) at (0, 40)
      const middleLeft = group.querySelector('[data-position="w"]');
      expect(Number(middleLeft?.getAttribute('cx'))).toBe(0);
      expect(Number(middleLeft?.getAttribute('cy'))).toBe(40);
    });
  });

  describe('Given different view IDs', () => {
    it('should use view id in test id', () => {
      const view = createMockView({ id: 'button-42' });

      render(() => (
        <svg>
          <SelectionOverlay view={view} />
        </svg>
      ));

      expect(screen.getByTestId('selection-overlay-button-42')).toBeInTheDocument();
    });
  });

  describe('Given handles have visual properties', () => {
    it('should have consistent handle size', () => {
      const view = createMockView();

      render(() => (
        <svg>
          <SelectionOverlay view={view} />
        </svg>
      ));

      const group = screen.getByTestId('selection-overlay-test-view');
      const handles = group.querySelectorAll('[data-role="resize-handle"]');

      // All handles should have same radius (HANDLE_SIZE / 2 = 4)
      for (const handle of handles) {
        expect(handle).toHaveAttribute('r', '4');
      }
    });
  });

  describe('Given adaptive overlay colors (US4 - selection overlays)', () => {
    const createOverlayStyle = (fillColor: string, strokeColor: string, fillOpacity = 0.5): OverlayStyle => ({
      fillColor,
      fillOpacity,
      strokeColor,
    });

    beforeEach(() => {
      resetViewModeStore();
    });

    afterEach(() => {
      cleanup();
    });

    it('should use white overlay when styled mode with dark background', () => {
      setViewMode('styled');
      const view = createMockView();
      const overlayStyle = createOverlayStyle('#FFFFFF', '#FFFFFF');

      render(() => (
        <svg>
          <SelectionOverlay view={view} overlayStyle={overlayStyle} />
        </svg>
      ));

      const group = screen.getByTestId('selection-overlay-test-view');
      const rect = group.querySelector('rect[data-role="selection-border"]');

      expect(rect).toHaveAttribute('fill', '#FFFFFF');
      expect(rect).toHaveAttribute('stroke', '#FFFFFF');
    });

    it('should use dark overlay when styled mode with light background', () => {
      setViewMode('styled');
      const view = createMockView();
      const overlayStyle = createOverlayStyle('#000000', '#000000');

      render(() => (
        <svg>
          <SelectionOverlay view={view} overlayStyle={overlayStyle} />
        </svg>
      ));

      const group = screen.getByTestId('selection-overlay-test-view');
      const rect = group.querySelector('rect[data-role="selection-border"]');

      expect(rect).toHaveAttribute('fill', '#000000');
      expect(rect).toHaveAttribute('stroke', '#000000');
    });

    it('should NOT use inline styles in wireframe mode even with overlayStyle', () => {
      setViewMode('wireframe');
      const view = createMockView();
      const overlayStyle = createOverlayStyle('#FFFFFF', '#FFFFFF');

      render(() => (
        <svg>
          <SelectionOverlay view={view} overlayStyle={overlayStyle} />
        </svg>
      ));

      const group = screen.getByTestId('selection-overlay-test-view');
      const rect = group.querySelector('rect[data-role="selection-border"]');

      // In wireframe mode, CSS classes control styling
      expect(rect).not.toHaveAttribute('fill', '#FFFFFF');
      expect(rect).not.toHaveAttribute('stroke', '#FFFFFF');
    });

    it('should use dark overlay for pure white #FFFFFF background', () => {
      setViewMode('styled');
      const view = createMockView();
      // Dark overlay for light background
      const overlayStyle = createOverlayStyle('#000000', '#000000');

      render(() => (
        <svg>
          <SelectionOverlay view={view} overlayStyle={overlayStyle} />
        </svg>
      ));

      const group = screen.getByTestId('selection-overlay-test-view');
      const rect = group.querySelector('rect[data-role="selection-border"]');

      expect(rect).toHaveAttribute('fill', '#000000');
    });

    it('should use white overlay for pure black #000000 background', () => {
      setViewMode('styled');
      const view = createMockView();
      // White overlay for dark background
      const overlayStyle = createOverlayStyle('#FFFFFF', '#FFFFFF');

      render(() => (
        <svg>
          <SelectionOverlay view={view} overlayStyle={overlayStyle} />
        </svg>
      ));

      const group = screen.getByTestId('selection-overlay-test-view');
      const rect = group.querySelector('rect[data-role="selection-border"]');

      expect(rect).toHaveAttribute('fill', '#FFFFFF');
    });

    it('should apply fill-opacity from overlayStyle in styled mode', () => {
      setViewMode('styled');
      const view = createMockView();
      const overlayStyle = createOverlayStyle('#000000', '#000000', 0.3);

      render(() => (
        <svg>
          <SelectionOverlay view={view} overlayStyle={overlayStyle} />
        </svg>
      ));

      const group = screen.getByTestId('selection-overlay-test-view');
      const rect = group.querySelector('rect[data-role="selection-border"]');

      expect(rect).toHaveAttribute('fill-opacity', '0.3');
    });

    it('should work without overlayStyle (backward compatibility)', () => {
      setViewMode('wireframe');
      const view = createMockView();

      render(() => (
        <svg>
          <SelectionOverlay view={view} />
        </svg>
      ));

      const group = screen.getByTestId('selection-overlay-test-view');
      const rect = group.querySelector('rect[data-role="selection-border"]');

      // Should render normally with CSS classes
      expect(rect).toBeInTheDocument();
    });
  });
});
