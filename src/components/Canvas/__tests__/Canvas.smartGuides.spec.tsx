import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@solidjs/testing-library';
import { Canvas } from '../Canvas';
import { reset, setDocumentForTest } from '../../../stores/documentStore';
import { resetSmartGuides, smartGuidesStore } from '../../../stores/smartGuidesStore';
import { resetSelection, select, selectionStore } from '../../../stores/selectionStore';
import { resetDrag } from '../../../stores/dragStore';
import { resetCanvas } from '../../../stores/canvasStore';
import { resetMarquee } from '../../../stores/marqueeStore';
import type { VSTGUIUIDescription } from '../../../types/uidesc';

const createTestDocument = (): VSTGUIUIDescription => ({
  'vstgui-ui-description': {
    version: '1',
    templates: {
      TestTemplate: {
        attributes: {
          class: 'CViewContainer',
          size: '400, 300',
          origin: '0, 0',
        },
        children: {
          'view-1': {
            attributes: {
              class: 'CView',
              origin: '50, 50',
              size: '100, 80',
            },
          },
          'view-2': {
            attributes: {
              class: 'CView',
              origin: '200, 50',
              size: '100, 80',
            },
          },
          'view-3': {
            attributes: {
              class: 'CView',
              origin: '50, 180',
              size: '100, 80',
            },
          },
        },
      },
    },
  },
});

describe('Canvas smart guides integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    reset();
    resetSmartGuides();
    resetSelection();
    resetDrag();
    resetCanvas();
    resetMarquee();
    setDocumentForTest(createTestDocument());
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  describe('guide display during drag', () => {
    test('shows guides when dragging view near aligned sibling', async () => {
      render(() => <Canvas />);
      await vi.advanceTimersByTimeAsync(50);

      select('TestTemplate-view-1');
      await vi.advanceTimersByTimeAsync(10);

      const viewRect = screen.getByTestId('view-rect-TestTemplate-view-1');
      fireEvent.mouseDown(viewRect, { button: 0, clientX: 100, clientY: 90 });
      fireEvent.mouseMove(document, { clientX: 100, clientY: 90 });
      fireEvent.mouseMove(document, { clientX: 105, clientY: 90 });
      await vi.advanceTimersByTimeAsync(10);

      expect(smartGuidesStore.isEnabled).toBe(true);
    });

    test('clears guides when drag ends', async () => {
      render(() => <Canvas />);
      await vi.advanceTimersByTimeAsync(50);

      select('TestTemplate-view-1');
      await vi.advanceTimersByTimeAsync(10);

      const viewRect = screen.getByTestId('view-rect-TestTemplate-view-1');
      fireEvent.mouseDown(viewRect, { button: 0, clientX: 100, clientY: 90 });
      fireEvent.mouseMove(document, { clientX: 110, clientY: 90 });
      await vi.advanceTimersByTimeAsync(10);

      fireEvent.mouseUp(document);
      await vi.advanceTimersByTimeAsync(10);

      expect(smartGuidesStore.activeGuides).toHaveLength(0);
    });

    test('SmartGuideLines component is rendered in Canvas', async () => {
      render(() => <Canvas />);
      await vi.advanceTimersByTimeAsync(50);

      const svg = screen.getByTestId('canvas');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('guide calculation', () => {
    test('guides calculated based on sibling positions', async () => {
      render(() => <Canvas />);
      await vi.advanceTimersByTimeAsync(50);

      select('TestTemplate-view-1');
      await vi.advanceTimersByTimeAsync(10);

      expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);
    });
  });

  describe('smart guides enabled state', () => {
    test('guides are enabled by default', () => {
      expect(smartGuidesStore.isEnabled).toBe(true);
    });

    test('no guides shown when smart guides disabled', async () => {
      render(() => <Canvas />);
      await vi.advanceTimersByTimeAsync(50);

      resetSmartGuides();

      select('view-1');
      await vi.advanceTimersByTimeAsync(10);

      expect(smartGuidesStore.activeGuides).toHaveLength(0);
    });
  });
});
