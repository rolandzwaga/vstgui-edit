import { beforeEach, describe, expect, it } from 'vitest';
import { createMockContainer, createMockDocument, createMockView } from '../../__tests__/helpers/fixtures';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  documentStore,
  getChildIds,
  getChildIndex,
  getParentId,
  reorderView,
  reparentView,
  reset,
  setDocumentForTest,
} from '../documentStore';

describe('documentStore hierarchy mutations', () => {
  beforeEach(() => {
    reset();
  });

  describe('getParentId', () => {
    it('should return null for root template', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(),
          },
        });
        setDocumentForTest(doc);

        expect(getParentId('MainView')).toBeNull();
      }));

    it('should return parent ID for direct child', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              child1: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        expect(getParentId('MainView-child1')).toBe('MainView');
      }));

    it('should return parent ID for nested child', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              container: createMockContainer({}, {
                nested: createMockView(),
              }),
            }),
          },
        });
        setDocumentForTest(doc);

        expect(getParentId('MainView-container-nested')).toBe('MainView-container');
      }));
  });

  describe('getChildIds', () => {
    it('should return empty array for leaf view', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              leaf: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        expect(getChildIds('MainView-leaf')).toEqual([]);
      }));

    it('should return child IDs for container', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView(),
              b: createMockView(),
              c: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const childIds = getChildIds('MainView');
        expect(childIds).toHaveLength(3);
        expect(childIds).toContain('MainView-a');
        expect(childIds).toContain('MainView-b');
        expect(childIds).toContain('MainView-c');
      }));
  });

  describe('getChildIndex', () => {
    it('should return index of child among siblings', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView(),
              b: createMockView(),
              c: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const childIds = getChildIds('MainView');
        expect(getChildIndex('MainView-a')).toBe(childIds.indexOf('MainView-a'));
        expect(getChildIndex('MainView-b')).toBe(childIds.indexOf('MainView-b'));
        expect(getChildIndex('MainView-c')).toBe(childIds.indexOf('MainView-c'));
      }));

    it('should return -1 for root', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: { MainView: createMockContainer() },
        });
        setDocumentForTest(doc);

        expect(getChildIndex('MainView')).toBe(-1);
      }));
  });

  describe('reparentView', () => {
    it('should move view from one container to another', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              container1: createMockContainer({}, {
                child: createMockView({ class: 'CTextLabel' }),
              }),
              container2: createMockContainer(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = reparentView('MainView-container1-child', 'MainView-container2');

        expect(result).not.toBeNull();
        expect(result?.oldParentId).toBe('MainView-container1');
        expect(result?.newParentId).toBe('MainView-container2');

        expect(getChildIds('MainView-container1')).toHaveLength(0);
        expect(getChildIds('MainView-container2')).toHaveLength(1);
      }));

    it('should preserve view attributes after reparent', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              source: createMockContainer({}, {
                view: createMockView({ class: 'CKnob', title: 'Volume' }),
              }),
              target: createMockContainer(),
            }),
          },
        });
        setDocumentForTest(doc);

        reparentView('MainView-source-view', 'MainView-target');

        const vstgui = documentStore.document?.['vstgui-ui-description'];
        const targetChildren = vstgui?.templates?.MainView?.children?.target?.children;
        const movedView = targetChildren ? Object.values(targetChildren)[0] : null;

        expect(movedView?.attributes.class).toBe('CKnob');
        expect(movedView?.attributes.title).toBe('Volume');
      }));

    it('should return null when reparenting to non-existent container', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              child: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = reparentView('MainView-child', 'MainView-nonexistent');
        expect(result).toBeNull();
      }));

    it('should return null when view does not exist', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              container: createMockContainer(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = reparentView('MainView-nonexistent', 'MainView-container');
        expect(result).toBeNull();
      }));

    it('should not allow reparenting root template', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              container: createMockContainer(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = reparentView('MainView', 'MainView-container');
        expect(result).toBeNull();
      }));

    it('should update origin to maintain absolute position', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ origin: '0, 0' }, {
              source: createMockContainer({ origin: '10, 10' }, {
                view: createMockView({ origin: '20, 20' }),
              }),
              target: createMockContainer({ origin: '50, 50' }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = reparentView('MainView-source-view', 'MainView-target', undefined, '-20, -20');

        expect(result).not.toBeNull();

        const vstgui = documentStore.document?.['vstgui-ui-description'];
        const targetChildren = vstgui?.templates?.MainView?.children?.target?.children;
        const movedView = targetChildren ? Object.values(targetChildren)[0] : null;

        expect(movedView?.attributes.origin).toBe('-20, -20');
      }));
  });

  describe('reorderView', () => {
    it('should change position of view among siblings', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView(),
              b: createMockView(),
              c: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const initialOrder = getChildIds('MainView');
        const result = reorderView('MainView-c', 0);

        expect(result).not.toBeNull();
        expect(result?.oldIndex).toBe(initialOrder.indexOf('MainView-c'));
        expect(result?.newIndex).toBe(0);
      }));

    it('should return null for root template', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: { MainView: createMockContainer() },
        });
        setDocumentForTest(doc);

        const result = reorderView('MainView', 0);
        expect(result).toBeNull();
      }));

    it('should return null for invalid index', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView(),
              b: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = reorderView('MainView-a', 10);
        expect(result).toBeNull();
      }));

    it('should return null when already at target index', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView(),
              b: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const currentIndex = getChildIndex('MainView-a');
        const result = reorderView('MainView-a', currentIndex);
        expect(result).toBeNull();
      }));
  });
});
