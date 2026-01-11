/**
 * KeyboardShortcutsSection Component
 *
 * Read-only keyboard shortcuts reference section with link to full panel.
 */

import type { Component } from 'solid-js';
import { For } from 'solid-js';
import {
  SHORTCUT_CATEGORIES,
  getShortcutsGroupedByCategory,
  formatKeysForPlatform,
} from '../../../domain/shortcuts';
import { closePreferences } from '../../../stores/preferencesStore';
import { openShortcutsPanel } from '../../../stores/shortcutsPanelStore';
import styles from './sections.module.css';
import shortcutStyles from './KeyboardShortcutsSection.module.css';

export const KeyboardShortcutsSection: Component = () => {
  // Get sorted categories and grouped shortcuts
  const sortedCategories = [...SHORTCUT_CATEGORIES].sort((a, b) => a.order - b.order);
  const groupedShortcuts = getShortcutsGroupedByCategory();

  // Handler to open full panel
  const handleOpenFullPanel = () => {
    closePreferences();
    openShortcutsPanel();
  };

  return (
    <section class={styles.section}>
      <h3 class={styles.sectionHeading}>Keyboard Shortcuts</h3>
      <p class={styles.sectionDescription}>
        Reference for all available keyboard shortcuts.
      </p>

      <button
        type="button"
        class={shortcutStyles.openPanelButton}
        onClick={handleOpenFullPanel}
      >
        Open Searchable Panel
      </button>

      <For each={sortedCategories}>
        {(category) => {
          const shortcuts = groupedShortcuts.get(category.id) ?? [];
          return (
            <div class={shortcutStyles.categoryGroup}>
              <h4 class={shortcutStyles.categoryName}>{category.name}</h4>
              <ul class={shortcutStyles.shortcutList}>
                <For each={shortcuts}>
                  {(shortcut) => (
                    <li class={shortcutStyles.shortcutItem}>
                      <kbd class={shortcutStyles.keyCombo}>
                        {formatKeysForPlatform(shortcut.keys)}
                      </kbd>
                      <span class={shortcutStyles.description}>{shortcut.description}</span>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          );
        }}
      </For>
    </section>
  );
};
