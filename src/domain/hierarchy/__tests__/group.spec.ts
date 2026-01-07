import { beforeEach, describe, expect, it } from 'vitest';
import { createMockContainer, createMockDocument, createMockView } from '../../../__tests__/helpers/fixtures';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { reset, setDocumentForTest } from '../../../stores/documentStore';
import {
  calculateGroupBounds,
  createGroupOperation,
  createUngroupOperation,
  validateGroup,
  validateUngroup,
} from '../group';

describe('group domain logic', () => {
  beforeEach(() => {
    reset();
  });

  describe('validateGroup', () => {
    it('should return valid for 2+ siblings', () =>
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

        const result = validateGroup(['MainView-a', 'MainView-b']);
        expect(result.isValid).toBe(true);
      }));

    it('should return invalid for single view', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = validateGroup(['MainView-a']);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe('need-multiple');
      }));

    it('should return invalid for empty array', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(),
          },
        });
        setDocumentForTest(doc);

        const result = validateGroup([]);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe('need-multiple');
      }));

    it('should return invalid for views with different parents', () =>
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

        const result = validateGroup(['MainView-container1-a', 'MainView-container2-b']);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe('different-parents');
      }));

    it('should return valid for 3+ siblings', () =>
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

        const result = validateGroup(['MainView-a', 'MainView-b', 'MainView-c']);
        expect(result.isValid).toBe(true);
      }));
  });

  describe('calculateGroupBounds', () => {
    it('should calculate bounding box of selected views', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView({ origin: '10, 20', size: '50, 30' }),
              b: createMockView({ origin: '100, 50', size: '40, 60' }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = calculateGroupBounds(['MainView-a', 'MainView-b']);

        expect(result).not.toBeNull();
        expect(result?.origin).toBe('10, 20');
        expect(result?.size).toBe('130, 90');
      }));

    it('should handle overlapping views', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView({ origin: '10, 10', size: '100, 100' }),
              b: createMockView({ origin: '50, 50', size: '100, 100' }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = calculateGroupBounds(['MainView-a', 'MainView-b']);

        expect(result?.origin).toBe('10, 10');
        expect(result?.size).toBe('140, 140');
      }));

    it('should return null for empty array', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(),
          },
        });
        setDocumentForTest(doc);

        const result = calculateGroupBounds([]);
        expect(result).toBeNull();
      }));

    it('should return null for nonexistent views', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(),
          },
        });
        setDocumentForTest(doc);

        const result = calculateGroupBounds(['MainView-nonexistent']);
        expect(result).toBeNull();
      }));
  });

  describe('createGroupOperation', () => {
    it('should create group operation with correct data', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView({ origin: '10, 20', size: '50, 30' }),
              b: createMockView({ origin: '100, 50', size: '40, 60' }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createGroupOperation(['MainView-a', 'MainView-b']);

        expect(result).not.toBeNull();
        expect(result?.viewIds).toEqual(['MainView-a', 'MainView-b']);
        expect(result?.parentId).toBe('MainView');
        expect(result?.containerOrigin).toBe('10, 20');
        expect(result?.containerSize).toBe('130, 90');
        expect(result?.newContainerId).toMatch(/^group-/);
      }));

    it('should calculate new origins relative to container', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView({ origin: '10, 20', size: '50, 30' }),
              b: createMockView({ origin: '100, 50', size: '40, 60' }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createGroupOperation(['MainView-a', 'MainView-b']);

        expect(result?.newOrigins).toEqual(['0, 0', '90, 30']);
      }));

    it('should return null for invalid group (single view)', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createGroupOperation(['MainView-a']);
        expect(result).toBeNull();
      }));

    it('should preserve original indices', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              first: createMockView(),
              second: createMockView(),
              third: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createGroupOperation(['MainView-first', 'MainView-third']);

        expect(result?.originalIndices).toEqual([0, 2]);
      }));
  });

  describe('validateUngroup', () => {
    it('should return valid for container with children', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              group: createMockContainer({}, {
                child: createMockView(),
              }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = validateUngroup('MainView-group');
        expect(result.isValid).toBe(true);
      }));

    it('should return invalid for root template', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              child: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = validateUngroup('MainView');
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe('is-root');
      }));

    it('should return invalid for non-container', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              leaf: createMockView({ class: 'CTextLabel' }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = validateUngroup('MainView-leaf');
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe('not-container');
      }));

    it('should return valid for empty container', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              emptyGroup: createMockContainer(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = validateUngroup('MainView-emptyGroup');
        expect(result.isValid).toBe(true);
      }));
  });

  describe('createUngroupOperation', () => {
    it('should create ungroup operation with correct data', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              group: createMockContainer({ origin: '50, 50', size: '200, 200' }, {
                a: createMockView({ origin: '10, 10' }),
                b: createMockView({ origin: '100, 100' }),
              }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createUngroupOperation('MainView-group');

        expect(result).not.toBeNull();
        expect(result?.containerId).toBe('MainView-group');
        expect(result?.parentId).toBe('MainView');
        expect(result?.containerOrigin).toBe('50, 50');
        expect(result?.containerSize).toBe('200, 200');
      }));

    it('should calculate new origins relative to parent', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              group: createMockContainer({ origin: '50, 50' }, {
                a: createMockView({ origin: '10, 10' }),
                b: createMockView({ origin: '100, 100' }),
              }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createUngroupOperation('MainView-group');

        expect(result?.childNewOrigins).toEqual(['60, 60', '150, 150']);
      }));

    it('should return null for root template', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(),
          },
        });
        setDocumentForTest(doc);

        const result = createUngroupOperation('MainView');
        expect(result).toBeNull();
      }));

    it('should return null for non-container', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              leaf: createMockView({ class: 'CTextLabel' }),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createUngroupOperation('MainView-leaf');
        expect(result).toBeNull();
      }));
  });
});
