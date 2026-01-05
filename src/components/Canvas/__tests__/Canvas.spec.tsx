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
});
