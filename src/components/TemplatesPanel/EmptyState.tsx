import type { Component } from 'solid-js';
import styles from './EmptyState.module.css';

export const EmptyState: Component = () => {
  return (
    <div class={styles.container} data-testid="templates-empty-state">
      <span class={styles.message}>No templates defined</span>
    </div>
  );
};
