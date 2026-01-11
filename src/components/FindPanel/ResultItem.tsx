/**
 * ResultItem Component
 * Single search result row with class name, path, and matched attribute.
 */

import { Show } from 'solid-js';
import type { SearchResult } from '../../types/search';
import styles from './FindPanel.module.css';

export interface ResultItemProps {
  /** Search result data */
  result: SearchResult;
  /** Whether this result is currently selected */
  isSelected: boolean;
  /** Called when the result is clicked */
  onClick: () => void;
}

export function ResultItem(props: ResultItemProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      props.onClick();
    }
  };

  return (
    <div
      class={`${styles.resultItem} ${props.isSelected ? styles.resultItemSelected : ''}`}
      role="option"
      aria-selected={props.isSelected}
      tabIndex={0}
      onClick={props.onClick}
      onKeyDown={handleKeyDown}
    >
      <div class={styles.resultHeader}>
        <span class={styles.resultClassName}>{props.result.className}</span>
        <Show when={props.result.templateName}>
          <span class={styles.templateBadge}>{props.result.templateName}</span>
        </Show>
      </div>
      <span class={styles.resultPath}>{props.result.displayPath}</span>
      <Show when={props.result.matchedAttribute}>
        <span class={styles.resultMatch}>
          {props.result.matchedAttribute}: {props.result.matchedValue}
        </span>
      </Show>
    </div>
  );
}
