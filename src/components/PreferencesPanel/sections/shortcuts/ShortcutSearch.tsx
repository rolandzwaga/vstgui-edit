/**
 * ShortcutSearch Component
 *
 * Search input for filtering keyboard shortcuts.
 */

import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import styles from './ShortcutSearch.module.css';

export interface ShortcutSearchProps {
  value: string;
  onChange: (query: string) => void;
  inputRef?: (el: HTMLInputElement) => void;
}

export const ShortcutSearch: Component<ShortcutSearchProps> = (props) => {
  return (
    <div class={styles.container}>
      <svg
        class={styles.searchIcon}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10zM14 14l-3-3"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <input
        ref={props.inputRef}
        type="text"
        class={styles.input}
        placeholder="Search shortcuts..."
        value={props.value}
        onInput={(e) => props.onChange(e.currentTarget.value)}
        aria-label="Search shortcuts"
      />
      <Show when={props.value.length > 0}>
        <button
          type="button"
          class={styles.clearButton}
          onClick={() => props.onChange('')}
          aria-label="Clear search"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
            <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </Show>
    </div>
  );
};
