import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { PropertiesPanel } from '../PropertiesPanel';
import { resetSelection, select } from '../../../stores/selectionStore';
import { resetProperties } from '../../../stores/propertiesStore';
import { testInRoot } from '../../../__tests__/helpers/solidjs';

const mockDocumentStore = vi.hoisted(() => ({
  document: null as unknown,
}));

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
}));

describe('PropertiesPanel', () => {
  beforeEach(() => {
    mockDocumentStore.document = null;
    testInRoot(() => {
      resetSelection();
      resetProperties();
    });
  });

  describe('empty state', () => {
    it('should show empty state when no selection', () => {
      render(() => <PropertiesPanel />);

      expect(screen.getByTestId('properties-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No selection')).toBeInTheDocument();
    });

    it('should have properties-panel test id', () => {
      render(() => <PropertiesPanel />);

      expect(screen.getByTestId('properties-panel')).toBeInTheDocument();
    });
  });

  describe('single selection', () => {
    beforeEach(() => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
                'background-color': '#FF5500FF',
              },
              children: {
                button: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '10, 20',
                    size: '100, 30',
                    title: 'Click Me',
                  },
                },
              },
            },
          },
        },
      };
    });

    it('should show properties when view is selected', () => {
      testInRoot(() => {
        select('button');
      });

      render(() => <PropertiesPanel />);

      expect(screen.queryByTestId('properties-empty-state')).not.toBeInTheDocument();
      expect(screen.getByTestId('properties-header')).toBeInTheDocument();
    });

    it('should display class name in header', () => {
      testInRoot(() => {
        select('button');
      });

      render(() => <PropertiesPanel />);

      expect(screen.getByTestId('properties-header')).toHaveTextContent('CTextButton');
    });

    it('should display attribute groups', () => {
      testInRoot(() => {
        select('button');
      });

      render(() => <PropertiesPanel />);

      expect(screen.getByText('Identity')).toBeInTheDocument();
      expect(screen.getByText('Geometry')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('should display attribute values', () => {
      testInRoot(() => {
        select('button');
      });

      render(() => <PropertiesPanel />);

      expect(screen.getByText('10, 20')).toBeInTheDocument();
      expect(screen.getByText('100, 30')).toBeInTheDocument();
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });
  });

  describe('selection change reactivity', () => {
    beforeEach(() => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer' },
              children: {
                view1: {
                  attributes: { class: 'CTextButton', title: 'Button 1' },
                },
                view2: {
                  attributes: { class: 'CTextLabel', title: 'Label 2' },
                },
              },
            },
          },
        },
      };
    });

    it('should update when selection changes', () => {
      testInRoot(() => {
        select('view1');
      });

      render(() => <PropertiesPanel />);
      expect(screen.getByTestId('properties-header')).toHaveTextContent('CTextButton');

      testInRoot(() => {
        select('view2');
      });

      expect(screen.getByTestId('properties-header')).toHaveTextContent('CTextLabel');
    });

    it('should show empty state when selection is cleared', () => {
      testInRoot(() => {
        select('view1');
      });

      render(() => <PropertiesPanel />);
      expect(screen.queryByTestId('properties-empty-state')).not.toBeInTheDocument();

      testInRoot(() => {
        resetSelection();
      });

      expect(screen.getByTestId('properties-empty-state')).toBeInTheDocument();
    });
  });
});
