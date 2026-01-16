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

describe('Canvas Constrained Movement (US4)', () => {
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

  describe('Given Shift is held during drag (FR-010)', () => {
    describe('When movement is primarily horizontal (FR-011)', () => {
      it('should constrain movement to horizontal axis after 5px threshold', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);
        expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 108, clientY: 102, shiftKey: true });

        expect(dragStore.isDragging).toBe(true);
        expect(dragStore.constrainedAxis).toBe('horizontal');
        expect(dragStore.delta).toEqual({ x: 8, y: 0 });
      });

      it('should lock horizontal axis once determined', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 108, clientY: 102, shiftKey: true });
        expect(dragStore.constrainedAxis).toBe('horizontal');

        fireEvent.mouseMove(document, { clientX: 110, clientY: 150, shiftKey: true });
        expect(dragStore.constrainedAxis).toBe('horizontal');
        expect(dragStore.delta.y).toBe(0);
      });
    });

    describe('When movement is primarily vertical', () => {
      it('should constrain movement to vertical axis after 5px threshold', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 102, clientY: 108, shiftKey: true });

        expect(dragStore.isDragging).toBe(true);
        expect(dragStore.constrainedAxis).toBe('vertical');
        expect(dragStore.delta).toEqual({ x: 0, y: 8 });
      });
    });

    describe('When Shift is released during drag', () => {
      it('should remove constraint and allow free movement', async () => {
        mockDocumentStore.document = createMockDocument([
          { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        ]);

        render(() => <Canvas />);

        const view = screen.getByTestId('view-TestTemplate-view-1');

        fireEvent.mouseDown(view, { button: 0 });
        fireEvent.mouseUp(document);

        fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 110, clientY: 102, shiftKey: true });
        expect(dragStore.constrainedAxis).toBe('horizontal');

        fireEvent.mouseMove(document, { clientX: 120, clientY: 130, shiftKey: false });
        expect(dragStore.constrainedAxis).toBeNull();
        expect(dragStore.delta).toEqual({ x: 20, y: 30 });
      });
    });
  });

  describe('Given movement below threshold', () => {
    it('should not lock axis until threshold is exceeded', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);

      const view = screen.getByTestId('view-TestTemplate-view-1');

      fireEvent.mouseDown(view, { button: 0 });
      fireEvent.mouseUp(document);

      fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 103, clientY: 101, shiftKey: true });

      expect(dragStore.isDragging).toBe(true);
      expect(dragStore.constrainedAxis).toBeNull();
    });
  });

  describe('Given drag completes with constraint', () => {
    it('should apply constrained position on mouse release', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);

      const view = screen.getByTestId('view-TestTemplate-view-1');

      fireEvent.mouseDown(view, { button: 0 });
      fireEvent.mouseUp(document);

      fireEvent.mouseDown(view, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 140, clientY: 130, shiftKey: true });
      expect(dragStore.constrainedAxis).toBe('horizontal');

      fireEvent.mouseUp(document);

      expect(mockUpdateViewOrigin).toHaveBeenCalledWith('TestTemplate-view-1', { x: 90, y: 50 });
    });
  });
});
