import { describe, it, expect, beforeEach } from 'vitest';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import {
  createRenameTemplateOperation,
  createAddTemplateOperation,
  createDeleteTemplateOperation,
} from '../historyOperations';
import { reset, setDocumentForTest, getTemplate } from '../../../stores/documentStore';
import { resetTemplateStore } from '../../../stores/templateStore';
import type { VSTGUIUIDescription, TemplateDefinition } from '../../../types/uidesc';

function createTestDocument(templates: Record<string, unknown>): VSTGUIUIDescription {
  return {
    'vstgui-ui-description': {
      version: '1',
      templates: templates as VSTGUIUIDescription['vstgui-ui-description']['templates'],
    },
  };
}

describe('template history operations', () => {
  beforeEach(() => {
    reset();
    resetTemplateStore();
  });

  describe('createRenameTemplateOperation', () => {
    it('should create operation with correct type', () => {
      testInRoot(() => {
        const operation = createRenameTemplateOperation('OldName', 'NewName');
        expect(operation.type).toBe('template-rename');
      });
    });

    it('should create operation with descriptive message', () => {
      testInRoot(() => {
        const operation = createRenameTemplateOperation('MainView', 'RenamedView');
        expect(operation.description).toContain('MainView');
        expect(operation.description).toContain('RenamedView');
      });
    });

    it('should undo rename operation', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
        };
        setDocumentForTest(createTestDocument(templates));

        const operation = createRenameTemplateOperation('MainView', 'RenamedView');

        operation.redo();
        expect(getTemplate('MainView')).toBeUndefined();
        expect(getTemplate('RenamedView')).toBeDefined();

        operation.undo();
        expect(getTemplate('MainView')).toBeDefined();
        expect(getTemplate('RenamedView')).toBeUndefined();
      });
    });

    it('should redo rename operation', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
        };
        setDocumentForTest(createTestDocument(templates));

        const operation = createRenameTemplateOperation('MainView', 'RenamedView');

        operation.redo();
        expect(getTemplate('RenamedView')).toBeDefined();

        operation.undo();
        expect(getTemplate('MainView')).toBeDefined();

        operation.redo();
        expect(getTemplate('RenamedView')).toBeDefined();
        expect(getTemplate('MainView')).toBeUndefined();
      });
    });

    it('should have timestamp', () => {
      testInRoot(() => {
        const before = Date.now();
        const operation = createRenameTemplateOperation('OldName', 'NewName');
        const after = Date.now();

        expect(operation.timestamp).toBeGreaterThanOrEqual(before);
        expect(operation.timestamp).toBeLessThanOrEqual(after);
      });
    });
  });

  describe('createAddTemplateOperation', () => {
    it('should create operation with correct type', () => {
      testInRoot(() => {
        const operation = createAddTemplateOperation('NewTemplate');
        expect(operation.type).toBe('template-add');
      });
    });

    it('should create operation with descriptive message', () => {
      testInRoot(() => {
        const operation = createAddTemplateOperation('MyNewView');
        expect(operation.description).toContain('MyNewView');
        expect(operation.description).toContain('Add');
      });
    });

    it('should undo add operation (deletes the template)', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
        };
        setDocumentForTest(createTestDocument(templates));

        const operation = createAddTemplateOperation('NewTemplate');

        operation.redo();
        expect(getTemplate('NewTemplate')).toBeDefined();

        operation.undo();
        expect(getTemplate('NewTemplate')).toBeUndefined();
      });
    });

    it('should redo add operation', () => {
      testInRoot(() => {
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
        };
        setDocumentForTest(createTestDocument(templates));

        const operation = createAddTemplateOperation('NewTemplate');

        operation.redo();
        expect(getTemplate('NewTemplate')).toBeDefined();

        operation.undo();
        expect(getTemplate('NewTemplate')).toBeUndefined();

        operation.redo();
        expect(getTemplate('NewTemplate')).toBeDefined();
      });
    });

    it('should have timestamp', () => {
      testInRoot(() => {
        const before = Date.now();
        const operation = createAddTemplateOperation('NewTemplate');
        const after = Date.now();

        expect(operation.timestamp).toBeGreaterThanOrEqual(before);
        expect(operation.timestamp).toBeLessThanOrEqual(after);
      });
    });
  });

  describe('createDeleteTemplateOperation', () => {
    it('should create operation with correct type', () => {
      testInRoot(() => {
        const templateData: TemplateDefinition = {
          attributes: { class: 'CViewContainer', size: '400, 300' },
        };
        const operation = createDeleteTemplateOperation('TemplateToDelete', templateData);
        expect(operation.type).toBe('template-delete');
      });
    });

    it('should create operation with descriptive message', () => {
      testInRoot(() => {
        const templateData: TemplateDefinition = {
          attributes: { class: 'CViewContainer', size: '400, 300' },
        };
        const operation = createDeleteTemplateOperation('ViewToRemove', templateData);
        expect(operation.description).toContain('ViewToRemove');
        expect(operation.description).toContain('Delete');
      });
    });

    it('should undo delete operation (restores the template)', () => {
      testInRoot(() => {
        const templateData: TemplateDefinition = {
          attributes: { class: 'CViewContainer', size: '400, 300' },
        };
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
          TemplateToDelete: templateData,
        };
        setDocumentForTest(createTestDocument(templates));

        const operation = createDeleteTemplateOperation('TemplateToDelete', templateData);

        operation.redo();
        expect(getTemplate('TemplateToDelete')).toBeUndefined();

        operation.undo();
        expect(getTemplate('TemplateToDelete')).toBeDefined();
        expect(getTemplate('TemplateToDelete')?.attributes.class).toBe('CViewContainer');
      });
    });

    it('should redo delete operation', () => {
      testInRoot(() => {
        const templateData: TemplateDefinition = {
          attributes: { class: 'CViewContainer', size: '400, 300' },
        };
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
          TemplateToDelete: templateData,
        };
        setDocumentForTest(createTestDocument(templates));

        const operation = createDeleteTemplateOperation('TemplateToDelete', templateData);

        operation.redo();
        expect(getTemplate('TemplateToDelete')).toBeUndefined();

        operation.undo();
        expect(getTemplate('TemplateToDelete')).toBeDefined();

        operation.redo();
        expect(getTemplate('TemplateToDelete')).toBeUndefined();
      });
    });

    it('should have timestamp', () => {
      testInRoot(() => {
        const templateData: TemplateDefinition = {
          attributes: { class: 'CViewContainer', size: '400, 300' },
        };
        const before = Date.now();
        const operation = createDeleteTemplateOperation('Template', templateData);
        const after = Date.now();

        expect(operation.timestamp).toBeGreaterThanOrEqual(before);
        expect(operation.timestamp).toBeLessThanOrEqual(after);
      });
    });

    it('should preserve template data through undo cycle', () => {
      testInRoot(() => {
        const templateData: TemplateDefinition = {
          attributes: {
            class: 'CViewContainer',
            size: '800, 600',
            origin: '0, 0',
            background: '#ff0000',
          },
          children: {
            child1: { attributes: { class: 'CTextLabel', title: 'Hello', size: '100, 20' } },
          },
        };
        const templates = {
          MainView: { attributes: { class: 'CViewContainer', size: '400, 300' } },
          ComplexTemplate: templateData,
        };
        setDocumentForTest(createTestDocument(templates));

        const operation = createDeleteTemplateOperation('ComplexTemplate', templateData);

        operation.redo();
        operation.undo();

        const restored = getTemplate('ComplexTemplate');
        expect(restored).toBeDefined();
        expect(restored?.attributes.background).toBe('#ff0000');
        expect(Object.keys(restored?.children || {})).toHaveLength(1);
      });
    });
  });
});
