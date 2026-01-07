import { beforeEach, describe, expect, it } from 'vitest';
import { createMockContainer, createMockDocument, createMockView } from '../../__tests__/helpers/fixtures';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  createGroupContainer,
  documentStore,
  getChildIds,
  reset,
  setDocumentForTest,
  ungroupContainer,
} from '../documentStore';

describe('documentStore group/ungroup mutations', () => {
  beforeEach(() => {
    reset();
  });

  describe('createGroupContainer', () => {
    it('should create new container with specified views', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView({ origin: '10, 10', size: '50, 50' }),
              b: createMockView({ origin: '70, 10', size: '50, 50' }),
              c: createMockView({ origin: '130, 10', size: '50, 50' }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createGroupContainer(
          ['MainView-a', 'MainView-b'],
          'new-group',
          { origin: '10, 10', size: '110, 50' }
        );

        expect(result).not.toBeNull();
        expect(result?.groupId).toBe('MainView-new-group');
        expect(result?.movedViewIds).toHaveLength(2);

        const mainChildren = getChildIds('MainView');
        expect(mainChildren).toContain('MainView-new-group');
        expect(mainChildren).toContain('MainView-c');
        expect(mainChildren).not.toContain('MainView-a');
        expect(mainChildren).not.toContain('MainView-b');
      }));

    it('should set container attributes', () =>
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

        createGroupContainer(
          ['MainView-a', 'MainView-b'],
          'group1',
          { origin: '100, 200', size: '300, 400' }
        );

        const vstgui = documentStore.document?.['vstgui-ui-description'];
        const group = vstgui?.templates?.MainView?.children?.group1;

        expect(group?.attributes.class).toBe('CViewContainer');
        expect(group?.attributes.origin).toBe('100, 200');
        expect(group?.attributes.size).toBe('300, 400');
      }));

    it('should return null if views have different parents', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              container1: createMockContainer({}, {
                a: createMockView(),
              }),
              container2: createMockContainer({}, {
                b: createMockView(),
              }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createGroupContainer(
          ['MainView-container1-a', 'MainView-container2-b'],
          'group',
          { origin: '0, 0', size: '100, 100' }
        );

        expect(result).toBeNull();
      }));

    it('should return null if only one view provided', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createGroupContainer(
          ['MainView-a'],
          'group',
          { origin: '0, 0', size: '100, 100' }
        );

        expect(result).toBeNull();
      }));

    it('should return null if empty array provided', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(),
          },
        });
        setDocumentForTest(doc);

        const result = createGroupContainer(
          [],
          'group',
          { origin: '0, 0', size: '100, 100' }
        );

        expect(result).toBeNull();
      }));
  });

  describe('ungroupContainer', () => {
    it('should move children to parent and delete container', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              group: createMockContainer({}, {
                a: createMockView(),
                b: createMockView(),
              }),
              other: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = ungroupContainer('MainView-group');

        expect(result).not.toBeNull();
        expect(result?.containerId).toBe('MainView-group');
        expect(result?.childIds).toHaveLength(2);

        const mainChildren = getChildIds('MainView');
        expect(mainChildren).not.toContain('MainView-group');
        expect(mainChildren).toContain('MainView-other');
        expect(mainChildren.length).toBeGreaterThanOrEqual(3);
      }));

    it('should return null for root template', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = ungroupContainer('MainView');
        expect(result).toBeNull();
      }));

    it('should return null for non-container view', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              leaf: createMockView({ class: 'CTextLabel' }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = ungroupContainer('MainView-leaf');
        expect(result).toBeNull();
      }));

    it('should delete empty container', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              emptyGroup: createMockContainer(),
              other: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = ungroupContainer('MainView-emptyGroup');

        expect(result).not.toBeNull();
        expect(result?.childIds).toHaveLength(0);

        const mainChildren = getChildIds('MainView');
        expect(mainChildren).not.toContain('MainView-emptyGroup');
        expect(mainChildren).toContain('MainView-other');
      }));

    it('should preserve container attributes in result for undo', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              group: createMockContainer(
                { origin: '50, 50', size: '200, 200', 'background-color': '#ff0000' },
                { child: createMockView() }
              ),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = ungroupContainer('MainView-group');

        expect(result?.containerOrigin).toBe('50, 50');
        expect(result?.containerSize).toBe('200, 200');
        expect(result?.containerAttributes['background-color']).toBe('#ff0000');
      }));
  });
});
