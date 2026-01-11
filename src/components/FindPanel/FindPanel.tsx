/**
 * FindPanel Component
 * Main Find/Replace panel with search input, results list, and navigation.
 */

import { Show, createEffect } from 'solid-js';
import { Portal } from 'solid-js/web';
import {
  searchStore,
  closeFindPanel,
  setRawQuery,
  setParsedQuery,
  setSearchResults,
  navigateToNext,
  navigateToPrevious,
  selectResultAtIndex,
  setCategoryFilter,
  setAllCategoryFilters,
} from '../../stores/searchStore';
import type { CategoryFilters } from '../../types/search';
import { parseSearchQuery, executeSearch, prepareViewForSearch, buildDisplayPath } from '../../domain/search';
import { documentStore, getView } from '../../stores/documentStore';
import { flattenHierarchy } from '../../domain/canvas';
import { select } from '../../stores/selectionStore';
import { SearchInput } from './SearchInput';
import { ResultsList } from './ResultsList';
import { CategoryFilter } from './CategoryFilter';
import { NavigationButtons } from './NavigationButtons';
import styles from './FindPanel.module.css';

export function FindPanel() {
  // Execute search when query changes
  const executeSearchWithQuery = (queryString: string) => {
    if (queryString.trim() === '') {
      setSearchResults([]);
      setParsedQuery(null);
      return;
    }

    const query = parseSearchQuery(queryString);
    setParsedQuery(query);

    // Get views from document
    const document = documentStore.document;
    if (!document) {
      setSearchResults([]);
      return;
    }

    // Get the current template
    const templates = document['vstgui-ui-description']?.templates;
    if (!templates) {
      setSearchResults([]);
      return;
    }

    // Get the first template (or selected template in future)
    const templateName = Object.keys(templates)[0];
    if (!templateName) {
      setSearchResults([]);
      return;
    }

    const templateView = templates[templateName];
    if (!templateView) {
      setSearchResults([]);
      return;
    }

    // Flatten hierarchy for searching
    const flatViews = flattenHierarchy(templateView, templateName);

    // Build view map for display path calculation
    const viewMap = new Map<string, { className: string; parentId: string | null }>();
    for (const view of flatViews) {
      viewMap.set(view.id, {
        className: view.className,
        parentId: view.parentId,
      });
    }

    // Prepare views for search
    const searchableViews = flatViews.map((view) => {
      // Get view attributes from document
      const viewNode = getView(view.id);
      const attributes: Record<string, string> = {};
      if (viewNode?.attributes) {
        for (const [key, value] of Object.entries(viewNode.attributes)) {
          if (typeof value === 'string') {
            attributes[key] = value;
          }
        }
      }
      const parentPath = buildDisplayPath(view.id, viewMap);
      return prepareViewForSearch(
        view.id,
        view.className,
        view.category,
        attributes,
        parentPath
      );
    });

    // Execute search with current filters
    const scope = searchStore.scope === 'selection' && searchStore.scopeContainerId
      ? { type: 'selection' as const, containerId: searchStore.scopeContainerId }
      : { type: 'all' as const };

    const results = executeSearch(
      searchableViews,
      query,
      searchStore.categoryFilters,
      scope
    );

    setSearchResults(results);
  };

  const handleNavigate = (direction: 'up' | 'down') => {
    if (direction === 'down') {
      navigateToNext();
    } else {
      navigateToPrevious();
    }
  };

  const handleSelect = (index: number) => {
    selectResultAtIndex(index);

    // Also select the view on canvas
    const result = searchStore.results[index];
    if (result) {
      select(result.viewId);
    }
  };

  // Select view on canvas when current result changes
  createEffect(() => {
    const currentResult = searchStore.currentResult;
    if (currentResult) {
      select(currentResult.viewId);
    }
  });

  const resultCountText = () => {
    const count = searchStore.resultCount;
    if (count === 0) return '';
    return count === 1 ? '1 result' : `${count} results`;
  };

  // Handle filter changes - re-execute search
  const handleFilterChange = (category: keyof CategoryFilters, enabled: boolean) => {
    setCategoryFilter(category, enabled);
    // Re-execute search with new filters
    if (searchStore.rawQuery.trim() !== '') {
      executeSearchWithQuery(searchStore.rawQuery);
    }
  };

  const handleToggleAllFilters = (enabled: boolean) => {
    setAllCategoryFilters(enabled);
    // Re-execute search with new filters
    if (searchStore.rawQuery.trim() !== '') {
      executeSearchWithQuery(searchStore.rawQuery);
    }
  };

  return (
    <Show when={searchStore.isOpen}>
      <Portal>
        <div
          class={styles.panel}
          role="dialog"
          aria-label="Find and Replace"
        >
          <div class={styles.header}>
            <h3 class={styles.title}>Find</h3>
            <button
              class={styles.closeButton}
              onClick={closeFindPanel}
              aria-label="Close find panel"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>

          <div class={styles.searchContainer}>
            <SearchInput
              value={searchStore.rawQuery}
              onInput={setRawQuery}
              onDebouncedInput={executeSearchWithQuery}
              onEscape={closeFindPanel}
              autoFocus
            />
          </div>

          <Show when={searchStore.rawQuery.trim() !== ''}>
            <div class={styles.navigation}>
              <span class={styles.resultCount}>{resultCountText()}</span>
              <NavigationButtons
                currentIndex={searchStore.currentIndex}
                totalCount={searchStore.resultCount}
                onPrevious={navigateToPrevious}
                onNext={navigateToNext}
              />
            </div>
          </Show>

          <CategoryFilter
            filters={searchStore.categoryFilters}
            onFilterChange={handleFilterChange}
            onToggleAll={handleToggleAllFilters}
          />

          <ResultsList
            results={searchStore.results}
            currentIndex={searchStore.currentIndex}
            onSelect={handleSelect}
            onNavigate={handleNavigate}
          />
        </div>
      </Portal>
    </Show>
  );
}
