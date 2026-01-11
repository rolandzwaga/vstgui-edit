/**
 * ResultsList Component
 * Scrollable list of search results with keyboard navigation.
 */

import { For, Show } from 'solid-js';
import type { SearchResult } from '../../types/search';
import { ResultItem } from './ResultItem';
import styles from './FindPanel.module.css';

export interface ResultsListProps {
  /** Array of search results to display */
  results: SearchResult[];
  /** Index of currently selected result */
  currentIndex: number;
  /** Called when a result is selected */
  onSelect: (index: number) => void;
  /** Called for keyboard navigation */
  onNavigate: (direction: 'up' | 'down') => void;
  /** Custom empty state message */
  emptyMessage?: string;
}

export function ResultsList(props: ResultsListProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        props.onNavigate('down');
        break;
      case 'ArrowUp':
        e.preventDefault();
        props.onNavigate('up');
        break;
      case 'Enter':
        e.preventDefault();
        if (props.currentIndex >= 0) {
          props.onSelect(props.currentIndex);
        }
        break;
    }
  };

  return (
    <div
      class={styles.resultsList}
      role="listbox"
      aria-label="Search results"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <Show
        when={props.results.length > 0}
        fallback={
          <div class={styles.resultsEmpty}>
            {props.emptyMessage ?? 'No matches found'}
          </div>
        }
      >
        <For each={props.results}>
          {(result, index) => (
            <ResultItem
              result={result}
              isSelected={index() === props.currentIndex}
              onClick={() => props.onSelect(index())}
            />
          )}
        </For>
      </Show>
    </div>
  );
}
