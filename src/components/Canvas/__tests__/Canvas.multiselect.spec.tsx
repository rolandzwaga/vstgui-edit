/**
 * Canvas Multi-Selection Tests
 * Tests for Shift+click multi-selection behavior (FR-004)
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { Canvas } from '../Canvas';
import { resetSelection, selectionStore } from '../../../stores/selectionStore';
import { resetCanvas } from '../../../stores/canvasStore';
import { testInRoot } from '../../../__tests__/helpers/solidjs';

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

const createMockDocument = (views: Array<{ id: string; x: number; y: number; w: number; h: number }>) => ({
  'vstgui-ui-description': {
    version: '1',
    templates: {
      TestTemplate: {
        attributes: {
          class: 'CViewContainer',
          origin: '0, 0',
          size: '500, 400',
        },
        children: views.map((v) => ({
          attributes: {
            class: 'CTextButton',
            origin: `${v.x}, ${v.y}`,
            size: `${v.w}, ${v.h}`,
          },
        })),
      },
    },
  },
});

describe('Canvas Multi-Selection (FR-004)', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetSelection();
      resetCanvas();
    });
    mockDocumentStore.document = null;
  });

  describe('Given one view is selected', () => {
    it('should add another view when Shift+clicking (US2 scenario 1)', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 10, y: 10, w: 80, h: 40 },
        { id: 'view-2', x: 100, y: 10, w: 80, h: 40 },
      ]);

      render(() => <Canvas />);

      const canvas = screen.getByTestId('canvas');
      const viewRects = canvas.querySelectorAll('[data-view-id]');
      expect(viewRects.length).toBeGreaterThanOrEqual(2);

      const view1 = viewRects[0];
      const view2 = viewRects[1];

      // Click first view to select it
      fireEvent.mouseDown(view1, { button: 0 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(1);
        expect(selectionStore.selectedIds.has(view1.getAttribute('data-view-id')!)).toBe(true);
      });

      // Shift+click second view to add to selection
      fireEvent.mouseDown(view2, { button: 0, shiftKey: true });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(2);
        expect(selectionStore.selectedIds.has(view1.getAttribute('data-view-id')!)).toBe(true);
        expect(selectionStore.selectedIds.has(view2.getAttribute('data-view-id')!)).toBe(true);
      });
    });
  });

  describe('Given multiple views are selected', () => {
    it('should remove a view when Shift+clicking an already selected view (US2 scenario 2)', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 10, y: 10, w: 80, h: 40 },
        { id: 'view-2', x: 100, y: 10, w: 80, h: 40 },
      ]);

      render(() => <Canvas />);

      const canvas = screen.getByTestId('canvas');
      const viewRects = canvas.querySelectorAll('[data-view-id]');
      const view1 = viewRects[0];
      const view2 = viewRects[1];

      // Select first view
      fireEvent.mouseDown(view1, { button: 0 });
      fireEvent.mouseUp(document);
      // Add second view
      fireEvent.mouseDown(view2, { button: 0, shiftKey: true });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(2);
      });

      // Shift+click view2 again to toggle it off
      fireEvent.mouseDown(view2, { button: 0, shiftKey: true });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(1);
        expect(selectionStore.selectedIds.has(view1.getAttribute('data-view-id')!)).toBe(true);
        expect(selectionStore.selectedIds.has(view2.getAttribute('data-view-id')!)).toBe(false);
      });
    });

    it('should clear multi-selection and select only clicked view when clicking without Shift (US2 scenario 3)', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 10, y: 10, w: 80, h: 40 },
        { id: 'view-2', x: 100, y: 10, w: 80, h: 40 },
        { id: 'view-3', x: 200, y: 10, w: 80, h: 40 },
      ]);

      render(() => <Canvas />);

      const canvas = screen.getByTestId('canvas');
      const viewRects = canvas.querySelectorAll('[data-view-id]');
      const view1 = viewRects[0];
      const view2 = viewRects[1];
      const view3 = viewRects[2];

      // Select first two views with Shift
      fireEvent.mouseDown(view1, { button: 0 });
      fireEvent.mouseUp(document);
      fireEvent.mouseDown(view2, { button: 0, shiftKey: true });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(2);
      });

      // Click view3 without Shift - should clear multi-selection
      fireEvent.mouseDown(view3, { button: 0 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(1);
        expect(selectionStore.selectedIds.has(view3.getAttribute('data-view-id')!)).toBe(true);
      });
    });
  });

  describe('Given no views are selected', () => {
    it('should select view when Shift+clicking (US2 scenario 4)', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 10, y: 10, w: 80, h: 40 },
      ]);

      render(() => <Canvas />);

      const canvas = screen.getByTestId('canvas');
      const viewRects = canvas.querySelectorAll('[data-view-id]');
      const view1 = viewRects[0];

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(0);
      });

      // Shift+click should still select the view
      fireEvent.mouseDown(view1, { button: 0, shiftKey: true });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(1);
        expect(selectionStore.selectedIds.has(view1.getAttribute('data-view-id')!)).toBe(true);
      });
    });
  });

  describe('Given multiple SelectionOverlays', () => {
    it('should render SelectionOverlay for each selected view (FR-009)', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 10, y: 10, w: 80, h: 40 },
        { id: 'view-2', x: 100, y: 10, w: 80, h: 40 },
      ]);

      render(() => <Canvas />);

      const canvas = screen.getByTestId('canvas');
      const viewRects = canvas.querySelectorAll('[data-view-id]');
      const view1 = viewRects[0];
      const view2 = viewRects[1];

      // Select both views
      fireEvent.mouseDown(view1, { button: 0 });
      fireEvent.mouseUp(document);
      fireEvent.mouseDown(view2, { button: 0, shiftKey: true });
      fireEvent.mouseUp(document);

      // Check that two selection overlays exist
      const selectionOverlays = canvas.querySelectorAll('[data-testid^="selection-overlay-"]');
      expect(selectionOverlays.length).toBe(2);
    });
  });
});
