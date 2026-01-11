/**
 * Tests for searchStore
 * Find/Replace state management
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import type { SearchResult } from '../../types/search';
import {
  clearHighlights,
  closeFindPanel,
  navigateToNext,
  navigateToPrevious,
  openFindPanel,
  openReplacePanel,
  resetSearchStore,
  searchStore,
  selectResultAtIndex,
  setAllCategoryFilters,
  setCategoryFilter,
  setIsSearching,
  setMode,
  setParsedQuery,
  setRawQuery,
  setReplaceValue,
  setSearchResults,
  setSearchScope,
  setTemplateScope,
  toggleFindPanel,
  updateHighlightedIds,
} from '../searchStore';
import { resetTemplateStore, setActiveTemplate, templateStore } from '../templateStore';

const mockResults: SearchResult[] = [
  {
    viewId: 'view-1',
    className: 'CKnob',
    category: 'control',
    displayPath: 'Root > Container',
  },
  {
    viewId: 'view-2',
    className: 'CSlider',
    category: 'control',
    displayPath: 'Root > Container',
  },
  {
    viewId: 'view-3',
    className: 'CTextLabel',
    category: 'display',
    displayPath: 'Root',
  },
];

describe('searchStore', () => {
  beforeEach(() => {
    resetSearchStore();
  });

  describe('initial state', () => {
    it('should have panel closed initially', () => {
      testInRoot(() => {
        expect(searchStore.isOpen).toBe(false);
      });
    });

    it('should have find mode by default', () => {
      testInRoot(() => {
        expect(searchStore.mode).toBe('find');
      });
    });

    it('should have empty query', () => {
      testInRoot(() => {
        expect(searchStore.rawQuery).toBe('');
        expect(searchStore.parsedQuery).toBeNull();
      });
    });

    it('should have no results', () => {
      testInRoot(() => {
        expect(searchStore.results).toEqual([]);
        expect(searchStore.resultCount).toBe(0);
        expect(searchStore.hasResults).toBe(false);
        expect(searchStore.currentResult).toBeNull();
      });
    });

    it('should have all category filters enabled', () => {
      testInRoot(() => {
        expect(searchStore.categoryFilters).toEqual({
          container: true,
          control: true,
          display: true,
          custom: true,
        });
      });
    });

    it('should have scope set to all', () => {
      testInRoot(() => {
        expect(searchStore.scope).toBe('all');
        expect(searchStore.scopeContainerId).toBeNull();
      });
    });
  });

  describe('panel open/close', () => {
    describe('openFindPanel', () => {
      it('should open panel in find mode', () => {
        testInRoot(() => {
          openFindPanel();
          expect(searchStore.isOpen).toBe(true);
          expect(searchStore.mode).toBe('find');
        });
      });
    });

    describe('openReplacePanel', () => {
      it('should open panel in replace mode', () => {
        testInRoot(() => {
          openReplacePanel();
          expect(searchStore.isOpen).toBe(true);
          expect(searchStore.mode).toBe('replace');
        });
      });
    });

    describe('closeFindPanel', () => {
      it('should close panel', () => {
        testInRoot(() => {
          openFindPanel();
          closeFindPanel();
          expect(searchStore.isOpen).toBe(false);
        });
      });

      it('should clear highlights on close', () => {
        testInRoot(() => {
          openFindPanel();
          updateHighlightedIds(new Set(['view-1', 'view-2']));
          closeFindPanel();
          expect(searchStore.highlightedIds.size).toBe(0);
        });
      });

      it('should preserve query on close', () => {
        testInRoot(() => {
          openFindPanel();
          setRawQuery('CKnob');
          closeFindPanel();
          expect(searchStore.rawQuery).toBe('CKnob');
        });
      });
    });

    describe('toggleFindPanel', () => {
      it('should open panel when closed', () => {
        testInRoot(() => {
          toggleFindPanel();
          expect(searchStore.isOpen).toBe(true);
          expect(searchStore.mode).toBe('find');
        });
      });

      it('should close panel when open', () => {
        testInRoot(() => {
          openFindPanel();
          toggleFindPanel();
          expect(searchStore.isOpen).toBe(false);
        });
      });
    });
  });

  describe('query management', () => {
    describe('setRawQuery', () => {
      it('should update raw query', () => {
        testInRoot(() => {
          setRawQuery('CKnob');
          expect(searchStore.rawQuery).toBe('CKnob');
        });
      });
    });

    describe('setParsedQuery', () => {
      it('should update parsed query', () => {
        testInRoot(() => {
          const query = { type: 'class' as const, term: 'CKnob' };
          setParsedQuery(query);
          expect(searchStore.parsedQuery).toEqual(query);
        });
      });

      it('should accept null', () => {
        testInRoot(() => {
          setParsedQuery({ type: 'class', term: 'test' });
          setParsedQuery(null);
          expect(searchStore.parsedQuery).toBeNull();
        });
      });
    });
  });

  describe('results management', () => {
    describe('setSearchResults', () => {
      it('should update results', () => {
        testInRoot(() => {
          setSearchResults(mockResults);
          expect(searchStore.results).toEqual(mockResults);
          expect(searchStore.resultCount).toBe(3);
          expect(searchStore.hasResults).toBe(true);
        });
      });

      it('should set currentIndex to 0 when results exist', () => {
        testInRoot(() => {
          setSearchResults(mockResults);
          expect(searchStore.currentIndex).toBe(0);
          expect(searchStore.currentResult).toEqual(mockResults[0]);
        });
      });

      it('should set currentIndex to -1 when no results', () => {
        testInRoot(() => {
          setSearchResults([]);
          expect(searchStore.currentIndex).toBe(-1);
          expect(searchStore.currentResult).toBeNull();
        });
      });

      it('should update highlighted IDs', () => {
        testInRoot(() => {
          setSearchResults(mockResults);
          expect(searchStore.highlightedIds.has('view-1')).toBe(true);
          expect(searchStore.highlightedIds.has('view-2')).toBe(true);
          expect(searchStore.highlightedIds.has('view-3')).toBe(true);
          expect(searchStore.highlightedIds.size).toBe(3);
        });
      });
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      testInRoot(() => {
        setSearchResults(mockResults);
      });
    });

    describe('navigateToNext', () => {
      it('should increment current index', () => {
        testInRoot(() => {
          setSearchResults(mockResults);
          expect(searchStore.currentIndex).toBe(0);
          navigateToNext();
          expect(searchStore.currentIndex).toBe(1);
        });
      });

      it('should wrap from last to first', () => {
        testInRoot(() => {
          setSearchResults(mockResults);
          selectResultAtIndex(2);
          navigateToNext();
          expect(searchStore.currentIndex).toBe(0);
        });
      });

      it('should do nothing when no results', () => {
        testInRoot(() => {
          setSearchResults([]);
          navigateToNext();
          expect(searchStore.currentIndex).toBe(-1);
        });
      });
    });

    describe('navigateToPrevious', () => {
      it('should decrement current index', () => {
        testInRoot(() => {
          setSearchResults(mockResults);
          selectResultAtIndex(2);
          navigateToPrevious();
          expect(searchStore.currentIndex).toBe(1);
        });
      });

      it('should wrap from first to last', () => {
        testInRoot(() => {
          setSearchResults(mockResults);
          expect(searchStore.currentIndex).toBe(0);
          navigateToPrevious();
          expect(searchStore.currentIndex).toBe(2);
        });
      });

      it('should do nothing when no results', () => {
        testInRoot(() => {
          setSearchResults([]);
          navigateToPrevious();
          expect(searchStore.currentIndex).toBe(-1);
        });
      });
    });

    describe('selectResultAtIndex', () => {
      it('should set current index', () => {
        testInRoot(() => {
          setSearchResults(mockResults);
          selectResultAtIndex(2);
          expect(searchStore.currentIndex).toBe(2);
          expect(searchStore.currentResult).toEqual(mockResults[2]);
        });
      });

      it('should ignore invalid negative index', () => {
        testInRoot(() => {
          setSearchResults(mockResults);
          selectResultAtIndex(1);
          selectResultAtIndex(-1);
          expect(searchStore.currentIndex).toBe(1);
        });
      });

      it('should ignore index out of bounds', () => {
        testInRoot(() => {
          setSearchResults(mockResults);
          selectResultAtIndex(1);
          selectResultAtIndex(100);
          expect(searchStore.currentIndex).toBe(1);
        });
      });

      describe('template switching', () => {
        const resultsWithTemplates: SearchResult[] = [
          {
            viewId: 'view-1',
            className: 'CKnob',
            category: 'control',
            displayPath: 'Root > Container',
            templateId: 'MainPanel',
            templateName: 'MainPanel',
          },
          {
            viewId: 'view-2',
            className: 'CSlider',
            category: 'control',
            displayPath: 'Root > Container',
            templateId: 'SettingsPanel',
            templateName: 'SettingsPanel',
          },
        ];

        beforeEach(() => {
          resetTemplateStore();
        });

        it('should switch template when selecting result from different template', () => {
          testInRoot(() => {
            setActiveTemplate('MainPanel');
            setSearchResults(resultsWithTemplates);

            // Select result from different template
            selectResultAtIndex(1);

            expect(searchStore.currentIndex).toBe(1);
            expect(templateStore.activeTemplateId).toBe('SettingsPanel');
          });
        });

        it('should not switch template when selecting result from current template', () => {
          testInRoot(() => {
            setActiveTemplate('MainPanel');
            setSearchResults(resultsWithTemplates);

            // Select result from same template
            selectResultAtIndex(0);

            expect(searchStore.currentIndex).toBe(0);
            expect(templateStore.activeTemplateId).toBe('MainPanel');
          });
        });

        it('should not switch template when result has no templateId', () => {
          testInRoot(() => {
            setActiveTemplate('MainPanel');
            setSearchResults(mockResults); // Results without templateId

            selectResultAtIndex(1);

            expect(searchStore.currentIndex).toBe(1);
            expect(templateStore.activeTemplateId).toBe('MainPanel');
          });
        });
      });
    });
  });

  describe('filters', () => {
    describe('setCategoryFilter', () => {
      it('should update individual category filter', () => {
        testInRoot(() => {
          setCategoryFilter('control', false);
          expect(searchStore.categoryFilters.control).toBe(false);
          expect(searchStore.categoryFilters.container).toBe(true);
        });
      });

      it('should enable category filter', () => {
        testInRoot(() => {
          setCategoryFilter('display', false);
          setCategoryFilter('display', true);
          expect(searchStore.categoryFilters.display).toBe(true);
        });
      });
    });

    describe('setAllCategoryFilters', () => {
      it('should disable all filters', () => {
        testInRoot(() => {
          setAllCategoryFilters(false);
          expect(searchStore.categoryFilters).toEqual({
            container: false,
            control: false,
            display: false,
            custom: false,
          });
        });
      });

      it('should enable all filters', () => {
        testInRoot(() => {
          setAllCategoryFilters(false);
          setAllCategoryFilters(true);
          expect(searchStore.categoryFilters).toEqual({
            container: true,
            control: true,
            display: true,
            custom: true,
          });
        });
      });
    });
  });

  describe('scope', () => {
    describe('setSearchScope', () => {
      it('should set scope to all', () => {
        testInRoot(() => {
          setSearchScope('selection', 'container-1');
          setSearchScope('all');
          expect(searchStore.scope).toBe('all');
          expect(searchStore.scopeContainerId).toBeNull();
        });
      });

      it('should set scope to selection with container ID', () => {
        testInRoot(() => {
          setSearchScope('selection', 'container-1');
          expect(searchStore.scope).toBe('selection');
          expect(searchStore.scopeContainerId).toBe('container-1');
        });
      });
    });
  });

  describe('template scope', () => {
    describe('initial state', () => {
      it('should have template scope set to current by default', () => {
        testInRoot(() => {
          expect(searchStore.templateScope).toBe('current');
        });
      });
    });

    describe('setTemplateScope', () => {
      it('should set template scope to all', () => {
        testInRoot(() => {
          setTemplateScope('all');
          expect(searchStore.templateScope).toBe('all');
        });
      });

      it('should set template scope to current', () => {
        testInRoot(() => {
          setTemplateScope('all');
          setTemplateScope('current');
          expect(searchStore.templateScope).toBe('current');
        });
      });

      it('should clear results when changing template scope', () => {
        testInRoot(() => {
          setSearchResults(mockResults);
          expect(searchStore.results.length).toBe(3);
          setTemplateScope('all');
          expect(searchStore.results).toEqual([]);
          expect(searchStore.currentIndex).toBe(-1);
        });
      });

      it('should clear highlights when changing template scope', () => {
        testInRoot(() => {
          setSearchResults(mockResults);
          expect(searchStore.highlightedIds.size).toBe(3);
          setTemplateScope('all');
          expect(searchStore.highlightedIds.size).toBe(0);
        });
      });
    });

    describe('resetSearchStore with templateScope', () => {
      it('should reset templateScope to current', () => {
        testInRoot(() => {
          setTemplateScope('all');
          resetSearchStore();
          expect(searchStore.templateScope).toBe('current');
        });
      });
    });
  });

  describe('mode', () => {
    describe('setMode', () => {
      it('should set mode to replace', () => {
        testInRoot(() => {
          setMode('replace');
          expect(searchStore.mode).toBe('replace');
        });
      });

      it('should set mode to find', () => {
        testInRoot(() => {
          setMode('replace');
          setMode('find');
          expect(searchStore.mode).toBe('find');
        });
      });
    });
  });

  describe('replace value', () => {
    describe('setReplaceValue', () => {
      it('should update replace value', () => {
        testInRoot(() => {
          setReplaceValue('#00FF00');
          expect(searchStore.replaceValue).toBe('#00FF00');
        });
      });
    });
  });

  describe('highlights', () => {
    describe('updateHighlightedIds', () => {
      it('should update highlighted IDs', () => {
        testInRoot(() => {
          updateHighlightedIds(new Set(['view-1', 'view-2']));
          expect(searchStore.highlightedIds.has('view-1')).toBe(true);
          expect(searchStore.highlightedIds.has('view-2')).toBe(true);
          expect(searchStore.highlightedIds.size).toBe(2);
        });
      });
    });

    describe('clearHighlights', () => {
      it('should clear all highlights', () => {
        testInRoot(() => {
          updateHighlightedIds(new Set(['view-1', 'view-2']));
          clearHighlights();
          expect(searchStore.highlightedIds.size).toBe(0);
        });
      });
    });
  });

  describe('searching state', () => {
    describe('setIsSearching', () => {
      it('should set searching state to true', () => {
        testInRoot(() => {
          setIsSearching(true);
          expect(searchStore.isSearching).toBe(true);
        });
      });

      it('should set searching state to false', () => {
        testInRoot(() => {
          setIsSearching(true);
          setIsSearching(false);
          expect(searchStore.isSearching).toBe(false);
        });
      });
    });
  });

  describe('resetSearchStore', () => {
    it('should reset all state to initial values', () => {
      testInRoot(() => {
        // Set various state values
        openReplacePanel();
        setRawQuery('test');
        setParsedQuery({ type: 'class', term: 'test' });
        setSearchResults(mockResults);
        setCategoryFilter('control', false);
        setSearchScope('selection', 'container-1');
        setReplaceValue('#FF0000');
        setIsSearching(true);

        // Reset
        resetSearchStore();

        // Verify all values are reset
        expect(searchStore.isOpen).toBe(false);
        expect(searchStore.mode).toBe('find');
        expect(searchStore.rawQuery).toBe('');
        expect(searchStore.parsedQuery).toBeNull();
        expect(searchStore.results).toEqual([]);
        expect(searchStore.currentIndex).toBe(-1);
        expect(searchStore.categoryFilters).toEqual({
          container: true,
          control: true,
          display: true,
          custom: true,
        });
        expect(searchStore.scope).toBe('all');
        expect(searchStore.scopeContainerId).toBeNull();
        expect(searchStore.replaceValue).toBe('');
        expect(searchStore.highlightedIds.size).toBe(0);
        expect(searchStore.isSearching).toBe(false);
      });
    });
  });

  describe('computed properties', () => {
    describe('currentResult', () => {
      it('should return correct result at current index', () => {
        testInRoot(() => {
          setSearchResults(mockResults);
          selectResultAtIndex(1);
          expect(searchStore.currentResult).toEqual(mockResults[1]);
        });
      });

      it('should return null when index is -1', () => {
        testInRoot(() => {
          expect(searchStore.currentResult).toBeNull();
        });
      });

      it('should return null when results are empty', () => {
        testInRoot(() => {
          setSearchResults([]);
          expect(searchStore.currentResult).toBeNull();
        });
      });
    });
  });
});
