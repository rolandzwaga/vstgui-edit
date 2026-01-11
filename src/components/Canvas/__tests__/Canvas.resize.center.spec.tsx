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
                origin: '100, 100',
                size: '100, 100',
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

describe('Canvas resize from center (Alt key)', () => {
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

  describe('SE corner with Alt held', () => {
    it('should resize symmetrically from center with Alt key', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 200, clientY: 200 });
      fireEvent.mouseMove(document, { clientX: 220, clientY: 210, altKey: true });

      testInRoot(() => {
        expect(resizeStore.newOrigin.x).toBe(80);
        expect(resizeStore.newOrigin.y).toBe(90);
        expect(resizeStore.newSize.width).toBe(140);
        expect(resizeStore.newSize.height).toBe(120);
      });
    });

    it('should not resize from center without Alt key', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 200, clientY: 200 });
      fireEvent.mouseMove(document, { clientX: 220, clientY: 210, altKey: false });

      testInRoot(() => {
        expect(resizeStore.newOrigin.x).toBe(100);
        expect(resizeStore.newOrigin.y).toBe(100);
        expect(resizeStore.newSize.width).toBe(120);
        expect(resizeStore.newSize.height).toBe(110);
      });
    });
  });

  describe('NW corner with Alt held', () => {
    it('should resize symmetrically from center when dragging NW with Alt', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const nwHandle = container.querySelector('[data-position="nw"]') as Element;

      fireEvent.mouseDown(nwHandle, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 80, clientY: 90, altKey: true });

      testInRoot(() => {
        expect(resizeStore.newOrigin.x).toBe(120);
        expect(resizeStore.newOrigin.y).toBe(110);
        expect(resizeStore.newSize.width).toBe(60);
        expect(resizeStore.newSize.height).toBe(80);
      });
    });
  });

  describe('combined Shift+Alt', () => {
    it('should maintain aspect ratio and resize from center with Shift+Alt', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 200, clientY: 200 });
      fireEvent.mouseMove(document, { clientX: 240, clientY: 220, shiftKey: true, altKey: true });

      testInRoot(() => {
        const ratio = resizeStore.newSize.width / resizeStore.newSize.height;
        expect(ratio).toBeCloseTo(1, 1);
        expect(resizeStore.newOrigin.x).toBeLessThan(100);
        expect(resizeStore.newOrigin.y).toBeLessThan(100);
      });
    });
  });

  describe('center resize with undo', () => {
    it('should correctly undo center resize', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 200, clientY: 200 });
      fireEvent.mouseMove(document, { clientX: 230, clientY: 220, altKey: true });
      fireEvent.mouseUp(document);

      // Call undo directly (global handler in App.tsx handles Ctrl+Z)
      testInRoot(() => {
        undo();

        const doc = documentStore.document;
        const button = doc?.['vstgui-ui-description']?.templates?.MainView?.children?.Button1;
        expect(button?.attributes.origin).toBe('100, 100');
        expect(button?.attributes.size).toBe('100, 100');
      });
    });
  });
});
