/**
 * KeyboardShortcutsSection Component
 *
 * Searchable keyboard shortcuts reference section with collapsible categories.
 */

import type { Component } from 'solid-js';
import { createMemo, createSignal, For, Show } from 'solid-js';
import {
  SHORTCUT_CATEGORIES,
  getShortcutsGroupedByCategory,
  searchShortcuts,
} from '../../../domain/shortcuts';
import type { ShortcutCategoryId } from '../../../types/shortcuts';
import { ShortcutSearch } from './shortcuts/ShortcutSearch';
import { ShortcutCategory } from './shortcuts/ShortcutCategory';
import { ShortcutItem } from './shortcuts/ShortcutItem';
import styles from './sections.module.css';
import shortcutStyles from './KeyboardShortcutsSection.module.css';

// Helper to get all category IDs as a Set
function getAllCategoryIds(): Set<ShortcutCategoryId> {
  return new Set(SHORTCUT_CATEGORIES.map((c) => c.id));
}

export const KeyboardShortcutsSection: Component = () => {
  // Local state for search and category expansion
  const [searchQuery, setSearchQuery] = createSignal('');
  const [expandedCategories, setExpandedCategories] = createSignal<Set<ShortcutCategoryId>>(
    getAllCategoryIds()
  );

  // Toggle category expansion
  const toggleCategory = (categoryId: ShortcutCategoryId) => {
    const current = expandedCategories();
    const newSet = new Set(current);
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId);
    } else {
      newSet.add(categoryId);
    }
    setExpandedCategories(newSet);
  };

  // Check if category is expanded
  const isCategoryExpanded = (categoryId: ShortcutCategoryId) => {
    return expandedCategories().has(categoryId);
  };

  // Get grouped shortcuts
  const groupedShortcuts = createMemo(() => getShortcutsGroupedByCategory());

  // Sorted categories for display
  const sortedCategories = createMemo(() => {
    return [...SHORTCUT_CATEGORIES].sort((a, b) => a.order - b.order);
  });

  // Search results
  const searchResults = createMemo(() => {
    const query = searchQuery();
    if (!query.trim()) {
      return null;
    }
    return searchShortcuts(query);
  });

  // Check if currently searching
  const isSearching = createMemo(() => searchQuery().trim().length > 0);

  return (
    <section class={styles.section}>
      <h3 class={styles.sectionHeading}>Keyboard Shortcuts</h3>
      <p class={styles.sectionDescription}>
        Reference for all available keyboard shortcuts. Use the search to quickly find shortcuts.
      </p>

      <div class={shortcutStyles.searchContainer}>
        <ShortcutSearch value={searchQuery()} onChange={setSearchQuery} />
      </div>

      <div class={shortcutStyles.content}>
        <Show
          when={!isSearching()}
          fallback={
            <div class={shortcutStyles.searchResults}>
              <Show
                when={(searchResults()?.length ?? 0) > 0}
                fallback={
                  <div class={shortcutStyles.emptyState}>
                    <p>No shortcuts found</p>
                    <p class={shortcutStyles.emptyHint}>
                      Try searching for a key combination or action
                    </p>
                  </div>
                }
              >
                <div class={shortcutStyles.resultCount}>
                  {searchResults()?.length} shortcut{searchResults()?.length === 1 ? '' : 's'} found
                </div>
                <div class={shortcutStyles.resultList} role="list">
                  <For each={searchResults()}>
                    {(shortcut) => <ShortcutItem shortcut={shortcut} />}
                  </For>
                </div>
              </Show>
            </div>
          }
        >
          <div class={shortcutStyles.categories}>
            <For each={sortedCategories()}>
              {(category) => (
                <ShortcutCategory
                  category={category}
                  shortcuts={groupedShortcuts().get(category.id) ?? []}
                  expanded={isCategoryExpanded(category.id)}
                  onToggle={() => toggleCategory(category.id)}
                />
              )}
            </For>
          </div>
        </Show>
      </div>
    </section>
  );
};
