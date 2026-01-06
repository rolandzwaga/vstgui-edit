/**
 * Canvas Selection Tests
 * Tests for click-based view selection on Canvas (US1)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { Canvas } from '../Canvas';
import { resetCanvas } from '../../../stores/canvasStore';
import { resetSelection, selectionStore } from '../../../stores/selectionStore';

// Define mock store using vi.hoisted so it's available in vi.mock
const mockDocumentStore = vi.hoisted(() => ({
  document: null as unknown,
}));

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
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

      const view = screen.getByTestId('view-view-1');

      // Click on the view
      fireEvent.click(view);

      expect(selectionStore.selectedIds.has('view-1')).toBe(true);
    });

    it('should deselect previous view when clicking different view (FR-002)', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        { id: 'view-2', x: 200, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);

      // Click first view
      fireEvent.click(screen.getByTestId('view-view-1'));
      expect(selectionStore.selectedIds.has('view-1')).toBe(true);

      // Click second view
      fireEvent.click(screen.getByTestId('view-view-2'));
      expect(selectionStore.selectedIds.has('view-1')).toBe(false);
      expect(selectionStore.selectedIds.has('view-2')).toBe(true);
    });

    it('should show selection overlay for selected view', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);

      // Click on the view
      fireEvent.click(screen.getByTestId('view-view-1'));

      // Selection overlay should appear
      expect(screen.getByTestId('selection-overlay-view-1')).toBeInTheDocument();
    });

    it('should not show selection overlay for unselected views', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
        { id: 'view-2', x: 200, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);

      // Click first view only
      fireEvent.click(screen.getByTestId('view-view-1'));

      // Only first view should have selection overlay
      expect(screen.getByTestId('selection-overlay-view-1')).toBeInTheDocument();
      expect(screen.queryByTestId('selection-overlay-view-2')).not.toBeInTheDocument();
    });
  });

  describe('Given click on empty canvas (FR-003)', () => {
    it('should deselect all views when clicking on empty area', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 50 },
      ]);

      render(() => <Canvas />);

      // First select a view
      fireEvent.click(screen.getByTestId('view-view-1'));
      expect(selectionStore.selectedIds.has('view-1')).toBe(true);

      // Click on the canvas SVG (empty area)
      const canvas = screen.getByTestId('canvas');
      fireEvent.click(canvas, { clientX: 300, clientY: 200 });

      // Should be deselected
      expect(selectionStore.selectedIds.size).toBe(0);
    });

    it('should deselect when clicking on empty canvas area', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 50 },
      ]);

      render(() => <Canvas />);

      // First select a view
      fireEvent.click(screen.getByTestId('view-view-1'));

      // Click on canvas background (which is template bounds)
      const canvas = screen.getByTestId('canvas');
      fireEvent.click(canvas, { clientX: 10, clientY: 10 });

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

      // Click on child view
      fireEvent.click(screen.getByTestId('view-child'));

      // Only child should be selected, not parent
      expect(selectionStore.selectedIds.has('child')).toBe(true);
      expect(selectionStore.selectedIds.has('parent')).toBe(false);
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

      // Click on parent area (not child)
      fireEvent.click(screen.getByTestId('view-parent'));

      // Parent should be selected
      expect(selectionStore.selectedIds.has('parent')).toBe(true);
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

      // Ctrl+click should start pan, not select
      fireEvent.mouseDown(screen.getByTestId('view-view-1'), { ctrlKey: true, button: 0 });

      expect(selectionStore.selectedIds.size).toBe(0);
    });

    it('should not select view when middle-clicking (pan gesture)', async () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);

      // Middle click should start pan, not select
      fireEvent.mouseDown(screen.getByTestId('view-view-1'), { button: 1 });

      expect(selectionStore.selectedIds.size).toBe(0);
    });
  });
});
