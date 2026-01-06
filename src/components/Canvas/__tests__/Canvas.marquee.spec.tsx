import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { Canvas } from '../Canvas';
import { resetCanvas } from '../../../stores/canvasStore';
import { resetSelection, selectionStore } from '../../../stores/selectionStore';
import { marqueeStore, resetMarquee } from '../../../stores/marqueeStore';
import { testInRoot } from '../../../__tests__/helpers/solidjs';

const mockDocumentStore = vi.hoisted(() => ({
  document: null as unknown,
}));

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
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
        class: 'CViewContainer',
        origin: `${view.x}, ${view.y}`,
        size: `${view.width}, ${view.height}`,
      },
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

describe('Canvas Marquee Selection', () => {
  beforeEach(() => {
    mockDocumentStore.document = null;
    resetCanvas();
    resetSelection();
    resetMarquee();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Given mousedown on empty canvas space', () => {
    it('should start marquee selection', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 200, y: 200, width: 50, height: 50 },
      ]);

      render(() => <Canvas />);
      const canvas = screen.getByTestId('canvas');

      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10, button: 0 });

      testInRoot(() => {
        expect(marqueeStore.isActive).toBe(true);
      });
    });

    it('should show marquee rectangle during drag', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 200, y: 200, width: 50, height: 50 },
      ]);

      render(() => <Canvas />);
      const canvas = screen.getByTestId('canvas');

      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10, button: 0 });

      testInRoot(() => {
        expect(marqueeStore.isActive).toBe(true);
      });

      expect(screen.getByTestId('marquee-rect')).toBeInTheDocument();
    });
  });

  describe('Given mousedown on a view', () => {
    it('should NOT start marquee selection', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);
      const view = screen.getByTestId('view-TestTemplate-view-1');

      fireEvent.mouseDown(view, { clientX: 75, clientY: 75, button: 0 });

      testInRoot(() => {
        expect(marqueeStore.isActive).toBe(false);
      });
    });

    it('should select the view instead', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 100, height: 100 },
      ]);

      render(() => <Canvas />);
      const view = screen.getByTestId('view-TestTemplate-view-1');

      fireEvent.click(view);

      testInRoot(() => {
        expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);
      });
    });
  });

  describe('Given mouseup after marquee drag', () => {
    it('should select views that intersect the marquee', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 50, height: 50 },
        { id: 'view-2', x: 150, y: 50, width: 50, height: 50 },
        { id: 'view-3', x: 300, y: 200, width: 50, height: 50 },
      ]);

      render(() => <Canvas />);
      const canvas = screen.getByTestId('canvas');

      fireEvent.mouseDown(canvas, { clientX: 40, clientY: 40, button: 0 });
      fireEvent.mouseMove(document, { clientX: 210, clientY: 110 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);
        expect(selectionStore.selectedIds.has('TestTemplate-view-2')).toBe(true);
        expect(selectionStore.selectedIds.has('TestTemplate-view-3')).toBe(false);
      });
    });

    it('should end marquee state', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 50, height: 50 },
      ]);

      render(() => <Canvas />);
      const canvas = screen.getByTestId('canvas');

      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10, button: 0 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(marqueeStore.isActive).toBe(false);
      });
    });
  });

  describe('Given marquee smaller than 5x5 pixels (FR-010)', () => {
    it('should clear selection instead of selecting', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 50, height: 50 },
      ]);

      testInRoot(() => {
        selectionStore.selectedIds.add?.('TestTemplate-view-1');
      });

      render(() => <Canvas />);
      const canvas = screen.getByTestId('canvas');

      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10, button: 0 });
      fireEvent.mouseMove(document, { clientX: 12, clientY: 12 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(0);
      });
    });

    it('should be treated as a click (deselect)', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 50, height: 50 },
      ]);

      render(() => <Canvas />);
      const canvas = screen.getByTestId('canvas');

      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10, button: 0 });
      fireEvent.mouseMove(document, { clientX: 13, clientY: 13 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(0);
        expect(marqueeStore.isActive).toBe(false);
      });
    });
  });

  describe('Given middle mouse button or ctrl+click', () => {
    it('should NOT start marquee (pan mode)', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 200, y: 200, width: 50, height: 50 },
      ]);

      render(() => <Canvas />);
      const canvas = screen.getByTestId('canvas');

      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10, button: 1 });

      testInRoot(() => {
        expect(marqueeStore.isActive).toBe(false);
      });
    });

    it('should NOT start marquee with ctrl+left click', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 200, y: 200, width: 50, height: 50 },
      ]);

      render(() => <Canvas />);
      const canvas = screen.getByTestId('canvas');

      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10, button: 0, ctrlKey: true });

      testInRoot(() => {
        expect(marqueeStore.isActive).toBe(false);
      });
    });
  });

  describe('US2: Shift+drag additive selection', () => {
    it('should preserve existing selection with Shift+drag', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 50, height: 50 },
        { id: 'view-2', x: 150, y: 50, width: 50, height: 50 },
        { id: 'view-3', x: 50, y: 150, width: 50, height: 50 },
      ]);

      render(() => <Canvas />);
      const view1 = screen.getByTestId('view-TestTemplate-view-1');
      const canvas = screen.getByTestId('canvas');

      fireEvent.click(view1);

      testInRoot(() => {
        expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);
      });

      fireEvent.mouseDown(canvas, { clientX: 140, clientY: 40, button: 0, shiftKey: true });
      fireEvent.mouseMove(document, { clientX: 210, clientY: 110 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);
        expect(selectionStore.selectedIds.has('TestTemplate-view-2')).toBe(true);
        expect(selectionStore.selectedIds.size).toBe(3);
      });
    });

    it('should set isAdditive when Shift is held', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 200, y: 200, width: 50, height: 50 },
      ]);

      render(() => <Canvas />);
      const canvas = screen.getByTestId('canvas');

      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10, button: 0, shiftKey: true });

      testInRoot(() => {
        expect(marqueeStore.isAdditive).toBe(true);
      });
    });

    it('should replace selection without Shift', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 50, height: 50 },
        { id: 'view-2', x: 150, y: 50, width: 50, height: 50 },
      ]);

      render(() => <Canvas />);
      const view1 = screen.getByTestId('view-TestTemplate-view-1');
      const canvas = screen.getByTestId('canvas');

      fireEvent.click(view1);

      testInRoot(() => {
        expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);
      });

      fireEvent.mouseDown(canvas, { clientX: 140, clientY: 40, button: 0 });
      fireEvent.mouseMove(document, { clientX: 210, clientY: 110 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(false);
        expect(selectionStore.selectedIds.has('TestTemplate-view-2')).toBe(true);
        expect(selectionStore.selectedIds.size).toBe(2);
      });
    });
  });

  describe('US3: Marquee cancellation', () => {
    it('should cancel marquee on Escape key', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 50, height: 50 },
      ]);

      render(() => <Canvas />);
      const canvas = screen.getByTestId('canvas');
      const wrapper = screen.getByTestId('canvas-wrapper');

      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10, button: 0 });
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });

      testInRoot(() => {
        expect(marqueeStore.isActive).toBe(true);
      });

      fireEvent.keyDown(wrapper, { key: 'Escape' });

      testInRoot(() => {
        expect(marqueeStore.isActive).toBe(false);
      });
    });

    it('should restore previous selection on Escape', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 50, height: 50 },
        { id: 'view-2', x: 150, y: 50, width: 50, height: 50 },
      ]);

      render(() => <Canvas />);
      const view1 = screen.getByTestId('view-TestTemplate-view-1');
      const canvas = screen.getByTestId('canvas');
      const wrapper = screen.getByTestId('canvas-wrapper');

      fireEvent.click(view1);

      testInRoot(() => {
        expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);
      });

      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10, button: 0 });
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });

      fireEvent.keyDown(wrapper, { key: 'Escape' });

      testInRoot(() => {
        expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);
      });
    });

    it('should cancel marquee on right-click (contextmenu)', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 50, y: 50, width: 50, height: 50 },
      ]);

      render(() => <Canvas />);
      const canvas = screen.getByTestId('canvas');
      const wrapper = screen.getByTestId('canvas-wrapper');

      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10, button: 0 });
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });

      testInRoot(() => {
        expect(marqueeStore.isActive).toBe(true);
      });

      fireEvent.contextMenu(wrapper);

      testInRoot(() => {
        expect(marqueeStore.isActive).toBe(false);
      });
    });
  });

  describe('US4: Visual feedback', () => {
    it('should apply marqueeRect CSS class to rectangle', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 200, y: 200, width: 50, height: 50 },
      ]);

      render(() => <Canvas />);
      const canvas = screen.getByTestId('canvas');

      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10, button: 0 });
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });

      const rect = screen.getByTestId('marquee-rect');
      expect(rect.classList.toString()).toContain('marqueeRect');
    });

    it('should apply crosshair cursor during marquee (FR-013)', () => {
      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 200, y: 200, width: 50, height: 50 },
      ]);

      render(() => <Canvas />);
      const canvas = screen.getByTestId('canvas');
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Before marquee, no crosshair cursor class
      expect(wrapper.classList.toString()).not.toContain('marqueeCursor');

      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10, button: 0 });

      // During marquee, crosshair cursor class should be applied
      testInRoot(() => {
        expect(marqueeStore.isActive).toBe(true);
      });
      expect(wrapper.classList.toString()).toContain('marqueeCursor');

      // After mouseup, cursor class should be removed
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(marqueeStore.isActive).toBe(false);
      });
      expect(wrapper.classList.toString()).not.toContain('marqueeCursor');
    });
  });

  describe('FR-012: Pan conflict detection', () => {
    it('should cancel marquee when pan starts', async () => {
      // Import pan functions to simulate pan starting during marquee
      const { startPan } = await import('../../../stores/canvasStore');

      mockDocumentStore.document = createMockDocument([
        { id: 'view-1', x: 200, y: 200, width: 50, height: 50 },
      ]);

      render(() => <Canvas />);
      const canvas = screen.getByTestId('canvas');

      // Start marquee
      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10, button: 0 });

      testInRoot(() => {
        expect(marqueeStore.isActive).toBe(true);
      });

      // Simulate pan starting (e.g., user presses space while dragging)
      testInRoot(() => {
        startPan(50, 50);
      });

      // Marquee should be cancelled
      testInRoot(() => {
        expect(marqueeStore.isActive).toBe(false);
      });
    });
  });
});
