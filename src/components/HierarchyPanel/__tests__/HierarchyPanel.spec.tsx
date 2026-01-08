import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { HierarchyPanel } from '../HierarchyPanel';
import { resetHierarchy } from '../../../stores/hierarchyStore';
import { testInRoot } from '../../../__tests__/helpers/solidjs';

const mockDocumentStore = vi.hoisted(() => ({
  document: null as unknown,
}));

const mockTemplateStore = vi.hoisted(() => ({
  activeTemplateId: 'MainView' as string | null,
}));

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
  getTemplate: (name: string) => {
    const doc = mockDocumentStore.document as { 'vstgui-ui-description'?: { templates?: Record<string, unknown> } } | null;
    return doc?.['vstgui-ui-description']?.templates?.[name];
  },
}));

vi.mock('../../../stores/templateStore', () => ({
  templateStore: mockTemplateStore,
}));

describe('HierarchyPanel', () => {
  beforeEach(() => {
    mockDocumentStore.document = null;
    mockTemplateStore.activeTemplateId = 'MainView';
    testInRoot(() => {
      resetHierarchy();
    });
  });

  describe('given no document loaded', () => {
    it('should render empty state', () => {
      render(() => <HierarchyPanel />);

      expect(screen.getByText('No template loaded')).toBeInTheDocument();
    });
  });

  describe('given document with template', () => {
    it('should render tree with root view', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer', size: '400, 300' },
            },
          },
        },
      };

      render(() => <HierarchyPanel />);

      expect(screen.getByText('CViewContainer')).toBeInTheDocument();
    });

    it('should render nested views', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer', size: '400, 300' },
              children: {
                button: { attributes: { class: 'CTextButton' } },
                label: { attributes: { class: 'CTextLabel' } },
              },
            },
          },
        },
      };

      render(() => <HierarchyPanel />);

      expect(screen.getByText('CViewContainer')).toBeInTheDocument();
      expect(screen.getByText('CTextButton')).toBeInTheDocument();
      expect(screen.getByText('CTextLabel')).toBeInTheDocument();
    });
  });

  describe('given empty template (edge case)', () => {
    it('should render root with no children', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            EmptyView: {
              attributes: { class: 'CViewContainer', size: '800, 600' },
            },
          },
        },
      };
      mockTemplateStore.activeTemplateId = 'EmptyView';

      render(() => <HierarchyPanel />);

      expect(screen.getByText('CViewContainer')).toBeInTheDocument();
    });
  });

  describe('given ARIA attributes (accessibility)', () => {
    it('should have role="tree"', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer' },
            },
          },
        },
      };

      render(() => <HierarchyPanel />);

      const tree = screen.getByRole('tree');
      expect(tree).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer' },
            },
          },
        },
      };

      render(() => <HierarchyPanel />);

      const tree = screen.getByRole('tree');
      expect(tree).toHaveAttribute('aria-label', 'View hierarchy');
    });
  });
});
