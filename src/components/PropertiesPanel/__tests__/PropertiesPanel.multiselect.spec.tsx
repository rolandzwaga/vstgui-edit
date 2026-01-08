import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { PropertiesPanel } from '../PropertiesPanel';
import { resetSelection, selectAll } from '../../../stores/selectionStore';
import { resetProperties } from '../../../stores/propertiesStore';
import { resetTemplateStore, setActiveTemplate } from '../../../stores/templateStore';
import { testInRoot } from '../../../__tests__/helpers/solidjs';

const mockDocumentStore = vi.hoisted(() => ({
  document: null as unknown,
}));

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
}));

describe('PropertiesPanel - Multi-selection', () => {
  beforeEach(() => {
    mockDocumentStore.document = null;
    testInRoot(() => {
      resetSelection();
      resetProperties();
      resetTemplateStore();
    });
  });

  describe('same class multi-selection', () => {
    beforeEach(() => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer' },
              children: {
                btn1: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '10, 20',
                    size: '100, 30',
                    'background-color': '#FF0000',
                  },
                },
                btn2: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '50, 60',
                    size: '100, 30',
                    'background-color': '#FF0000',
                  },
                },
                btn3: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '90, 100',
                    size: '200, 40',
                    'background-color': '#00FF00',
                  },
                },
              },
            },
          },
        },
      };
      testInRoot(() => {
        setActiveTemplate('MainView');
      });
    });

    it('should show class name with count for same class selection', () => {
      testInRoot(() => {
        selectAll(['MainView-btn1', 'MainView-btn2', 'MainView-btn3']);
      });

      render(() => <PropertiesPanel />);

      expect(screen.getByTestId('properties-header')).toHaveTextContent('CTextButton');
      expect(screen.getByTestId('properties-header')).toHaveTextContent('(3)');
    });

    it('should show shared value when all views have same value', () => {
      testInRoot(() => {
        selectAll(['MainView-btn1', 'MainView-btn2']);
      });

      render(() => <PropertiesPanel />);

      expect(screen.getByText('#FF0000')).toBeInTheDocument();
      expect(screen.getByText('100, 30')).toBeInTheDocument();
    });

    it('should show Mixed indicator when values differ', () => {
      testInRoot(() => {
        selectAll(['MainView-btn1', 'MainView-btn2', 'MainView-btn3']);
      });

      render(() => <PropertiesPanel />);

      const mixedElements = screen.getAllByText('Mixed');
      expect(mixedElements.length).toBeGreaterThan(0);
    });

    it('should mark differing values as non-copyable', () => {
      testInRoot(() => {
        selectAll(['MainView-btn1', 'MainView-btn3']);
      });

      render(() => <PropertiesPanel />);

      const mixedElements = screen.getAllByText('Mixed');
      for (const mixed of mixedElements) {
        const parent = mixed.closest('[data-testid="attribute-value"]');
        expect(parent).not.toHaveClass(/copyable/);
      }
    });
  });

  describe('different class multi-selection', () => {
    beforeEach(() => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer' },
              children: {
                button: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '10, 20',
                    size: '100, 30',
                  },
                },
                label: {
                  attributes: {
                    class: 'CTextLabel',
                    origin: '50, 60',
                    size: '100, 30',
                  },
                },
              },
            },
          },
        },
      };
      testInRoot(() => {
        setActiveTemplate('MainView');
      });
    });

    it('should show count only when classes differ', () => {
      testInRoot(() => {
        selectAll(['MainView-button', 'MainView-label']);
      });

      render(() => <PropertiesPanel />);

      expect(screen.getByTestId('properties-header')).toHaveTextContent('2 views selected');
    });

    it('should mark class attribute as Mixed', () => {
      testInRoot(() => {
        selectAll(['MainView-button', 'MainView-label']);
      });

      render(() => <PropertiesPanel />);

      const identityGroup = screen.getAllByTestId('attribute-group')[0];
      expect(identityGroup).toHaveTextContent('Mixed');
    });
  });

  describe('partial attribute presence', () => {
    beforeEach(() => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer' },
              children: {
                view1: {
                  attributes: {
                    class: 'CView',
                    origin: '0, 0',
                    tooltip: 'Has tooltip',
                  },
                },
                view2: {
                  attributes: {
                    class: 'CView',
                    origin: '10, 10',
                  },
                },
              },
            },
          },
        },
      };
      testInRoot(() => {
        setActiveTemplate('MainView');
      });
    });

    it('should mark attribute as Mixed when only some views have it', () => {
      testInRoot(() => {
        selectAll(['MainView-view1', 'MainView-view2']);
      });

      render(() => <PropertiesPanel />);

      const mixedElements = screen.getAllByText('Mixed');
      expect(mixedElements.length).toBeGreaterThan(0);
    });
  });
});
