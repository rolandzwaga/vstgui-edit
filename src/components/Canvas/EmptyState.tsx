import type { Component } from 'solid-js';
import styles from './Canvas.module.css';

export interface EmptyStateProps {
  message?: string;
}

/**
 * Displays a centered message when no template is available.
 */
export const EmptyState: Component<EmptyStateProps> = (props) => {
  return (
    <div class={styles.emptyState} data-testid="empty-state">
      <span class={styles.emptyMessage}>{props.message ?? 'No template loaded'}</span>
    </div>
  );
};
