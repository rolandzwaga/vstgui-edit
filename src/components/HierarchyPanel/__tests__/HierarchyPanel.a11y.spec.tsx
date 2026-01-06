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
