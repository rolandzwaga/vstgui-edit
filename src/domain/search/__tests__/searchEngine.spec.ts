/**
 * Tests for searchEngine.ts
 * Search logic for Find/Replace feature.
 */

import { describe, expect, it } from 'vitest';
import type { SearchableView } from '../searchEngine';
import {
  prepareViewForSearch,
  buildDisplayPath,
  matchesQuery,
  passesCategoryFilter,
  isDescendantOf,
  executeSearch,
} from '../searchEngine';
import type { CategoryFilters, SearchQuery } from '../../../types/search';

// Test fixtures
function createTestView(
  overrides: Partial<SearchableView> = {}
): SearchableView {
  return {
    id: 'test-view-0',
    className: 'CKnob',
    category: 'control',
    attributes: {
      class: 'CKnob',
      origin: '10, 20',
      size: '100, 100',
    },
    parentPath: 'Root > Container',
    ...overrides,
  };
}

const defaultFilters: CategoryFilters = {
  container: true,
  control: true,
  display: true,
  custom: true,
};

describe('searchEngine', () => {
  describe('prepareViewForSearch', () => {
    it('should create a SearchableView with all properties', () => {
      const result = prepareViewForSearch(
        'view-1',
        'CSlider',
        'control',
        { origin: '0, 0', size: '50, 200' },
        'Root > Panel'
      );

      expect(result.id).toBe('view-1');
      expect(result.className).toBe('CSlider');
      expect(result.category).toBe('control');
      expect(result.attributes).toEqual({ origin: '0, 0', size: '50, 200' });
      expect(result.parentPath).toBe('Root > Panel');
    });
  });

  describe('buildDisplayPath', () => {
    it('should build path from root to view', () => {
      const viewMap = new Map([
        ['root', { className: 'CViewContainer', parentId: null }],
        ['root-0', { className: 'CRowColumnView', parentId: 'root' }],
        ['root-0-1', { className: 'CKnob', parentId: 'root-0' }],
      ]);

      const path = buildDisplayPath('root-0-1', viewMap);
      expect(path).toBe('CViewContainer > CRowColumnView > CKnob');
    });

    it('should handle single view with no parent', () => {
      const viewMap = new Map([
        ['root', { className: 'CViewContainer', parentId: null }],
      ]);

      const path = buildDisplayPath('root', viewMap);
      expect(path).toBe('CViewContainer');
    });

    it('should return empty string for unknown view', () => {
      const viewMap = new Map<string, { className: string; parentId: string | null }>();
      const path = buildDisplayPath('unknown', viewMap);
      expect(path).toBe('');
    });
  });

  describe('matchesQuery', () => {
    describe('class search', () => {
      it('should match view by class name (case-insensitive)', () => {
        const view = createTestView({ className: 'CAnimKnob' });
        const query: SearchQuery = { type: 'class', term: 'knob' };

        const result = matchesQuery(view, query);
        expect(result.matches).toBe(true);
      });

      it('should match partial class name', () => {
        const view = createTestView({ className: 'CViewContainer' });
        const query: SearchQuery = { type: 'class', term: 'Container' };

        const result = matchesQuery(view, query);
        expect(result.matches).toBe(true);
      });

      it('should not match if class name does not contain term', () => {
        const view = createTestView({ className: 'CSlider' });
        const query: SearchQuery = { type: 'class', term: 'Knob' };

        const result = matchesQuery(view, query);
        expect(result.matches).toBe(false);
      });
    });

    describe('attribute search', () => {
      it('should match view by attribute value (case-insensitive)', () => {
        const view = createTestView({
          attributes: { 'background-color': '#FF0000' },
        });
        const query: SearchQuery = {
          type: 'attribute',
          term: 'background-color:#FF0000',
          attributeName: 'background-color',
          value: '#ff0000',
        };

        const result = matchesQuery(view, query);
        expect(result.matches).toBe(true);
        expect(result.matchedAttribute).toBe('background-color');
        expect(result.matchedValue).toBe('#FF0000');
      });

      it('should match partial attribute value', () => {
        const view = createTestView({
          attributes: { origin: '10, 20' },
        });
        const query: SearchQuery = {
          type: 'attribute',
          term: 'origin:10',
          attributeName: 'origin',
          value: '10',
        };

        const result = matchesQuery(view, query);
        expect(result.matches).toBe(true);
        expect(result.matchedValue).toBe('10, 20');
      });

      it('should not match if attribute does not exist', () => {
        const view = createTestView({
          attributes: { origin: '10, 20' },
        });
        const query: SearchQuery = {
          type: 'attribute',
          term: 'font:MyFont',
          attributeName: 'font',
          value: 'MyFont',
        };

        const result = matchesQuery(view, query);
        expect(result.matches).toBe(false);
      });

      it('should not match if value does not match', () => {
        const view = createTestView({
          attributes: { 'background-color': '#00FF00' },
        });
        const query: SearchQuery = {
          type: 'attribute',
          term: 'background-color:#FF0000',
          attributeName: 'background-color',
          value: '#FF0000',
        };

        const result = matchesQuery(view, query);
        expect(result.matches).toBe(false);
      });

      it('should handle missing attributeName', () => {
        const view = createTestView();
        const query: SearchQuery = {
          type: 'attribute',
          term: 'test',
        };

        const result = matchesQuery(view, query);
        expect(result.matches).toBe(false);
      });
    });

    describe('global search', () => {
      it('should match by class name', () => {
        const view = createTestView({ className: 'CKnob' });
        const query: SearchQuery = { type: 'global', term: 'knob' };

        const result = matchesQuery(view, query);
        expect(result.matches).toBe(true);
      });

      it('should match by attribute value', () => {
        const view = createTestView({
          className: 'CSlider',
          attributes: { title: 'Volume Control' },
        });
        const query: SearchQuery = { type: 'global', term: 'volume' };

        const result = matchesQuery(view, query);
        expect(result.matches).toBe(true);
        expect(result.matchedAttribute).toBe('title');
        expect(result.matchedValue).toBe('Volume Control');
      });

      it('should prefer class name match over attribute match', () => {
        const view = createTestView({
          className: 'CKnob',
          attributes: { title: 'Knob Control' },
        });
        const query: SearchQuery = { type: 'global', term: 'knob' };

        const result = matchesQuery(view, query);
        expect(result.matches).toBe(true);
        // When class name matches, we don't return matchedAttribute
        expect(result.matchedAttribute).toBeUndefined();
      });

      it('should not match if term not found in class or attributes', () => {
        const view = createTestView({
          className: 'CSlider',
          attributes: { title: 'Volume' },
        });
        const query: SearchQuery = { type: 'global', term: 'pan' };

        const result = matchesQuery(view, query);
        expect(result.matches).toBe(false);
      });
    });

    describe('empty term', () => {
      it('should not match on empty term', () => {
        const view = createTestView();
        const query: SearchQuery = { type: 'global', term: '' };

        const result = matchesQuery(view, query);
        expect(result.matches).toBe(false);
      });
    });
  });

  describe('passesCategoryFilter', () => {
    it('should return true when category is enabled', () => {
      const view = createTestView({ category: 'control' });
      const filters: CategoryFilters = {
        container: false,
        control: true,
        display: false,
        custom: false,
      };

      expect(passesCategoryFilter(view, filters)).toBe(true);
    });

    it('should return false when category is disabled', () => {
      const view = createTestView({ category: 'control' });
      const filters: CategoryFilters = {
        container: true,
        control: false,
        display: true,
        custom: true,
      };

      expect(passesCategoryFilter(view, filters)).toBe(false);
    });

    it('should work for all categories', () => {
      const containerView = createTestView({ category: 'container' });
      const displayView = createTestView({ category: 'display' });
      const customView = createTestView({ category: 'custom' });

      expect(passesCategoryFilter(containerView, defaultFilters)).toBe(true);
      expect(passesCategoryFilter(displayView, defaultFilters)).toBe(true);
      expect(passesCategoryFilter(customView, defaultFilters)).toBe(true);
    });
  });

  describe('isDescendantOf', () => {
    it('should return true for direct child', () => {
      expect(isDescendantOf('template-0-1', 'template-0')).toBe(true);
    });

    it('should return true for deep descendant', () => {
      expect(isDescendantOf('template-0-1-2-3', 'template-0')).toBe(true);
    });

    it('should return false for self', () => {
      expect(isDescendantOf('template-0', 'template-0')).toBe(false);
    });

    it('should return false for sibling', () => {
      expect(isDescendantOf('template-0-1', 'template-0-2')).toBe(false);
    });

    it('should return false for ancestor', () => {
      expect(isDescendantOf('template-0', 'template-0-1')).toBe(false);
    });

    it('should return false for unrelated views', () => {
      expect(isDescendantOf('other-0', 'template-0')).toBe(false);
    });

    it('should handle views with similar prefixes correctly', () => {
      // "template-0-10" should NOT be a descendant of "template-0-1"
      expect(isDescendantOf('template-0-10', 'template-0-1')).toBe(false);
    });
  });

  describe('executeSearch', () => {
    const testViews: SearchableView[] = [
      {
        id: 'root-0',
        className: 'CViewContainer',
        category: 'container',
        attributes: { class: 'CViewContainer', origin: '0, 0' },
        parentPath: 'Root',
      },
      {
        id: 'root-0-0',
        className: 'CKnob',
        category: 'control',
        attributes: { class: 'CKnob', origin: '10, 10', title: 'Volume' },
        parentPath: 'Root > Container',
      },
      {
        id: 'root-0-1',
        className: 'CSlider',
        category: 'control',
        attributes: { class: 'CSlider', origin: '100, 10', title: 'Pan' },
        parentPath: 'Root > Container',
      },
      {
        id: 'root-0-2',
        className: 'CTextLabel',
        category: 'display',
        attributes: { class: 'CTextLabel', title: 'Volume Label' },
        parentPath: 'Root > Container',
      },
      {
        id: 'root-1',
        className: 'CAnimKnob',
        category: 'control',
        attributes: { class: 'CAnimKnob', origin: '200, 0' },
        parentPath: 'Root',
      },
    ];

    it('should find all views matching class search', () => {
      const query: SearchQuery = { type: 'class', term: 'Knob' };
      const results = executeSearch(testViews, query, defaultFilters, { type: 'all' });

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.viewId)).toContain('root-0-0');
      expect(results.map((r) => r.viewId)).toContain('root-1');
    });

    it('should apply category filter', () => {
      const query: SearchQuery = { type: 'global', term: 'volume' };
      const filters: CategoryFilters = {
        container: false,
        control: true,
        display: false,
        custom: false,
      };
      const results = executeSearch(testViews, query, filters, { type: 'all' });

      // Only CKnob should match (CTextLabel is display category)
      expect(results).toHaveLength(1);
      expect(results[0].viewId).toBe('root-0-0');
    });

    it('should apply scope filter', () => {
      const query: SearchQuery = { type: 'class', term: 'C' };
      const results = executeSearch(testViews, query, defaultFilters, {
        type: 'selection',
        containerId: 'root-0',
      });

      // Should only find descendants of root-0
      expect(results).toHaveLength(3); // CKnob, CSlider, CTextLabel
      expect(results.map((r) => r.viewId)).not.toContain('root-0'); // Not the container itself
      expect(results.map((r) => r.viewId)).not.toContain('root-1'); // Not siblings
    });

    it('should return empty array when no matches', () => {
      const query: SearchQuery = { type: 'class', term: 'XYZ' };
      const results = executeSearch(testViews, query, defaultFilters, { type: 'all' });

      expect(results).toHaveLength(0);
    });

    it('should return results with correct structure', () => {
      const query: SearchQuery = {
        type: 'attribute',
        term: 'title:Volume',
        attributeName: 'title',
        value: 'Volume',
      };
      const results = executeSearch(testViews, query, defaultFilters, { type: 'all' });

      expect(results).toHaveLength(2);
      const knobResult = results.find((r) => r.viewId === 'root-0-0');
      expect(knobResult).toBeDefined();
      expect(knobResult?.className).toBe('CKnob');
      expect(knobResult?.category).toBe('control');
      expect(knobResult?.displayPath).toBe('Root > Container');
      expect(knobResult?.matchedAttribute).toBe('title');
      expect(knobResult?.matchedValue).toBe('Volume');
    });

    it('should handle empty views array', () => {
      const query: SearchQuery = { type: 'class', term: 'Knob' };
      const results = executeSearch([], query, defaultFilters, { type: 'all' });

      expect(results).toHaveLength(0);
    });

    it('should handle all filters disabled', () => {
      const query: SearchQuery = { type: 'class', term: 'C' };
      const filters: CategoryFilters = {
        container: false,
        control: false,
        display: false,
        custom: false,
      };
      const results = executeSearch(testViews, query, filters, { type: 'all' });

      expect(results).toHaveLength(0);
    });
  });
});
