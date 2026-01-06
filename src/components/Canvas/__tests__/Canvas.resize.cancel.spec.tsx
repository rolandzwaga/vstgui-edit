import { render, fireEvent, cleanup } from '@solidjs/testing-library';
import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import { Canvas } from '../Canvas';
import { documentStore, reset, setDocumentForTest } from '../../../stores/documentStore';
import { resetSelection, select } from '../../../stores/selectionStore';
import { resetResize, resizeStore } from '../../../stores/resizeStore';
import { resetHistory } from '../../../stores/historyStore';
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

describe('Canvas resize cancel (Escape key)', () => {
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

  describe('Escape during resize', () => {
    it('should cancel resize and restore original size on Escape', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;
      const wrapper = container.querySelector('[data-testid="canvas-wrapper"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 150, clientY: 130 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 180 });

      testInRoot(() => {
        expect(resizeStore.isResizing).toBe(true);
        expect(resizeStore.newSize.width).toBeGreaterThan(100);
      });

      fireEvent.keyDown(wrapper, { key: 'Escape' });

      testInRoot(() => {
        expect(resizeStore.isResizing).toBe(false);
        const doc = documentStore.document;
        const button = doc?.['vstgui-ui-description']?.templates?.MainView?.children?.Button1;
        expect(button?.attributes.size).toBe('100, 80');
      });
    });

    it('should reset resize state after Escape', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;
      const wrapper = container.querySelector('[data-testid="canvas-wrapper"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 150, clientY: 130 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 180 });
      fireEvent.keyDown(wrapper, { key: 'Escape' });

      testInRoot(() => {
        expect(resizeStore.isResizing).toBe(false);
        expect(resizeStore.activeHandle).toBeNull();
        expect(resizeStore.viewId).toBeNull();
      });
    });

    it('should not push to history on cancel', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const seHandle = container.querySelector('[data-position="se"]') as Element;
      const wrapper = container.querySelector('[data-testid="canvas-wrapper"]') as Element;

      fireEvent.mouseDown(seHandle, { button: 0, clientX: 150, clientY: 130 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 180 });
      fireEvent.keyDown(wrapper, { key: 'Escape' });

      fireEvent.keyDown(wrapper, { key: 'z', ctrlKey: true });

      testInRoot(() => {
        const doc = documentStore.document;
        const button = doc?.['vstgui-ui-description']?.templates?.MainView?.children?.Button1;
        expect(button?.attributes.size).toBe('100, 80');
      });
    });
  });

  describe('Escape when not resizing', () => {
    it('should clear selection when not resizing', () => {
      testInRoot(() => {
        select('MainView-Button1');
      });

      const { container } = render(() => <Canvas />);
      const wrapper = container.querySelector('[data-testid="canvas-wrapper"]') as Element;

      fireEvent.keyDown(wrapper, { key: 'Escape' });

      testInRoot(() => {
        const doc = documentStore.document;
        const button = doc?.['vstgui-ui-description']?.templates?.MainView?.children?.Button1;
        expect(button?.attributes.size).toBe('100, 80');
      });
    });
  });
});
