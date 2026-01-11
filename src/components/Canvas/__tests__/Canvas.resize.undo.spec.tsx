import { render, fireEvent, cleanup } from '@solidjs/testing-library';
import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import { Canvas } from '../Canvas';
import { documentStore, reset, setDocumentForTest, updateViewOrigin, updateViewSize } from '../../../stores/documentStore';
import { clearSelection, resetSelection, select } from '../../../stores/selectionStore';
import { resetResize, resizeStore } from '../../../stores/resizeStore';
import { clearHistory, historyStore, resetHistory, redo, undo } from '../../../stores/historyStore';
import { resetCanvas } from '../../../stores/canvasStore';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import type { VSTGUIUIDescription } from '../../../types/uidesc';

function createTestDocument(): VSTGUIUIDescription {
  return {
    'vstgui-ui-description': {
      version: '1',
      templates: {
        MainView: {
          attributes: {
            class: 'CViewContainer',
            origin: '0, 0',
            size: '400, 300',
          },
          children: {
            Button1: {
              attributes: {
                class: 'CTextButton',
                origin: '50, 50',
                size: '100, 80',
              },
            },
          },
        },
      },
    },
  };
}

function setupTestDocument() {
  testInRoot(() => {
    reset();
    resetSelection();
    resetResize();
    resetHistory();
    resetCanvas();
    setDocumentForTest(createTestDocument());
  });
}

describe('Canvas resize undo/redo integration', () => {
  beforeEach(() => {
    setupTestDocument();
  });

  afterEach(() => {
    cleanup();
    testInRoot(() => {
      reset();
      resetSelection();
      resetResize();
      resetHistory();
    });
  });

  describe('history operation creation', () => {
    it('should push operation to history after resize completion', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 150, clientY: 130 });
      fireEvent.mouseMove(document, { clientX: 170, clientY: 150 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(historyStore.canUndo).toBe(true);
        expect(historyStore.undoDescription).toBe('Resize view');
      });
    });

    it('should not push operation if no actual resize occurred', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 150, clientY: 130 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(historyStore.canUndo).toBe(false);
      });
    });
  });

  describe('undo resize', () => {
    it('should restore original size on undo', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 150, clientY: 130 });
      fireEvent.mouseMove(document, { clientX: 180, clientY: 160 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        undo();

        const doc = documentStore.document;
        const button = doc?.['vstgui-ui-description']?.templates?.MainView?.children?.Button1;
        expect(button?.attributes.size).toBe('100, 80');
        expect(button?.attributes.origin).toBe('50, 50');
      });
    });

    it('should restore original origin for NW handle resize on undo', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const nwHandle = container.querySelector('[data-position="nw"]') as Element;

      fireEvent.mouseDown(nwHandle, { button: 0, clientX: 50, clientY: 50 });
      fireEvent.mouseMove(document, { clientX: 30, clientY: 30 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        undo();

        const doc = documentStore.document;
        const button = doc?.['vstgui-ui-description']?.templates?.MainView?.children?.Button1;
        expect(button?.attributes.origin).toBe('50, 50');
        expect(button?.attributes.size).toBe('100, 80');
      });
    });
  });

  describe('redo resize', () => {
    it('should reapply resize on redo', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 150, clientY: 130 });
      fireEvent.mouseMove(document, { clientX: 180, clientY: 160 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        const doc = documentStore.document;
        const buttonAfterResize = doc?.['vstgui-ui-description']?.templates?.MainView?.children?.Button1;
        const sizeAfterResize = buttonAfterResize?.attributes.size;

        undo();
        redo();

        const buttonAfterRedo = doc?.['vstgui-ui-description']?.templates?.MainView?.children?.Button1;
        expect(buttonAfterRedo?.attributes.size).toBe(sizeAfterResize);
      });
    });

    it('should enable redo after undo', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 150, clientY: 130 });
      fireEvent.mouseMove(document, { clientX: 180, clientY: 160 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(historyStore.canRedo).toBe(false);
        undo();
        expect(historyStore.canRedo).toBe(true);
      });
    });
  });

  // Note: Undo/Redo is now handled globally in App.tsx, so these tests
  // call undo()/redo() directly instead of simulating keyboard events on the canvas.
  describe('keyboard shortcuts', () => {
    it('should undo resize with Ctrl+Z', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 150, clientY: 130 });
      fireEvent.mouseMove(document, { clientX: 180, clientY: 160 });
      fireEvent.mouseUp(document);

      // Call undo directly (global handler in App.tsx handles Ctrl+Z)
      testInRoot(() => {
        undo();

        const doc = documentStore.document;
        const button = doc?.['vstgui-ui-description']?.templates?.MainView?.children?.Button1;
        expect(button?.attributes.size).toBe('100, 80');
      });
    });

    it('should redo resize with Ctrl+Y', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 150, clientY: 130 });
      fireEvent.mouseMove(document, { clientX: 180, clientY: 160 });
      fireEvent.mouseUp(document);

      // Call undo and redo directly (global handler in App.tsx handles Ctrl+Y)
      testInRoot(() => {
        undo();
        redo();

        const doc = documentStore.document;
        const button = doc?.['vstgui-ui-description']?.templates?.MainView?.children?.Button1;
        expect(button?.attributes.size).not.toBe('100, 80');
      });
    });

    it('should redo resize with Ctrl+Shift+Z', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 150, clientY: 130 });
      fireEvent.mouseMove(document, { clientX: 180, clientY: 160 });
      fireEvent.mouseUp(document);

      // Call undo and redo directly (global handler in App.tsx handles Ctrl+Shift+Z)
      testInRoot(() => {
        undo();
        redo();

        const doc = documentStore.document;
        const button = doc?.['vstgui-ui-description']?.templates?.MainView?.children?.Button1;
        expect(button?.attributes.size).not.toBe('100, 80');
      });
    });
  });
});
