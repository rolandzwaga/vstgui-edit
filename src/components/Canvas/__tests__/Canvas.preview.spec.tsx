import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { Canvas } from '../Canvas';
import { resetCanvas } from '../../../stores/canvasStore';
import { dragStore, resetDrag } from '../../../stores/dragStore';
import { resetHistory } from '../../../stores/historyStore';
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

describe('Canvas Drag Preview (US5)', () => {
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

  describe('Given a view is being dragged (FR-012)', () => {
    describe('When drag exceeds click threshold', () => {
      it('should display ghost preview of target position', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);
        expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });

        expect(screen.queryByTestId('drag-preview-TestTemplate-view-1')).not.toBeInTheDocument();

        fireEvent.mouseMove(document, { clientX: 150, clientY: 120 });

        expect(dragStore.isDragging).toBe(true);
        expect(screen.getByTestId('drag-preview-TestTemplate-view-1')).toBeInTheDocument();
      });

      it('should hide preview when mouse is released', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 150, clientY: 120 });
        expect(screen.getByTestId('drag-preview-TestTemplate-view-1')).toBeInTheDocument();

        fireEvent.mouseUp(document);
        expect(screen.queryByTestId('drag-preview-TestTemplate-view-1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Given multiple views are being dragged', () => {
    describe('When dragging', () => {
      it('should display ghost preview for all selected views', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
          { id: 'view-2', x: 200, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view1 = screen.getByTestId('view-TestTemplate-view-1');
        const view2 = screen.getByTestId('view-TestTemplate-view-2');

        fireEvent.mouseDown(view1, { button: 0 });
        fireEvent.mouseUp(document);
        fireEvent.mouseDown(view2, { button: 0, shiftKey: true });
        fireEvent.mouseUp(document);

        expect(selectionStore.selectedIds.size).toBe(2);

        fireEvent.mouseDown(view1, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 150, clientY: 120 });

        expect(screen.getByTestId('drag-preview-TestTemplate-view-1')).toBeInTheDocument();
        expect(screen.getByTestId('drag-preview-TestTemplate-view-2')).toBeInTheDocument();
      });
    });
  });

  describe('Given drag is cancelled with Escape', () => {
    it('should hide preview immediately', async () => {
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
      expect(screen.getByTestId('drag-preview-TestTemplate-view-1')).toBeInTheDocument();

      fireEvent.keyDown(wrapper, { key: 'Escape' });

      expect(screen.queryByTestId('drag-preview-TestTemplate-view-1')).not.toBeInTheDocument();
    });
  });
});
