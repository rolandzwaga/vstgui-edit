/**
 * Ancestor Utility Tests
 * Tests for getAncestorIds utility function (T058)
 */
import { describe, expect, it } from 'vitest';
import type { RenderableView } from '../../../types/canvas';
import { getAncestorIds } from '../ancestors';

const createMockView = (overrides: Partial<RenderableView> = {}): RenderableView => ({
  id: 'test-view',
  absoluteX: 0,
  absoluteY: 0,
  width: 100,
  height: 100,
  className: 'CViewContainer',
  category: 'container',
  zIndex: 0,
  parentId: null,
  ...overrides,
});

describe('getAncestorIds', () => {
  describe('Given a view with no parent', () => {
    it('should return empty array for root view', () => {
      const views: RenderableView[] = [
        createMockView({ id: 'root', parentId: null }),
      ];

      const ancestors = getAncestorIds('root', views);

      expect(ancestors).toEqual([]);
    });
  });

  describe('Given a view with one parent', () => {
    it('should return array with single parent id', () => {
      const views: RenderableView[] = [
        createMockView({ id: 'root', parentId: null }),
        createMockView({ id: 'child', parentId: 'root' }),
      ];

      const ancestors = getAncestorIds('child', views);

      expect(ancestors).toEqual(['root']);
    });
  });

  describe('Given a deeply nested view', () => {
    it('should return all ancestor ids from immediate parent to root', () => {
      const views: RenderableView[] = [
        createMockView({ id: 'root', parentId: null }),
        createMockView({ id: 'level-1', parentId: 'root' }),
        createMockView({ id: 'level-2', parentId: 'level-1' }),
        createMockView({ id: 'level-3', parentId: 'level-2' }),
      ];

      const ancestors = getAncestorIds('level-3', views);

      // Immediate parent first, then up to root
      expect(ancestors).toEqual(['level-2', 'level-1', 'root']);
    });
  });

  describe('Given a view that does not exist', () => {
    it('should return empty array for non-existent view id', () => {
      const views: RenderableView[] = [
        createMockView({ id: 'root', parentId: null }),
      ];

      const ancestors = getAncestorIds('non-existent', views);

      expect(ancestors).toEqual([]);
    });
  });

  describe('Given an empty views array', () => {
    it('should return empty array', () => {
      const ancestors = getAncestorIds('any-id', []);

      expect(ancestors).toEqual([]);
    });
  });

  describe('Given sibling views', () => {
    it('should only return ancestors of the specified view', () => {
      const views: RenderableView[] = [
        createMockView({ id: 'root', parentId: null }),
        createMockView({ id: 'child-a', parentId: 'root' }),
        createMockView({ id: 'child-b', parentId: 'root' }),
        createMockView({ id: 'grandchild-a', parentId: 'child-a' }),
      ];

      const ancestorsA = getAncestorIds('grandchild-a', views);
      const ancestorsB = getAncestorIds('child-b', views);

      expect(ancestorsA).toEqual(['child-a', 'root']);
      expect(ancestorsB).toEqual(['root']);
    });
  });
});
