/**
 * Search Engine
 * Core search logic for finding views by class, attribute, or global search.
 */

import type { ViewCategory } from '../../types/canvas';
import type { CategoryFilters, SearchQuery, SearchResult } from '../../types/search';

/**
 * View data structure optimized for searching.
 */
export interface SearchableView {
  /** Unique view ID */
  id: string;
  /** VSTGUI class name */
  className: string;
  /** View category */
  category: ViewCategory;
  /** All view attributes */
  attributes: Record<string, string>;
  /** Display path (e.g., "MainPanel > Controls") */
  parentPath: string;
}

/**
 * Convert RenderableView to SearchableView.
 *
 * @param id - View ID
 * @param className - VSTGUI class name
 * @param category - View category
 * @param attributes - View attributes record
 * @param parentPath - Display path string
 * @returns SearchableView
 */
export function prepareViewForSearch(
  id: string,
  className: string,
  category: ViewCategory,
  attributes: Record<string, string>,
  parentPath: string
): SearchableView {
  return {
    id,
    className,
    category,
    attributes,
    parentPath,
  };
}

/**
 * Build display path for a view.
 *
 * @param viewId - View ID
 * @param viewMap - Map of ID to view data
 * @returns Display path string (e.g., "MainPanel > Controls > Knob1")
 */
export function buildDisplayPath(
  viewId: string,
  viewMap: Map<string, { className: string; parentId: string | null }>
): string {
  const parts: string[] = [];
  let currentId: string | null = viewId;

  // Walk up the hierarchy to build the path
  while (currentId) {
    const view = viewMap.get(currentId);
    if (!view) break;

    parts.unshift(view.className);
    currentId = view.parentId;
  }

  return parts.join(' > ');
}

/**
 * Check if a view matches the search query.
 *
 * Matching behavior by query type:
 * - class: Case-insensitive substring match on className
 * - attribute: Exact attribute name + case-insensitive substring on value
 * - global: Case-insensitive substring on className OR any attribute value
 *
 * @param view - View to check
 * @param query - Parsed search query
 * @returns Match result with optional matched attribute info
 */
export function matchesQuery(
  view: SearchableView,
  query: SearchQuery
): { matches: boolean; matchedAttribute?: string; matchedValue?: string } {
  const term = query.term.toLowerCase();

  if (term === '') {
    return { matches: false };
  }

  switch (query.type) {
    case 'class': {
      const matches = view.className.toLowerCase().includes(term);
      return { matches };
    }

    case 'attribute': {
      if (!query.attributeName || query.value === undefined) {
        return { matches: false };
      }

      const attrValue = view.attributes[query.attributeName];
      if (attrValue === undefined) {
        return { matches: false };
      }

      const searchValue = query.value.toLowerCase();
      const matches = attrValue.toLowerCase().includes(searchValue);
      return {
        matches,
        matchedAttribute: query.attributeName,
        matchedValue: attrValue,
      };
    }

    case 'global': {
      // First check class name
      if (view.className.toLowerCase().includes(term)) {
        return { matches: true };
      }

      // Then check all attribute values
      for (const [attrName, attrValue] of Object.entries(view.attributes)) {
        if (attrValue.toLowerCase().includes(term)) {
          return {
            matches: true,
            matchedAttribute: attrName,
            matchedValue: attrValue,
          };
        }
      }

      return { matches: false };
    }

    default:
      return { matches: false };
  }
}

/**
 * Check if view passes category filter.
 *
 * @param view - View to check
 * @param filters - Active filters
 * @returns true if view's category is enabled
 */
export function passesCategoryFilter(view: SearchableView, filters: CategoryFilters): boolean {
  return filters[view.category] === true;
}

/**
 * Check if view ID is descendant of container.
 *
 * Uses ID path structure: parent-0-child-1 is child of parent-0.
 * A view ID is a descendant if it starts with the container ID followed by a dash.
 *
 * @param viewId - View ID to check
 * @param containerId - Potential ancestor ID
 * @returns true if viewId is descendant of containerId
 */
export function isDescendantOf(viewId: string, containerId: string): boolean {
  // A view is a descendant if its ID starts with the container ID followed by a separator
  // For example: "template-0-1-2" is descendant of "template-0-1" and "template-0"
  if (viewId === containerId) {
    return false; // A view is not a descendant of itself
  }

  // Check if viewId starts with containerId followed by a dash
  return viewId.startsWith(`${containerId}-`);
}

/**
 * Execute search across all views.
 *
 * @param views - Array of searchable views
 * @param query - Search query
 * @param filters - Category filters
 * @param scope - Search scope configuration
 * @returns Array of matching SearchResults
 */
export function executeSearch(
  views: SearchableView[],
  query: SearchQuery,
  filters: CategoryFilters,
  scope: { type: 'all' } | { type: 'selection'; containerId: string }
): SearchResult[] {
  const results: SearchResult[] = [];

  for (const view of views) {
    // Apply category filter
    if (!passesCategoryFilter(view, filters)) {
      continue;
    }

    // Apply scope filter
    if (scope.type === 'selection') {
      if (!isDescendantOf(view.id, scope.containerId)) {
        continue;
      }
    }

    // Check if view matches query
    const matchResult = matchesQuery(view, query);
    if (!matchResult.matches) {
      continue;
    }

    results.push({
      viewId: view.id,
      className: view.className,
      category: view.category,
      displayPath: view.parentPath,
      matchedAttribute: matchResult.matchedAttribute,
      matchedValue: matchResult.matchedValue,
    });
  }

  return results;
}

/**
 * Template data structure for multi-template search.
 */
export interface TemplateSearchData {
  name: string;
  views: SearchableView[];
}

/**
 * Execute search across multiple templates.
 * Returns results with templateId and templateName populated.
 *
 * @param templateData - Map of templateId to template data (name and views)
 * @param query - Search query
 * @param filters - Category filters
 * @returns Array of SearchResults with template info
 */
export function executeMultiTemplateSearch(
  templateData: Map<string, TemplateSearchData>,
  query: SearchQuery,
  filters: CategoryFilters
): SearchResult[] {
  const results: SearchResult[] = [];

  for (const [templateId, { name, views }] of templateData) {
    for (const view of views) {
      // Apply category filter
      if (!passesCategoryFilter(view, filters)) {
        continue;
      }

      // Check if view matches query
      const matchResult = matchesQuery(view, query);
      if (!matchResult.matches) {
        continue;
      }

      results.push({
        viewId: view.id,
        className: view.className,
        category: view.category,
        displayPath: view.parentPath,
        matchedAttribute: matchResult.matchedAttribute,
        matchedValue: matchResult.matchedValue,
        templateId,
        templateName: name,
      });
    }
  }

  return results;
}
