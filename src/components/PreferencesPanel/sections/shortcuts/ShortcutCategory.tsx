/**
 * ShortcutCategory Component
 *
 * Collapsible section displaying shortcuts in a category.
 */

import type { Component } from 'solid-js';
import { For, Show } from 'solid-js';
import type { ShortcutCategoryMeta, ShortcutDefinition } from '../../../../types/shortcuts';
import { ShortcutItem } from './ShortcutItem';
import styles from './ShortcutCategory.module.css';

export interface ShortcutCategoryProps {
  category: ShortcutCategoryMeta;
  shortcuts: ShortcutDefinition[];
  expanded: boolean;
  onToggle: () => void;
}

export const ShortcutCategory: Component<ShortcutCategoryProps> = (props) => {
  return (
    <div class={styles.category}>
      <button
        type="button"
        class={styles.header}
        onClick={props.onToggle}
        aria-expanded={props.expanded}
        aria-controls={`shortcuts-category-${props.category.id}`}
      >
        <span class={styles.expandIcon} classList={{ [styles.expanded]: props.expanded }}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2" />
          </svg>
        </span>
        <span class={styles.name}>{props.category.name}</span>
        <span class={styles.count}>{props.shortcuts.length}</span>
      </button>
      <Show when={props.expanded}>
        <div
          id={`shortcuts-category-${props.category.id}`}
          class={styles.content}
          role="list"
        >
          <For each={props.shortcuts}>
            {(shortcut) => <ShortcutItem shortcut={shortcut} />}
          </For>
        </div>
      </Show>
    </div>
  );
};
