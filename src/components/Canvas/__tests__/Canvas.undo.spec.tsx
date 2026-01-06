import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { Canvas } from '../Canvas';
import { resetCanvas } from '../../../stores/canvasStore';
import { resetDrag } from '../../../stores/dragStore';
import { clearHistory, historyStore, resetHistory } from '../../../stores/historyStore';
import { resetSelection, selectionStore } from '../../../stores/selectionStore';

// biome-ignore lint/suspicious/noExplicitAny: Mock for testing
const mockDocumentStore = vi.hoisted(() => ({
  document: null as any,
}));

const mockUpdateViewOrigin = vi.fn();

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
  updateViewOrigin: (...args: unknown[]) => mockUpdateViewOrigin(...args),
}));

const createMockDocument = (
  views: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>
) => {
  const children: Record<string, unknown> = {};

  for (const view of views) {
    children[view.id] = {
      attributes: {
        class: 'CTextButton',
        origin: `${view.x}, ${view.y}`,
        size: `${view.width}, ${view.height}`,
      },
    };
  }

  return {
    'vstgui-ui-description': {
      version: '1',
      templates: {
        TestTemplate: {
          attributes: {
            class: 'CViewContainer',
            origin: '0, 0',
            size: '400, 300',
          },
          children,
        },
      },
    },
  };
};

describe('Canvas Undo/Redo (US2)', () => {
  beforeEach(() => {
    mockDocumentStore.document = null;
    mockUpdateViewOrigin.mockClear();
    resetCanvas();
    resetSelection();
    resetDrag();
    resetHistory();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Given a view has been moved', () => {
    describe('When user presses Ctrl+Z (FR-004)', () => {
      it('should call undo and restore view to previous position', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);
        expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 150, clientY: 120 });
        fireEvent.mouseUp(document);

        expect(historyStore.canUndo).toBe(true);
        mockUpdateViewOrigin.mockClear();

        fireEvent.keyDown(wrapper, { key: 'z', ctrlKey: true });

        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 50, y: 50 });
      });

      it('should enable redo after undo', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 150, clientY: 120 });
        fireEvent.mouseUp(document);

        expect(historyStore.canRedo).toBe(false);

        fireEvent.keyDown(wrapper, { key: 'z', ctrlKey: true });

        expect(historyStore.canRedo).toBe(true);
      });
    });

    describe('When user presses Ctrl+Y (FR-005)', () => {
      it('should call redo and restore view to moved position', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 150, clientY: 120 });
        fireEvent.mouseUp(document);

        fireEvent.keyDown(wrapper, { key: 'z', ctrlKey: true });
        mockUpdateViewOrigin.mockClear();

        fireEvent.keyDown(wrapper, { key: 'y', ctrlKey: true });

        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 100, y: 70 });
      });
    });

    describe('When user presses Ctrl+Shift+Z (FR-005 alternative)', () => {
      it('should also call redo', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 150, clientY: 120 });
        fireEvent.mouseUp(document);

        fireEvent.keyDown(wrapper, { key: 'z', ctrlKey: true });
        mockUpdateViewOrigin.mockClear();

        fireEvent.keyDown(wrapper, { key: 'z', ctrlKey: true, shiftKey: true });

        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 100, y: 70 });
      });
    });
  });

  describe('Given multiple moves have been performed', () => {
    describe('When user presses Ctrl+Z multiple times', () => {
      it('should undo each move in reverse order', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 120, clientY: 100 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 130, clientY: 100 });
        fireEvent.mouseUp(document);

        mockUpdateViewOrigin.mockClear();

        fireEvent.keyDown(wrapper, { key: 'z', ctrlKey: true });
        expect(mockUpdateViewOrigin).toHaveBeenCalledTimes(1);

        fireEvent.keyDown(wrapper, { key: 'z', ctrlKey: true });
        expect(mockUpdateViewOrigin).toHaveBeenCalledTimes(2);

        fireEvent.keyDown(wrapper, { key: 'z', ctrlKey: true });
        expect(mockUpdateViewOrigin).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Given a move has been undone', () => {
    describe('When a new move is performed (FR-007)', () => {
      it('should clear the redo stack', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 150, clientY: 100 });
        fireEvent.mouseUp(document);

        fireEvent.keyDown(wrapper, { key: 'z', ctrlKey: true });
        expect(historyStore.canRedo).toBe(true);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 200, clientY: 100 });
        fireEvent.mouseUp(document);

        expect(historyStore.canRedo).toBe(false);
      });
    });
  });

  describe('Given no operations in history', () => {
    describe('When Ctrl+Z is pressed', () => {
      it('should do nothing (no-op)', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const wrapper = screen.getByTestId('canvas-wrapper');
        expect(historyStore.canUndo).toBe(false);

        fireEvent.keyDown(wrapper, { key: 'z', ctrlKey: true });

        expect(mockUpdateViewOrigin).not.toHaveBeenCalled();
      });
    });

    describe('When Ctrl+Y is pressed', () => {
      it('should do nothing (no-op)', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const wrapper = screen.getByTestId('canvas-wrapper');
        expect(historyStore.canRedo).toBe(false);

        fireEvent.keyDown(wrapper, { key: 'y', ctrlKey: true });

        expect(mockUpdateViewOrigin).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given keyboard is in a text input', () => {
    it('should NOT trigger undo/redo (FR-007 filter)', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
      ]);

      render(() => (
        <div>
          <Canvas />
          <input type="text" data-testid="text-input" />
        </div>
      ));

      const view = screen.getByTestId('view-TestTemplate-view-1');

      fireEvent.mouseDown(view, { button: 0 });
      fireEvent.mouseUp(document);

      fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 150, clientY: 120 });
      fireEvent.mouseUp(document);

      expect(historyStore.canUndo).toBe(true);
      mockUpdateViewOrigin.mockClear();

      const textInput = screen.getByTestId('text-input');
      fireEvent.keyDown(textInput, { key: 'z', ctrlKey: true });

      expect(mockUpdateViewOrigin).not.toHaveBeenCalled();
      expect(historyStore.canUndo).toBe(true);
    });
  });
});
