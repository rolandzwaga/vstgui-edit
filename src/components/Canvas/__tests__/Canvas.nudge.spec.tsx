import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { Canvas } from '../Canvas';
import { resetCanvas } from '../../../stores/canvasStore';
import { resetDrag } from '../../../stores/dragStore';
import { historyStore, resetHistory } from '../../../stores/historyStore';
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
  getParentId: () => null,
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

describe('Canvas Arrow Key Nudge (US3)', () => {
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

  describe('Given a view is selected', () => {
    describe('When user presses arrow key (FR-008)', () => {
      it('should move view 1 pixel right on ArrowRight', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);
        expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);
        mockUpdateViewOrigin.mockClear();

        fireEvent.keyDown(wrapper, { key: 'ArrowRight' });

        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 51, y: 50 });
      });

      it('should move view 1 pixel left on ArrowLeft', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);
        mockUpdateViewOrigin.mockClear();

        fireEvent.keyDown(wrapper, { key: 'ArrowLeft' });

        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 49, y: 50 });
      });

      it('should move view 1 pixel down on ArrowDown', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);
        mockUpdateViewOrigin.mockClear();

        fireEvent.keyDown(wrapper, { key: 'ArrowDown' });

        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 50, y: 51 });
      });

      it('should move view 1 pixel up on ArrowUp', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);
        mockUpdateViewOrigin.mockClear();

        fireEvent.keyDown(wrapper, { key: 'ArrowUp' });

        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 50, y: 49 });
      });
    });

    describe('When user presses Shift+Arrow (FR-009)', () => {
      it('should move view 10 pixels right on Shift+ArrowRight', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);
        mockUpdateViewOrigin.mockClear();

        fireEvent.keyDown(wrapper, { key: 'ArrowRight', shiftKey: true });

        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 60, y: 50 });
      });

      it('should move view 10 pixels left on Shift+ArrowLeft', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);
        mockUpdateViewOrigin.mockClear();

        fireEvent.keyDown(wrapper, { key: 'ArrowLeft', shiftKey: true });

        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 40, y: 50 });
      });

      it('should move view 10 pixels down on Shift+ArrowDown', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);
        mockUpdateViewOrigin.mockClear();

        fireEvent.keyDown(wrapper, { key: 'ArrowDown', shiftKey: true });

        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 50, y: 60 });
      });

      it('should move view 10 pixels up on Shift+ArrowUp', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);
        mockUpdateViewOrigin.mockClear();

        fireEvent.keyDown(wrapper, { key: 'ArrowUp', shiftKey: true });

        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 50, y: 40 });
      });
    });
  });

  describe('Given multiple views are selected', () => {
    describe('When user presses arrow key', () => {
      it('should move all selected views together', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
          { id: 'view-2', x: 200, y: 80, width: 100, height: 100 },
          { id: 'view-3', x: 50, y: 200, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view1 = screen.getByTestId('view-TestTemplate-view-1');
        const view2 = screen.getByTestId('view-TestTemplate-view-2');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view1, { button: 0 });
        fireEvent.mouseUp(document);
        fireEvent.mouseDown(view2, { button: 0, shiftKey: true });
        fireEvent.mouseUp(document);

        expect(selectionStore.selectedIds.size).toBe(2);
        mockUpdateViewOrigin.mockClear();

        fireEvent.keyDown(wrapper, { key: 'ArrowRight' });

        expect(mockUpdateViewOrigin).toHaveBeenCalledTimes(2);
        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 51, y: 50 });
        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-2', { x: 201, y: 80 });
      });
    });
  });

  describe('Given no selection', () => {
    describe('When user presses arrow key', () => {
      it('should do nothing (no-op)', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const wrapper = screen.getByTestId('canvas-wrapper');
        expect(selectionStore.selectedIds.size).toBe(0);

        fireEvent.keyDown(wrapper, { key: 'ArrowRight' });

        expect(mockUpdateViewOrigin).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given arrow key nudge is performed', () => {
    describe('Undo/redo integration (FR-015)', () => {
      it('should record nudge in history for undo', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        expect(historyStore.canUndo).toBe(false);

        fireEvent.keyDown(wrapper, { key: 'ArrowRight' });

        expect(historyStore.canUndo).toBe(true);
      });

      it('should restore original position on undo', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        const wrapper = screen.getByTestId('canvas-wrapper');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.keyDown(wrapper, { key: 'ArrowRight' });
        mockUpdateViewOrigin.mockClear();

        fireEvent.keyDown(wrapper, { key: 'z', ctrlKey: true });

        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 50, y: 50 });
      });
    });
  });

  describe('Given keyboard is in a text input', () => {
    it('should NOT trigger nudge', async () => {
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
      mockUpdateViewOrigin.mockClear();

      const textInput = screen.getByTestId('text-input');
      fireEvent.keyDown(textInput, { key: 'ArrowRight' });

      expect(mockUpdateViewOrigin).not.toHaveBeenCalled();
    });
  });
});
