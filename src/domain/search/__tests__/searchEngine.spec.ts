/**
 * Tests for searchEngine.ts
 * Search logic for Find/Replace feature.
 */

import { describe, expect, it } from 'vitest';
import type { CategoryFilters, SearchQuery } from '../../../types/search';
import type { SearchableView } from '../searchEngine';
import {
  buildDisplayPath,
  executeMultiTemplateSearch,
  executeSearch,
  isDescendantOf,
  matchesQuery,
  passesCategoryFilter,
  prepareViewForSearch,
} from '../searchEngine';

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

  describe('executeMultiTemplateSearch', () => {
    const template1Views: SearchableView[] = [
      {
        id: 'main-0',
        className: 'CViewContainer',
        category: 'container',
        attributes: { class: 'CViewContainer' },
        parentPath: 'Root',
      },
      {
        id: 'main-0-0',
        className: 'CKnob',
        category: 'control',
        attributes: { class: 'CKnob', title: 'Volume' },
        parentPath: 'Root > Container',
      },
    ];

    const template2Views: SearchableView[] = [
      {
        id: 'settings-0',
        className: 'CViewContainer',
        category: 'container',
        attributes: { class: 'CViewContainer' },
        parentPath: 'Root',
      },
      {
        id: 'settings-0-0',
        className: 'CKnob',
        category: 'control',
        attributes: { class: 'CKnob', title: 'Gain' },
        parentPath: 'Root > Container',
      },
      {
        id: 'settings-0-1',
        className: 'CSlider',
        category: 'control',
        attributes: { class: 'CSlider', title: 'Bass' },
        parentPath: 'Root > Container',
      },
    ];

    const templateData = new Map([
      ['MainPanel', { name: 'MainPanel', views: template1Views }],
      ['SettingsPanel', { name: 'SettingsPanel', views: template2Views }],
    ]);

    it('should search across all templates', () => {
      const query: SearchQuery = { type: 'class', term: 'Knob' };
      const results = executeMultiTemplateSearch(templateData, query, defaultFilters);

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.viewId)).toContain('main-0-0');
      expect(results.map((r) => r.viewId)).toContain('settings-0-0');
    });

    it('should include templateId in results', () => {
      const query: SearchQuery = { type: 'class', term: 'Knob' };
      const results = executeMultiTemplateSearch(templateData, query, defaultFilters);

      const mainResult = results.find((r) => r.viewId === 'main-0-0');
      const settingsResult = results.find((r) => r.viewId === 'settings-0-0');

      expect(mainResult?.templateId).toBe('MainPanel');
      expect(settingsResult?.templateId).toBe('SettingsPanel');
    });

    it('should include templateName in results', () => {
      const query: SearchQuery = { type: 'class', term: 'Knob' };
      const results = executeMultiTemplateSearch(templateData, query, defaultFilters);

      const mainResult = results.find((r) => r.viewId === 'main-0-0');
      const settingsResult = results.find((r) => r.viewId === 'settings-0-0');

      expect(mainResult?.templateName).toBe('MainPanel');
      expect(settingsResult?.templateName).toBe('SettingsPanel');
    });

    it('should apply category filters across all templates', () => {
      const query: SearchQuery = { type: 'class', term: 'C' };
      const filters: CategoryFilters = {
        container: false,
        control: true,
        display: false,
        custom: false,
      };
      const results = executeMultiTemplateSearch(templateData, query, filters);

      // Should only find controls, not containers
      expect(results.every((r) => r.category === 'control')).toBe(true);
      expect(results).toHaveLength(3); // CKnob from main, CKnob and CSlider from settings
    });

    it('should return empty array when no matches across any template', () => {
      const query: SearchQuery = { type: 'class', term: 'XYZ' };
      const results = executeMultiTemplateSearch(templateData, query, defaultFilters);

      expect(results).toHaveLength(0);
    });

    it('should handle empty template map', () => {
      const query: SearchQuery = { type: 'class', term: 'Knob' };
      const results = executeMultiTemplateSearch(new Map(), query, defaultFilters);

      expect(results).toHaveLength(0);
    });

    it('should handle template with no views', () => {
      const emptyTemplateData = new Map([
        ['EmptyTemplate', { name: 'EmptyTemplate', views: [] }],
      ]);
      const query: SearchQuery = { type: 'class', term: 'Knob' };
      const results = executeMultiTemplateSearch(emptyTemplateData, query, defaultFilters);

      expect(results).toHaveLength(0);
    });

    it('should find results with global search across templates', () => {
      const query: SearchQuery = { type: 'global', term: 'volume' };
      const results = executeMultiTemplateSearch(templateData, query, defaultFilters);

      expect(results).toHaveLength(1);
      expect(results[0].viewId).toBe('main-0-0');
      expect(results[0].templateId).toBe('MainPanel');
      expect(results[0].matchedAttribute).toBe('title');
    });

    it('should find results with attribute search across templates', () => {
      const query: SearchQuery = {
        type: 'attribute',
        term: 'title:Gain',
        attributeName: 'title',
        value: 'Gain',
      };
      const results = executeMultiTemplateSearch(templateData, query, defaultFilters);

      expect(results).toHaveLength(1);
      expect(results[0].viewId).toBe('settings-0-0');
      expect(results[0].templateId).toBe('SettingsPanel');
      expect(results[0].matchedValue).toBe('Gain');
    });

    it('should order results by template, then by view order within template', () => {
      const query: SearchQuery = { type: 'class', term: 'C' };
      const results = executeMultiTemplateSearch(templateData, query, defaultFilters);

      // Results should be grouped by template in map iteration order
      const templateIds = results.map((r) => r.templateId);

      // Check that results from same template are contiguous
      const mainIndices = templateIds
        .map((id, idx) => (id === 'MainPanel' ? idx : -1))
        .filter((idx) => idx >= 0);
      const settingsIndices = templateIds
        .map((id, idx) => (id === 'SettingsPanel' ? idx : -1))
        .filter((idx) => idx >= 0);

      // All main results should come before all settings results (or vice versa)
      // They should be contiguous
      if (mainIndices.length > 1) {
        expect(mainIndices[mainIndices.length - 1] - mainIndices[0]).toBe(mainIndices.length - 1);
      }
      if (settingsIndices.length > 1) {
        expect(settingsIndices[settingsIndices.length - 1] - settingsIndices[0]).toBe(settingsIndices.length - 1);
      }
    });
  });
});
