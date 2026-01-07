import { beforeEach, describe, expect, it } from 'vitest';
import {
  createMockContainer,
  createMockDocument,
  createMockView,
} from '../../../__tests__/helpers/fixtures';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { reset, setDocumentForTest } from '../../../stores/documentStore';
import {
  createMultiReorderOperation,
  createReorderOperation,
  getDropPosition,
  validateReorder,
} from '../reorder';

describe('reorder domain logic', () => {
  beforeEach(() => {
    reset();
  });

  describe('validateReorder', () => {
    it('should return valid for reorder within same parent', () =>
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

        const result = validateReorder('MainView-a', 'MainView-c', 'after');
        expect(result.isValid).toBe(true);
      }));

    it('should return invalid for reorder across different parents', () =>
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

        const result = validateReorder('MainView-container1-a', 'MainView-container2-b', 'after');
        expect(result.isValid).toBe(false);
        expect(result.invalidReason).toBe('different-parents');
      }));

    it('should return invalid for self-reorder', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = validateReorder('MainView-a', 'MainView-a', 'before');
        expect(result.isValid).toBe(false);
        expect(result.invalidReason).toBe('self-drop');
      }));

    it('should return valid for before position', () =>
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

        const result = validateReorder('MainView-b', 'MainView-a', 'before');
        expect(result.isValid).toBe(true);
      }));

    it('should return valid for after position', () =>
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

        const result = validateReorder('MainView-a', 'MainView-b', 'after');
        expect(result.isValid).toBe(true);
      }));
  });

  describe('getDropPosition', () => {
    it('should return before when in top third of element', () => {
      const result = getDropPosition(5, 30);
      expect(result).toBe('before');
    });

    it('should return inside when in middle third of element', () => {
      const result = getDropPosition(15, 30);
      expect(result).toBe('inside');
    });

    it('should return after when in bottom third of element', () => {
      const result = getDropPosition(25, 30);
      expect(result).toBe('after');
    });

    it('should handle edge cases at boundaries', () => {
      expect(getDropPosition(0, 30)).toBe('before');
      expect(getDropPosition(10, 30)).toBe('inside');
      expect(getDropPosition(20, 30)).toBe('after');
      expect(getDropPosition(30, 30)).toBe('after');
    });

    it('should handle small heights', () => {
      expect(getDropPosition(0, 10)).toBe('before');
      expect(getDropPosition(5, 10)).toBe('inside');
      expect(getDropPosition(9, 10)).toBe('after');
    });
  });

  describe('createReorderOperation', () => {
    it('should create reorder operation for moving view before target', () =>
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

        const result = createReorderOperation('MainView-c', 'MainView-a', 'before');

        expect(result).not.toBeNull();
        expect(result?.viewId).toBe('MainView-c');
        expect(result?.parentId).toBe('MainView');
        expect(result?.oldIndex).toBe(2);
        expect(result?.newIndex).toBe(0);
      }));

    it('should create reorder operation for moving view after target', () =>
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

        const result = createReorderOperation('MainView-a', 'MainView-c', 'after');

        expect(result).not.toBeNull();
        expect(result?.viewId).toBe('MainView-a');
        expect(result?.parentId).toBe('MainView');
        expect(result?.oldIndex).toBe(0);
        expect(result?.newIndex).toBe(2);
      }));

    it('should return null for invalid reorder (different parents)', () =>
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

        const result = createReorderOperation('MainView-container1-a', 'MainView-container2-b', 'after');
        expect(result).toBeNull();
      }));

    it('should return null for self-reorder', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createReorderOperation('MainView-a', 'MainView-a', 'before');
        expect(result).toBeNull();
      }));

    it('should handle moving middle element to first position', () =>
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

        const result = createReorderOperation('MainView-second', 'MainView-first', 'before');

        expect(result?.oldIndex).toBe(1);
        expect(result?.newIndex).toBe(0);
      }));

    it('should handle moving first element to last position', () =>
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

        const result = createReorderOperation('MainView-first', 'MainView-third', 'after');

        expect(result?.oldIndex).toBe(0);
        expect(result?.newIndex).toBe(2);
      }));

    it('should return null when position is inside (reparent, not reorder)', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView(),
              b: createMockContainer(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createReorderOperation('MainView-a', 'MainView-b', 'inside');
        expect(result).toBeNull();
      }));
  });

  describe('createMultiReorderOperation', () => {
    it('should create operations for multiple views moving before target', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView(),
              b: createMockView(),
              c: createMockView(),
              d: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createMultiReorderOperation(
          ['MainView-c', 'MainView-d'],
          'MainView-a',
          'before'
        );

        expect(result).not.toBeNull();
        expect(result?.operations.length).toBe(2);
        expect(result?.parentId).toBe('MainView');
      }));

    it('should create operations for multiple views moving after target', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView(),
              b: createMockView(),
              c: createMockView(),
              d: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createMultiReorderOperation(
          ['MainView-a', 'MainView-b'],
          'MainView-d',
          'after'
        );

        expect(result).not.toBeNull();
        expect(result?.operations.length).toBe(2);
      }));

    it('should return null for views from different parents', () =>
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

        const result = createMultiReorderOperation(
          ['MainView-container1-a', 'MainView-container2-b'],
          'MainView-container1-a',
          'before'
        );

        expect(result).toBeNull();
      }));

    it('should return null for inside position', () =>
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

        const result = createMultiReorderOperation(['MainView-a'], 'MainView-b', 'inside');
        expect(result).toBeNull();
      }));

    it('should return null for empty view list', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const result = createMultiReorderOperation([], 'MainView-a', 'before');
        expect(result).toBeNull();
      }));

    it('should return null when no actual reordering occurs', () =>
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

        const result = createMultiReorderOperation(['MainView-a'], 'MainView-a', 'before');
        expect(result).toBeNull();
      }));
  });
});
