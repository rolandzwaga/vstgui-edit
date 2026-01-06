/**
 * Selection Store Tests
 * Tests for view selection state management
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  clearSelection,
  resetSelection,
  select,
  selectionStore,
} from '../selectionStore';

describe('selectionStore', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetSelection();
    });
  });

  describe('initial state', () => {
    it('should have empty selectedIds', () => {
      testInRoot(() => {
        expect(selectionStore.selectedIds.size).toBe(0);
      });
    });

    it('should have null hoveredId', () => {
      testInRoot(() => {
        expect(selectionStore.hoveredId).toBeNull();
      });
    });
  });

  describe('select', () => {
    it('should select a single view', () => {
      testInRoot(() => {
        select('view-1');
        expect(selectionStore.selectedIds.has('view-1')).toBe(true);
        expect(selectionStore.selectedIds.size).toBe(1);
      });
    });

    it('should clear previous selection when selecting new view', () => {
      testInRoot(() => {
        select('view-1');
        select('view-2');
        expect(selectionStore.selectedIds.has('view-1')).toBe(false);
        expect(selectionStore.selectedIds.has('view-2')).toBe(true);
        expect(selectionStore.selectedIds.size).toBe(1);
      });
    });

    it('should keep view selected when clicking same view again', () => {
      testInRoot(() => {
        select('view-1');
        select('view-1');
        expect(selectionStore.selectedIds.has('view-1')).toBe(true);
        expect(selectionStore.selectedIds.size).toBe(1);
      });
    });
  });

  describe('clearSelection', () => {
    it('should remove all selected views', () => {
      testInRoot(() => {
        select('view-1');
        clearSelection();
        expect(selectionStore.selectedIds.size).toBe(0);
      });
    });

    it('should do nothing when already empty', () => {
      testInRoot(() => {
        clearSelection();
        expect(selectionStore.selectedIds.size).toBe(0);
      });
    });
  });

  describe('isSelected', () => {
    it('should return true for selected view', () => {
      testInRoot(() => {
        select('view-1');
        expect(selectionStore.selectedIds.has('view-1')).toBe(true);
      });
    });

    it('should return false for non-selected view', () => {
      testInRoot(() => {
        select('view-1');
        expect(selectionStore.selectedIds.has('view-2')).toBe(false);
      });
    });
  });
});
