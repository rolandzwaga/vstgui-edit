import { beforeEach, describe, expect, it } from 'vitest';
import { createMockContainer, createMockDocument, createMockView } from '../../../__tests__/helpers/fixtures';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { resetClipboard } from '../../../stores/clipboardStore';
import { documentStore, reset as resetDocument, setDocumentForTest } from '../../../stores/documentStore';
import { clearHistory, historyStore, pushOperation, redo, undo } from '../../../stores/historyStore';
import { clearSelection, resetSelection, select, selectAll, selectionStore } from '../../../stores/selectionStore';
import type { RenderableView } from '../../../types/canvas';
import {
  canPaste,
  copySelectedViews,
  createCreateOperation,
  createDeleteOperation,
  createDuplicateOperation,
  createNewView,
  createPasteOperation,
  cutSelectedViews,
  deleteSelectedViews,
  duplicateSelectedViews,
  findContainerAtPoint,
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

    it('should have no-op redo for duplicate (SC-004 note: new IDs make exact redo impossible)', () => {
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

        operation.undo();
        const templateAfterUndo = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(templateAfterUndo?.children ?? {}).length).toBe(1);

        operation.redo();
        const templateAfterRedo = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(templateAfterRedo?.children ?? {}).length).toBe(1);
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

    it('should paste into selected container (FR-010)', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100', size: '50, 20' }),
                '1': createMockContainer({ origin: '200, 200', size: '300, 300' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);

        // Copy view-0
        select('MainView-0');
        copySelectedViews();

        // Select container view-1, then paste
        select('MainView-1');
        const pasted = pasteViews();

        expect(pasted).toHaveLength(1);
        // Pasted view should be child of the container (MainView-1), not sibling
        expect(pasted[0]).toMatch(/^MainView-1-/);

        // Verify structure
        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        const container = template?.children?.['1'];
        expect(container?.children).toBeDefined();
        expect(Object.keys(container?.children ?? {}).length).toBe(1);
        expect(container?.children?.['0']?.attributes.class).toBe('CTextLabel');
      });
    });

    it('should paste as sibling when no view is selected (FR-011)', () => {
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

        // Copy view
        select('MainView-0');
        copySelectedViews();

        // Clear selection, then paste
        clearSelection();
        const pasted = pasteViews();

        expect(pasted).toHaveLength(1);
        // Should paste into original parent (MainView)
        expect(pasted[0]).toMatch(/^MainView-\d+$/);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(template?.children ?? {}).length).toBe(2);
      });
    });

    it('should paste as sibling when non-container is selected (FR-011)', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100' }),
                '1': createMockView({ class: 'CTextButton', origin: '200, 200' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);

        // Copy view-0
        select('MainView-0');
        copySelectedViews();

        // Select non-container view-1, then paste
        select('MainView-1');
        const pasted = pasteViews();

        expect(pasted).toHaveLength(1);
        // Should paste as sibling (child of MainView, not child of view-1)
        expect(pasted[0]).toMatch(/^MainView-\d+$/);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(template?.children ?? {}).length).toBe(3);
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

    it('should have no-op redo for paste (SC-004 note: new IDs make exact redo impossible)', () => {
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

        operation.undo();
        const templateAfterUndo = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(templateAfterUndo?.children ?? {}).length).toBe(1);

        operation.redo();
        const templateAfterRedo = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(templateAfterRedo?.children ?? {}).length).toBe(1);
      });
    });
  });

  describe('clipboard operation performance (SC-003)', () => {
    it('should complete all clipboard operations in < 100ms', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockContainer(
                  { origin: '10, 10', size: '200, 200' },
                  {
                    '0': createMockView({ class: 'CTextLabel', origin: '5, 5' }),
                    '1': createMockView({ class: 'CTextButton', origin: '5, 30' }),
                    '2': createMockView({ class: 'CSlider', origin: '5, 60' }),
                  }
                ),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const copyStart = performance.now();
        copySelectedViews();
        const copyDuration = performance.now() - copyStart;

        const pasteStart = performance.now();
        pasteViews();
        const pasteDuration = performance.now() - pasteStart;

        clearSelection();
        select('MainView-0');

        const cutStart = performance.now();
        cutSelectedViews();
        const cutDuration = performance.now() - cutStart;

        select('MainView-1');

        const duplicateStart = performance.now();
        duplicateSelectedViews();
        const duplicateDuration = performance.now() - duplicateStart;

        expect(copyDuration).toBeLessThan(100);
        expect(pasteDuration).toBeLessThan(100);
        expect(cutDuration).toBeLessThan(100);
        expect(duplicateDuration).toBeLessThan(100);
      });
    });
  });

  describe('pasteViews with pointer position (US5)', () => {
    it('should paste at pointer position when pointer is inside template bounds', () => {
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
        clearSelection();

        const pointerPosition = { x: 400, y: 300 };
        const templateBounds = { width: 800, height: 600 };
        const pasted = pasteViews({ pointerPosition, templateBounds });

        expect(pasted).toHaveLength(1);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        const pastedView = template?.children?.['1'];
        const origin = pastedView?.attributes.origin?.split(', ').map(Number);
        expect(origin?.[0]).toBe(375);
        expect(origin?.[1]).toBe(290);
      });
    });

    it('should fall back to offset paste when pointer is outside template bounds', () => {
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
        clearSelection();

        const pointerPosition = { x: 900, y: 700 };
        const templateBounds = { width: 800, height: 600 };
        const pasted = pasteViews({ pointerPosition, templateBounds });

        expect(pasted).toHaveLength(1);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        const pastedView = template?.children?.['1'];
        expect(pastedView?.attributes.origin).toBe('110, 110');
      });
    });

    it('should fall back to offset paste when no pointer position provided', () => {
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
        clearSelection();

        const pasted = pasteViews();

        expect(pasted).toHaveLength(1);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        const pastedView = template?.children?.['1'];
        expect(pastedView?.attributes.origin).toBe('110, 110');
      });
    });

    it('should center multiple views around pointer position', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100', size: '50, 20' }),
                '1': createMockView({ class: 'CTextButton', origin: '200, 100', size: '50, 20' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        selectAll(['MainView-0', 'MainView-1']);
        copySelectedViews();
        clearSelection();

        const pointerPosition = { x: 400, y: 300 };
        const templateBounds = { width: 800, height: 600 };
        const pasted = pasteViews({ pointerPosition, templateBounds });

        expect(pasted).toHaveLength(2);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        const pastedView1 = template?.children?.['2'];
        const pastedView2 = template?.children?.['3'];

        const origin1 = pastedView1?.attributes.origin?.split(', ').map(Number);
        const origin2 = pastedView2?.attributes.origin?.split(', ').map(Number);

        expect(origin1?.[0]).toBe(325);
        expect(origin2?.[0]).toBe(425);
        expect(origin1?.[1]).toBe(origin2?.[1]);
      });
    });
  });

  describe('findContainerAtPoint', () => {
    function createTestView(overrides: Partial<RenderableView>): RenderableView {
      return {
        id: 'test',
        absoluteX: 0,
        absoluteY: 0,
        relativeX: 0,
        relativeY: 0,
        width: 100,
        height: 100,
        className: 'CTextLabel',
        category: 'display',
        zIndex: 0,
        parentId: null,
        ...overrides,
      };
    }

    it('should return null when no containers exist', () => {
      const views = [
        createTestView({ id: 'view1', className: 'CTextLabel' }),
        createTestView({ id: 'view2', className: 'CSlider' }),
      ];

      const result = findContainerAtPoint(views, { x: 50, y: 50 });
      expect(result).toBeNull();
    });

    it('should find container at point', () => {
      const views = [
        createTestView({
          id: 'container1',
          className: 'CViewContainer',
          absoluteX: 0,
          absoluteY: 0,
          width: 200,
          height: 200,
          category: 'container',
        }),
      ];

      const result = findContainerAtPoint(views, { x: 100, y: 100 });
      expect(result?.id).toBe('container1');
    });

    it('should return null when point is outside all containers', () => {
      const views = [
        createTestView({
          id: 'container1',
          className: 'CViewContainer',
          absoluteX: 0,
          absoluteY: 0,
          width: 100,
          height: 100,
          category: 'container',
        }),
      ];

      const result = findContainerAtPoint(views, { x: 150, y: 150 });
      expect(result).toBeNull();
    });

    it('should return topmost container when multiple overlap', () => {
      const views = [
        createTestView({
          id: 'container1',
          className: 'CViewContainer',
          absoluteX: 0,
          absoluteY: 0,
          width: 200,
          height: 200,
          zIndex: 0,
          category: 'container',
        }),
        createTestView({
          id: 'container2',
          className: 'CViewContainer',
          absoluteX: 50,
          absoluteY: 50,
          width: 100,
          height: 100,
          zIndex: 1,
          category: 'container',
        }),
      ];

      const result = findContainerAtPoint(views, { x: 75, y: 75 });
      expect(result?.id).toBe('container2');
    });

    it('should exclude specified container IDs', () => {
      const views = [
        createTestView({
          id: 'container1',
          className: 'CViewContainer',
          absoluteX: 0,
          absoluteY: 0,
          width: 200,
          height: 200,
          zIndex: 1,
          category: 'container',
        }),
        createTestView({
          id: 'container2',
          className: 'CViewContainer',
          absoluteX: 0,
          absoluteY: 0,
          width: 200,
          height: 200,
          zIndex: 0,
          category: 'container',
        }),
      ];

      const result = findContainerAtPoint(views, { x: 100, y: 100 }, new Set(['container1']));
      expect(result?.id).toBe('container2');
    });
  });

  describe('createNewView', () => {
    it('should create a view with default size', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {}
            ),
          },
        });
        setDocumentForTest(doc);

        const newId = createNewView({
          className: 'CTextButton',
          parentId: 'MainView',
          position: { x: 100, y: 100 },
        });

        expect(newId).toBe('MainView-0');

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        const newView = template?.children?.['0'];
        expect(newView?.attributes.class).toBe('CTextButton');
        expect(newView?.attributes.origin).toBe('100, 100');
        expect(newView?.attributes.size).toBe('100, 30');
      });
    });

    it('should select the new view after creation', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {}
            ),
          },
        });
        setDocumentForTest(doc);

        const newId = createNewView({
          className: 'CSlider',
          parentId: 'MainView',
          position: { x: 50, y: 50 },
        });

        expect(selectionStore.selectedIds.has(newId!)).toBe(true);
      });
    });

    it('should return null if parent does not exist', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {}
            ),
          },
        });
        setDocumentForTest(doc);

        const newId = createNewView({
          className: 'CTextLabel',
          parentId: 'NonExistent',
          position: { x: 100, y: 100 },
        });

        expect(newId).toBeNull();
      });
    });

    it('should create container with empty children', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {}
            ),
          },
        });
        setDocumentForTest(doc);

        createNewView({
          className: 'CViewContainer',
          parentId: 'MainView',
          position: { x: 100, y: 100 },
        });

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        const newView = template?.children?.['0'];
        expect(newView?.children).toEqual({});
      });
    });
  });

  describe('createCreateOperation', () => {
    it('should create a history operation for view creation', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {}
            ),
          },
        });
        setDocumentForTest(doc);

        const newId = createNewView({
          className: 'CTextLabel',
          parentId: 'MainView',
          position: { x: 100, y: 100 },
        });

        const operation = createCreateOperation(newId!, 'CTextLabel');

        expect(operation.type).toBe('create');
        expect(operation.description).toBe('Create CTextLabel');
        expect(typeof operation.undo).toBe('function');
      });
    });

    it('should undo creation by removing the view', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {}
            ),
          },
        });
        setDocumentForTest(doc);

        const newId = createNewView({
          className: 'CTextLabel',
          parentId: 'MainView',
          position: { x: 100, y: 100 },
        });

        const operation = createCreateOperation(newId!, 'CTextLabel');

        const templateBefore = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(templateBefore?.children ?? {}).length).toBe(1);

        operation.undo();

        const templateAfter = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(templateAfter?.children ?? {}).length).toBe(0);
      });
    });
  });
});
