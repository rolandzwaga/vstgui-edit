import { describe, it, expect, beforeEach } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  documentStore,
  setDocumentForTest,
  reset,
  getTemplates,
  getTemplate,
  getTemplateNames,
} from '../documentStore';
import type { VSTGUIUIDescription } from '../../types/uidesc';

function createTestDocument(templates: Record<string, unknown>): VSTGUIUIDescription {
  return {
    'vstgui-ui-description': {
      version: '1',
      templates: templates as VSTGUIUIDescription['vstgui-ui-description']['templates'],
    },
  };
}

describe('documentStore template operations', () => {
  beforeEach(() => {
    reset();
  });

  describe('getTemplates', () => {
    it('should return undefined when no document is loaded', () => {
      testInRoot(() => {
        expect(getTemplates()).toBeUndefined();
      });
    });

    it('should return templates when document is loaded', () => {
      testInRoot(() => {
        const templates = {
          MainView: {
            attributes: { class: 'CViewContainer', size: '400, 300' },
          },
          SettingsView: {
            attributes: { class: 'CViewContainer', size: '300, 200' },
          },
        };
        setDocumentForTest(createTestDocument(templates));

        const result = getTemplates();
        expect(result).toBeDefined();
        expect(Object.keys(result!)).toEqual(['MainView', 'SettingsView']);
      });
    });

    it('should return undefined when document has no templates', () => {
      testInRoot(() => {
        setDocumentForTest({
          'vstgui-ui-description': {
            version: '1',
          },
        } as VSTGUIUIDescription);

        expect(getTemplates()).toBeUndefined();
      });
    });
  });

  describe('getTemplate', () => {
    it('should return undefined when no document is loaded', () => {
      testInRoot(() => {
        expect(getTemplate('MainView')).toBeUndefined();
      });
    });

    it('should return template by name', () => {
      testInRoot(() => {
        const templates = {
          MainView: {
            attributes: { class: 'CViewContainer', size: '400, 300' },
          },
        };
        setDocumentForTest(createTestDocument(templates));

        const result = getTemplate('MainView');
        expect(result).toBeDefined();
        expect(result?.attributes.size).toBe('400, 300');
      });
    });

    it('should return undefined for non-existent template', () => {
      testInRoot(() => {
        const templates = {
          MainView: {
            attributes: { class: 'CViewContainer', size: '400, 300' },
          },
        };
        setDocumentForTest(createTestDocument(templates));

        expect(getTemplate('NonExistent')).toBeUndefined();
      });
    });
  });

  describe('getTemplateNames', () => {
    it('should return empty array when no document is loaded', () => {
      testInRoot(() => {
        expect(getTemplateNames()).toEqual([]);
      });
    });

    it('should return array of template names', () => {
      testInRoot(() => {
        const templates = {
          MainView: {
            attributes: { class: 'CViewContainer', size: '400, 300' },
          },
          SettingsView: {
            attributes: { class: 'CViewContainer', size: '300, 200' },
          },
          AboutView: {
            attributes: { class: 'CViewContainer', size: '200, 150' },
          },
        };
        setDocumentForTest(createTestDocument(templates));

        const names = getTemplateNames();
        expect(names).toHaveLength(3);
        expect(names).toContain('MainView');
        expect(names).toContain('SettingsView');
        expect(names).toContain('AboutView');
      });
    });

    it('should return empty array when document has no templates', () => {
      testInRoot(() => {
        setDocumentForTest({
          'vstgui-ui-description': {
            version: '1',
          },
        } as VSTGUIUIDescription);

        expect(getTemplateNames()).toEqual([]);
      });
    });
  });
});
