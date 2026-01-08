import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { FontsPanel } from '../FontsPanel';

const mockDocumentStore = vi.hoisted(() => ({
  document: null as unknown,
}));

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
  getFonts: () => {
    const doc = mockDocumentStore.document as {
      'vstgui-ui-description'?: { fonts?: Record<string, unknown> };
    } | null;
    return doc?.['vstgui-ui-description']?.fonts;
  },
  addFont: vi.fn(() => true),
  deleteFont: vi.fn(() => ({ font: {}, removedReferences: [] })),
  updateFontName: vi.fn(() => true),
  updateFontProperty: vi.fn(() => null),
  updateViewAttribute: vi.fn(),
}));

vi.mock('../../../stores/historyStore', () => ({
  pushOperation: vi.fn(),
}));

vi.mock('../../../domain/fonts/usage', () => ({
  findFontUsages: vi.fn(() => []),
}));

async function expandSection() {
  const header = screen.getByRole('button', { name: /Fonts/i });
  await fireEvent.click(header);
}

describe('FontsPanel', () => {
  beforeEach(() => {
    mockDocumentStore.document = null;
  });

  describe('given no document loaded', () => {
    it('should render empty state', async () => {
      render(() => <FontsPanel />);
      await expandSection();

      expect(screen.getByTestId('fonts-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No fonts defined')).toBeInTheDocument();
    });
  });

  describe('given document with no fonts section', () => {
    it('should render empty state', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
        },
      };

      render(() => <FontsPanel />);
      await expandSection();

      expect(screen.getByTestId('fonts-empty-state')).toBeInTheDocument();
    });
  });

  describe('given document with empty fonts', () => {
    it('should render empty state', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          fonts: {},
        },
      };

      render(() => <FontsPanel />);
      await expandSection();

      expect(screen.getByTestId('fonts-empty-state')).toBeInTheDocument();
    });
  });

  describe('given document with fonts', () => {
    it('should render font items', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          fonts: {
            TitleFont: { 'font-name': 'Arial', size: '14' },
            BodyFont: { 'font-name': 'Helvetica', size: '12' },
          },
        },
      };

      render(() => <FontsPanel />);
      await expandSection();

      expect(screen.queryByTestId('fonts-empty-state')).not.toBeInTheDocument();
      expect(screen.getByText('TitleFont')).toBeInTheDocument();
      expect(screen.getByText('BodyFont')).toBeInTheDocument();
    });

    it('should render panel header with title', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          fonts: {
            TestFont: { 'font-name': 'Arial', size: '12' },
          },
        },
      };

      render(() => <FontsPanel />);

      expect(screen.getByText('Fonts')).toBeInTheDocument();
    });

    it('should render add button', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          fonts: {},
        },
      };

      render(() => <FontsPanel />);

      expect(screen.getByTestId('add-font-button')).toBeInTheDocument();
    });
  });

  describe('given no document', () => {
    it('should disable add button', () => {
      mockDocumentStore.document = null;

      render(() => <FontsPanel />);

      expect(screen.getByTestId('add-font-button')).toBeDisabled();
    });
  });

  describe('given document loaded', () => {
    it('should enable add button', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          fonts: {},
        },
      };

      render(() => <FontsPanel />);

      expect(screen.getByTestId('add-font-button')).not.toBeDisabled();
    });
  });
});
