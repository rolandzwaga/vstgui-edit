import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { Canvas } from '../Canvas';
import { resetCanvas } from '../../../stores/canvasStore';
import { dragStore, resetDrag } from '../../../stores/dragStore';
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

describe('Canvas Drag to Move (US1)', () => {
  beforeEach(() => {
    mockDocumentStore.document = null;
    mockUpdateViewOrigin.mockClear();
    resetCanvas();
    resetSelection();
    resetDrag();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Given a view is selected', () => {
    describe('When user clicks and drags the selected view', () => {
      it('should initiate drag when movement exceeds 3px (FR-014)', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);
        expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 102, clientY: 102 });
        expect(dragStore.isDragging).toBe(false);

        fireEvent.mouseMove(document, { clientX: 105, clientY: 100 });
        expect(dragStore.isDragging).toBe(true);
      });

      it('should NOT initiate drag if movement is less than 3px (click tolerance)', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);
        expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 102, clientY: 101 });
        expect(dragStore.isDragging).toBe(false);

        fireEvent.mouseUp(document);
        expect(dragStore.isDragging).toBe(false);
      });

      it('should show move cursor during drag (FR-013)', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 110, clientY: 100 });

        const wrapper = screen.getByTestId('canvas-wrapper');
        const hasMoveCursor = Array.from(wrapper.classList).some((c) => c.includes('moveCursor'));
        expect(hasMoveCursor).toBe(true);
      });
    });

    describe('When drag is completed', () => {
      it('should call updateViewOrigin on mouse release (FR-001, FR-002)', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');
        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 150, clientY: 120 });
        expect(dragStore.isDragging).toBe(true);

        fireEvent.mouseUp(document);

        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 100, y: 70 });
      });
    });
  });

  describe('Given multiple views are selected', () => {
    describe('When user drags any selected view', () => {
      it('should move all selected views together (FR-003)', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
          { id: 'view-2', x: 200, y: 50, width: 100, height: 100 },
          { id: 'view-3', x: 50, y: 200, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view1 = screen.getByTestId('view-TestTemplate-view-1');
        const view2 = screen.getByTestId('view-TestTemplate-view-2');

        fireEvent.mouseDown(view1, { button: 0 });
        fireEvent.mouseUp(document);
        fireEvent.mouseDown(view2, { button: 0, shiftKey: true });
        fireEvent.mouseUp(document);

        expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);
        expect(selectionStore.selectedIds.has('TestTemplate-view-2')).toBe(true);

        fireEvent.mouseDown(view1, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 130, clientY: 110 });
        fireEvent.mouseUp(document);

        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 80, y: 60 });
        expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-2', { x: 230, y: 60 });
        expect(mockUpdateViewOrigin).not.toHaveBeenCalledWith(
          'TestTemplate-view-3',
          expect.anything()
        );
      });

      it('should maintain relative positions between selected views', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
          { id: 'view-2', x: 100, y: 80, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view1 = screen.getByTestId('view-TestTemplate-view-1');
        const view2 = screen.getByTestId('view-TestTemplate-view-2');

        fireEvent.mouseDown(view1, { button: 0 });
        fireEvent.mouseUp(document);
        fireEvent.mouseDown(view2, { button: 0, shiftKey: true });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view2, { button: 0, clientX: 150, clientY: 130 });
        fireEvent.mouseMove(document, { clientX: 200, clientY: 180 });
        fireEvent.mouseUp(document);

        const calls = mockUpdateViewOrigin.mock.calls as Array<[string, { x: number; y: number }]>;
        const view1Call = calls.find((c) => c[0] === 'TestTemplate-view-1');
        const view2Call = calls.find((c) => c[0] === 'TestTemplate-view-2');

        expect(view1Call).toBeDefined();
        expect(view2Call).toBeDefined();

        const relativeX = view2Call![1].x - view1Call![1].x;
        const relativeY = view2Call![1].y - view1Call![1].y;
        expect(relativeX).toBe(50);
        expect(relativeY).toBe(30);
      });
    });
  });

  describe('Given unselected view is clicked', () => {
    it('should NOT start drag, should just select the view', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);
      expect(selectionStore.selectedIds.size).toBe(0);

      const view = screen.getByTestId('view-TestTemplate-view-1');

      fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });

      expect(dragStore.isDragging).toBe(false);

      fireEvent.mouseUp(document);
      expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);
    });
  });

  describe('Given drag is cancelled', () => {
    it('should call updateViewOrigin with original positions when Escape is pressed', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);

      const view = screen.getByTestId('view-TestTemplate-view-1');
      fireEvent.mouseDown(view, { button: 0 });
      fireEvent.mouseUp(document);

      const wrapper = screen.getByTestId('canvas-wrapper');

      fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
      expect(dragStore.isDragging).toBe(true);

      fireEvent.keyDown(wrapper, { key: 'Escape' });

      expect(dragStore.isDragging).toBe(false);
      expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 50, y: 50 });
    });
  });
});
