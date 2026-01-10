import { describe, expect, test } from 'vitest';
import {
  calculateHideStateInfo,
  filterVisibleViews,
  getAllHiddenIds,
  getHideMenuItem,
  shouldViewBeHidden,
} from '../hideOperations';

describe('hideOperations', () => {
  describe('calculateHideStateInfo', () => {
    test('returns noneHidden for empty set', () => {
      const isHidden = () => false;
      const result = calculateHideStateInfo(new Set<string>(), isHidden);
      expect(result).toEqual({
        allHidden: false,
        anyHidden: false,
        noneHidden: true,
      });
    });

    test('returns noneHidden when no views are hidden', () => {
      const isHidden = () => false;
      const result = calculateHideStateInfo(new Set(['a', 'b', 'c']), isHidden);
      expect(result).toEqual({
        allHidden: false,
        anyHidden: false,
        noneHidden: true,
      });
    });

    test('returns allHidden when all views are hidden', () => {
      const isHidden = () => true;
      const result = calculateHideStateInfo(new Set(['a', 'b', 'c']), isHidden);
      expect(result).toEqual({
        allHidden: true,
        anyHidden: true,
        noneHidden: false,
      });
    });

    test('returns anyHidden when some views are hidden', () => {
      const hidden = new Set(['a', 'c']);
      const isHidden = (id: string) => hidden.has(id);
      const result = calculateHideStateInfo(new Set(['a', 'b', 'c']), isHidden);
      expect(result).toEqual({
        allHidden: false,
        anyHidden: true,
        noneHidden: false,
      });
    });

    test('handles single hidden view in set of one', () => {
      const isHidden = () => true;
      const result = calculateHideStateInfo(new Set(['a']), isHidden);
      expect(result).toEqual({
        allHidden: true,
        anyHidden: true,
        noneHidden: false,
      });
    });

    test('handles single visible view in set of one', () => {
      const isHidden = () => false;
      const result = calculateHideStateInfo(new Set(['a']), isHidden);
      expect(result).toEqual({
        allHidden: false,
        anyHidden: false,
        noneHidden: true,
      });
    });
  });

  describe('shouldViewBeHidden', () => {
    const getParentId = (id: string): string | null => {
      const hierarchy: Record<string, string | null> = {
        'child-1': 'parent-1',
        'child-2': 'parent-1',
        'grandchild-1': 'child-1',
        'parent-1': 'root',
        root: null,
      };
      return hierarchy[id] ?? null;
    };

    test('returns false when view and ancestors are visible', () => {
      const isHidden = () => false;
      expect(shouldViewBeHidden('child-1', isHidden, getParentId)).toBe(false);
    });

    test('returns true when view is hidden', () => {
      const hidden = new Set(['child-1']);
      const isHidden = (id: string) => hidden.has(id);
      expect(shouldViewBeHidden('child-1', isHidden, getParentId)).toBe(true);
    });

    test('returns true when parent is hidden', () => {
      const hidden = new Set(['parent-1']);
      const isHidden = (id: string) => hidden.has(id);
      expect(shouldViewBeHidden('child-1', isHidden, getParentId)).toBe(true);
    });

    test('returns true when grandparent is hidden', () => {
      const hidden = new Set(['root']);
      const isHidden = (id: string) => hidden.has(id);
      expect(shouldViewBeHidden('grandchild-1', isHidden, getParentId)).toBe(true);
    });

    test('returns true when any ancestor is hidden', () => {
      const hidden = new Set(['child-1']);
      const isHidden = (id: string) => hidden.has(id);
      expect(shouldViewBeHidden('grandchild-1', isHidden, getParentId)).toBe(true);
    });

    test('returns false for unknown view', () => {
      const isHidden = () => false;
      expect(shouldViewBeHidden('unknown', isHidden, getParentId)).toBe(false);
    });

    test('handles root view with no parent', () => {
      const hidden = new Set<string>();
      const isHidden = (id: string) => hidden.has(id);
      expect(shouldViewBeHidden('root', isHidden, getParentId)).toBe(false);
    });

    test('hidden root hides itself', () => {
      const hidden = new Set(['root']);
      const isHidden = (id: string) => hidden.has(id);
      expect(shouldViewBeHidden('root', isHidden, getParentId)).toBe(true);
    });
  });

  describe('filterVisibleViews', () => {
    const getParentId = (id: string): string | null => {
      const hierarchy: Record<string, string | null> = {
        'child-1': 'parent-1',
        'child-2': 'parent-1',
        'grandchild-1': 'child-1',
        'parent-1': 'root',
        root: null,
      };
      return hierarchy[id] ?? null;
    };

    test('returns all views when none are hidden', () => {
      const isHidden = () => false;
      const result = filterVisibleViews(['child-1', 'child-2'], isHidden, getParentId);
      expect(result).toEqual(['child-1', 'child-2']);
    });

    test('filters out directly hidden views', () => {
      const hidden = new Set(['child-1']);
      const isHidden = (id: string) => hidden.has(id);
      const result = filterVisibleViews(['child-1', 'child-2'], isHidden, getParentId);
      expect(result).toEqual(['child-2']);
    });

    test('filters out views with hidden ancestors', () => {
      const hidden = new Set(['parent-1']);
      const isHidden = (id: string) => hidden.has(id);
      const result = filterVisibleViews(['child-1', 'child-2', 'root'], isHidden, getParentId);
      expect(result).toEqual(['root']);
    });

    test('filters out grandchildren of hidden containers', () => {
      const hidden = new Set(['child-1']);
      const isHidden = (id: string) => hidden.has(id);
      const result = filterVisibleViews(['grandchild-1', 'child-2'], isHidden, getParentId);
      expect(result).toEqual(['child-2']);
    });

    test('returns empty array when all views are hidden', () => {
      const hidden = new Set(['root']);
      const isHidden = (id: string) => hidden.has(id);
      const result = filterVisibleViews(
        ['root', 'parent-1', 'child-1', 'grandchild-1'],
        isHidden,
        getParentId
      );
      expect(result).toEqual([]);
    });

    test('handles empty input array', () => {
      const isHidden = () => true;
      const result = filterVisibleViews([], isHidden, getParentId);
      expect(result).toEqual([]);
    });

    test('preserves order of visible views', () => {
      const hidden = new Set(['child-2']);
      const isHidden = (id: string) => hidden.has(id);
      const result = filterVisibleViews(
        ['root', 'parent-1', 'child-1', 'child-2'],
        isHidden,
        getParentId
      );
      expect(result).toEqual(['root', 'parent-1', 'child-1']);
    });
  });

  describe('getAllHiddenIds', () => {
    test('returns empty array for empty set', () => {
      const result = getAllHiddenIds(new Set<string>());
      expect(result).toEqual([]);
    });

    test('returns array of hidden IDs', () => {
      const result = getAllHiddenIds(new Set(['a', 'b', 'c']));
      expect(result).toHaveLength(3);
      expect(result).toContain('a');
      expect(result).toContain('b');
      expect(result).toContain('c');
    });

    test('returns single ID for single hidden view', () => {
      const result = getAllHiddenIds(new Set(['a']));
      expect(result).toEqual(['a']);
    });
  });

  describe('getHideMenuItem', () => {
    test('returns Hide when none are hidden', () => {
      const stateInfo = { allHidden: false, anyHidden: false, noneHidden: true };
      const result = getHideMenuItem(stateInfo);
      expect(result).toEqual({
        label: 'Hide',
        action: 'hide',
        shortcut: 'Ctrl+H',
      });
    });

    test('returns Hide when some are hidden', () => {
      const stateInfo = { allHidden: false, anyHidden: true, noneHidden: false };
      const result = getHideMenuItem(stateInfo);
      expect(result).toEqual({
        label: 'Hide',
        action: 'hide',
        shortcut: 'Ctrl+H',
      });
    });

    test('returns Show when all are hidden', () => {
      const stateInfo = { allHidden: true, anyHidden: true, noneHidden: false };
      const result = getHideMenuItem(stateInfo);
      expect(result).toEqual({
        label: 'Show',
        action: 'show',
        shortcut: 'Ctrl+H',
      });
    });
  });
});
