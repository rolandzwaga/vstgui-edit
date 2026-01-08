import { describe, it, expect, beforeEach } from 'vitest';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { createRenameTemplateOperation } from '../historyOperations';
import { reset, setDocumentForTest, getTemplate } from '../../../stores/documentStore';
import { resetTemplateStore } from '../../../stores/templateStore';
import type { VSTGUIUIDescription } from '../../../types/uidesc';

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
});
