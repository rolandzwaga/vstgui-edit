import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import type { VSTGUIUIDescription } from '../../types/uidesc';
import {
  addTemplate,
  deleteTemplate,
  duplicateTemplate,
  getTemplate,
  getTemplateNames,
  getTemplates,
  renameTemplate,
  reset,
  setDocumentForTest,
} from '../documentStore';
import { resetTemplateStore, setActiveTemplate, templateStore } from '../templateStore';

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

  describe('renameTemplate', () => {
    beforeEach(() => {
      resetTemplateStore();
    });

    it('should return false when no document is loaded', () => {
      testInRoot(() => {
        expect(renameTemplate('MainView', 'NewName')).toBe(false);
      });
    });

    it('should return false when template does not exist', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
        };
        setDocumentForTest(createTestDocument(templates));

        expect(renameTemplate('NonExistent', 'NewName')).toBe(false);
      });
    });

    it('should return false for invalid new name (empty)', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
        };
        setDocumentForTest(createTestDocument(templates));

        expect(renameTemplate('MainView', '')).toBe(false);
      });
    });

    it('should return false for invalid new name (invalid characters)', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
        };
        setDocumentForTest(createTestDocument(templates));

        expect(renameTemplate('MainView', 'New Name')).toBe(false);
        expect(renameTemplate('MainView', '123Start')).toBe(false);
      });
    });

    it('should return false when new name already exists', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
          SettingsView: { attributes: { class: 'CViewContainer', size: '300, 200' } },
        };
        setDocumentForTest(createTestDocument(templates));

        expect(renameTemplate('MainView', 'SettingsView')).toBe(false);
      });
    });

    it('should rename template successfully', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
        };
        setDocumentForTest(createTestDocument(templates));

        expect(renameTemplate('MainView', 'RenamedView')).toBe(true);
        expect(getTemplate('MainView')).toBeUndefined();
        expect(getTemplate('RenamedView')).toBeDefined();
        expect(getTemplate('RenamedView')?.attributes.size).toBe('400, 300');
      });
    });

    it('should preserve template data when renaming', () => {
      testInRoot(() => {
        const templates = {
          MainView: {
            attributes: { class: 'CViewContainer', size: '400, 300', 'background-color': '#FF0000' },
            children: {
              button: { attributes: { class: 'CTextButton', size: '100, 30' } },
            },
          },
        };
        setDocumentForTest(createTestDocument(templates));

        renameTemplate('MainView', 'RenamedView');

        const renamed = getTemplate('RenamedView');
        expect(renamed?.attributes['background-color']).toBe('#FF0000');
        expect(renamed?.children).toBeDefined();
      });
    });

    it('should return true when renaming to same name (no-op)', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
        };
        setDocumentForTest(createTestDocument(templates));

        expect(renameTemplate('MainView', 'MainView')).toBe(true);
        expect(getTemplate('MainView')).toBeDefined();
      });
    });

    it('should update activeTemplateId when renaming active template', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
        };
        setDocumentForTest(createTestDocument(templates));
        setActiveTemplate('MainView');

        renameTemplate('MainView', 'RenamedView');

        expect(templateStore.activeTemplateId).toBe('RenamedView');
      });
    });

    it('should not update activeTemplateId when renaming non-active template', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
          SettingsView: { attributes: { class: 'CViewContainer', size: '300, 200' } },
        };
        setDocumentForTest(createTestDocument(templates));
        setActiveTemplate('SettingsView');

        renameTemplate('MainView', 'RenamedView');

        expect(templateStore.activeTemplateId).toBe('SettingsView');
      });
    });
  });

  describe('addTemplate', () => {
    beforeEach(() => {
      resetTemplateStore();
    });

    it('should return false when no document is loaded', () => {
      testInRoot(() => {
        expect(addTemplate('NewTemplate')).toBe(false);
      });
    });

    it('should return false for invalid name', () => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument({}));

        expect(addTemplate('')).toBe(false);
        expect(addTemplate('Invalid Name')).toBe(false);
        expect(addTemplate('123Start')).toBe(false);
      });
    });

    it('should return false when name already exists', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
        };
        setDocumentForTest(createTestDocument(templates));

        expect(addTemplate('MainView')).toBe(false);
      });
    });

    it('should add template with default CViewContainer', () => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument({}));

        expect(addTemplate('NewTemplate')).toBe(true);

        const template = getTemplate('NewTemplate');
        expect(template).toBeDefined();
        expect(template?.attributes.class).toBe('CViewContainer');
        expect(template?.attributes.size).toBe('400, 300');
      });
    });

    it('should add template to existing templates', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '800, 600' } },
        };
        setDocumentForTest(createTestDocument(templates));

        addTemplate('NewTemplate');

        const names = getTemplateNames();
        expect(names).toContain('MainView');
        expect(names).toContain('NewTemplate');
      });
    });

    it('should create templates object if it does not exist', () => {
      testInRoot(() => {
        setDocumentForTest({
          'vstgui-ui-description': {
            version: '1',
          },
        } as VSTGUIUIDescription);

        expect(addTemplate('NewTemplate')).toBe(true);
        expect(getTemplate('NewTemplate')).toBeDefined();
      });
    });
  });

  describe('deleteTemplate', () => {
    beforeEach(() => {
      resetTemplateStore();
    });

    it('should return null when no document is loaded', () => {
      testInRoot(() => {
        expect(deleteTemplate('MainView')).toBeNull();
      });
    });

    it('should return null when template does not exist', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
        };
        setDocumentForTest(createTestDocument(templates));

        expect(deleteTemplate('NonExistent')).toBeNull();
      });
    });

    it('should delete template and return its data', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
          SettingsView: { attributes: { class: 'CViewContainer', size: '300, 200' } },
        };
        setDocumentForTest(createTestDocument(templates));

        const deleted = deleteTemplate('MainView');

        expect(deleted).toBeDefined();
        expect(deleted?.attributes.size).toBe('400, 300');
        expect(getTemplate('MainView')).toBeUndefined();
        expect(getTemplate('SettingsView')).toBeDefined();
      });
    });

    it('should switch to first remaining template if deleting active template', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
          SettingsView: { attributes: { class: 'CViewContainer', size: '300, 200' } },
        };
        setDocumentForTest(createTestDocument(templates));
        setActiveTemplate('MainView');

        deleteTemplate('MainView');

        expect(templateStore.activeTemplateId).toBe('SettingsView');
      });
    });

    it('should not change activeTemplateId if deleting non-active template', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
          SettingsView: { attributes: { class: 'CViewContainer', size: '300, 200' } },
        };
        setDocumentForTest(createTestDocument(templates));
        setActiveTemplate('SettingsView');

        deleteTemplate('MainView');

        expect(templateStore.activeTemplateId).toBe('SettingsView');
      });
    });

    it('should return null when trying to delete last template', () => {
      testInRoot(() => {
        const templates = {
          OnlyTemplate: { attributes: { class: 'CViewContainer', size: '400, 300' } },
        };
        setDocumentForTest(createTestDocument(templates));

        expect(deleteTemplate('OnlyTemplate')).toBeNull();
        expect(getTemplate('OnlyTemplate')).toBeDefined();
      });
    });

    it('should switch to first remaining template when deleting active template', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
          SettingsView: { attributes: { class: 'CViewContainer', size: '300, 200' } },
          AboutView: { attributes: { class: 'CViewContainer', size: '200, 150' } },
        };
        setDocumentForTest(createTestDocument(templates));
        setActiveTemplate('MainView');

        deleteTemplate('MainView');

        expect(templateStore.activeTemplateId).not.toBe('MainView');
        expect(templateStore.activeTemplateId).not.toBeNull();
      });
    });
  });

  describe('duplicateTemplate', () => {
    beforeEach(() => {
      resetTemplateStore();
    });

    it('should return null when no document is loaded', () => {
      testInRoot(() => {
        expect(duplicateTemplate('MainView')).toBeNull();
      });
    });

    it('should return null when source template does not exist', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
        };
        setDocumentForTest(createTestDocument(templates));

        expect(duplicateTemplate('NonExistent')).toBeNull();
      });
    });

    it('should duplicate template with SourceNameCopy naming', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
        };
        setDocumentForTest(createTestDocument(templates));

        const newName = duplicateTemplate('MainView');

        expect(newName).toBe('MainViewCopy');
        expect(getTemplate('MainViewCopy')).toBeDefined();
        expect(getTemplate('MainView')).toBeDefined();
      });
    });

    it('should generate unique name when copy already exists', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
          MainViewCopy: { attributes: { class: 'CViewContainer', size: '300, 200' } },
        };
        setDocumentForTest(createTestDocument(templates));

        const newName = duplicateTemplate('MainView');

        expect(newName).toBe('MainViewCopy2');
        expect(getTemplate('MainViewCopy2')).toBeDefined();
      });
    });

    it('should perform deep copy of template data', () => {
      testInRoot(() => {
        const templates = {
          MainView: {
            attributes: {
              class: 'CViewContainer',
              size: '400, 300',
              'background-color': '#FF0000',
            },
            children: {
              button: {
                attributes: { class: 'CTextButton', title: 'Click Me', size: '100, 30' },
              },
            },
          },
        };
        setDocumentForTest(createTestDocument(templates));

        duplicateTemplate('MainView');

        const copy = getTemplate('MainViewCopy');
        expect(copy).toBeDefined();
        expect(copy?.attributes['background-color']).toBe('#FF0000');
        expect(copy?.children?.button).toBeDefined();
        expect(copy?.children?.button.attributes.title).toBe('Click Me');
      });
    });

    it('should create independent copy (no shared references)', () => {
      testInRoot(() => {
        const templates = {
          MainView: {
            attributes: { class: 'CViewContainer', size: '400, 300' },
            children: {
              label: { attributes: { class: 'CTextLabel', title: 'Original', size: '100, 20' } },
            },
          },
        };
        setDocumentForTest(createTestDocument(templates));

        duplicateTemplate('MainView');

        const original = getTemplate('MainView');
        const copy = getTemplate('MainViewCopy');

        expect(original?.children).not.toBe(copy?.children);
        expect(original?.attributes).not.toBe(copy?.attributes);
      });
    });
  });
});
