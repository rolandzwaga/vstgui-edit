import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import type { VSTGUIUIDescription } from '../../types/uidesc';
import {
  documentStore,
  reset,
  setDocumentForTest,
  getViewAttribute,
  updateViewAttribute,
} from '../documentStore';

function createTestDocument(): VSTGUIUIDescription {
  return {
    'vstgui-ui-description': {
      version: '1',
      templates: {
        MainView: {
          attributes: {
            class: 'CViewContainer',
            origin: '0, 0',
            size: '400, 300',
            'background-color': 'Background',
          },
          children: {
            panel: {
              attributes: {
                class: 'CViewContainer',
                origin: '10, 20',
                size: '200, 150',
                opacity: '0.8',
              },
              children: {
                button: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '5, 10',
                    size: '80, 30',
                    title: 'Click Me',
                    tooltip: 'Button tooltip',
                  },
                },
              },
            },
            label: {
              attributes: {
                class: 'CTextLabel',
                origin: '50, 100',
                size: '100, 20',
                title: 'Hello World',
                'text-alignment': 'center',
              },
            },
          },
        },
      },
    },
  };
}

describe('documentStore - getViewAttribute', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return undefined', () => {
      testInRoot(() => {
        const result = getViewAttribute('MainView-panel', 'origin');
        expect(result).toBeUndefined();
      });
    });
  });

  describe('Given document loaded', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should return attribute value for root template', () => {
      testInRoot(() => {
        const result = getViewAttribute('MainView', 'class');
        expect(result).toBe('CViewContainer');
      });
    });

    it('should return attribute value for first-level child', () => {
      testInRoot(() => {
        const result = getViewAttribute('MainView-panel', 'opacity');
        expect(result).toBe('0.8');
      });
    });

    it('should return attribute value for nested child', () => {
      testInRoot(() => {
        const result = getViewAttribute('MainView-panel-button', 'title');
        expect(result).toBe('Click Me');
      });
    });

    it('should return undefined for non-existent attribute', () => {
      testInRoot(() => {
        const result = getViewAttribute('MainView-panel', 'nonexistent');
        expect(result).toBeUndefined();
      });
    });

    it('should return undefined for non-existent view', () => {
      testInRoot(() => {
        const result = getViewAttribute('MainView-nonexistent', 'origin');
        expect(result).toBeUndefined();
      });
    });
  });
});

describe('documentStore - updateViewAttribute', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return null', () => {
      testInRoot(() => {
        const result = updateViewAttribute('MainView-panel', 'title', 'New Title');
        expect(result).toBeNull();
      });
    });
  });

  describe('Given document loaded', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should update existing attribute and return previous value', () => {
      testInRoot(() => {
        const result = updateViewAttribute('MainView-panel-button', 'title', 'New Title');

        expect(result).toBe('Click Me');
        const button =
          documentStore.document?.['vstgui-ui-description']?.templates?.MainView.children?.panel
            ?.children?.button;
        expect(button?.attributes.title).toBe('New Title');
      });
    });

    it('should add new attribute and return undefined as previous value', () => {
      testInRoot(() => {
        const result = updateViewAttribute('MainView-panel', 'tooltip', 'Panel tooltip');

        expect(result).toBeUndefined();
        const panel =
          documentStore.document?.['vstgui-ui-description']?.templates?.MainView.children?.panel;
        expect(panel?.attributes.tooltip).toBe('Panel tooltip');
      });
    });

    it('should update root template attribute', () => {
      testInRoot(() => {
        const result = updateViewAttribute('MainView', 'background-color', 'NewColor');

        expect(result).toBe('Background');
        const main = documentStore.document?.['vstgui-ui-description']?.templates?.MainView;
        expect(main?.attributes['background-color']).toBe('NewColor');
      });
    });

    it('should update text-alignment enum attribute', () => {
      testInRoot(() => {
        const result = updateViewAttribute('MainView-label', 'text-alignment', 'left');

        expect(result).toBe('center');
        const label =
          documentStore.document?.['vstgui-ui-description']?.templates?.MainView.children?.label;
        expect(label?.attributes['text-alignment']).toBe('left');
      });
    });

    it('should return null for non-existent view', () => {
      testInRoot(() => {
        const result = updateViewAttribute('MainView-nonexistent', 'title', 'New Title');
        expect(result).toBeNull();
      });
    });

    it('should not affect other attributes', () => {
      testInRoot(() => {
        updateViewAttribute('MainView-panel-button', 'title', 'New Title');

        const button =
          documentStore.document?.['vstgui-ui-description']?.templates?.MainView.children?.panel
            ?.children?.button;
        expect(button?.attributes.tooltip).toBe('Button tooltip');
        expect(button?.attributes.class).toBe('CTextButton');
        expect(button?.attributes.origin).toBe('5, 10');
      });
    });

    it('should handle empty string value', () => {
      testInRoot(() => {
        updateViewAttribute('MainView-panel-button', 'title', '');

        const button =
          documentStore.document?.['vstgui-ui-description']?.templates?.MainView.children?.panel
            ?.children?.button;
        expect(button?.attributes.title).toBe('');
      });
    });
  });
});
