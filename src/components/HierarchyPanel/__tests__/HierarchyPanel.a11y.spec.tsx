import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { resetSelection } from '../../../stores/selectionStore';
import { resetHierarchy, expandAll } from '../../../stores/hierarchyStore';
import { HierarchyPanel } from '../HierarchyPanel';

const mockDocumentStore = vi.hoisted(() => ({
  document: null as unknown,
}));

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
}));

describe('HierarchyPanel accessibility', () => {
  beforeEach(() => {
    mockDocumentStore.document = null;
    testInRoot(() => {
      resetSelection();
      resetHierarchy();
    });
  });

  describe('given keyboard navigation', () => {
    it('should allow Tab to focus tree nodes', () => {
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

      const row = screen.getByTestId('tree-node-MainView');
      expect(row).toHaveAttribute('tabindex', '0');
    });

    it('should select node on Enter key', async () => {
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

      const row = screen.getByTestId('tree-node-MainView');
      row.focus();
      fireEvent.keyDown(row, { key: 'Enter' });

      await Promise.resolve();

      expect(row).toHaveAttribute('aria-selected', 'true');
    });

    it('should select node on Space key', async () => {
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

      const row = screen.getByTestId('tree-node-MainView');
      row.focus();
      fireEvent.keyDown(row, { key: ' ' });

      await Promise.resolve();

      expect(row).toHaveAttribute('aria-selected', 'true');
    });

    it('should expand collapsed container on ArrowRight', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer' },
              children: {
                Child: { attributes: { class: 'CTextLabel' } },
              },
            },
          },
        },
      };

      render(() => <HierarchyPanel />);

      const row = screen.getByTestId('tree-node-MainView');

      fireEvent.keyDown(row, { key: 'ArrowLeft' });
      await Promise.resolve();
      expect(row).toHaveAttribute('aria-expanded', 'false');

      fireEvent.keyDown(row, { key: 'ArrowRight' });
      await Promise.resolve();

      expect(row).toHaveAttribute('aria-expanded', 'true');
    });

    it('should not expand already expanded container on ArrowRight', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer' },
              children: {
                Child: { attributes: { class: 'CTextLabel' } },
              },
            },
          },
        },
      };

      testInRoot(() => {
        resetHierarchy();
        expandAll(['MainView']);
      });

      render(() => <HierarchyPanel />);

      const row = screen.getByTestId('tree-node-MainView');
      expect(row).toHaveAttribute('aria-expanded', 'true');

      fireEvent.keyDown(row, { key: 'ArrowRight' });
      await Promise.resolve();

      expect(row).toHaveAttribute('aria-expanded', 'true');
    });

    it('should collapse expanded container on ArrowLeft', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer' },
              children: {
                Child: { attributes: { class: 'CTextLabel' } },
              },
            },
          },
        },
      };

      testInRoot(() => {
        resetHierarchy();
        expandAll(['MainView']);
      });

      render(() => <HierarchyPanel />);

      const row = screen.getByTestId('tree-node-MainView');
      expect(row).toHaveAttribute('aria-expanded', 'true');

      fireEvent.keyDown(row, { key: 'ArrowLeft' });
      await Promise.resolve();

      expect(row).toHaveAttribute('aria-expanded', 'false');
    });

    it('should not collapse already collapsed container on ArrowLeft', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer' },
              children: {
                Child: { attributes: { class: 'CTextLabel' } },
              },
            },
          },
        },
      };

      render(() => <HierarchyPanel />);

      const row = screen.getByTestId('tree-node-MainView');

      fireEvent.keyDown(row, { key: 'ArrowLeft' });
      await Promise.resolve();
      expect(row).toHaveAttribute('aria-expanded', 'false');

      fireEvent.keyDown(row, { key: 'ArrowLeft' });
      await Promise.resolve();

      expect(row).toHaveAttribute('aria-expanded', 'false');
    });

    it('should ignore ArrowRight/ArrowLeft on leaf nodes', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CTextLabel' },
            },
          },
        },
      };

      render(() => <HierarchyPanel />);

      const row = screen.getByTestId('tree-node-MainView');
      expect(row).not.toHaveAttribute('aria-expanded');

      fireEvent.keyDown(row, { key: 'ArrowRight' });
      fireEvent.keyDown(row, { key: 'ArrowLeft' });
      await Promise.resolve();

      expect(row).not.toHaveAttribute('aria-expanded');
    });

    it('should ignore unknown keys', async () => {
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

      const row = screen.getByTestId('tree-node-MainView');
      fireEvent.keyDown(row, { key: 'Tab' });
      fireEvent.keyDown(row, { key: 'a' });
      await Promise.resolve();

      expect(row).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('given focus styles', () => {
    it('should have visible focus indicator', () => {
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

      const row = screen.getByTestId('tree-node-MainView');
      row.focus();

      expect(document.activeElement).toBe(row);
    });
  });
});
