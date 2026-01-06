import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import type { VSTGUIUIDescription } from '../../types/uidesc';
import { documentStore, reset, setDocumentForTest, updateViewOrigin } from '../documentStore';

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
          },
          children: {
            panel: {
              attributes: {
                class: 'CViewContainer',
                origin: '10, 20',
                size: '200, 150',
              },
              children: {
                button: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '5, 10',
                    size: '80, 30',
                  },
                },
              },
            },
            label: {
              attributes: {
                class: 'CTextLabel',
                origin: '50, 100',
                size: '100, 20',
              },
            },
          },
        },
      },
    },
  };
}

describe('documentStore - updateViewOrigin', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return null', () => {
      testInRoot(() => {
        const result = updateViewOrigin('MainView-panel', { x: 100, y: 100 });
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

    it('should update root template origin', () => {
      testInRoot(() => {
        const result = updateViewOrigin('MainView', { x: 50, y: 60 });

        expect(result).toEqual({ x: 0, y: 0 });
        const templates = documentStore.document?.['vstgui-ui-description']?.templates;
        expect(templates?.MainView.attributes.origin).toBe('50, 60');
      });
    });

    it('should update first-level child origin', () => {
      testInRoot(() => {
        const result = updateViewOrigin('MainView-panel', { x: 100, y: 200 });

        expect(result).toEqual({ x: 10, y: 20 });
        const panel = documentStore.document?.['vstgui-ui-description']?.templates?.MainView.children?.panel;
        expect(panel?.attributes.origin).toBe('100, 200');
      });
    });

    it('should update nested child origin', () => {
      testInRoot(() => {
        const result = updateViewOrigin('MainView-panel-button', { x: 30, y: 40 });

        expect(result).toEqual({ x: 5, y: 10 });
        const button =
          documentStore.document?.['vstgui-ui-description']?.templates?.MainView.children?.panel?.children?.button;
        expect(button?.attributes.origin).toBe('30, 40');
      });
    });

    it('should handle view without existing origin attribute', () => {
      testInRoot(() => {
        const doc = createTestDocument();
        delete doc['vstgui-ui-description'].templates?.MainView.children?.panel.attributes.origin;
        setDocumentForTest(doc);

        const result = updateViewOrigin('MainView-panel', { x: 100, y: 100 });

        expect(result).toEqual({ x: 0, y: 0 });
        const panel = documentStore.document?.['vstgui-ui-description']?.templates?.MainView.children?.panel;
        expect(panel?.attributes.origin).toBe('100, 100');
      });
    });

    it('should return null for non-existent view', () => {
      testInRoot(() => {
        const result = updateViewOrigin('MainView-nonexistent', { x: 100, y: 100 });
        expect(result).toBeNull();
      });
    });

    it('should return null for invalid view path', () => {
      testInRoot(() => {
        const result = updateViewOrigin('MainView-panel-invalid-path', { x: 100, y: 100 });
        expect(result).toBeNull();
      });
    });

    it('should handle negative coordinates', () => {
      testInRoot(() => {
        updateViewOrigin('MainView-label', { x: -20, y: -30 });

        const label = documentStore.document?.['vstgui-ui-description']?.templates?.MainView.children?.label;
        expect(label?.attributes.origin).toBe('-20, -30');
      });
    });

    it('should not affect other view attributes', () => {
      testInRoot(() => {
        updateViewOrigin('MainView-panel', { x: 100, y: 100 });

        const panel = documentStore.document?.['vstgui-ui-description']?.templates?.MainView.children?.panel;
        expect(panel?.attributes.size).toBe('200, 150');
        expect(panel?.attributes.class).toBe('CViewContainer');
      });
    });
  });
});
