import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import type { VSTGUIUIDescription } from '../../types/uidesc';
import { documentStore, reset, setDocumentForTest, updateViewSize } from '../documentStore';

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
            Button1: {
              attributes: {
                class: 'CTextButton',
                origin: '10, 10',
                size: '100, 50',
              },
            },
            Container: {
              attributes: {
                class: 'CViewContainer',
                origin: '50, 50',
                size: '200, 150',
              },
              children: {
                NestedButton: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '20, 20',
                    size: '80, 40',
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

describe('documentStore.updateViewSize', () => {
  beforeEach(() => {
    testInRoot(() => {
      reset();
    });
  });

  describe('when document is null', () => {
    it('should return null', () => {
      testInRoot(() => {
        const result = updateViewSize('MainView', { width: 200, height: 100 });
        expect(result).toBeNull();
      });
    });
  });

  describe('when document has no templates', () => {
    it('should return null', () => {
      testInRoot(() => {
        setDocumentForTest({
          'vstgui-ui-description': {
            version: '1',
          },
        });
        const result = updateViewSize('MainView', { width: 200, height: 100 });
        expect(result).toBeNull();
      });
    });
  });

  describe('when view does not exist', () => {
    it('should return null for non-existent view', () => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
        const result = updateViewSize('NonExistent', { width: 200, height: 100 });
        expect(result).toBeNull();
      });
    });
  });

  describe('when updating root template view size', () => {
    it('should update size and return previous size', () => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
        const prevSize = updateViewSize('MainView', { width: 500, height: 400 });

        expect(prevSize).toEqual({ width: 400, height: 300 });
      });
    });

    it('should persist the new size in the document', () => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
        updateViewSize('MainView', { width: 500, height: 400 });

        const doc = documentStore.document;
        const view = doc?.['vstgui-ui-description']?.templates?.MainView;
        expect(view?.attributes.size).toBe('500, 400');
      });
    });
  });

  describe('when updating direct child view size', () => {
    it('should update size and return previous size', () => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
        const prevSize = updateViewSize('MainView-Button1', { width: 150, height: 75 });

        expect(prevSize).toEqual({ width: 100, height: 50 });
      });
    });

    it('should persist the new size in the document', () => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
        updateViewSize('MainView-Button1', { width: 150, height: 75 });

        const doc = documentStore.document;
        const view = doc?.['vstgui-ui-description']?.templates?.MainView;
        const child = view?.children?.Button1;
        expect(child?.attributes.size).toBe('150, 75');
      });
    });
  });

  describe('when updating nested child view size', () => {
    it('should update size and return previous size', () => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
        const prevSize = updateViewSize('MainView-Container-NestedButton', { width: 120, height: 60 });

        expect(prevSize).toEqual({ width: 80, height: 40 });
      });
    });

    it('should persist the new size in the document', () => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
        updateViewSize('MainView-Container-NestedButton', { width: 120, height: 60 });

        const doc = documentStore.document;
        const view = doc?.['vstgui-ui-description']?.templates?.MainView;
        const container = view?.children?.Container;
        const nested = container?.children?.NestedButton;
        expect(nested?.attributes.size).toBe('120, 60');
      });
    });
  });

  describe('size formatting', () => {
    it('should format size as "width, height" string', () => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
        updateViewSize('MainView-Button1', { width: 123, height: 456 });

        const doc = documentStore.document;
        const view = doc?.['vstgui-ui-description']?.templates?.MainView;
        const child = view?.children?.Button1;
        expect(child?.attributes.size).toBe('123, 456');
      });
    });

    it('should handle zero dimensions', () => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
        updateViewSize('MainView-Button1', { width: 0, height: 0 });

        const doc = documentStore.document;
        const view = doc?.['vstgui-ui-description']?.templates?.MainView;
        const child = view?.children?.Button1;
        expect(child?.attributes.size).toBe('0, 0');
      });
    });

    it('should round fractional dimensions', () => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
        updateViewSize('MainView-Button1', { width: 100.5, height: 50.5 });

        const doc = documentStore.document;
        const view = doc?.['vstgui-ui-description']?.templates?.MainView;
        const child = view?.children?.Button1;
        expect(child?.attributes.size).toBe('101, 51');
      });
    });
  });

  describe('handling views with no size attribute', () => {
    it('should return zero size when view has no size', () => {
      testInRoot(() => {
        const docWithNoSize: VSTGUIUIDescription = {
          'vstgui-ui-description': {
            version: '1',
            templates: {
              MainView: {
                attributes: {
                  class: 'CViewContainer',
                  origin: '0, 0',
                },
              },
            },
          },
        };
        setDocumentForTest(docWithNoSize);

        const result = updateViewSize('MainView', { width: 200, height: 100 });
        expect(result).toEqual({ width: 0, height: 0 });
      });
    });
  });
});
