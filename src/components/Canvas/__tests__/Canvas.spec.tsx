import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@solidjs/testing-library';
import { Canvas } from '../Canvas';

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
});
