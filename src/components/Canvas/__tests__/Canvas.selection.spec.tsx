/**
 * Canvas Selection Tests
 * Tests for click-based view selection on Canvas (US1)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { Canvas } from '../Canvas';
import { resetCanvas } from '../../../stores/canvasStore';
import { resetSelection, selectionStore } from '../../../stores/selectionStore';

const mockDocumentStore = vi.hoisted(() => ({
  document: null as unknown,
}));

const mockTemplateStore = vi.hoisted(() => ({
  activeTemplateId: 'TestTemplate' as string | null,
}));

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
  getTemplate: (name: string) => {
    const doc = mockDocumentStore.document as { 'vstgui-ui-description'?: { templates?: Record<string, unknown> } } | null;
    return doc?.['vstgui-ui-description']?.templates?.[name];
  },
  getParentId: () => null,
  getView: () => null,
}));

vi.mock('../../../stores/templateStore', () => ({
  templateStore: mockTemplateStore,
}));

// Helper to create mock uidesc document with multiple views
const createMockDocument = (
  views: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    children?: Array<{ id: string; x: number; y: number; width: number; height: number }>;
  }>
) => {
  const children: Record<string, unknown> = {};

  for (const view of views) {
    const childViews: Record<string, unknown> = {};

    if (view.children) {
      for (const child of view.children) {
        childViews[child.id] = {
          attributes: {
            class: 'CTextButton',
            origin: `${child.x}, ${child.y}`,
            size: `${child.width}, ${child.height}`,
          },
        };
      }
    }

    children[view.id] = {
      attributes: {
        class: 'CViewContainer',
        origin: `${view.x}, ${view.y}`,
        size: `${view.width}, ${view.height}`,
      },
      children: Object.keys(childViews).length > 0 ? childViews : undefined,
    };
  }

  return {
    'vstgui-ui-description': {
      version: '1.0',
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

describe('Canvas Selection (US1)', () => {
  beforeEach(() => {
    mockDocumentStore.document = null;
    resetCanvas();
    resetSelection();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Given a canvas with views rendered', () => {
    it('should select a view when clicked (FR-001)', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);

      const view = screen.getByTestId('view-TestTemplate-view-1');

      fireEvent.mouseDown(view, { button: 0 });
      fireEvent.mouseUp(document);

      expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);
    });

    it('should deselect previous view when clicking different view (FR-002)', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        { id: 'view-2', x: 200, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);

      fireEvent.mouseDown(screen.getByTestId('view-TestTemplate-view-1'), { button: 0 });
      fireEvent.mouseUp(document);
      expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);

      fireEvent.mouseDown(screen.getByTestId('view-TestTemplate-view-2'), { button: 0 });
      fireEvent.mouseUp(document);
      expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(false);
      expect(selectionStore.selectedIds.has('TestTemplate-view-2')).toBe(true);
    });

    it('should show selection overlay for selected view', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);

      fireEvent.mouseDown(screen.getByTestId('view-TestTemplate-view-1'), { button: 0 });
      fireEvent.mouseUp(document);

      expect(screen.getByTestId('selection-overlay-TestTemplate-view-1')).toBeInTheDocument();
    });

    it('should not show selection overlay for unselected views', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        { id: 'view-2', x: 200, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);

      fireEvent.mouseDown(screen.getByTestId('view-TestTemplate-view-1'), { button: 0 });
      fireEvent.mouseUp(document);

      expect(screen.getByTestId('selection-overlay-TestTemplate-view-1')).toBeInTheDocument();
      expect(screen.queryByTestId('selection-overlay-TestTemplate-view-2')).not.toBeInTheDocument();
    });

    it('should deselect view when clicking on already selected view (toggle)', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);

      const view = screen.getByTestId('view-TestTemplate-view-1');

      // First click - select
      fireEvent.mouseDown(view, { button: 0 });
      fireEvent.mouseUp(document);
      expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);

      // Second click - deselect (toggle off)
      fireEvent.mouseDown(view, { button: 0 });
      fireEvent.mouseUp(document);
      expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(false);
      expect(selectionStore.selectedIds.size).toBe(0);
    });

    it('should clear multi-selection when clicking on one of the selected views', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        { id: 'view-2', x: 200, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);

      const view1 = screen.getByTestId('view-TestTemplate-view-1');
      const view2 = screen.getByTestId('view-TestTemplate-view-2');

      // Select first view
      fireEvent.mouseDown(view1, { button: 0 });
      fireEvent.mouseUp(document);

      // Shift+click second view to add to selection
      fireEvent.mouseDown(view2, { button: 0, shiftKey: true });
      fireEvent.mouseUp(document);

      expect(selectionStore.selectedIds.size).toBe(2);

      // Click on view1 (already selected) without Shift - should clear all
      fireEvent.mouseDown(view1, { button: 0 });
      fireEvent.mouseUp(document);

      expect(selectionStore.selectedIds.size).toBe(0);
    });
  });

  describe('Given click on empty canvas (FR-003)', () => {
    it('should deselect all views when clicking on empty area', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 50 },
      ]);

      render(() => <Canvas />);

      // First select a view (path-based ID: TestTemplate-view-1)
      fireEvent.mouseDown(screen.getByTestId('view-TestTemplate-view-1'), { button: 0 });
      fireEvent.mouseUp(document);
      expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);

      // Click on the canvas SVG (empty area)
      const canvas = screen.getByTestId('canvas');
      fireEvent.mouseDown(canvas, { button: 0, clientX: 300, clientY: 200 });
      fireEvent.mouseUp(document);

      // Should be deselected
      expect(selectionStore.selectedIds.size).toBe(0);
    });

    it('should deselect when clicking on empty canvas area', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 50 },
      ]);

      render(() => <Canvas />);

      // First select a view (path-based ID: TestTemplate-view-1)
      fireEvent.mouseDown(screen.getByTestId('view-TestTemplate-view-1'), { button: 0 });
      fireEvent.mouseUp(document);

      // Click on canvas background (which is template bounds)
      const canvas = screen.getByTestId('canvas');
      fireEvent.mouseDown(canvas, { button: 0, clientX: 10, clientY: 10 });
      fireEvent.mouseUp(document);

      // Should be deselected since we clicked empty area
      expect(selectionStore.selectedIds.size).toBe(0);
    });
  });

  describe('Given nested views (FR-013)', () => {
    it('should select child view when clicking on nested view', async () => {
      mockDocumentStore.document = createMockDocument([
        {
          id: 'parent',
          x: 50,
          y: 50,
          width: 200,
          height: 200,
          children: [{ id: 'child', x: 25, y: 25, width: 50, height: 50 }],
        },
      ]);

      render(() => <Canvas />);

      // Click on child view (path-based ID: TestTemplate-parent-child)
      fireEvent.mouseDown(screen.getByTestId('view-TestTemplate-parent-child'), { button: 0 });
      fireEvent.mouseUp(document);

      // Only child should be selected, not parent
      expect(selectionStore.selectedIds.has('TestTemplate-parent-child')).toBe(true);
      expect(selectionStore.selectedIds.has('TestTemplate-parent')).toBe(false);
    });

    it('should select parent when clicking on parent area outside child', async () => {
      mockDocumentStore.document = createMockDocument([
        {
          id: 'parent',
          x: 50,
          y: 50,
          width: 200,
          height: 200,
          children: [{ id: 'child', x: 100, y: 100, width: 50, height: 50 }],
        },
      ]);

      render(() => <Canvas />);

      // Click on parent area (not child) (path-based ID: TestTemplate-parent)
      fireEvent.mouseDown(screen.getByTestId('view-TestTemplate-parent'), { button: 0 });
      fireEvent.mouseUp(document);

      // Parent should be selected
      expect(selectionStore.selectedIds.has('TestTemplate-parent')).toBe(true);
    });
  });

  describe('Given no document loaded', () => {
    it('should not crash on click', async () => {
      render(() => <Canvas />);

      // Should show empty state, no canvas to click
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  describe('Given pan interaction (event propagation)', () => {
    it('should not select view when starting pan with ctrl+click', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);

      // Ctrl+click should start pan, not select (path-based ID: TestTemplate-view-1)
      fireEvent.mouseDown(screen.getByTestId('view-TestTemplate-view-1'), { ctrlKey: true, button: 0 });

      expect(selectionStore.selectedIds.size).toBe(0);
    });

    it('should not select view when middle-clicking (pan gesture)', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);

      // Middle click should start pan, not select (path-based ID: TestTemplate-view-1)
      fireEvent.mouseDown(screen.getByTestId('view-TestTemplate-view-1'), { button: 1 });

      expect(selectionStore.selectedIds.size).toBe(0);
    });
  });
});
