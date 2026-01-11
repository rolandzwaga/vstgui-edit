/**
 * SearchInput Component
 * Debounced text input for search queries with immediate and delayed callbacks.
 */

import { onMount, onCleanup } from 'solid-js';
import styles from './FindPanel.module.css';
import { SEARCH_DEBOUNCE_MS } from '../../types/search';

export interface SearchInputProps {
  /** Current input value */
  value: string;
  /** Called immediately on input change */
  onInput: (value: string) => void;
  /** Called after debounce delay */
  onDebouncedInput: (value: string) => void;
  /** Debounce delay in milliseconds (default: 150) */
  debounceMs?: number;
  /** Placeholder text */
  placeholder?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Called when Escape key is pressed */
  onEscape?: () => void;
  /** Called when Enter key is pressed */
  onEnter?: () => void;
  /** Clear input when Escape is pressed */
  clearOnEscape?: boolean;
}

export function SearchInput(props: SearchInputProps) {
  let inputRef: HTMLInputElement | undefined;
  let timeoutId: number | undefined;

  const handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    props.onInput(value);

    // Clear existing timeout
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    // Set new timeout for debounced callback
    timeoutId = window.setTimeout(() => {
      props.onDebouncedInput(value);
    }, props.debounceMs ?? SEARCH_DEBOUNCE_MS);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (props.clearOnEscape) {
        props.onInput('');
      }
      props.onEscape?.();
    } else if (e.key === 'Enter') {
      props.onEnter?.();
    }
  };

  onMount(() => {
    if (props.autoFocus && inputRef) {
      inputRef.focus();
    }
  });

  onCleanup(() => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  });

  return (
    <div class={styles.searchInputWrapper}>
      <svg
        class={styles.searchIcon}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        class={styles.searchInput}
        value={props.value}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={props.placeholder ?? 'Search views...'}
        aria-label="Search query"
      />
    </div>
  );
}
