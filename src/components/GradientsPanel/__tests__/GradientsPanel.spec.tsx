import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { GradientsPanel } from '../GradientsPanel';

const mockDocumentStore = vi.hoisted(() => ({
  document: null as unknown,
}));

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
  getGradients: () => {
    const doc = mockDocumentStore.document as {
      'vstgui-ui-description'?: { gradients?: Record<string, unknown> };
    } | null;
    return doc?.['vstgui-ui-description']?.gradients;
  },
  addGradient: vi.fn(() => true),
  deleteGradient: vi.fn(() => ({ stops: [], removedReferences: [] })),
  updateGradientName: vi.fn(() => true),
  updateGradientStops: vi.fn(() => null),
  updateViewAttribute: vi.fn(),
}));

vi.mock('../../../stores/historyStore', () => ({
  pushOperation: vi.fn(),
}));

vi.mock('../../../domain/gradients/usage', () => ({
  findGradientUsages: vi.fn(() => []),
}));

async function expandSection() {
  const header = screen.getByRole('button', { name: /Gradients/i });
  await fireEvent.click(header);
}

describe('GradientsPanel', () => {
  beforeEach(() => {
    mockDocumentStore.document = null;
  });

  describe('given no document loaded', () => {
    it('should render empty state', async () => {
      render(() => <GradientsPanel />);
      await expandSection();

      expect(screen.getByTestId('gradients-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No gradients defined')).toBeInTheDocument();
    });
  });

  describe('given document with no gradients section', () => {
    it('should render empty state', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
        },
      };

      render(() => <GradientsPanel />);
      await expandSection();

      expect(screen.getByTestId('gradients-empty-state')).toBeInTheDocument();
    });
  });

  describe('given document with empty gradients', () => {
    it('should render empty state', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          gradients: {},
        },
      };

      render(() => <GradientsPanel />);
      await expandSection();

      expect(screen.getByTestId('gradients-empty-state')).toBeInTheDocument();
    });
  });

  describe('given document with gradients', () => {
    it('should render gradient items', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          gradients: {
            'Background Gradient': [
              { rgba: '#000000FF', start: '0.00' },
              { rgba: '#FFFFFFFF', start: '1.00' },
            ],
            'Highlight Gradient': [
              { rgba: '#FF0000FF', start: '0.00' },
              { rgba: '#00FF00FF', start: '0.50' },
              { rgba: '#0000FFFF', start: '1.00' },
            ],
          },
        },
      };

      render(() => <GradientsPanel />);
      await expandSection();

      expect(screen.queryByTestId('gradients-empty-state')).not.toBeInTheDocument();
      expect(screen.getByText('Background Gradient')).toBeInTheDocument();
      expect(screen.getByText('Highlight Gradient')).toBeInTheDocument();
    });

    it('should render panel header with title', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          gradients: {
            TestGradient: [
              { rgba: '#000000FF', start: '0.00' },
              { rgba: '#FFFFFFFF', start: '1.00' },
            ],
          },
        },
      };

      render(() => <GradientsPanel />);

      expect(screen.getByText('Gradients')).toBeInTheDocument();
    });

    it('should render gradient previews', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          gradients: {
            TestGradient: [
              { rgba: '#000000FF', start: '0.00' },
              { rgba: '#FFFFFFFF', start: '1.00' },
            ],
          },
        },
      };

      render(() => <GradientsPanel />);
      await expandSection();

      expect(screen.getAllByTestId('gradient-preview')).toHaveLength(1);
    });
  });

  describe('given no document', () => {
    it('should disable add button', () => {
      mockDocumentStore.document = null;

      render(() => <GradientsPanel />);

      expect(screen.getByTestId('add-gradient-button')).toBeDisabled();
    });
  });

  describe('given document loaded', () => {
    it('should enable add button', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          gradients: {},
        },
      };

      render(() => <GradientsPanel />);

      expect(screen.getByTestId('add-gradient-button')).not.toBeDisabled();
    });
  });
});
