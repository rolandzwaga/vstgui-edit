/**
 * SelectionOverlay Cursor Tests
 * Tests for resize handle cursor changes (FR-014)
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { SelectionOverlay } from '../SelectionOverlay';
import type { RenderableView } from '../../../types/canvas';
import { HANDLE_CURSORS, HANDLE_POSITIONS, type HandlePosition } from '../../../types/selection';

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

describe('SelectionOverlay Cursors (FR-014)', () => {
  describe('Given a selection overlay with resize handles', () => {
    it('should render 8 resize handles', () => {
      const view = createMockView();

      render(() => <SelectionOverlay view={view} />);

      const overlay = screen.getByTestId('selection-overlay-test-view');
      const handles = overlay.querySelectorAll('[data-role="resize-handle"]');

      expect(handles.length).toBe(8);
    });

    it('should have correct cursor style for each handle position', () => {
      const view = createMockView();

      render(() => <SelectionOverlay view={view} />);

      const overlay = screen.getByTestId('selection-overlay-test-view');

      // Check each handle has correct cursor
      for (const position of HANDLE_POSITIONS) {
        const handle = overlay.querySelector(`[data-position="${position}"]`);
        expect(handle).toBeInTheDocument();

        const expectedCursor = HANDLE_CURSORS[position];
        expect(handle).toHaveStyle({ cursor: expectedCursor });
      }
    });
  });

  describe('Given corner handles', () => {
    it('should have diagonal resize cursors', () => {
      const view = createMockView();

      render(() => <SelectionOverlay view={view} />);

      const overlay = screen.getByTestId('selection-overlay-test-view');

      // NW and SE use nwse-resize
      const nwHandle = overlay.querySelector('[data-position="nw"]');
      const seHandle = overlay.querySelector('[data-position="se"]');
      expect(nwHandle).toHaveStyle({ cursor: 'nwse-resize' });
      expect(seHandle).toHaveStyle({ cursor: 'nwse-resize' });

      // NE and SW use nesw-resize
      const neHandle = overlay.querySelector('[data-position="ne"]');
      const swHandle = overlay.querySelector('[data-position="sw"]');
      expect(neHandle).toHaveStyle({ cursor: 'nesw-resize' });
      expect(swHandle).toHaveStyle({ cursor: 'nesw-resize' });
    });
  });

  describe('Given edge handles', () => {
    it('should have vertical resize cursors for N and S', () => {
      const view = createMockView();

      render(() => <SelectionOverlay view={view} />);

      const overlay = screen.getByTestId('selection-overlay-test-view');

      const nHandle = overlay.querySelector('[data-position="n"]');
      const sHandle = overlay.querySelector('[data-position="s"]');

      expect(nHandle).toHaveStyle({ cursor: 'ns-resize' });
      expect(sHandle).toHaveStyle({ cursor: 'ns-resize' });
    });

    it('should have horizontal resize cursors for E and W', () => {
      const view = createMockView();

      render(() => <SelectionOverlay view={view} />);

      const overlay = screen.getByTestId('selection-overlay-test-view');

      const eHandle = overlay.querySelector('[data-position="e"]');
      const wHandle = overlay.querySelector('[data-position="w"]');

      expect(eHandle).toHaveStyle({ cursor: 'ew-resize' });
      expect(wHandle).toHaveStyle({ cursor: 'ew-resize' });
    });
  });

  describe('Given resize handles are visual only (FR-015)', () => {
    it('should not respond to click events (no resize action)', () => {
      const view = createMockView();

      render(() => <SelectionOverlay view={view} />);

      const overlay = screen.getByTestId('selection-overlay-test-view');
      const handles = overlay.querySelectorAll('[data-role="resize-handle"]');

      // Verify handles exist but have no click handlers
      // (they use pointer-events: none in CSS or simply have no onClick)
      handles.forEach((handle) => {
        // Handles should be visual only - no aria labels for interaction
        expect(handle).not.toHaveAttribute('role', 'button');
        expect(handle).not.toHaveAttribute('onclick');
      });
    });

    it('should not have aria-label for interactive element', () => {
      const view = createMockView();

      render(() => <SelectionOverlay view={view} />);

      const overlay = screen.getByTestId('selection-overlay-test-view');
      const handles = overlay.querySelectorAll('[data-role="resize-handle"]');

      // Visual-only handles don't need interactive ARIA
      handles.forEach((handle) => {
        expect(handle).not.toHaveAttribute('aria-label');
      });
    });
  });
});
