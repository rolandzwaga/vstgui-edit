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
        select('MainView-button');
      });

      render(() => <PropertiesPanel />);

      expect(screen.queryByTestId('properties-empty-state')).not.toBeInTheDocument();
      expect(screen.getByTestId('properties-header')).toBeInTheDocument();
    });

    it('should display class name in header', () => {
      testInRoot(() => {
        select('MainView-button');
      });

      render(() => <PropertiesPanel />);

      expect(screen.getByTestId('properties-header')).toHaveTextContent('CTextButton');
    });

    it('should display attribute groups', () => {
      testInRoot(() => {
        select('MainView-button');
      });

      render(() => <PropertiesPanel />);

      expect(screen.getByText('Identity')).toBeInTheDocument();
      expect(screen.getByText('Geometry')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('should display attribute values', () => {
      testInRoot(() => {
        select('MainView-button');
      });

      render(() => <PropertiesPanel />);

      expect(screen.getByText('10, 20')).toBeInTheDocument();
      expect(screen.getByText('100, 30')).toBeInTheDocument();
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });
  });

  describe('grouped attribute display', () => {
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
                title: 'Main',
                'mouse-enabled': 'true',
                'custom-attr': 'custom-value',
              },
            },
          },
        },
      };
    });

    it('should display groups in priority order: Identity, Geometry, Appearance, Text, Behavior, Other', () => {
      testInRoot(() => {
        select('MainView');
      });

      render(() => <PropertiesPanel />);

      const groups = screen.getAllByTestId('attribute-group');
      const labels = groups.map((g) => {
        const header = g.querySelector('[data-testid="group-header"]');
        const labelSpan = header?.querySelector('span:last-child');
        return labelSpan?.textContent?.trim();
      });

      expect(labels).toEqual(['Identity', 'Geometry', 'Appearance', 'Text', 'Behavior', 'Other']);
    });

    it('should not display empty groups', () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CView',
                origin: '0, 0',
              },
            },
          },
        },
      };

      testInRoot(() => {
        select('MainView');
      });

      render(() => <PropertiesPanel />);

      expect(screen.getByText('Identity')).toBeInTheDocument();
      expect(screen.getByText('Geometry')).toBeInTheDocument();
      expect(screen.queryByText('Appearance')).not.toBeInTheDocument();
      expect(screen.queryByText('Text')).not.toBeInTheDocument();
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
        select('MainView-view1');
      });

      render(() => <PropertiesPanel />);
      expect(screen.getByTestId('properties-header')).toHaveTextContent('CTextButton');

      testInRoot(() => {
        select('MainView-view2');
      });

      expect(screen.getByTestId('properties-header')).toHaveTextContent('CTextLabel');
    });

    it('should show empty state when selection is cleared', () => {
      testInRoot(() => {
        select('MainView-view1');
      });

      render(() => <PropertiesPanel />);
      expect(screen.queryByTestId('properties-empty-state')).not.toBeInTheDocument();

      testInRoot(() => {
        resetSelection();
      });

      expect(screen.getByTestId('properties-empty-state')).toBeInTheDocument();
    });
  });

  describe('nested view selection with composite IDs', () => {
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
              },
              children: {
                panel: {
                  attributes: {
                    class: 'CViewContainer',
                    origin: '10, 10',
                    size: '200, 150',
                    'background-color': '#333333FF',
                  },
                  children: {
                    button: {
                      attributes: {
                        class: 'CTextButton',
                        origin: '5, 5',
                        size: '80, 24',
                        title: 'Nested Button',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };
    });

    it('should show properties for child view using composite ID', () => {
      // Canvas generates IDs like 'MainView-panel', not just 'panel'
      testInRoot(() => {
        select('MainView-panel');
      });

      render(() => <PropertiesPanel />);

      expect(screen.queryByTestId('properties-empty-state')).not.toBeInTheDocument();
      expect(screen.getByTestId('properties-header')).toHaveTextContent('CViewContainer');
      expect(screen.getByText('10, 10')).toBeInTheDocument();
      expect(screen.getByText('200, 150')).toBeInTheDocument();
    });

    it('should show properties for deeply nested grandchild using composite ID', () => {
      // Canvas generates IDs like 'MainView-panel-button' for grandchildren
      testInRoot(() => {
        select('MainView-panel-button');
      });

      render(() => <PropertiesPanel />);

      expect(screen.queryByTestId('properties-empty-state')).not.toBeInTheDocument();
      expect(screen.getByTestId('properties-header')).toHaveTextContent('CTextButton');
      expect(screen.getByText('Nested Button')).toBeInTheDocument();
      expect(screen.getByText('5, 5')).toBeInTheDocument();
      expect(screen.getByText('80, 24')).toBeInTheDocument();
    });

    it('should show properties for root template using template name as ID', () => {
      testInRoot(() => {
        select('MainView');
      });

      render(() => <PropertiesPanel />);

      expect(screen.queryByTestId('properties-empty-state')).not.toBeInTheDocument();
      expect(screen.getByTestId('properties-header')).toHaveTextContent('CViewContainer');
      expect(screen.getByText('0, 0')).toBeInTheDocument();
      expect(screen.getByText('400, 300')).toBeInTheDocument();
    });
  });
});
