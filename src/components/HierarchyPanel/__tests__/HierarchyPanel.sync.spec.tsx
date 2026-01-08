import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { select, resetSelection } from '../../../stores/selectionStore';
import { resetHierarchy, isExpanded } from '../../../stores/hierarchyStore';
import { HierarchyPanel } from '../HierarchyPanel';
import { vi } from 'vitest';

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

async function expandPanelSection() {
  const header = screen.getByRole('button', { name: /Hierarchy/i });
  await fireEvent.click(header);
}

describe('HierarchyPanel canvas-to-tree sync', () => {
  beforeEach(() => {
    mockDocumentStore.document = null;
    mockTemplateStore.activeTemplateId = 'MainView';
    testInRoot(() => {
      resetSelection();
      resetHierarchy();
    });
  });

  describe('given canvas selection changes', () => {
    it('should show selected state in tree', async () => {
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
      await expandPanelSection();

      testInRoot(() => {
        select('MainView');
      });

      const row = screen.getByTestId('tree-node-MainView');
      expect(row.className).toContain('selected');
    });

    it('should auto-expand ancestors when selecting nested view', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer', size: '400, 300' },
              children: {
                panel: {
                  attributes: { class: 'CViewContainer' },
                  children: {
                    button: { attributes: { class: 'CTextButton' } },
                  },
                },
              },
            },
          },
        },
      };

      render(() => <HierarchyPanel />);
      await expandPanelSection();

      testInRoot(() => {
        resetHierarchy();
        select('MainView-panel-button');
      });

      await Promise.resolve();

      testInRoot(() => {
        expect(isExpanded('MainView')).toBe(true);
        expect(isExpanded('MainView-panel')).toBe(true);
      });
    });
  });

  describe('given multi-selection on canvas', () => {
    it('should show all selected nodes in tree', async () => {
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
      await expandPanelSection();

      testInRoot(() => {
        select('MainView-button');
      });

      const buttonRow = screen.getByTestId('tree-node-MainView-button');
      expect(buttonRow.className).toContain('selected');
    });
  });
});
