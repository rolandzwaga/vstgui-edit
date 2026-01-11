/**
 * KeyboardShortcutsSection Component
 *
 * Read-only keyboard shortcuts reference section.
 */

import type { Component } from 'solid-js';
import { For } from 'solid-js';
import { KEYBOARD_SHORTCUTS } from '../../../domain/preferences/keyboardShortcuts';
import styles from './sections.module.css';
import shortcutStyles from './KeyboardShortcutsSection.module.css';

export const KeyboardShortcutsSection: Component = () => {
  return (
    <section class={styles.section}>
      <h3 class={styles.sectionHeading}>Keyboard Shortcuts</h3>
      <p class={styles.sectionDescription}>
        Reference for all available keyboard shortcuts.
      </p>

      <For each={KEYBOARD_SHORTCUTS}>
        {(category) => (
          <div class={shortcutStyles.categoryGroup}>
            <h4 class={shortcutStyles.categoryName}>{category.name}</h4>
            <ul class={shortcutStyles.shortcutList}>
              <For each={category.shortcuts}>
                {(shortcut) => (
                  <li class={shortcutStyles.shortcutItem}>
                    <kbd class={shortcutStyles.keyCombo}>{shortcut.keys}</kbd>
                    <span class={shortcutStyles.description}>{shortcut.description}</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        )}
      </For>
    </section>
  );
};
