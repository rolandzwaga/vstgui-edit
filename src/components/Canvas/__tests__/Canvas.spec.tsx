import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@solidjs/testing-library';
import { canvasStore, resetPan, resetZoom } from '../../../stores/canvasStore';
import { Canvas } from '../Canvas';
import styles from '../Canvas.module.css';

// Define mock store using vi.hoisted so it's available in vi.mock
const mockDocumentStore = vi.hoisted(() => ({
  document: null as unknown,
}));

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
}));

describe('Canvas', () => {
  beforeEach(() => {
    mockDocumentStore.document = null;
  });

  afterEach(() => {
    cleanup();
  });

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

      // Verify parent appears before child in DOM
      const parentView = screen.getByTestId('view-MainView');
      const childView = screen.getByTestId('view-childButton');

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

      // Verify correct DOM order: MainView -> panel -> nestedButton
      const mainView = screen.getByTestId('view-MainView');
      const panelView = screen.getByTestId('view-panel');
      const nestedButton = screen.getByTestId('view-nestedButton');

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
      const viewRect = screen.getByTestId('view-button');

      // Middle-click on the view element
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

    it('should increase zoomLevel when wheel scrolls up (deltaY < 0)', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Scroll up (zoom in)
      fireEvent.wheel(wrapper, { deltaY: -100, clientX: 200, clientY: 150 });

      expect(canvasStore.zoomLevel).toBeGreaterThan(1.0);
    });

    it('should decrease zoomLevel when wheel scrolls down (deltaY > 0)', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Scroll down (zoom out)
      fireEvent.wheel(wrapper, { deltaY: 100, clientX: 200, clientY: 150 });

      expect(canvasStore.zoomLevel).toBeLessThan(1.0);
    });

    it('should prevent default browser zoom on wheel event', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      const event = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 200,
        clientY: 150,
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

      // Zoom in
      fireEvent.wheel(wrapper, { deltaY: -100, clientX: 200, clientY: 150 });

      // Transform should include scale
      expect(wrapper.style.transform).toContain('scale(');
    });

    it('should handle zoom with cursor outside canvas bounds', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Zoom with cursor at extreme position
      fireEvent.wheel(wrapper, { deltaY: -100, clientX: 1000, clientY: 1000 });

      // Should still zoom without error
      expect(canvasStore.zoomLevel).toBeGreaterThan(1.0);
    });

    it('should handle zoom interaction with existing pan offset', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Pan first
      fireEvent.mouseDown(wrapper, { button: 1, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 150, clientY: 120 });
      fireEvent.mouseUp(document);

      const panOffsetBeforeZoom = { ...canvasStore.panOffset };
      expect(panOffsetBeforeZoom.x).toBe(50);
      expect(panOffsetBeforeZoom.y).toBe(20);

      // Now zoom - pan should be adjusted for cursor centering
      fireEvent.wheel(wrapper, { deltaY: -100, clientX: 200, clientY: 150 });

      // Zoom should change
      expect(canvasStore.zoomLevel).toBeGreaterThan(1.0);
      // Pan should be adjusted (won't be the same as before)
      // Just verify we can zoom after panning without error
    });

    it('should handle rapid wheel scrolling (multiple events)', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Rapid zoom in - 5 consecutive wheel events
      for (let i = 0; i < 5; i++) {
        fireEvent.wheel(wrapper, { deltaY: -100, clientX: 200, clientY: 150 });
      }

      // Zoom should be significantly greater than 1.0 (approximately 1.1^5 ≈ 1.61)
      expect(canvasStore.zoomLevel).toBeGreaterThan(1.5);
    });

    it('should stop at MAX_ZOOM limit when zooming in excessively', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Zoom in many times to hit the limit (1.1^20 ≈ 6.7, but should cap at 5.0)
      for (let i = 0; i < 20; i++) {
        fireEvent.wheel(wrapper, { deltaY: -100, clientX: 200, clientY: 150 });
      }

      // Should be capped at MAX_ZOOM (5.0)
      expect(canvasStore.zoomLevel).toBe(5.0);
    });

    it('should stop at MIN_ZOOM limit when zooming out excessively', () => {
      render(() => <Canvas />);
      const wrapper = screen.getByTestId('canvas-wrapper');

      // Zoom out many times to hit the limit (1/1.1^30 ≈ 0.042, but should cap at 0.1)
      for (let i = 0; i < 30; i++) {
        fireEvent.wheel(wrapper, { deltaY: 100, clientX: 200, clientY: 150 });
      }

      // Should be capped at MIN_ZOOM (0.1)
      expect(canvasStore.zoomLevel).toBe(0.1);
    });
  });
});
