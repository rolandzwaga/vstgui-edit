import { render, fireEvent, cleanup } from '@solidjs/testing-library';
import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import { Canvas } from '../Canvas';
import { documentStore, reset, setDocumentForTest } from '../../../stores/documentStore';
import { resetSelection, select } from '../../../stores/selectionStore';
import { resetResize, resizeStore } from '../../../stores/resizeStore';
import { resetHistory, undo } from '../../../stores/historyStore';
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
                size: '200, 100',
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

describe('Canvas resize aspect ratio lock (Shift key)', () => {
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

  describe('SE corner with Shift held', () => {
    it('should maintain aspect ratio when resizing with Shift', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 250, clientY: 150 });
      fireEvent.mouseMove(document, { clientX: 300, clientY: 170, shiftKey: true });

      testInRoot(() => {
        const newWidth = resizeStore.newSize.width;
        const newHeight = resizeStore.newSize.height;
        const ratio = newWidth / newHeight;
        expect(ratio).toBeCloseTo(2, 1);
      });
    });

    it('should not maintain aspect ratio without Shift', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 250, clientY: 150 });
      fireEvent.mouseMove(document, { clientX: 300, clientY: 170, shiftKey: false });

      testInRoot(() => {
        const newWidth = resizeStore.newSize.width;
        const newHeight = resizeStore.newSize.height;
        expect(newWidth).toBe(250);
        expect(newHeight).toBe(120);
      });
    });
  });

  describe('NW corner with Shift held', () => {
    it('should maintain aspect ratio when resizing from NW with Shift', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const nwHandle = container.querySelector('[data-position="nw"]') as Element;

      fireEvent.mouseDown(nwHandle, { button: 0, clientX: 50, clientY: 50 });
      fireEvent.mouseMove(document, { clientX: 10, clientY: 40, shiftKey: true });

      testInRoot(() => {
        const newWidth = resizeStore.newSize.width;
        const newHeight = resizeStore.newSize.height;
        const ratio = newWidth / newHeight;
        expect(ratio).toBeCloseTo(2, 1);
      });
    });
  });

  describe('edge handles with Shift', () => {
    it('should allow width change from E edge even with Shift (edge handles are constrained to one axis)', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const eHandle = container.querySelector('[data-position="e"]') as Element;

      fireEvent.mouseDown(eHandle, { button: 0, clientX: 250, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 290, clientY: 100, shiftKey: true });

      testInRoot(() => {
        const newWidth = resizeStore.newSize.width;
        const newHeight = resizeStore.newSize.height;
        expect(newWidth).toBe(240);
        expect(newHeight).toBe(100);
      });
    });
  });

  describe('aspect ratio with undo/redo', () => {
    it('should correctly undo aspect-ratio-locked resize', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 250, clientY: 150 });
      fireEvent.mouseMove(document, { clientX: 300, clientY: 170, shiftKey: true });
      fireEvent.mouseUp(document);

      // Call undo directly (global handler in App.tsx handles Ctrl+Z)
      testInRoot(() => {
        undo();

        const doc = documentStore.document;
        const button = doc?.['vstgui-ui-description']?.templates?.MainView?.children?.Button1;
        expect(button?.attributes.size).toBe('200, 100');
      });
    });
  });
});
