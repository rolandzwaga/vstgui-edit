import { beforeEach, describe, expect, it } from 'vitest';
import { createMockContainer, createMockDocument, createMockView } from '../../../__tests__/helpers/fixtures';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { documentStore, reset as resetDocument, setDocumentForTest } from '../../../stores/documentStore';
import { clearHistory, historyStore, pushOperation, redo, undo } from '../../../stores/historyStore';
import { clearSelection, resetSelection, select, selectAll, selectionStore } from '../../../stores/selectionStore';
import { resetClipboard } from '../../../stores/clipboardStore';
import {
  canPaste,
  copySelectedViews,
  createDeleteOperation,
  createDuplicateOperation,
  createPasteOperation,
  cutSelectedViews,
  deleteSelectedViews,
  duplicateSelectedViews,
  pasteViews,
} from '../viewOperations';

describe('viewOperations', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetDocument();
      clearHistory();
      resetSelection();
      resetClipboard();
    });
  });

  describe('deleteSelectedViews', () => {
    it('should return empty array when no views are selected', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);

        const result = deleteSelectedViews();
        expect(result).toEqual([]);
      });
    });

    it('should delete a single selected view', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
                '1': createMockView({ class: 'CTextButton' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const result = deleteSelectedViews();

        expect(result).toHaveLength(1);
        expect(result[0].viewId).toBe('MainView-0');

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(template?.children?.['0']).toBeUndefined();
        expect(template?.children?.['1']).toBeDefined();
      });
    });

    it('should delete multiple selected views', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
                '1': createMockView({ class: 'CTextButton' }),
                '2': createMockView({ class: 'CSlider' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        selectAll(['MainView-0', 'MainView-2']);

        const result = deleteSelectedViews();

        expect(result).toHaveLength(2);
        const deletedIds = result.map(r => r.viewId);
        expect(deletedIds).toContain('MainView-0');
        expect(deletedIds).toContain('MainView-2');
      });
    });

    it('should clear selection after deletion', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        deleteSelectedViews();

        expect(selectionStore.selectedIds.size).toBe(0);
      });
    });

    it('should not delete root template view', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ origin: '0, 0', size: '800, 600' }),
          },
        });
        setDocumentForTest(doc);
        select('MainView');

        const result = deleteSelectedViews();

        expect(result).toEqual([]);
        expect(documentStore.document?.['vstgui-ui-description']?.templates?.['MainView']).toBeDefined();
      });
    });

    it('should delete container with all children', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockContainer(
                  { origin: '10, 10', size: '200, 200' },
                  {
                    '0': createMockView({ class: 'CTextLabel' }),
                    '1': createMockView({ class: 'CTextButton' }),
                  }
                ),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const result = deleteSelectedViews();

        expect(result).toHaveLength(1);
        expect(result[0].viewData.children).toBeDefined();

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(template?.children?.['0']).toBeUndefined();
      });
    });
  });

  describe('createDeleteOperation', () => {
    it('should create a history operation for deletion', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '10, 10' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const removed = deleteSelectedViews();
        const operation = createDeleteOperation(removed);

        expect(operation.type).toBe('delete');
        expect(operation.description).toContain('Delete');
        expect(typeof operation.undo).toBe('function');
        expect(typeof operation.redo).toBe('function');
      });
    });

    it('should undo deletion by restoring views', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '50, 50' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const removed = deleteSelectedViews();
        const operation = createDeleteOperation(removed);

        const templateBefore = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(templateBefore?.children?.['0']).toBeUndefined();

        operation.undo();

        const templateAfter = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(templateAfter?.children?.['0']).toBeDefined();
        expect(templateAfter?.children?.['0']?.attributes.class).toBe('CTextLabel');
        expect(templateAfter?.children?.['0']?.attributes.origin).toBe('50, 50');
      });
    });

    it('should redo deletion by removing views again', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const removed = deleteSelectedViews();
        const operation = createDeleteOperation(removed);

        operation.undo();
        const templateAfterUndo = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(templateAfterUndo?.children?.['0']).toBeDefined();

        operation.redo();
        const templateAfterRedo = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(templateAfterRedo?.children?.['0']).toBeUndefined();
      });
    });

    it('should integrate with history store for undo/redo', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const removed = deleteSelectedViews();
        const operation = createDeleteOperation(removed);

        expect(historyStore.canUndo).toBe(false);

        pushOperation(operation);

        expect(historyStore.canUndo).toBe(true);
        expect(historyStore.undoDescription).toContain('Delete');

        undo();

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(template?.children?.['0']).toBeDefined();

        expect(historyStore.canRedo).toBe(true);

        redo();

        const templateAfterRedo = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(templateAfterRedo?.children?.['0']).toBeUndefined();
      });
    });

    it('should describe single view deletion correctly', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const removed = deleteSelectedViews();
        const operation = createDeleteOperation(removed);

        expect(operation.description).toBe('Delete 1 view');
      });
    });

    it('should describe multiple view deletion correctly', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
                '1': createMockView({ class: 'CTextButton' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        selectAll(['MainView-0', 'MainView-1']);

        const removed = deleteSelectedViews();
        const operation = createDeleteOperation(removed);

        expect(operation.description).toBe('Delete 2 views');
      });
    });
  });

  describe('duplicateSelectedViews', () => {
    it('should return empty array when no views are selected', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);

        const result = duplicateSelectedViews();
        expect(result).toEqual([]);
      });
    });

    it('should duplicate a single selected view with 10px offset', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100', size: '50, 20' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const result = duplicateSelectedViews();

        expect(result).toHaveLength(1);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        const newView = template?.children?.['1'];
        expect(newView?.attributes.class).toBe('CTextLabel');
        expect(newView?.attributes.origin).toBe('110, 110');
        expect(newView?.attributes.size).toBe('50, 20');
      });
    });

    it('should duplicate multiple selected views', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '50, 50' }),
                '1': createMockView({ class: 'CTextButton', origin: '100, 100' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        selectAll(['MainView-0', 'MainView-1']);

        const result = duplicateSelectedViews();

        expect(result).toHaveLength(2);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(template?.children ?? {}).length).toBe(4);
      });
    });

    it('should select duplicated views after duplication', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const result = duplicateSelectedViews();

        expect(selectionStore.selectedIds.has('MainView-0')).toBe(false);
        expect(selectionStore.selectedIds.has(result[0])).toBe(true);
      });
    });

    it('should not duplicate root template view', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ origin: '0, 0', size: '800, 600' }),
          },
        });
        setDocumentForTest(doc);
        select('MainView');

        const result = duplicateSelectedViews();

        expect(result).toEqual([]);
      });
    });

    it('should duplicate container with all children', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockContainer(
                  { origin: '50, 50', size: '200, 200' },
                  {
                    '0': createMockView({ class: 'CTextLabel', origin: '10, 10' }),
                  }
                ),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const result = duplicateSelectedViews();

        expect(result).toHaveLength(1);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        const newContainer = template?.children?.['1'];
        expect(newContainer?.attributes.origin).toBe('60, 60');
        expect(newContainer?.children?.['0']?.attributes.class).toBe('CTextLabel');
      });
    });
  });

  describe('createDuplicateOperation', () => {
    it('should create a history operation for duplication', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const duplicatedIds = duplicateSelectedViews();
        const operation = createDuplicateOperation(duplicatedIds);

        expect(operation.type).toBe('duplicate');
        expect(operation.description).toContain('Duplicate');
        expect(typeof operation.undo).toBe('function');
        expect(typeof operation.redo).toBe('function');
      });
    });

    it('should undo duplication by removing duplicated views', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const duplicatedIds = duplicateSelectedViews();
        const operation = createDuplicateOperation(duplicatedIds);

        const templateBefore = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(templateBefore?.children ?? {}).length).toBe(2);

        operation.undo();

        const templateAfter = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(templateAfter?.children ?? {}).length).toBe(1);
        expect(templateAfter?.children?.['0']).toBeDefined();
        expect(templateAfter?.children?.['1']).toBeUndefined();
      });
    });

    it('should describe single view duplication correctly', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const duplicatedIds = duplicateSelectedViews();
        const operation = createDuplicateOperation(duplicatedIds);

        expect(operation.description).toBe('Duplicate 1 view');
      });
    });

    it('should describe multiple view duplication correctly', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
                '1': createMockView({ class: 'CTextButton' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        selectAll(['MainView-0', 'MainView-1']);

        const duplicatedIds = duplicateSelectedViews();
        const operation = createDuplicateOperation(duplicatedIds);

        expect(operation.description).toBe('Duplicate 2 views');
      });
    });
  });

  describe('copySelectedViews', () => {
    it('should return false when no views are selected', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);

        const result = copySelectedViews();
        expect(result).toBe(false);
      });
    });

    it('should copy a selected view to clipboard', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const result = copySelectedViews();

        expect(result).toBe(true);
        expect(canPaste()).toBe(true);
      });
    });

    it('should not modify the original views', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        copySelectedViews();

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(template?.children?.['0']).toBeDefined();
        expect(selectionStore.selectedIds.has('MainView-0')).toBe(true);
      });
    });
  });

  describe('cutSelectedViews', () => {
    it('should copy and delete selected views', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100' }),
                '1': createMockView({ class: 'CTextButton' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const removed = cutSelectedViews();

        expect(removed).toHaveLength(1);
        expect(canPaste()).toBe(true);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(template?.children?.['0']).toBeUndefined();
        expect(template?.children?.['1']).toBeDefined();
      });
    });

    it('should return empty array when no views are selected', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);

        const removed = cutSelectedViews();

        expect(removed).toEqual([]);
        expect(canPaste()).toBe(false);
      });
    });
  });

  describe('pasteViews', () => {
    it('should return empty array when clipboard is empty', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ origin: '0, 0', size: '800, 600' }),
          },
        });
        setDocumentForTest(doc);

        const pasted = pasteViews();

        expect(pasted).toEqual([]);
      });
    });

    it('should paste views from clipboard with offset', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100', size: '50, 20' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');
        copySelectedViews();

        const pasted = pasteViews();

        expect(pasted).toHaveLength(1);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(template?.children ?? {}).length).toBe(2);

        const newView = template?.children?.['1'];
        expect(newView?.attributes.class).toBe('CTextLabel');
        expect(newView?.attributes.origin).toBe('110, 110');
      });
    });

    it('should select pasted views', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');
        copySelectedViews();

        const pasted = pasteViews();

        expect(selectionStore.selectedIds.has(pasted[0])).toBe(true);
        expect(selectionStore.selectedIds.has('MainView-0')).toBe(false);
      });
    });

    it('should increment paste offset on multiple pastes', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');
        copySelectedViews();

        pasteViews();
        pasteViews();
        const pasted3 = pasteViews();

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(template?.children ?? {}).length).toBe(4);

        const thirdPaste = template?.children?.[pasted3[0].split('-').pop() ?? ''];
        expect(thirdPaste?.attributes.origin).toBe('130, 130');
      });
    });
  });

  describe('createPasteOperation', () => {
    it('should create a history operation for paste', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');
        copySelectedViews();

        const pasted = pasteViews();
        const operation = createPasteOperation(pasted);

        expect(operation.type).toBe('create');
        expect(operation.description).toContain('Paste');
      });
    });

    it('should undo paste by removing pasted views', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');
        copySelectedViews();

        const pasted = pasteViews();
        const operation = createPasteOperation(pasted);

        const templateBefore = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(templateBefore?.children ?? {}).length).toBe(2);

        operation.undo();

        const templateAfter = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(templateAfter?.children ?? {}).length).toBe(1);
      });
    });
  });
});
