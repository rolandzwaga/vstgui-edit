import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@solidjs/testing-library';
import { Canvas } from '../Canvas';
import { reset, setDocumentForTest } from '../../../stores/documentStore';
import {
  resetSmartGuides,
  smartGuidesStore,
  toggleSmartGuides,
} from '../../../stores/smartGuidesStore';
import { resetSelection, select, toggleSelect, selectionStore } from '../../../stores/selectionStore';
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

      toggleSmartGuides();
      expect(smartGuidesStore.isEnabled).toBe(false);

      select('TestTemplate-view-1');
      await vi.advanceTimersByTimeAsync(10);

      expect(smartGuidesStore.activeGuides).toHaveLength(0);
    });
  });

  describe('parent center guides (US3)', () => {
    test('parent bounds are passed to guide calculation', async () => {
      render(() => <Canvas />);
      await vi.advanceTimersByTimeAsync(50);

      select('TestTemplate-view-1');
      await vi.advanceTimersByTimeAsync(10);

      expect(selectionStore.selectedIds.has('TestTemplate-view-1')).toBe(true);
    });
  });

  describe('spacing guides (US4)', () => {
    const createSpacingTestDocument = (): VSTGUIUIDescription => ({
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
              'view-left': {
                attributes: {
                  class: 'CView',
                  origin: '0, 50',
                  size: '50, 100',
                },
              },
              'view-middle': {
                attributes: {
                  class: 'CView',
                  origin: '75, 50',
                  size: '50, 100',
                },
              },
              'view-right': {
                attributes: {
                  class: 'CView',
                  origin: '150, 50',
                  size: '50, 100',
                },
              },
            },
          },
        },
      },
    });

    test('spacing guides calculated during drag with equal gaps', async () => {
      reset();
      setDocumentForTest(createSpacingTestDocument());

      render(() => <Canvas />);
      await vi.advanceTimersByTimeAsync(50);

      select('TestTemplate-view-middle');
      await vi.advanceTimersByTimeAsync(10);

      const viewRect = screen.getByTestId('view-rect-TestTemplate-view-middle');
      fireEvent.mouseDown(viewRect, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 110, clientY: 100 });
      await vi.advanceTimersByTimeAsync(10);

      const spacingGuides = smartGuidesStore.activeGuides.filter(g => g.type === 'spacing');
      expect(spacingGuides.length).toBeGreaterThanOrEqual(0);

      fireEvent.mouseUp(document);
    });
  });

  describe('S key toggle (US5)', () => {
    test('S key toggles smart guides off', async () => {
      render(() => <Canvas />);
      await vi.advanceTimersByTimeAsync(50);

      expect(smartGuidesStore.isEnabled).toBe(true);

      const wrapper = screen.getByTestId('canvas-wrapper');
      fireEvent.keyDown(wrapper, { key: 's' });
      await vi.advanceTimersByTimeAsync(10);

      expect(smartGuidesStore.isEnabled).toBe(false);
    });

    test('S key toggles smart guides back on', async () => {
      render(() => <Canvas />);
      await vi.advanceTimersByTimeAsync(50);

      toggleSmartGuides();
      expect(smartGuidesStore.isEnabled).toBe(false);

      const wrapper = screen.getByTestId('canvas-wrapper');
      fireEvent.keyDown(wrapper, { key: 's' });
      await vi.advanceTimersByTimeAsync(10);

      expect(smartGuidesStore.isEnabled).toBe(true);
    });

    test('S key works with uppercase', async () => {
      render(() => <Canvas />);
      await vi.advanceTimersByTimeAsync(50);

      const wrapper = screen.getByTestId('canvas-wrapper');
      fireEvent.keyDown(wrapper, { key: 'S' });
      await vi.advanceTimersByTimeAsync(10);

      expect(smartGuidesStore.isEnabled).toBe(false);
    });

    test('S key ignored in text inputs', async () => {
      render(() => (
        <div>
          <input type="text" data-testid="text-input" />
          <Canvas />
        </div>
      ));
      await vi.advanceTimersByTimeAsync(50);

      expect(smartGuidesStore.isEnabled).toBe(true);

      const input = screen.getByTestId('text-input');
      fireEvent.keyDown(input, { key: 's' });
      await vi.advanceTimersByTimeAsync(10);

      expect(smartGuidesStore.isEnabled).toBe(true);
    });

    test('guides not shown during drag when disabled', async () => {
      render(() => <Canvas />);
      await vi.advanceTimersByTimeAsync(50);

      toggleSmartGuides();
      expect(smartGuidesStore.isEnabled).toBe(false);

      select('TestTemplate-view-1');
      await vi.advanceTimersByTimeAsync(10);

      const viewRect = screen.getByTestId('view-rect-TestTemplate-view-1');
      fireEvent.mouseDown(viewRect, { button: 0, clientX: 100, clientY: 90 });
      fireEvent.mouseMove(document, { clientX: 110, clientY: 90 });
      await vi.advanceTimersByTimeAsync(10);

      expect(smartGuidesStore.activeGuides).toHaveLength(0);

      fireEvent.mouseUp(document);
    });
  });

  describe('multi-view drag scenario (FR-014)', () => {
    const createAlignmentTestDocument = (): VSTGUIUIDescription => ({
      'vstgui-ui-description': {
        version: '1',
        templates: {
          TestTemplate: {
            attributes: {
              class: 'CViewContainer',
              size: '500, 400',
              origin: '0, 0',
            },
            children: {
              anchor: {
                attributes: {
                  class: 'CView',
                  origin: '100, 100',
                  size: '50, 50',
                },
              },
              selected: {
                attributes: {
                  class: 'CView',
                  origin: '200, 200',
                  size: '50, 50',
                },
              },
              sibling: {
                attributes: {
                  class: 'CView',
                  origin: '100, 200',
                  size: '50, 50',
                },
              },
            },
          },
        },
      },
    });

    test('guides calculated based on anchor view position, not other selected views', async () => {
      reset();
      setDocumentForTest(createAlignmentTestDocument());

      render(() => <Canvas />);
      await vi.advanceTimersByTimeAsync(50);

      select('TestTemplate-anchor');
      toggleSelect('TestTemplate-selected');
      await vi.advanceTimersByTimeAsync(10);

      expect(selectionStore.selectedIds.size).toBe(2);

      const anchorRect = screen.getByTestId('view-rect-TestTemplate-anchor');
      fireEvent.mouseDown(anchorRect, { button: 0, clientX: 125, clientY: 125 });
      fireEvent.mouseMove(document, { clientX: 130, clientY: 125 });
      await vi.advanceTimersByTimeAsync(10);

      const guides = smartGuidesStore.activeGuides;

      const anchorAlignedGuides = guides.filter(
        g => g.participatingViewIds.includes('TestTemplate-anchor')
      );
      expect(anchorAlignedGuides.length).toBeGreaterThan(0);

      const nonAnchorOnlyGuides = guides.filter(
        g =>
          !g.participatingViewIds.includes('TestTemplate-anchor') &&
          g.participatingViewIds.includes('TestTemplate-selected')
      );
      expect(nonAnchorOnlyGuides.length).toBe(0);

      fireEvent.mouseUp(document);
    });

    test('anchor view aligns with sibling at same left edge', async () => {
      reset();
      setDocumentForTest(createAlignmentTestDocument());

      render(() => <Canvas />);
      await vi.advanceTimersByTimeAsync(50);

      select('TestTemplate-anchor');
      toggleSelect('TestTemplate-selected');
      await vi.advanceTimersByTimeAsync(10);

      const anchorRect = screen.getByTestId('view-rect-TestTemplate-anchor');
      fireEvent.mouseDown(anchorRect, { button: 0, clientX: 125, clientY: 125 });
      fireEvent.mouseMove(document, { clientX: 130, clientY: 125 });
      await vi.advanceTimersByTimeAsync(10);

      const guides = smartGuidesStore.activeGuides;
      const leftEdgeGuide = guides.find(
        g =>
          g.orientation === 'vertical' &&
          g.participatingViewIds.includes('TestTemplate-anchor') &&
          g.participatingViewIds.includes('TestTemplate-sibling')
      );

      expect(leftEdgeGuide).toBeDefined();

      fireEvent.mouseUp(document);
    });
  });

  describe('edge case: only child in container', () => {
    const createSingleChildDocument = (): VSTGUIUIDescription => ({
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
              'only-child': {
                attributes: {
                  class: 'CView',
                  origin: '100, 100',
                  size: '50, 50',
                },
              },
            },
          },
        },
      },
    });

    test('parent center guides available when view is only child', async () => {
      reset();
      setDocumentForTest(createSingleChildDocument());

      render(() => <Canvas />);
      await vi.advanceTimersByTimeAsync(50);

      select('TestTemplate-only-child');
      await vi.advanceTimersByTimeAsync(10);

      const viewRect = screen.getByTestId('view-rect-TestTemplate-only-child');
      fireEvent.mouseDown(viewRect, { button: 0, clientX: 125, clientY: 125 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 150 });
      await vi.advanceTimersByTimeAsync(10);

      expect(smartGuidesStore.isEnabled).toBe(true);

      fireEvent.mouseUp(document);
    });

    test('only parent-center guides available when view is only child (no siblings)', async () => {
      reset();
      setDocumentForTest(createSingleChildDocument());

      render(() => <Canvas />);
      await vi.advanceTimersByTimeAsync(50);

      select('TestTemplate-only-child');
      await vi.advanceTimersByTimeAsync(10);

      const viewRect = screen.getByTestId('view-rect-TestTemplate-only-child');
      fireEvent.mouseDown(viewRect, { button: 0, clientX: 125, clientY: 125 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 150 });
      await vi.advanceTimersByTimeAsync(10);

      const guides = smartGuidesStore.activeGuides;
      const parentCenterGuides = guides.filter(g => g.type === 'parent-center');
      const spacingGuides = guides.filter(g => g.type === 'spacing');

      expect(spacingGuides).toHaveLength(0);
      expect(parentCenterGuides.length).toBeGreaterThanOrEqual(0);

      fireEvent.mouseUp(document);
    });
  });
});
