import { beforeEach, describe, expect, it } from 'vitest';
import { createMockContainer, createMockDocument, createMockView } from '../../../__tests__/helpers/fixtures';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { reset, setDocumentForTest } from '../../../stores/documentStore';
import {
  calculateNewOrigin,
  createReparentOperation,
  isDescendantOf,
  validateReparent,
} from '../reparent';

describe('reparent domain logic', () => {
  beforeEach(() => {
    reset();
  });

  describe('isDescendantOf', () => {
    it('should return true when target is a child of source', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              parent: createMockContainer({}, {
                child: createMockView(),
              }),
            }),
          },
        });
        setDocumentForTest(doc);

        expect(isDescendantOf('MainView-parent-child', 'MainView-parent')).toBe(true);
      }));

    it('should return true when target is a grandchild of source', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              grandparent: createMockContainer({}, {
                parent: createMockContainer({}, {
                  child: createMockView(),
                }),
              }),
            }),
          },
        });
        setDocumentForTest(doc);

        expect(isDescendantOf('MainView-grandparent-parent-child', 'MainView-grandparent')).toBe(true);
      }));

    it('should return false when target is not a descendant of source', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              containerA: createMockContainer({}, {
                child: createMockView(),
              }),
              containerB: createMockContainer(),
            }),
          },
        });
        setDocumentForTest(doc);

        expect(isDescendantOf('MainView-containerA-child', 'MainView-containerB')).toBe(false);
      }));

    it('should return false when comparing same view', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              child: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        expect(isDescendantOf('MainView-child', 'MainView-child')).toBe(false);
      }));

    it('should return false when source is descendant of target (reverse)', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              parent: createMockContainer({}, {
                child: createMockView(),
              }),
            }),
          },
        });
        setDocumentForTest(doc);

        expect(isDescendantOf('MainView-parent', 'MainView-parent-child')).toBe(false);
      }));
  });

  describe('validateReparent', () => {
    it('should return valid for reparent to sibling container', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              containerA: createMockContainer({}, {
                child: createMockView(),
              }),
              containerB: createMockContainer(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = validateReparent('MainView-containerA-child', 'MainView-containerB');
        expect(result.isValid).toBe(true);
      }));

    it('should return self-drop error when dropping on self', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              container: createMockContainer(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = validateReparent('MainView-container', 'MainView-container');
        expect(result.isValid).toBe(false);
        expect(result.invalidReason).toBe('self-drop');
      }));

    it('should return circular error when dropping into own descendant', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              parent: createMockContainer({}, {
                child: createMockContainer(),
              }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = validateReparent('MainView-parent', 'MainView-parent-child');
        expect(result.isValid).toBe(false);
        expect(result.invalidReason).toBe('circular');
      }));

    it('should return non-container error when dropping into non-container', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              container: createMockContainer({}, {
                child: createMockView(),
              }),
              leaf: createMockView({ class: 'CTextLabel' }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = validateReparent('MainView-container-child', 'MainView-leaf');
        expect(result.isValid).toBe(false);
        expect(result.invalidReason).toBe('non-container');
      }));

    it('should return valid when target view not found (null check)', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              child: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = validateReparent('MainView-child', 'MainView-nonexistent');
        expect(result.isValid).toBe(false);
      }));
  });

  describe('calculateNewOrigin', () => {
    it('should preserve visual position when reparenting', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              containerA: createMockContainer({ origin: '100, 100' }, {
                child: createMockView({ origin: '50, 50' }),
              }),
              containerB: createMockContainer({ origin: '200, 150' }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = calculateNewOrigin(
          'MainView-containerA-child',
          'MainView-containerA',
          'MainView-containerB'
        );
        expect(result).toBe('-50, 0');
      }));

    it('should handle moving to root container', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({ origin: '0, 0' }, {
              container: createMockContainer({ origin: '100, 100' }, {
                child: createMockView({ origin: '20, 20' }),
              }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = calculateNewOrigin(
          'MainView-container-child',
          'MainView-container',
          'MainView'
        );
        expect(result).toBe('120, 120');
      }));

    it('should return null for invalid view', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(),
          },
        });
        setDocumentForTest(doc);

        const result = calculateNewOrigin('MainView-nonexistent', 'MainView', 'MainView');
        expect(result).toBeNull();
      }));
  });

  describe('createReparentOperation', () => {
    it('should create complete reparent operation with adjusted origin', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              containerA: createMockContainer({ origin: '100, 100' }, {
                child: createMockView({ origin: '50, 50' }),
              }),
              containerB: createMockContainer({ origin: '200, 150' }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createReparentOperation('MainView-containerA-child', 'MainView-containerB');

        expect(result).not.toBeNull();
        expect(result?.viewId).toBe('MainView-containerA-child');
        expect(result?.oldParentId).toBe('MainView-containerA');
        expect(result?.newParentId).toBe('MainView-containerB');
        expect(result?.oldOrigin).toBe('50, 50');
        expect(result?.newOrigin).toBe('-50, 0');
      }));

    it('should return null for invalid reparent (self-drop)', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              container: createMockContainer(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createReparentOperation('MainView-container', 'MainView-container');
        expect(result).toBeNull();
      }));

    it('should return null for circular reparent', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              parent: createMockContainer({}, {
                child: createMockContainer(),
              }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createReparentOperation('MainView-parent', 'MainView-parent-child');
        expect(result).toBeNull();
      }));

    it('should include old index in operation', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              container: createMockContainer({}, {
                first: createMockView(),
                second: createMockView(),
                third: createMockView(),
              }),
              target: createMockContainer(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createReparentOperation('MainView-container-second', 'MainView-target');
        expect(result?.oldIndex).toBe(1);
      }));
  });
});
