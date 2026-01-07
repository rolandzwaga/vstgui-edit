import { beforeEach, describe, expect, it } from 'vitest';
import { createMockContainer, createMockDocument, createMockView } from '../../../__tests__/helpers/fixtures';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { documentStore, reset as resetDocument, setDocumentForTest } from '../../../stores/documentStore';
import { clearHistory, historyStore, pushOperation, redo, undo } from '../../../stores/historyStore';
import { clearSelection, resetSelection, select, selectAll, selectionStore } from '../../../stores/selectionStore';
import { createDeleteOperation, deleteSelectedViews } from '../viewOperations';

describe('viewOperations', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetDocument();
      clearHistory();
      resetSelection();
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
});
