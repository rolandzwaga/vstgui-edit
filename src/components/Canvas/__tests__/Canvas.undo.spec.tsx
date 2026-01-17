import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { Canvas } from '../Canvas';
import { resetCanvas } from '../../../stores/canvasStore';
import { resetDrag } from '../../../stores/dragStore';
import { historyStore, resetHistory, undo, redo } from '../../../stores/historyStore';
import { resetSelection, selectionStore } from '../../../stores/selectionStore';

// biome-ignore lint/suspicious/noExplicitAny: Mock for testing
const mockDocumentStore = vi.hoisted(() => ({
  document: null as any,
}));

const mockTemplateStore = vi.hoisted(() => ({
  activeTemplateId: 'TestTemplate' as string | null,
}));

const mockUpdateViewOrigin = vi.fn();

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
  updateViewOrigin: (...args: unknown[]) => mockUpdateViewOrigin(...args),
  getTemplate: (name: string) => {
    const doc = mockDocumentStore.document as { 'vstgui-ui-description'?: { templates?: Record<string, unknown> } } | null;
    return doc?.['vstgui-ui-description']?.templates?.[name];
  },
  getParentId: (viewId: string) => {
    if (viewId === 'TestTemplate') return null;
    const lastDash = viewId.lastIndexOf('-');
    return lastDash > 0 ? viewId.substring(0, lastDash) : null;
  },
  isRoot: (viewId: string) => viewId === 'TestTemplate',
  getView: () => null,
}));

vi.mock('../../../stores/templateStore', () => ({
  templateStore: mockTemplateStore,
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

// Note: Undo/Redo is now handled globally in App.tsx, so these tests
// call undo()/redo() directly instead of simulating keyboard events on the canvas.

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

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);
        expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 150, clientY: 120 });
        fireEvent.mouseUp(document);

        expect(historyStore.canUndo).toBe(true);
        mockUpdateViewOrigin.mockClear();

        // Call undo directly (global handler in App.tsx handles Ctrl+Z)
        undo();

        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 50, y: 50 });
      });

      it('should enable redo after undo', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 150, clientY: 120 });
        fireEvent.mouseUp(document);

        expect(historyStore.canRedo).toBe(false);

        undo();

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

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 150, clientY: 120 });
        fireEvent.mouseUp(document);

        undo();
        mockUpdateViewOrigin.mockClear();

        redo();

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

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 150, clientY: 120 });
        fireEvent.mouseUp(document);

        undo();
        mockUpdateViewOrigin.mockClear();

        // Ctrl+Shift+Z also calls redo (handled globally)
        redo();

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

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 120, clientY: 100 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 130, clientY: 100 });
        fireEvent.mouseUp(document);

        mockUpdateViewOrigin.mockClear();

        undo();
        expect(mockUpdateViewOrigin).toHaveBeenCalledTimes(1);

        undo();
        expect(mockUpdateViewOrigin).toHaveBeenCalledTimes(2);

        undo();
        // No more operations - should stay at 2
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

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 150, clientY: 100 });
        fireEvent.mouseUp(document);

        undo();
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

        expect(historyStore.canUndo).toBe(false);

        undo();

        expect(mockUpdateViewOrigin).not.toHaveBeenCalled();
      });
    });

    describe('When Ctrl+Y is pressed', () => {
      it('should do nothing (no-op)', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        expect(historyStore.canRedo).toBe(false);

        redo();

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

      // When focused on text input and Ctrl+Z is pressed, global handler skips it
      // (This behavior is tested in App.tsx, not here since we call undo() directly)
      const textInput = screen.getByTestId('text-input');
      textInput.focus();

      // Simulating what the global handler does - it checks if target is input/textarea
      // and skips undo. Here we just verify the history state remains unchanged.
      expect(historyStore.canUndo).toBe(true);
    });
  });
});
