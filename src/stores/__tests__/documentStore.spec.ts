import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockContainer, createMockDocument, createMockUidescFile, createMockView } from '../../__tests__/helpers/fixtures';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import type { NewDocumentConfig } from '../../types/createNew';
import {
  addView,
  createNewDocument,
  documentStore,
  duplicateView,
  loadFile,
  type RemovedViewInfo,
  removeView,
  removeViews,
  reset,
  restoreView,
  setDocumentForTest,
  setDragging,
} from '../documentStore';

describe('documentStore', () => {
  beforeEach(() => {
    reset();
  });

  describe('initial state', () => {
    it('should have idle upload state with null content', () => {
      expect(documentStore.uploadState).toBe('idle');
      expect(documentStore.content).toBeNull();
      expect(documentStore.metadata).toBeNull();
      expect(documentStore.error).toBeNull();
    });
  });

  describe('loadFile', () => {
    it('should read file and store raw string content', async () => {
      const content = '<?xml version="1.0"?><root/>';
      const file = createMockUidescFile(content);

      await loadFile(file);

      expect(documentStore.content).toBe(content);
    });

    it('should set metadata with filename, fileSize, and loadedAt', async () => {
      const content = 'test content';
      const file = createMockUidescFile(content, 'myfile.uidesc');

      await loadFile(file);

      expect(documentStore.metadata).not.toBeNull();
      expect(documentStore.metadata?.filename).toBe('myfile.uidesc');
      expect(documentStore.metadata?.fileSize).toBe(content.length);
      expect(documentStore.metadata?.loadedAt).toBeInstanceOf(Date);
    });

    it('should transition through loading → success states', async () => {
      const states: string[] = [];
      const content = 'test content';
      const file = createMockUidescFile(content);

      // We'll track state changes by checking before and after
      expect(documentStore.uploadState).toBe('idle');

      const loadPromise = loadFile(file);

      // During loading
      expect(documentStore.uploadState).toBe('loading');
      states.push(documentStore.uploadState);

      await loadPromise;

      // After loading
      expect(documentStore.uploadState).toBe('success');
      states.push(documentStore.uploadState);

      expect(states).toEqual(['loading', 'success']);
    });

    it('should set error state for empty file', async () => {
      const file = new File([''], 'empty.uidesc', { type: 'text/plain' });

      await loadFile(file);

      expect(documentStore.uploadState).toBe('error');
      expect(documentStore.error).not.toBeNull();
      expect(documentStore.error?.type).toBe('empty-file');
    });

    it('should set error state for invalid extension', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      await loadFile(file);

      expect(documentStore.uploadState).toBe('error');
      expect(documentStore.error).not.toBeNull();
      expect(documentStore.error?.type).toBe('invalid-extension');
      if (documentStore.error?.type === 'invalid-extension') {
        expect(documentStore.error.filename).toBe('test.txt');
      }
    });

    it('should handle case-insensitive .uidesc extension', async () => {
      const content = 'test content';
      const file = createMockUidescFile(content, 'Test.UIDESC');

      await loadFile(file);

      expect(documentStore.uploadState).toBe('success');
      expect(documentStore.content).toBe(content);
    });
  });

  describe('reset', () => {
    it('should clear content and return to idle', async () => {
      const content = 'test content';
      const file = createMockUidescFile(content);
      await loadFile(file);

      expect(documentStore.content).not.toBeNull();

      reset();

      expect(documentStore.content).toBeNull();
      expect(documentStore.metadata).toBeNull();
      expect(documentStore.uploadState).toBe('idle');
      expect(documentStore.error).toBeNull();
    });
  });

  describe('setDragging', () => {
    it('should update uploadState to dragging when true', () => {
      setDragging(true);
      expect(documentStore.uploadState).toBe('dragging');
    });

    it('should update uploadState to idle when false', () => {
      setDragging(true);
      expect(documentStore.uploadState).toBe('dragging');

      setDragging(false);
      expect(documentStore.uploadState).toBe('idle');
    });

    it('should not change state from success when setDragging(false)', async () => {
      const content = 'test content';
      const file = createMockUidescFile(content);
      await loadFile(file);

      expect(documentStore.uploadState).toBe('success');

      setDragging(false);

      // Should remain in success state, not go back to idle
      expect(documentStore.uploadState).toBe('success');
    });
  });

  describe('removeView', () => {
    beforeEach(() => {
      testInRoot(() => {
        reset();
      });
    });

    it('should return null when no document is loaded', () => {
      testInRoot(() => {
        const result = removeView('view-0');
        expect(result).toBeNull();
      });
    });

    it('should return null when trying to remove root template', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ origin: '0, 0', size: '800, 600' }),
          },
        });
        setDocumentForTest(doc);

        const result = removeView('MainView');
        expect(result).toBeNull();
      });
    });

    it('should return null for non-existent view', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ origin: '0, 0', size: '800, 600' }),
          },
        });
        setDocumentForTest(doc);

        const result = removeView('MainView-nonexistent');
        expect(result).toBeNull();
      });
    });

    it('should remove a child view and return its info', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '10, 10', size: '100, 20' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);

        const result = removeView('MainView-0');

        expect(result).not.toBeNull();
        expect(result?.viewId).toBe('MainView-0');
        expect(result?.childKey).toBe('0');
        expect(result?.parentId).toBe('MainView');
        expect(result?.viewData.attributes.class).toBe('CTextLabel');
      });
    });

    it('should actually remove the view from the document', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '10, 10' }),
                '1': createMockView({ class: 'CTextButton', origin: '20, 20' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);

        removeView('MainView-0');

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(template?.children?.['0']).toBeUndefined();
        expect(template?.children?.['1']).toBeDefined();
      });
    });

    it('should remove nested views with their children', () => {
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
                  }
                ),
              }
            ),
          },
        });
        setDocumentForTest(doc);

        const result = removeView('MainView-0');

        expect(result).not.toBeNull();
        expect(result?.viewData.children?.['0']).toBeDefined();

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(template?.children?.['0']).toBeUndefined();
      });
    });
  });

  describe('removeViews', () => {
    beforeEach(() => {
      testInRoot(() => {
        reset();
      });
    });

    it('should remove multiple views and return their info', () => {
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

        const result = removeViews(['MainView-0', 'MainView-2']);

        expect(result).toHaveLength(2);
        expect(result.map(r => r.viewId)).toContain('MainView-0');
        expect(result.map(r => r.viewId)).toContain('MainView-2');
      });
    });

    it('should skip non-existent views silently', () => {
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

        const result = removeViews(['MainView-0', 'MainView-nonexistent']);

        expect(result).toHaveLength(1);
        expect(result[0].viewId).toBe('MainView-0');
      });
    });

    it('should handle removing parent and child by removing deepest first', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockContainer(
                  { origin: '10, 10' },
                  {
                    '0': createMockView({ class: 'CTextLabel' }),
                  }
                ),
              }
            ),
          },
        });
        setDocumentForTest(doc);

        const result = removeViews(['MainView-0', 'MainView-0-0']);

        expect(result).toHaveLength(2);
        expect(result[0].viewId).toBe('MainView-0-0');
        expect(result[1].viewId).toBe('MainView-0');
      });
    });
  });

  describe('addView', () => {
    beforeEach(() => {
      testInRoot(() => {
        reset();
      });
    });

    it('should return null when no document is loaded', () => {
      testInRoot(() => {
        const view = createMockView({ class: 'CTextLabel' });
        const result = addView('MainView', view);
        expect(result).toBeNull();
      });
    });

    it('should return null for non-existent parent', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ origin: '0, 0', size: '800, 600' }),
          },
        });
        setDocumentForTest(doc);

        const view = createMockView({ class: 'CTextLabel' });
        const result = addView('NonExistent', view);
        expect(result).toBeNull();
      });
    });

    it('should add a view to the root template', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ origin: '0, 0', size: '800, 600' }),
          },
        });
        setDocumentForTest(doc);

        const view = createMockView({ class: 'CTextLabel', origin: '50, 50' });
        const newId = addView('MainView', view);

        expect(newId).toBe('MainView-0');

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(template?.children?.['0']?.attributes.class).toBe('CTextLabel');
      });
    });

    it('should add a view to a nested container', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockContainer({ origin: '10, 10', size: '200, 200' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);

        const view = createMockView({ class: 'CSlider' });
        const newId = addView('MainView-0', view);

        expect(newId).toBe('MainView-0-0');

        const container = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView']?.children?.['0'];
        expect(container?.children?.['0']?.attributes.class).toBe('CSlider');
      });
    });

    it('should use provided childKey when specified', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ origin: '0, 0', size: '800, 600' }),
          },
        });
        setDocumentForTest(doc);

        const view = createMockView({ class: 'CTextLabel' });
        const newId = addView('MainView', view, 'customKey');

        expect(newId).toBe('MainView-customKey');
      });
    });

    it('should generate unique keys for multiple additions', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ origin: '0, 0', size: '800, 600' }),
          },
        });
        setDocumentForTest(doc);

        const view1 = createMockView({ class: 'CTextLabel' });
        const view2 = createMockView({ class: 'CTextButton' });

        const id1 = addView('MainView', view1);
        const id2 = addView('MainView', view2);

        expect(id1).toBe('MainView-0');
        expect(id2).toBe('MainView-1');
      });
    });
  });

  describe('restoreView', () => {
    beforeEach(() => {
      testInRoot(() => {
        reset();
      });
    });

    it('should restore a previously removed view', () => {
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

        const removed = removeView('MainView-0');
        expect(removed).not.toBeNull();

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(template?.children?.['0']).toBeUndefined();

        const restored = restoreView(removed as RemovedViewInfo);
        expect(restored).toBe('MainView-0');

        const templateAfter = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(templateAfter?.children?.['0']?.attributes.class).toBe('CTextLabel');
      });
    });

    it('should return null if parent no longer exists', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockContainer(
                  { origin: '10, 10' },
                  {
                    '0': createMockView({ class: 'CTextLabel' }),
                  }
                ),
              }
            ),
          },
        });
        setDocumentForTest(doc);

        const removedChild = removeView('MainView-0-0');
        removeView('MainView-0');

        const restored = restoreView(removedChild as RemovedViewInfo);
        expect(restored).toBeNull();
      });
    });
  });

  describe('duplicateView', () => {
    beforeEach(() => {
      testInRoot(() => {
        reset();
      });
    });

    it('should return null when no document is loaded', () => {
      testInRoot(() => {
        const result = duplicateView('MainView-0', { x: 10, y: 10 });
        expect(result).toBeNull();
      });
    });

    it('should return null for root template', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ origin: '0, 0', size: '800, 600' }),
          },
        });
        setDocumentForTest(doc);

        const result = duplicateView('MainView', { x: 10, y: 10 });
        expect(result).toBeNull();
      });
    });

    it('should duplicate a view with offset', () => {
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

        const newId = duplicateView('MainView-0', { x: 10, y: 10 });

        expect(newId).toBe('MainView-1');

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        const newView = template?.children?.['1'];
        expect(newView?.attributes.class).toBe('CTextLabel');
        expect(newView?.attributes.origin).toBe('110, 110');
        expect(newView?.attributes.size).toBe('50, 20');
      });
    });

    it('should duplicate a container with its children', () => {
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

        const newId = duplicateView('MainView-0', { x: 20, y: 20 });

        expect(newId).toBe('MainView-1');

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        const newContainer = template?.children?.['1'];
        expect(newContainer?.attributes.origin).toBe('70, 70');
        expect(newContainer?.children?.['0']?.attributes.class).toBe('CTextLabel');
      });
    });
  });

  describe('createNewDocument', () => {
    const defaultConfig: NewDocumentConfig = {
      width: 800,
      height: 600,
      containerClass: 'CViewContainer',
    };

    beforeEach(() => {
      testInRoot(() => {
        reset();
      });
    });

    it('should set document with correct structure', () => {
      testInRoot(() => {
        createNewDocument(defaultConfig);

        expect(documentStore.document).not.toBeNull();
        expect(documentStore.document?.['vstgui-ui-description']).toBeDefined();
        expect(documentStore.document?.['vstgui-ui-description']?.version).toBe('1');
        expect(documentStore.document?.['vstgui-ui-description']?.templates?.view).toBeDefined();

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.view;
        expect(template?.attributes.class).toBe('CViewContainer');
        expect(template?.attributes.size).toBe('800, 600');
        expect(template?.attributes.origin).toBe('0, 0');
        expect(template?.attributes['background-color']).toBe('~ BlackCColor');
      });
    });

    it('should set parseState to valid', () => {
      testInRoot(() => {
        createNewDocument(defaultConfig);
        expect(documentStore.parseState).toBe('valid');
      });
    });

    it('should set detectedFormat and originalFormat to json', () => {
      testInRoot(() => {
        createNewDocument(defaultConfig);
        expect(documentStore.detectedFormat).toBe('json');
        expect(documentStore.originalFormat).toBe('json');
      });
    });

    it('should set isDirty to false', () => {
      testInRoot(() => {
        createNewDocument(defaultConfig);
        expect(documentStore.isDirty).toBe(false);
      });
    });

    it('should clear fileHandle, lastSavedAt, metadata', () => {
      testInRoot(() => {
        createNewDocument(defaultConfig);
        expect(documentStore.fileHandle).toBeNull();
        expect(documentStore.lastSavedAt).toBeNull();
        expect(documentStore.metadata).toBeNull();
      });
    });

    it('should clear content', () => {
      testInRoot(() => {
        createNewDocument(defaultConfig);
        expect(documentStore.content).toBeNull();
      });
    });

    it('should use config container class', () => {
      testInRoot(() => {
        createNewDocument({
          width: 400,
          height: 300,
          containerClass: 'CScrollView',
        });

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.view;
        expect(template?.attributes.class).toBe('CScrollView');
      });
    });

    it('should use config dimensions', () => {
      testInRoot(() => {
        createNewDocument({
          width: 1024,
          height: 768,
          containerClass: 'CViewContainer',
        });

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.view;
        expect(template?.attributes.size).toBe('1024, 768');
      });
    });
  });
});
