import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import {
  canvasStore,
  fitToView,
  resetPan,
  resetZoom,
  zoomIn,
  zoomOut,
} from '../../../stores/canvasStore';
import { resetGrid, toggleVisibility } from '../../../stores/gridStore';
import { Canvas } from '../Canvas';
import styles from '../Canvas.module.css';

vi.mock('../../../stores/canvasStore', async () => {
  const actual = await vi.importActual('../../../stores/canvasStore');
  return {
    ...actual,
    zoomIn: vi.fn((actual as { zoomIn: () => void }).zoomIn),
    zoomOut: vi.fn((actual as { zoomOut: () => void }).zoomOut),
    resetZoom: vi.fn((actual as { resetZoom: () => void }).resetZoom),
    fitToView: vi.fn((actual as { fitToView: () => void }).fitToView),
  };
});

vi.mock('../../../stores/gridStore', async () => {
  const actual = await vi.importActual('../../../stores/gridStore');
  return {
    ...actual,
    toggleVisibility: vi.fn((actual as { toggleVisibility: () => void }).toggleVisibility),
  };
});

// Define mock stores using vi.hoisted so they're available in vi.mock
const mockDocumentStore = vi.hoisted(() => ({
  document: null as unknown,
}));

const mockTemplateStore = vi.hoisted(() => ({
  activeTemplateId: null as string | null,
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

function setMockDocument(doc: unknown, activeTemplateId: string | null = 'MainView') {
  mockDocumentStore.document = doc;
  mockTemplateStore.activeTemplateId = activeTemplateId;
}

describe('Canvas', () => {
  beforeEach(() => {
    mockDocumentStore.document = null;
    mockTemplateStore.activeTemplateId = 'MainView';
  });

  // Note: cleanup() and resetCanvas() are handled automatically by src/__tests__/setup.ts

  describe('Given no document loaded (US1 - empty state)', () => {
    it('should render EmptyState component', () => {
      render(() => <Canvas />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should display "No template loaded" message', () => {
      render(() => <Canvas />);

      expect(screen.getByText('No template loaded')).toBeInTheDocument();
    });
  });

  describe('Given document with no templates', () => {
    it('should render EmptyState', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
        },
      };

      render(() => <Canvas />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  describe('Given document with empty templates object', () => {
    it('should render EmptyState', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
        },
      };

      render(() => <Canvas />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  describe('Given document with a template (US1 - basic rendering)', () => {
    it('should render SVG canvas element', () => {
      setMockDocument({
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
              },
            },
          },
        },
      });

      render(() => <Canvas />);

      expect(screen.getByTestId('canvas')).toBeInTheDocument();
    });

    it('should not render EmptyState when template exists', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
              },
            },
          },
        },
      };

      render(() => <Canvas />);

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });

    it('should render view rectangles for template views', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
              },
            },
          },
        },
      };

      render(() => <Canvas />);

      // Should render at least the root view
      const canvas = screen.getByTestId('canvas');
      const rects = canvas.querySelectorAll('rect');
      expect(rects.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Given document with nested views (US2 - z-ordering)', () => {
    it('should render all child views', () => {
      mockDocumentStore.document = {
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
                button1: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '10, 10',
                    size: '100, 30',
                  },
                },
                button2: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '10, 50',
                    size: '100, 30',
                  },
                },
              },
            },
          },
        },
      };

      render(() => <Canvas />);

      const canvas = screen.getByTestId('canvas');
      const rects = canvas.querySelectorAll('rect');
      // Template bounds + Root + 2 children = 4 rectangles
      expect(rects.length).toBe(4);
    });

    it('should render children after parents in DOM order', () => {
      mockDocumentStore.document = {
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
                childButton: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '10, 10',
                    size: '100, 30',
                  },
                },
              },
            },
          },
        },
      };

      render(() => <Canvas />);

      // Verify parent appears before child in DOM (path-based IDs)
      const parentView = screen.getByTestId('view-MainView');
      const childView = screen.getByTestId('view-MainView-childButton');

      // Parent should come before child in document order
      expect(
        parentView.compareDocumentPosition(childView) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it('should render deeply nested views in correct DOM order', () => {
      mockDocumentStore.document = {
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
                panel: {
                  attributes: {
                    class: 'CViewContainer',
                    origin: '10, 10',
                    size: '200, 200',
                  },
                  children: {
                    nestedButton: {
                      attributes: {
                        class: 'CTextButton',
                        origin: '5, 5',
                        size: '80, 30',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      render(() => <Canvas />);

      const canvas = screen.getByTestId('canvas');
      const rects = canvas.querySelectorAll('rect');
      // Template bounds + Root + panel + nestedButton = 4 rectangles
      expect(rects.length).toBe(4);

      // Verify correct DOM order: MainView -> panel -> nestedButton (path-based IDs)
      const mainView = screen.getByTestId('view-MainView');
      const panelView = screen.getByTestId('view-MainView-panel');
      const nestedButton = screen.getByTestId('view-MainView-panel-nestedButton');

      expect(
        mainView.compareDocumentPosition(panelView) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
      expect(
        panelView.compareDocumentPosition(nestedButton) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });
  });

  describe('Given document with template (US5 - template bounds)', () => {
    it('should render template bounds indicator', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
              },
            },
          },
        },
      };

      render(() => <Canvas />);

      expect(screen.getByTestId('template-bounds')).toBeInTheDocument();
    });

    it('should render template bounds before views (at bottom z-order)', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
              },
            },
          },
        },
      };

      render(() => <Canvas />);

      const templateBounds = screen.getByTestId('template-bounds');
      const mainView = screen.getByTestId('view-MainView');

      // Template bounds should appear before views in DOM order
      expect(
        templateBounds.compareDocumentPosition(mainView) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });
  });

  describe('Given canvas with content (US1 - Middle-Mouse Pan)', () => {
    beforeEach(() => {
      resetPan();
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
              },
            },
          },
        },
      };
    });

    it('should initiate pan mode when middle mouse button pressed (button=1)', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      fireEvent.mouseDown(wrapper, { button: 1, clientX: 100, clientY: 100 });

      expect(canvasStore.isPanning).toBe(true);
      expect(canvasStore.panStart).toEqual({ x: 100, y: 100 });
    });

    it('should update panOffset when mouse moves during pan', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      fireEvent.mouseDown(wrapper, { button: 1, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 150, clientY: 120 });

      // Delta: x = 150 - 100 = 50, y = 120 - 100 = 20
      expect(canvasStore.panOffset).toEqual({ x: 50, y: 20 });
    });

    it('should end pan and preserve panOffset when mouse released', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      fireEvent.mouseDown(wrapper, { button: 1, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(document);

      expect(canvasStore.isPanning).toBe(false);
      expect(canvasStore.panOffset).toEqual({ x: 50, y: 50 });
    });

    it('should apply transform style to canvas wrapper based on panOffset', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      fireEvent.mouseDown(wrapper, { button: 1, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 150 });
      fireEvent.mouseUp(document);

      // Check transform is applied (includes scale from zoomLevel)
      expect(wrapper.style.transform).toBe('translate(100px, 50px) scale(1)');
    });

    it('should initiate pan even when middle-clicking on a view element (edge case)', () => {
      mockDocumentStore.document = {
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
                button: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '50, 50',
                    size: '100, 40',
                  },
                },
              },
            },
          },
        },
      };

      render(() => <Canvas />);
      const viewRect = screen.getByTestId('view-MainView-button');

      // Middle-click on the view element (path-based ID)
      fireEvent.mouseDown(viewRect, { button: 1, clientX: 75, clientY: 75 });

      expect(canvasStore.isPanning).toBe(true);
    });

    it('should NOT initiate pan when left mouse button pressed (button=0)', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      fireEvent.mouseDown(wrapper, { button: 0, clientX: 100, clientY: 100 });

      expect(canvasStore.isPanning).toBe(false);
    });

    it('should NOT initiate pan when right mouse button pressed (button=2)', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      fireEvent.mouseDown(wrapper, { button: 2, clientX: 100, clientY: 100 });

      expect(canvasStore.isPanning).toBe(false);
    });

    it('should prevent default browser auto-scroll behavior on middle-click', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      const event = new MouseEvent('mousedown', {
        button: 1,
        clientX: 100,
        clientY: 100,
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      wrapper.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Given canvas with content (US2 - Ctrl+Drag Pan)', () => {
    beforeEach(() => {
      resetPan();
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
              },
            },
          },
        },
      };
    });

    it('should initiate pan mode when Ctrl held and left mouse button pressed (button=0)', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Ctrl+left-click
      fireEvent.mouseDown(wrapper, { button: 0, ctrlKey: true, clientX: 100, clientY: 100 });

      expect(canvasStore.isPanning).toBe(true);
      expect(canvasStore.panStart).toEqual({ x: 100, y: 100 });
    });

    it('should update panOffset when dragging with Ctrl held', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      fireEvent.mouseDown(wrapper, { button: 0, ctrlKey: true, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 150, clientY: 130 });

      expect(canvasStore.panOffset).toEqual({ x: 50, y: 30 });
    });

    it('should end pan gesture when mouse released during Ctrl+drag', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      fireEvent.mouseDown(wrapper, { button: 0, ctrlKey: true, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
      fireEvent.mouseUp(document);

      expect(canvasStore.isPanning).toBe(false);
      expect(canvasStore.panOffset).toEqual({ x: 100, y: 100 }); // Offset preserved
    });

    it('should NOT initiate pan when left-click without Ctrl held', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // No Ctrl key pressed
      fireEvent.mouseDown(wrapper, { button: 0, clientX: 100, clientY: 100 });

      expect(canvasStore.isPanning).toBe(false);
    });

    it('should ignore Ctrl+drag if middle-mouse pan is already in progress', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Start middle-mouse pan
      fireEvent.mouseDown(wrapper, { button: 1, clientX: 100, clientY: 100 });
      expect(canvasStore.isPanning).toBe(true);

      // Now try Ctrl+left-click while already panning
      fireEvent.mouseDown(wrapper, { button: 0, ctrlKey: true, clientX: 200, clientY: 200 });

      // Pan start should NOT change to the new position
      // (it was already panning from middle-mouse)
      expect(canvasStore.panStart).toEqual({ x: 100, y: 100 });
    });
  });

  describe('Given canvas with content (US3 - Cursor Feedback)', () => {
    beforeEach(() => {
      resetPan();
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
              },
            },
          },
        },
      };
    });

    it('should apply grabbing cursor class when panning via middle-mouse', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Start middle-mouse pan
      fireEvent.mouseDown(wrapper, { button: 1, clientX: 100, clientY: 100 });

      // Check for grabbing cursor class using imported CSS Module styles
      expect(wrapper.classList.contains(styles.grabbing)).toBe(true);
    });

    it('should apply grabbing cursor class during Ctrl+drag pan', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Ctrl+left-click to pan
      fireEvent.mouseDown(wrapper, { button: 0, ctrlKey: true, clientX: 100, clientY: 100 });

      // Check for grabbing cursor class
      expect(wrapper.classList.contains(styles.grabbing)).toBe(true);
    });

    it('should return to default cursor when pan ends', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Start and end pan
      fireEvent.mouseDown(wrapper, { button: 1, clientX: 100, clientY: 100 });
      fireEvent.mouseUp(document);

      // No grabbing class
      expect(wrapper.classList.contains(styles.grabbing)).toBe(false);
    });
  });

  describe('Given canvas with content (US1 - Wheel Zoom)', () => {
    beforeEach(() => {
      resetPan();
      resetZoom();
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
              },
            },
          },
        },
      };
    });

    it('should increase zoomLevel when Ctrl+wheel scrolls up (deltaY < 0)', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Ctrl + Scroll up (zoom in)
      fireEvent.wheel(wrapper, { deltaY: -100, clientX: 200, clientY: 150, ctrlKey: true });

      expect(canvasStore.zoomLevel).toBeGreaterThan(1.0);
    });

    it('should decrease zoomLevel when Ctrl+wheel scrolls down (deltaY > 0)', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Ctrl + Scroll down (zoom out)
      fireEvent.wheel(wrapper, { deltaY: 100, clientX: 200, clientY: 150, ctrlKey: true });

      expect(canvasStore.zoomLevel).toBeLessThan(1.0);
    });

    it('should NOT zoom when wheel scrolls without Ctrl key', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Scroll without Ctrl (should not zoom)
      fireEvent.wheel(wrapper, { deltaY: -100, clientX: 200, clientY: 150 });

      expect(canvasStore.zoomLevel).toBe(1.0);
    });

    it('should prevent default browser zoom on Ctrl+wheel event', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      const event = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 200,
        clientY: 150,
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      wrapper.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should apply scale transform based on zoomLevel', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      fireEvent.wheel(wrapper, { deltaY: -100, clientX: 200, clientY: 150, ctrlKey: true });

      expect(wrapper.style.transform).toContain('scale(');
    });

    it('should handle zoom with cursor outside canvas bounds', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      fireEvent.wheel(wrapper, { deltaY: -100, clientX: 1000, clientY: 1000, ctrlKey: true });

      expect(canvasStore.zoomLevel).toBeGreaterThan(1.0);
    });

    it('should handle zoom interaction with existing pan offset', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      fireEvent.mouseDown(wrapper, { button: 1, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 150, clientY: 120 });
      fireEvent.mouseUp(document);

      const panOffsetBeforeZoom = { ...canvasStore.panOffset };
      expect(panOffsetBeforeZoom.x).toBe(50);
      expect(panOffsetBeforeZoom.y).toBe(20);

      fireEvent.wheel(wrapper, { deltaY: -100, clientX: 200, clientY: 150, ctrlKey: true });

      expect(canvasStore.zoomLevel).toBeGreaterThan(1.0);
    });

    it('should handle rapid Ctrl+wheel scrolling (multiple events)', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      for (let i = 0; i < 5; i++) {
        fireEvent.wheel(wrapper, { deltaY: -100, clientX: 200, clientY: 150, ctrlKey: true });
      }

      expect(canvasStore.zoomLevel).toBeGreaterThan(1.5);
    });

    it('should stop at MAX_ZOOM limit when zooming in excessively', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      for (let i = 0; i < 20; i++) {
        fireEvent.wheel(wrapper, { deltaY: -100, clientX: 200, clientY: 150, ctrlKey: true });
      }

      expect(canvasStore.zoomLevel).toBe(5.0);
    });

    it('should stop at MIN_ZOOM limit when zooming out excessively', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      for (let i = 0; i < 30; i++) {
        fireEvent.wheel(wrapper, { deltaY: 100, clientX: 200, clientY: 150, ctrlKey: true });
      }

      expect(canvasStore.zoomLevel).toBe(0.1);
    });
  });

  describe('Given canvas with content (US1 - Keyboard Zoom)', () => {
    beforeEach(() => {
      resetPan();
      resetZoom();
      vi.clearAllMocks();
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
              },
            },
          },
        },
      };
    });

    it('should trigger zoomIn when + key pressed and canvas has focus', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Focus the wrapper and press + key
      wrapper.focus();
      fireEvent.keyDown(wrapper, { key: '+' });

      expect(zoomIn).toHaveBeenCalled();
    });

    it('should trigger zoomIn when = key pressed and canvas has focus (alternative key)', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Focus the wrapper and press = key (same physical key as + without Shift)
      wrapper.focus();
      fireEvent.keyDown(wrapper, { key: '=' });

      expect(zoomIn).toHaveBeenCalled();
    });

    it('should trigger zoomOut when - key pressed and canvas has focus', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Focus the wrapper and press - key
      wrapper.focus();
      fireEvent.keyDown(wrapper, { key: '-' });

      expect(zoomOut).toHaveBeenCalled();
    });

    it('should not trigger zoom when modifier keys are held (prevents browser shortcuts conflict)', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      wrapper.focus();

      // Ctrl++ should not trigger our zoom (browser zoom)
      fireEvent.keyDown(wrapper, { key: '+', ctrlKey: true });
      expect(zoomIn).not.toHaveBeenCalled();

      // Cmd++ should not trigger our zoom (browser zoom on Mac)
      fireEvent.keyDown(wrapper, { key: '+', metaKey: true });
      expect(zoomIn).not.toHaveBeenCalled();
    });
  });

  describe('Given canvas with content (US2 - Reset Keyboard Shortcut)', () => {
    beforeEach(() => {
      resetPan();
      resetZoom();
      vi.clearAllMocks();
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
              },
            },
          },
        },
      };
    });

    it('should trigger resetZoom when 0 key pressed and canvas has focus', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      wrapper.focus();
      fireEvent.keyDown(wrapper, { key: '0' });

      expect(resetZoom).toHaveBeenCalled();
    });

    it('should not trigger resetZoom when modifier keys are held', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      wrapper.focus();

      // Ctrl+0 should not trigger our reset (browser zoom reset)
      fireEvent.keyDown(wrapper, { key: '0', ctrlKey: true });
      expect(resetZoom).not.toHaveBeenCalled();

      // Cmd+0 should not trigger our reset (browser zoom reset on Mac)
      fireEvent.keyDown(wrapper, { key: '0', metaKey: true });
      expect(resetZoom).not.toHaveBeenCalled();
    });
  });

  describe('Given canvas with content (US3 - Fit to View Keyboard Shortcut)', () => {
    beforeEach(() => {
      resetPan();
      resetZoom();
      vi.clearAllMocks();
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
              },
            },
          },
        },
      };
    });

    it('should trigger fitToView when F key pressed and canvas has focus', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      wrapper.focus();
      fireEvent.keyDown(wrapper, { key: 'f' });

      expect(fitToView).toHaveBeenCalled();
    });

    it('should trigger fitToView when uppercase F key pressed', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      wrapper.focus();
      fireEvent.keyDown(wrapper, { key: 'F' });

      expect(fitToView).toHaveBeenCalled();
    });

    it('should not trigger fitToView when modifier keys are held', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      wrapper.focus();

      // Ctrl+F should not trigger fit (browser find)
      fireEvent.keyDown(wrapper, { key: 'f', ctrlKey: true });
      expect(fitToView).not.toHaveBeenCalled();

      // Cmd+F should not trigger fit (browser find on Mac)
      fireEvent.keyDown(wrapper, { key: 'f', metaKey: true });
      expect(fitToView).not.toHaveBeenCalled();
    });
  });

  describe('Given canvas with content (FR-013 - Keyboard Filter)', () => {
    beforeEach(() => {
      resetPan();
      resetZoom();
      vi.clearAllMocks();
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
              },
            },
          },
        },
      };
    });

    it('should ignore keyboard shortcuts when focus is in a text input element', () => {
      render(() => (
        <div>
          <Canvas />
          <input type="text" data-testid="text-input" />
        </div>
      ));

      const textInput = screen.getByTestId('text-input');

      // Focus the text input and fire keyboard event
      textInput.focus();

      // Simulate keydown event bubbling from input to canvas wrapper
      fireEvent.keyDown(textInput, { key: '+', bubbles: true });
      fireEvent.keyDown(textInput, { key: '-', bubbles: true });
      fireEvent.keyDown(textInput, { key: '0', bubbles: true });
      fireEvent.keyDown(textInput, { key: 'f', bubbles: true });

      // None of the zoom functions should be called
      expect(zoomIn).not.toHaveBeenCalled();
      expect(zoomOut).not.toHaveBeenCalled();
      expect(resetZoom).not.toHaveBeenCalled();
      expect(fitToView).not.toHaveBeenCalled();
    });

    it('should ignore keyboard shortcuts when focus is in a textarea element', () => {
      render(() => (
        <div>
          <Canvas />
          <textarea data-testid="textarea" />
        </div>
      ));

      const textarea = screen.getByTestId('textarea');

      // Focus the textarea and fire keyboard event
      textarea.focus();

      // Simulate keydown event bubbling from textarea
      fireEvent.keyDown(textarea, { key: '+', bubbles: true });
      fireEvent.keyDown(textarea, { key: '-', bubbles: true });

      // Zoom functions should not be called
      expect(zoomIn).not.toHaveBeenCalled();
      expect(zoomOut).not.toHaveBeenCalled();
    });
  });

  describe('Given canvas with content (Grid Toggle - G Key)', () => {
    beforeEach(() => {
      resetPan();
      resetZoom();
      resetGrid();
      vi.clearAllMocks();
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
              },
            },
          },
        },
      };
    });

    it('should trigger toggleVisibility when G key pressed and canvas has focus', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      wrapper.focus();
      fireEvent.keyDown(wrapper, { key: 'g' });

      expect(toggleVisibility).toHaveBeenCalled();
    });

    it('should trigger toggleVisibility when uppercase G key pressed', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      wrapper.focus();
      fireEvent.keyDown(wrapper, { key: 'G' });

      expect(toggleVisibility).toHaveBeenCalled();
    });

    it('should not trigger toggleVisibility when Ctrl+G is pressed', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      wrapper.focus();
      fireEvent.keyDown(wrapper, { key: 'g', ctrlKey: true });

      expect(toggleVisibility).not.toHaveBeenCalled();
    });

    it('should not trigger toggleVisibility when Cmd+G is pressed (Mac)', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      wrapper.focus();
      fireEvent.keyDown(wrapper, { key: 'g', metaKey: true });

      expect(toggleVisibility).not.toHaveBeenCalled();
    });

    it('should not trigger toggleVisibility when Alt+G is pressed', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      wrapper.focus();
      fireEvent.keyDown(wrapper, { key: 'g', altKey: true });

      expect(toggleVisibility).not.toHaveBeenCalled();
    });

    it('should not trigger toggleVisibility when focus is in a text input', () => {
      render(() => (
        <div>
          <Canvas />
          <input type="text" data-testid="text-input" />
        </div>
      ));

      const textInput = screen.getByTestId('text-input');
      textInput.focus();

      fireEvent.keyDown(textInput, { key: 'g', bubbles: true });

      expect(toggleVisibility).not.toHaveBeenCalled();
    });

    it('should not trigger toggleVisibility when focus is in a textarea', () => {
      render(() => (
        <div>
          <Canvas />
          <textarea data-testid="textarea" />
        </div>
      ));

      const textarea = screen.getByTestId('textarea');
      textarea.focus();

      fireEvent.keyDown(textarea, { key: 'g', bubbles: true });

      expect(toggleVisibility).not.toHaveBeenCalled();
    });
  });
});
