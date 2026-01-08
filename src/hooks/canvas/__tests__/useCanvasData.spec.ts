import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { createMockDocument, createMockContainer, createMockView } from '../../../__tests__/helpers/fixtures';
import { reset, setDocumentForTest } from '../../../stores/documentStore';
import { setActiveTemplate, resetTemplateStore } from '../../../stores/templateStore';
import { useCanvasData } from '../useCanvasData';

describe('useCanvasData', () => {
  beforeEach(() => {
    reset();
    resetTemplateStore();
  });

  afterEach(() => {
    reset();
    resetTemplateStore();
  });

  describe('activeTemplate integration', () => {
    test('returns null when no document loaded', () => {
      testInRoot(() => {
        const { activeTemplate, isEmpty } = useCanvasData();
        expect(activeTemplate()).toBeNull();
        expect(isEmpty()).toBe(true);
      });
    });

    test('returns null when activeTemplateId is cleared after document load', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ size: '800, 600' }),
          },
        });
        setDocumentForTest(doc);
        resetTemplateStore();

        const { activeTemplate, isEmpty } = useCanvasData();
        expect(activeTemplate()).toBeNull();
        expect(isEmpty()).toBe(true);
      });
    });

    test('auto-selects first template when document is loaded', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ size: '800, 600' }),
            Settings: createMockContainer({ size: '400, 300' }),
          },
        });
        setDocumentForTest(doc);

        const { activeTemplate, isEmpty } = useCanvasData();
        const template = activeTemplate();
        expect(template).not.toBeNull();
        expect(template![0]).toBe('MainView');
        expect(isEmpty()).toBe(false);
      });
    });

    test('returns active template when activeTemplateId is set', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ size: '800, 600' }),
            Settings: createMockContainer({ size: '400, 300' }),
          },
        });
        setDocumentForTest(doc);
        setActiveTemplate('MainView');

        const { activeTemplate, isEmpty } = useCanvasData();
        const template = activeTemplate();
        expect(template).not.toBeNull();
        expect(template![0]).toBe('MainView');
        expect(isEmpty()).toBe(false);
      });
    });

    test('returns different template when activeTemplateId changes', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ size: '800, 600' }),
            Settings: createMockContainer({ size: '400, 300' }),
          },
        });
        setDocumentForTest(doc);
        setActiveTemplate('MainView');

        const { activeTemplate } = useCanvasData();
        expect(activeTemplate()![0]).toBe('MainView');

        setActiveTemplate('Settings');
        expect(activeTemplate()![0]).toBe('Settings');
      });
    });

    test('returns null when activeTemplateId does not exist in document', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ size: '800, 600' }),
          },
        });
        setDocumentForTest(doc);
        setActiveTemplate('NonExistent');

        const { activeTemplate, isEmpty } = useCanvasData();
        expect(activeTemplate()).toBeNull();
        expect(isEmpty()).toBe(true);
      });
    });
  });

  describe('templateBounds', () => {
    test('returns bounds for active template', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ size: '800, 600' }),
          },
        });
        setDocumentForTest(doc);
        setActiveTemplate('MainView');

        const { templateBounds } = useCanvasData();
        const bounds = templateBounds();
        expect(bounds).toEqual({ width: 800, height: 600 });
      });
    });

    test('returns null when activeTemplateId is cleared', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ size: '800, 600' }),
          },
        });
        setDocumentForTest(doc);
        resetTemplateStore();

        const { templateBounds } = useCanvasData();
        expect(templateBounds()).toBeNull();
      });
    });
  });

  describe('renderableViews', () => {
    test('returns flattened views for active template', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { size: '800, 600' },
              {
                child1: createMockView({ class: 'CTextLabel', origin: '10, 10', size: '100, 30' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        setActiveTemplate('MainView');

        const { renderableViews } = useCanvasData();
        const views = renderableViews();
        expect(views.length).toBeGreaterThan(0);
        expect(views.some(v => v.className === 'CTextLabel')).toBe(true);
      });
    });

    test('returns empty array when activeTemplateId is cleared', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ size: '800, 600' }),
          },
        });
        setDocumentForTest(doc);
        resetTemplateStore();

        const { renderableViews } = useCanvasData();
        expect(renderableViews()).toEqual([]);
      });
    });
  });
});
