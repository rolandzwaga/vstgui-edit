/**
 * Canvas Keyboard Shortcut Tests
 * Tests for Ctrl+A (select all) and Escape (deselect) keyboard shortcuts
 * FR-005, FR-006, FR-007
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { Canvas } from '../Canvas';
import { resetSelection, select, selectionStore } from '../../../stores/selectionStore';
import { resetCanvas } from '../../../stores/canvasStore';
import {
  guidesStore,
  resetGuidesStore,
  addGuide,
  setGuidesVisibility,
} from '../../../stores/guidesStore';
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
}));

vi.mock('../../../stores/templateStore', () => ({
  templateStore: mockTemplateStore,
}));

const createMockDocument = (viewCount: number) => ({
  'vstgui-ui-description': {
    version: '1',
    templates: {
      TestTemplate: {
        attributes: {
          class: 'CViewContainer',
          origin: '0, 0',
          size: '500, 400',
        },
        children: Array.from({ length: viewCount }, (_, i) => ({
          attributes: {
            class: 'CTextButton',
            origin: `${i * 60}, 10`,
            size: '50, 30',
          },
        })),
      },
    },
  },
});

describe('Canvas Keyboard Shortcuts', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetSelection();
      resetCanvas();
      resetGuidesStore();
    });
    mockDocumentStore.document = null;
    mockTemplateStore.activeTemplateId = 'TestTemplate';
  });

  describe('Ctrl+A - Select All (FR-005)', () => {
    it('should select all views when Ctrl+A is pressed', () => {
      mockDocumentStore.document = createMockDocument(3);

      render(() => <Canvas />);

      const wrapper = screen.getByTestId('canvas-wrapper');

      // Press Ctrl+A
      fireEvent.keyDown(wrapper, { key: 'a', ctrlKey: true });

      testInRoot(() => {
        // Should have 4 selected views (root container + 3 child views)
        expect(selectionStore.selectedIds.size).toBe(4);
      });
    });

    it('should select all views when Cmd+A is pressed (Mac)', () => {
      mockDocumentStore.document = createMockDocument(3);

      render(() => <Canvas />);

      const wrapper = screen.getByTestId('canvas-wrapper');

      // Press Cmd+A (metaKey for Mac)
      fireEvent.keyDown(wrapper, { key: 'a', metaKey: true });

      testInRoot(() => {
        // Should have 4 selected views (root container + 3 child views)
        expect(selectionStore.selectedIds.size).toBe(4);
      });
    });

    it('should replace existing selection when Ctrl+A is pressed', () => {
      mockDocumentStore.document = createMockDocument(3);

      render(() => <Canvas />);

      const wrapper = screen.getByTestId('canvas-wrapper');
      const canvas = screen.getByTestId('canvas');

      // First select just one view
      const viewRects = canvas.querySelectorAll('[data-view-id]');
      fireEvent.mouseDown(viewRects[0], { button: 0 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(1);
      });

      // Press Ctrl+A
      fireEvent.keyDown(wrapper, { key: 'a', ctrlKey: true });

      testInRoot(() => {
        // Should have 4 selected views (root container + 3 child views)
        expect(selectionStore.selectedIds.size).toBe(4);
      });
    });

    it('should select root view when template has no children', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            EmptyTemplate: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '500, 400',
              },
              children: [],
            },
          },
        },
      };
      mockTemplateStore.activeTemplateId = 'EmptyTemplate';

      render(() => <Canvas />);

      const wrapper = screen.getByTestId('canvas-wrapper');
      fireEvent.keyDown(wrapper, { key: 'a', ctrlKey: true });

      testInRoot(() => {
        // Should select root container view
        expect(selectionStore.selectedIds.size).toBe(1);
      });
    });
  });

  describe('Escape - Deselect All (FR-006)', () => {
    it('should deselect all views when Escape is pressed', () => {
      mockDocumentStore.document = createMockDocument(3);

      render(() => <Canvas />);

      const wrapper = screen.getByTestId('canvas-wrapper');
      const canvas = screen.getByTestId('canvas');

      // Select a view first
      const viewRects = canvas.querySelectorAll('[data-view-id]');
      fireEvent.mouseDown(viewRects[0], { button: 0 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(1);
      });

      // Press Escape
      fireEvent.keyDown(wrapper, { key: 'Escape' });

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(0);
      });
    });

    it('should deselect all when multiple views are selected', () => {
      mockDocumentStore.document = createMockDocument(3);

      render(() => <Canvas />);

      const wrapper = screen.getByTestId('canvas-wrapper');
      const canvas = screen.getByTestId('canvas');

      // Select multiple views with Shift+click
      const viewRects = canvas.querySelectorAll('[data-view-id]');
      fireEvent.mouseDown(viewRects[0], { button: 0 });
      fireEvent.mouseUp(document);
      fireEvent.mouseDown(viewRects[1], { button: 0, shiftKey: true });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(2);
      });

      // Press Escape
      fireEvent.keyDown(wrapper, { key: 'Escape' });

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(0);
      });
    });

    it('should do nothing when no views are selected', () => {
      mockDocumentStore.document = createMockDocument(3);

      render(() => <Canvas />);

      const wrapper = screen.getByTestId('canvas-wrapper');

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(0);
      });

      // Press Escape
      fireEvent.keyDown(wrapper, { key: 'Escape' });

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(0);
      });
    });
  });

  describe('Text Input Filter (FR-007)', () => {
    it('should ignore Ctrl+A when focus is in a text input', () => {
      mockDocumentStore.document = createMockDocument(3);

      // Render Canvas and an input field
      render(() => (
        <div>
          <Canvas />
          <input type="text" data-testid="text-input" />
        </div>
      ));

      const input = screen.getByTestId('text-input');

      // Focus the input
      input.focus();

      // Press Ctrl+A while input is focused
      fireEvent.keyDown(input, { key: 'a', ctrlKey: true });

      testInRoot(() => {
        // Should not have selected any views
        expect(selectionStore.selectedIds.size).toBe(0);
      });
    });

    it('should ignore Escape when focus is in a textarea', () => {
      mockDocumentStore.document = createMockDocument(3);

      // Select a view first via store
      testInRoot(() => {
        select('TestTemplate-0');
      });

      // Render Canvas and a textarea
      render(() => (
        <div>
          <Canvas />
          <textarea data-testid="text-area" />
        </div>
      ));

      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(1);
      });

      const textarea = screen.getByTestId('text-area');

      // Focus the textarea
      textarea.focus();

      // Press Escape while textarea is focused
      fireEvent.keyDown(textarea, { key: 'Escape' });

      testInRoot(() => {
        // Should still have view selected (Escape was ignored)
        expect(selectionStore.selectedIds.size).toBe(1);
      });
    });

    it('should work normally when focus is on canvas wrapper', () => {
      mockDocumentStore.document = createMockDocument(3);

      render(() => <Canvas />);

      const wrapper = screen.getByTestId('canvas-wrapper');

      // Focus the canvas wrapper
      wrapper.focus();

      // Press Ctrl+A
      fireEvent.keyDown(wrapper, { key: 'a', ctrlKey: true });

      testInRoot(() => {
        // Should have 4 selected views (root container + 3 child views)
        expect(selectionStore.selectedIds.size).toBe(4);
      });
    });
  });

  describe('Ctrl+; - Toggle Guide Visibility (FR-012)', () => {
    it('should toggle guides visibility when Ctrl+; is pressed', () => {
      mockDocumentStore.document = createMockDocument(1);

      // Add a guide and verify initial visibility
      testInRoot(() => {
        addGuide('horizontal', 100);
        expect(guidesStore.isVisible).toBe(true);
      });

      render(() => <Canvas />);

      const wrapper = screen.getByTestId('canvas-wrapper');

      // Press Ctrl+;
      fireEvent.keyDown(wrapper, { key: ';', ctrlKey: true });

      testInRoot(() => {
        expect(guidesStore.isVisible).toBe(false);
      });

      // Press Ctrl+; again to toggle back
      fireEvent.keyDown(wrapper, { key: ';', ctrlKey: true });

      testInRoot(() => {
        expect(guidesStore.isVisible).toBe(true);
      });
    });

    it('should toggle guides visibility when Cmd+; is pressed (Mac)', () => {
      mockDocumentStore.document = createMockDocument(1);

      testInRoot(() => {
        addGuide('vertical', 200);
        expect(guidesStore.isVisible).toBe(true);
      });

      render(() => <Canvas />);

      const wrapper = screen.getByTestId('canvas-wrapper');

      // Press Cmd+; (metaKey for Mac)
      fireEvent.keyDown(wrapper, { key: ';', metaKey: true });

      testInRoot(() => {
        expect(guidesStore.isVisible).toBe(false);
      });
    });

    it('should preserve guides when toggling visibility', () => {
      mockDocumentStore.document = createMockDocument(1);

      testInRoot(() => {
        addGuide('horizontal', 100);
        addGuide('vertical', 200);
        expect(guidesStore.guides.length).toBe(2);
      });

      render(() => <Canvas />);

      const wrapper = screen.getByTestId('canvas-wrapper');

      // Hide guides
      fireEvent.keyDown(wrapper, { key: ';', ctrlKey: true });

      testInRoot(() => {
        expect(guidesStore.isVisible).toBe(false);
        // Guides should still exist in store
        expect(guidesStore.guides.length).toBe(2);
      });

      // Show guides again
      fireEvent.keyDown(wrapper, { key: ';', ctrlKey: true });

      testInRoot(() => {
        expect(guidesStore.isVisible).toBe(true);
        // Guides should still be there
        expect(guidesStore.guides.length).toBe(2);
      });
    });

    it('should disable snap when guides are hidden', () => {
      mockDocumentStore.document = createMockDocument(1);

      testInRoot(() => {
        addGuide('horizontal', 100);
        expect(guidesStore.isSnapEnabled).toBe(true);
      });

      render(() => <Canvas />);

      const wrapper = screen.getByTestId('canvas-wrapper');

      // Hide guides
      fireEvent.keyDown(wrapper, { key: ';', ctrlKey: true });

      testInRoot(() => {
        // Snap should be disabled when hidden (FR-013)
        expect(guidesStore.isSnapEnabled).toBe(false);
      });

      // Show guides again
      fireEvent.keyDown(wrapper, { key: ';', ctrlKey: true });

      testInRoot(() => {
        // Snap should be re-enabled
        expect(guidesStore.isSnapEnabled).toBe(true);
      });
    });
  });
});
