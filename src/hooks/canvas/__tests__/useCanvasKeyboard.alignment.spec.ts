import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { createMockRenderableView } from '../../../__tests__/helpers/fixtures';
import { clearSelection, select, toggleSelect, selectionStore } from '../../../stores/selectionStore';
import { clearHistory, historyStore } from '../../../stores/historyStore';
import type { RenderableView, TemplateBounds } from '../../../types/canvas';
import { useCanvasKeyboard } from '../useCanvasKeyboard';

// Mock document store
vi.mock('../../../stores/documentStore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../stores/documentStore')>();
  return {
    ...actual,
    updateViewOrigin: vi.fn(),
    getParentId: vi.fn((id: string) => {
      if (id === 'root') return null;
      return 'root';
    }),
    getView: vi.fn(() => null),
  };
});

// Import the mocked function
import { updateViewOrigin } from '../../../stores/documentStore';

describe('useCanvasKeyboard alignment shortcuts', () => {
  const mockViews: RenderableView[] = [
    createMockRenderableView({
      id: 'root',
      absoluteX: 0,
      absoluteY: 0,
      relativeX: 0,
      relativeY: 0,
      width: 800,
      height: 600,
      parentId: null,
    }),
    createMockRenderableView({
      id: 'view1',
      absoluteX: 10,
      absoluteY: 20,
      relativeX: 10,
      relativeY: 20,
      width: 100,
      height: 50,
      parentId: 'root',
    }),
    createMockRenderableView({
      id: 'view2',
      absoluteX: 200,
      absoluteY: 100,
      relativeX: 200,
      relativeY: 100,
      width: 80,
      height: 60,
      parentId: 'root',
    }),
  ];

  const createOptions = () => ({
    renderableViews: () => mockViews,
    templateBounds: () => ({ width: 800, height: 600 } as TemplateBounds),
    cancelCallbacks: {
      cancelResizeListeners: vi.fn(),
      cancelDragListeners: vi.fn(),
      cancelMarqueeListeners: vi.fn(),
      clearPendingDrag: vi.fn(),
    },
  });

  const createKeyboardEvent = (
    key: string,
    options: { ctrlKey?: boolean; shiftKey?: boolean } = {}
  ): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', {
      key,
      ctrlKey: options.ctrlKey ?? false,
      shiftKey: options.shiftKey ?? false,
      bubbles: true,
      cancelable: true,
    });
    // Set target to document body (not an input/textarea)
    Object.defineProperty(event, 'target', {
      value: document.body,
      writable: false,
    });
    // Add preventDefault spy
    vi.spyOn(event, 'preventDefault');
    return event;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    clearSelection();
    clearHistory();
  });

  afterEach(() => {
    clearSelection();
  });

  describe('Ctrl+Shift+L (align left)', () => {
    it('triggers align left for selected views', () => {
      testInRoot(() => {
        select('view1');
        toggleSelect('view2');

        const options = createOptions();
        const { handleKeyDown } = useCanvasKeyboard(options);
        const event = createKeyboardEvent('l', { ctrlKey: true, shiftKey: true });

        handleKeyDown(event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(updateViewOrigin).toHaveBeenCalled();
      });
    });

    it('creates history entry for alignment', () => {
      testInRoot(() => {
        select('view1');
        toggleSelect('view2');

        const options = createOptions();
        const { handleKeyDown } = useCanvasKeyboard(options);
        const event = createKeyboardEvent('l', { ctrlKey: true, shiftKey: true });

        handleKeyDown(event);

        expect(historyStore.canUndo).toBe(true);
      });
    });
  });

  describe('Ctrl+Shift+C (align center)', () => {
    it('triggers align center for selected views', () => {
      testInRoot(() => {
        select('view1');
        toggleSelect('view2');

        const options = createOptions();
        const { handleKeyDown } = useCanvasKeyboard(options);
        const event = createKeyboardEvent('c', { ctrlKey: true, shiftKey: true });

        handleKeyDown(event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(updateViewOrigin).toHaveBeenCalled();
      });
    });
  });

  describe('Ctrl+Shift+R (align right)', () => {
    it('triggers align right for selected views', () => {
      testInRoot(() => {
        select('view1');
        toggleSelect('view2');

        const options = createOptions();
        const { handleKeyDown } = useCanvasKeyboard(options);
        const event = createKeyboardEvent('r', { ctrlKey: true, shiftKey: true });

        handleKeyDown(event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(updateViewOrigin).toHaveBeenCalled();
      });
    });
  });

  describe('Ctrl+Shift+T (align top)', () => {
    it('triggers align top for selected views', () => {
      testInRoot(() => {
        select('view1');
        toggleSelect('view2');

        const options = createOptions();
        const { handleKeyDown } = useCanvasKeyboard(options);
        const event = createKeyboardEvent('t', { ctrlKey: true, shiftKey: true });

        handleKeyDown(event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(updateViewOrigin).toHaveBeenCalled();
      });
    });
  });

  describe('Ctrl+Shift+M (align middle)', () => {
    it('triggers align middle for selected views', () => {
      testInRoot(() => {
        select('view1');
        toggleSelect('view2');

        const options = createOptions();
        const { handleKeyDown } = useCanvasKeyboard(options);
        const event = createKeyboardEvent('m', { ctrlKey: true, shiftKey: true });

        handleKeyDown(event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(updateViewOrigin).toHaveBeenCalled();
      });
    });
  });

  describe('Ctrl+Shift+B (align bottom)', () => {
    it('triggers align bottom for selected views', () => {
      testInRoot(() => {
        select('view1');
        toggleSelect('view2');

        const options = createOptions();
        const { handleKeyDown } = useCanvasKeyboard(options);
        const event = createKeyboardEvent('b', { ctrlKey: true, shiftKey: true });

        handleKeyDown(event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(updateViewOrigin).toHaveBeenCalled();
      });
    });
  });

  describe('no selection', () => {
    it('does not trigger alignment when nothing selected', () => {
      testInRoot(() => {
        // No selection
        const options = createOptions();
        const { handleKeyDown } = useCanvasKeyboard(options);
        const event = createKeyboardEvent('l', { ctrlKey: true, shiftKey: true });

        handleKeyDown(event);

        // Should not prevent default or update any views
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(updateViewOrigin).not.toHaveBeenCalled();
      });
    });
  });

  describe('root only selected', () => {
    it('does not trigger alignment when only root selected', () => {
      testInRoot(() => {
        select('root');

        const options = createOptions();
        const { handleKeyDown } = useCanvasKeyboard(options);
        const event = createKeyboardEvent('l', { ctrlKey: true, shiftKey: true });

        handleKeyDown(event);

        // Alignment should not create history entry (no valid views to align)
        expect(historyStore.canUndo).toBe(false);
      });
    });
  });
});
