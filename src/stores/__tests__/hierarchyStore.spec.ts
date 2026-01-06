import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  collapseNode,
  expandAll,
  expandNode,
  hierarchyStore,
  isExpanded,
  resetHierarchy,
  toggleExpanded,
} from '../hierarchyStore';

describe('hierarchyStore', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetHierarchy();
    });
  });

  describe('initial state', () => {
    it('should have empty expandedIds', () => {
      testInRoot(() => {
        expect(hierarchyStore.expandedIds.size).toBe(0);
      });
    });
  });

  describe('toggleExpanded', () => {
    it('should add id when not expanded', () => {
      testInRoot(() => {
        toggleExpanded('node-1');

        expect(hierarchyStore.expandedIds.has('node-1')).toBe(true);
      });
    });

    it('should remove id when already expanded', () => {
      testInRoot(() => {
        toggleExpanded('node-1');
        toggleExpanded('node-1');

        expect(hierarchyStore.expandedIds.has('node-1')).toBe(false);
      });
    });

    it('should not affect other expanded nodes', () => {
      testInRoot(() => {
        expandAll(['node-1', 'node-2', 'node-3']);
        toggleExpanded('node-2');

        expect(hierarchyStore.expandedIds.has('node-1')).toBe(true);
        expect(hierarchyStore.expandedIds.has('node-2')).toBe(false);
        expect(hierarchyStore.expandedIds.has('node-3')).toBe(true);
      });
    });
  });

  describe('expandNode', () => {
    it('should add id to expandedIds', () => {
      testInRoot(() => {
        expandNode('node-1');

        expect(hierarchyStore.expandedIds.has('node-1')).toBe(true);
      });
    });

    it('should be idempotent (no-op if already expanded)', () => {
      testInRoot(() => {
        expandNode('node-1');
        expandNode('node-1');

        expect(hierarchyStore.expandedIds.has('node-1')).toBe(true);
        expect(hierarchyStore.expandedIds.size).toBe(1);
      });
    });
  });

  describe('collapseNode', () => {
    it('should remove id from expandedIds', () => {
      testInRoot(() => {
        expandNode('node-1');
        collapseNode('node-1');

        expect(hierarchyStore.expandedIds.has('node-1')).toBe(false);
      });
    });

    it('should be idempotent (no-op if not expanded)', () => {
      testInRoot(() => {
        collapseNode('node-1');

        expect(hierarchyStore.expandedIds.has('node-1')).toBe(false);
      });
    });
  });

  describe('expandAll', () => {
    it('should set all provided ids as expanded', () => {
      testInRoot(() => {
        expandAll(['node-1', 'node-2', 'node-3']);

        expect(hierarchyStore.expandedIds.has('node-1')).toBe(true);
        expect(hierarchyStore.expandedIds.has('node-2')).toBe(true);
        expect(hierarchyStore.expandedIds.has('node-3')).toBe(true);
      });
    });

    it('should replace existing expanded state', () => {
      testInRoot(() => {
        expandAll(['old-1', 'old-2']);
        expandAll(['new-1', 'new-2']);

        expect(hierarchyStore.expandedIds.has('old-1')).toBe(false);
        expect(hierarchyStore.expandedIds.has('old-2')).toBe(false);
        expect(hierarchyStore.expandedIds.has('new-1')).toBe(true);
        expect(hierarchyStore.expandedIds.has('new-2')).toBe(true);
      });
    });

    it('should handle empty array', () => {
      testInRoot(() => {
        expandAll(['node-1']);
        expandAll([]);

        expect(hierarchyStore.expandedIds.size).toBe(0);
      });
    });
  });

  describe('isExpanded', () => {
    it('should return true for expanded nodes', () => {
      testInRoot(() => {
        expandNode('node-1');

        expect(isExpanded('node-1')).toBe(true);
      });
    });

    it('should return false for collapsed nodes', () => {
      testInRoot(() => {
        expect(isExpanded('node-1')).toBe(false);
      });
    });
  });

  describe('resetHierarchy', () => {
    it('should clear all expanded state', () => {
      testInRoot(() => {
        expandAll(['node-1', 'node-2', 'node-3']);
        resetHierarchy();

        expect(hierarchyStore.expandedIds.size).toBe(0);
      });
    });
  });
});
