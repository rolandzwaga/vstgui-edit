import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import styles from './SelectionHeader.module.css';

export interface SelectionHeaderProps {
  className: string | null;
  selectionCount: number;
  sameClass: boolean;
}

export const SelectionHeader: Component<SelectionHeaderProps> = (props) => {
  return (
    <div class={styles.header} data-testid="properties-header">
      <Show
        when={props.sameClass && props.className}
        fallback={<span class={styles.count}>{props.selectionCount} views selected</span>}
      >
        <span class={styles.className}>{props.className}</span>
        <Show when={props.selectionCount > 1}>
          <span class={styles.count}>({props.selectionCount})</span>
        </Show>
      </Show>
    </div>
  );
};
