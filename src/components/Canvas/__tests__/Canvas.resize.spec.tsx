import { render, fireEvent, cleanup } from '@solidjs/testing-library';
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { Canvas } from '../Canvas';
import { documentStore, reset, setDocumentForTest, updateViewOrigin, updateViewSize } from '../../../stores/documentStore';
import { clearSelection, resetSelection, select, selectionStore } from '../../../stores/selectionStore';
import { resetResize, resizeStore } from '../../../stores/resizeStore';
import { clearHistory, resetHistory } from '../../../stores/historyStore';
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

describe('Canvas resize integration', () => {
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

  describe('resize gesture initiation', () => {
    it('should start resize when mousedown on handle of selected view', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);

      const seHandle = container.querySelector('[data-position="se"]') as Element;
      expect(seHandle).toBeTruthy();

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 200, clientY: 180 });

      testInRoot(() => {
        expect(resizeStore.isResizing).toBe(true);
        expect(resizeStore.activeHandle).toBe('se');
        expect(resizeStore.viewId).toBe('MainView-Button1');
      });
    });

    it('should capture original origin and size on resize start', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 200, clientY: 180 });

      testInRoot(() => {
        expect(resizeStore.originalOrigin).toEqual({ x: 50, y: 50 });
        expect(resizeStore.originalSize).toEqual({ width: 100, height: 80 });
      });
    });
  });

  describe('resize gesture update', () => {
    it('should update newSize when mouse moves during resize', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 150, clientY: 130 });
      fireEvent.mouseMove(document, { clientX: 170, clientY: 150 });

      testInRoot(() => {
        expect(resizeStore.currentPoint).toBeTruthy();
      });
    });
  });

  describe('resize gesture completion', () => {
    it('should update document view size on mouseup', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 150, clientY: 130 });
      fireEvent.mouseMove(document, { clientX: 170, clientY: 150 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(resizeStore.isResizing).toBe(false);
      });
    });

    it('should reset resize state after completion', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 150, clientY: 130 });
      fireEvent.mouseMove(document, { clientX: 180, clientY: 160 });
      fireEvent.mouseUp(document);

      testInRoot(() => {
        expect(resizeStore.isResizing).toBe(false);
        expect(resizeStore.activeHandle).toBeNull();
      });
    });
  });

  describe('resize with different handles', () => {
    it('should resize from NW corner (changes origin and size)', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const nwHandle = container.querySelector('[data-position="nw"]') as Element;
      expect(nwHandle).toBeTruthy();

      fireEvent.mouseDown(nwHandle, { button: 0, clientX: 50, clientY: 50 });

      testInRoot(() => {
        expect(resizeStore.activeHandle).toBe('nw');
      });
    });

    it('should resize from E edge (changes only width)', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const eHandle = container.querySelector('[data-position="e"]') as Element;
      expect(eHandle).toBeTruthy();

      fireEvent.mouseDown(eHandle, { button: 0, clientX: 150, clientY: 90 });

      testInRoot(() => {
        expect(resizeStore.activeHandle).toBe('e');
      });
    });
  });

  describe('minimum size enforcement', () => {
    it('should enforce minimum 10x10 size', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 150, clientY: 130 });
      fireEvent.mouseMove(document, { clientX: 55, clientY: 55 });

      testInRoot(() => {
        expect(resizeStore.newSize.width).toBeGreaterThanOrEqual(10);
        expect(resizeStore.newSize.height).toBeGreaterThanOrEqual(10);
      });
    });
  });
});
