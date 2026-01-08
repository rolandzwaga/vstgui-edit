import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { ColorsPanel } from '../ColorsPanel';

const mockDocumentStore = vi.hoisted(() => ({
  document: null as unknown,
}));

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
  getColors: () => {
    const doc = mockDocumentStore.document as {
      'vstgui-ui-description'?: { colors?: Record<string, string> };
    } | null;
    return doc?.['vstgui-ui-description']?.colors;
  },
}));

async function expandSection() {
  const header = screen.getByRole('button', { name: /Colors/i });
  await fireEvent.click(header);
}

describe('ColorsPanel', () => {
  beforeEach(() => {
    mockDocumentStore.document = null;
  });

  describe('given no document loaded', () => {
    it('should render empty state', async () => {
      render(() => <ColorsPanel />);
      await expandSection();

      expect(screen.getByTestId('colors-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No colors defined')).toBeInTheDocument();
    });
  });

  describe('given document with no colors section', () => {
    it('should render empty state', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
        },
      };

      render(() => <ColorsPanel />);
      await expandSection();

      expect(screen.getByTestId('colors-empty-state')).toBeInTheDocument();
    });
  });

  describe('given document with empty colors', () => {
    it('should render empty state', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          colors: {},
        },
      };

      render(() => <ColorsPanel />);
      await expandSection();

      expect(screen.getByTestId('colors-empty-state')).toBeInTheDocument();
    });
  });

  describe('given document with colors', () => {
    it('should render color items', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          colors: {
            Primary: '#FF0000FF',
            Secondary: '#00FF00FF',
          },
        },
      };

      render(() => <ColorsPanel />);
      await expandSection();

      expect(screen.queryByTestId('colors-empty-state')).not.toBeInTheDocument();
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
    });

    it('should render color values', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          colors: {
            Red: '#FF0000FF',
          },
        },
      };

      render(() => <ColorsPanel />);
      await expandSection();

      expect(screen.getByText('#ff0000ff')).toBeInTheDocument();
    });

    it('should render panel header with title', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          colors: {
            Test: '#000000FF',
          },
        },
      };

      render(() => <ColorsPanel />);

      expect(screen.getByText('Colors')).toBeInTheDocument();
    });
  });

  describe('given panel structure', () => {
    it('should have colors-panel testid', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          colors: {},
        },
      };

      render(() => <ColorsPanel />);

      expect(screen.getByTestId('colors-panel')).toBeInTheDocument();
    });
  });

  describe('given ARIA attributes (accessibility)', () => {
    it('should have role="list" for colors list', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          colors: {
            Test: '#000000FF',
          },
        },
      };

      render(() => <ColorsPanel />);
      await expandSection();

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });

    it('should have aria-label for colors list', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          colors: {
            Test: '#000000FF',
          },
        },
      };

      render(() => <ColorsPanel />);
      await expandSection();

      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('aria-label', 'Color definitions');
    });
  });
});
