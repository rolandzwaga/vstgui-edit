import type { Component } from 'solid-js';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  message?: string;
}

export const EmptyState: Component<EmptyStateProps> = (props) => {
  return (
    <div class={styles.container} data-testid="fonts-empty-state">
      <span class={styles.message}>{props.message ?? 'No fonts defined'}</span>
      <span class={styles.hint}>Click + to add one</span>
    </div>
  );
};
