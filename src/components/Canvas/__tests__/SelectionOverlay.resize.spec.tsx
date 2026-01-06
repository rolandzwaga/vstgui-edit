import { render, fireEvent, cleanup } from '@solidjs/testing-library';
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { SelectionOverlay } from '../SelectionOverlay';
import type { RenderableView } from '../../../types/canvas';
import type { HandlePosition } from '../../../types/selection';

function createMockView(overrides?: Partial<RenderableView>): RenderableView {
  return {
    id: 'test-view',
    absoluteX: 100,
    absoluteY: 100,
    width: 200,
    height: 150,
    className: 'CTextButton',
    category: 'control',
    zIndex: 0,
    parentId: null,
    ...overrides,
  };
}

describe('SelectionOverlay resize handles', () => {
  afterEach(() => {
    cleanup();
  });

  describe('onResizeStart callback', () => {
    it('should call onResizeStart when mousedown on NW handle', () => {
      const onResizeStart = vi.fn();
      const view = createMockView();

      const { container } = render(() => (
        <svg>
          <SelectionOverlay view={view} onResizeStart={onResizeStart} />
        </svg>
      ));

      const nwHandle = container.querySelector('[data-position="nw"]') as Element;
      expect(nwHandle).toBeTruthy();

      fireEvent.mouseDown(nwHandle, { button: 0 });

      expect(onResizeStart).toHaveBeenCalledTimes(1);
      expect(onResizeStart).toHaveBeenCalledWith('nw', view);
    });

    it('should call onResizeStart when mousedown on SE handle', () => {
      const onResizeStart = vi.fn();
      const view = createMockView();

      const { container } = render(() => (
        <svg>
          <SelectionOverlay view={view} onResizeStart={onResizeStart} />
        </svg>
      ));

      const seHandle = container.querySelector('[data-position="se"]') as Element;
      fireEvent.mouseDown(seHandle, { button: 0 });

      expect(onResizeStart).toHaveBeenCalledWith('se', view);
    });

    it('should call onResizeStart for all 8 handles', () => {
      const onResizeStart = vi.fn();
      const view = createMockView();
      const handles: HandlePosition[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

      for (const position of handles) {
        onResizeStart.mockClear();
        cleanup();

        const { container } = render(() => (
          <svg>
            <SelectionOverlay view={view} onResizeStart={onResizeStart} />
          </svg>
        ));

        const handle = container.querySelector(`[data-position="${position}"]`) as Element;
        fireEvent.mouseDown(handle, { button: 0 });

        expect(onResizeStart).toHaveBeenCalledWith(position, view);
      }
    });

    it('should not call onResizeStart for right-click', () => {
      const onResizeStart = vi.fn();
      const view = createMockView();

      const { container } = render(() => (
        <svg>
          <SelectionOverlay view={view} onResizeStart={onResizeStart} />
        </svg>
      ));

      const seHandle = container.querySelector('[data-position="se"]') as Element;
      fireEvent.mouseDown(seHandle, { button: 2 });

      expect(onResizeStart).not.toHaveBeenCalled();
    });

    it('should stop propagation to prevent canvas handling', () => {
      const onResizeStart = vi.fn();
      const canvasMouseDown = vi.fn();
      const view = createMockView();

      const { container } = render(() => (
        <svg onMouseDown={canvasMouseDown}>
          <SelectionOverlay view={view} onResizeStart={onResizeStart} />
        </svg>
      ));

      const seHandle = container.querySelector('[data-position="se"]') as Element;
      fireEvent.mouseDown(seHandle, { button: 0 });

      expect(onResizeStart).toHaveBeenCalled();
      expect(canvasMouseDown).not.toHaveBeenCalled();
    });
  });

  describe('when onResizeStart is not provided', () => {
    it('should render handles without error', () => {
      const view = createMockView();

      const { container } = render(() => (
        <svg>
          <SelectionOverlay view={view} />
        </svg>
      ));

      const handles = container.querySelectorAll('[data-role="resize-handle"]');
      expect(handles.length).toBe(8);
    });

    it('should not throw when handle is clicked', () => {
      const view = createMockView();

      const { container } = render(() => (
        <svg>
          <SelectionOverlay view={view} />
        </svg>
      ));

      const seHandle = container.querySelector('[data-position="se"]') as Element;
      expect(() => fireEvent.mouseDown(seHandle, { button: 0 })).not.toThrow();
    });
  });
});
