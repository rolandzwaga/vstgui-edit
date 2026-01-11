/**
 * ShortcutsPanel Component
 *
 * Modal dialog displaying all keyboard shortcuts in a searchable, categorized list.
 */

import { type Component, createEffect, createMemo, For, onCleanup, Show } from 'solid-js';
import {
  shortcutsPanelStore,
  closeShortcutsPanel,
  setSearchQuery,
  toggleCategory,
  isCategoryExpanded,
} from '../../stores/shortcutsPanelStore';
import {
  SHORTCUT_CATEGORIES,
  getShortcutsGroupedByCategory,
  searchShortcuts,
} from '../../domain/shortcuts';
import { ShortcutSearch } from './ShortcutSearch';
import { ShortcutCategory } from './ShortcutCategory';
import { ShortcutItem } from './ShortcutItem';
import styles from './ShortcutsPanel.module.css';

const DIALOG_ID = 'shortcuts-panel';
const HEADING_ID = `${DIALOG_ID}-heading`;

export const ShortcutsPanel: Component = () => {
  let panelRef: HTMLDivElement | undefined;
  let searchInputRef: HTMLInputElement | undefined;

  // Handle Escape key to close panel
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && shortcutsPanelStore.isOpen) {
      e.preventDefault();
      e.stopPropagation();
      closeShortcutsPanel();
    }
  };

  // Focus management and keyboard handling
  createEffect(() => {
    if (shortcutsPanelStore.isOpen) {
      document.addEventListener('keydown', handleKeyDown, true);

      // Focus search input after render
      requestAnimationFrame(() => {
        searchInputRef?.focus();
      });
    } else {
      document.removeEventListener('keydown', handleKeyDown, true);
    }
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown, true);
  });

  // Get grouped shortcuts
  const groupedShortcuts = createMemo(() => getShortcutsGroupedByCategory());

  // Sorted categories for display
  const sortedCategories = createMemo(() => {
    return [...SHORTCUT_CATEGORIES].sort((a, b) => a.order - b.order);
  });

  // Search results
  const searchResults = createMemo(() => {
    const query = shortcutsPanelStore.searchQuery;
    if (!query.trim()) {
      return null;
    }
    return searchShortcuts(query);
  });

  // Check if currently searching
  const isSearching = createMemo(() => shortcutsPanelStore.searchQuery.trim().length > 0);

  return (
    <Show when={shortcutsPanelStore.isOpen}>
      <div class={styles.overlay} onClick={closeShortcutsPanel}>
        <div
          ref={panelRef}
          class={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={HEADING_ID}
          onClick={(e) => e.stopPropagation()}
        >
          <header class={styles.header}>
            <h2 id={HEADING_ID} class={styles.heading}>
              Keyboard Shortcuts
            </h2>
            <button
              type="button"
              class={styles.closeButton}
              onClick={closeShortcutsPanel}
              aria-label="Close keyboard shortcuts"
            >
              &times;
            </button>
          </header>

          <div class={styles.searchContainer}>
            <ShortcutSearch
              value={shortcutsPanelStore.searchQuery}
              onChange={setSearchQuery}
              inputRef={(el) => {
                searchInputRef = el;
              }}
            />
          </div>

          <div class={styles.content}>
            <Show
              when={!isSearching()}
              fallback={
                <div class={styles.searchResults}>
                  <Show
                    when={searchResults()?.length ?? 0 > 0}
                    fallback={
                      <div class={styles.emptyState}>
                        <p>No shortcuts found</p>
                        <p class={styles.emptyHint}>
                          Try searching for a key combination or action
                        </p>
                      </div>
                    }
                  >
                    <div class={styles.resultCount}>
                      {searchResults()?.length} shortcut{searchResults()?.length === 1 ? '' : 's'}{' '}
                      found
                    </div>
                    <div class={styles.resultList} role="list">
                      <For each={searchResults()}>
                        {(shortcut) => <ShortcutItem shortcut={shortcut} />}
                      </For>
                    </div>
                  </Show>
                </div>
              }
            >
              <div class={styles.categories}>
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
        </div>
      </div>
    </Show>
  );
};
