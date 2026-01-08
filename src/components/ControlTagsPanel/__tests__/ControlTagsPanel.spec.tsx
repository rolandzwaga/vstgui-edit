import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { ControlTagsPanel } from '../ControlTagsPanel';

const mockDocumentStore = vi.hoisted(() => ({
  document: null as unknown,
}));

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
  getControlTags: () => {
    const doc = mockDocumentStore.document as {
      'vstgui-ui-description'?: { 'control-tags'?: Record<string, string> };
    } | null;
    return doc?.['vstgui-ui-description']?.['control-tags'];
  },
  addControlTag: vi.fn(() => true),
  deleteControlTag: vi.fn(() => ({ tagId: '0', removedReferences: [] })),
  updateControlTagName: vi.fn(() => true),
  updateControlTagId: vi.fn(() => '0'),
  restoreControlTagReference: vi.fn(() => true),
}));

vi.mock('../../../stores/historyStore', () => ({
  pushOperation: vi.fn(),
}));

vi.mock('../../../domain/controlTags/usage', () => ({
  findControlTagUsages: vi.fn(() => []),
}));

describe('ControlTagsPanel', () => {
  beforeEach(() => {
    mockDocumentStore.document = null;
  });

  describe('given no document loaded', () => {
    it('should render empty state', () => {
      render(() => <ControlTagsPanel />);

      expect(screen.getByTestId('control-tags-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No control tags defined')).toBeInTheDocument();
    });
  });

  describe('given document with no control-tags section', () => {
    it('should render empty state', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
        },
      };

      render(() => <ControlTagsPanel />);

      expect(screen.getByTestId('control-tags-empty-state')).toBeInTheDocument();
    });
  });

  describe('given document with empty control-tags', () => {
    it('should render empty state', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          'control-tags': {},
        },
      };

      render(() => <ControlTagsPanel />);

      expect(screen.getByTestId('control-tags-empty-state')).toBeInTheDocument();
    });
  });

  describe('given document with control-tags', () => {
    it('should render control tag items', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          'control-tags': {
            Volume: '0',
            Pan: '1',
            Bypass: '2',
          },
        },
      };

      render(() => <ControlTagsPanel />);

      expect(screen.queryByTestId('control-tags-empty-state')).not.toBeInTheDocument();
      expect(screen.getByText('Volume')).toBeInTheDocument();
      expect(screen.getByText('Pan')).toBeInTheDocument();
      expect(screen.getByText('Bypass')).toBeInTheDocument();
    });

    it('should display tag IDs', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          'control-tags': {
            Volume: '0',
            Pan: '1',
          },
        },
      };

      render(() => <ControlTagsPanel />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should render panel header with title', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          'control-tags': {
            Volume: '0',
          },
        },
      };

      render(() => <ControlTagsPanel />);

      expect(screen.getByText('Control Tags')).toBeInTheDocument();
    });

    it('should render add button', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          'control-tags': {},
        },
      };

      render(() => <ControlTagsPanel />);

      expect(screen.getByTestId('add-control-tag-button')).toBeInTheDocument();
    });
  });

  describe('given no document', () => {
    it('should disable add button', () => {
      mockDocumentStore.document = null;

      render(() => <ControlTagsPanel />);

      expect(screen.getByTestId('add-control-tag-button')).toBeDisabled();
    });
  });

  describe('given document loaded', () => {
    it('should enable add button', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          'control-tags': {},
        },
      };

      render(() => <ControlTagsPanel />);

      expect(screen.getByTestId('add-control-tag-button')).not.toBeDisabled();
    });
  });
});
