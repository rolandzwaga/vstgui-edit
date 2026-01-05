import type { Component } from 'solid-js';
import styles from './Canvas.module.css';

/**
 * Legend component showing color coding for view categories.
 */
export const Legend: Component = () => {
  return (
    <div class={styles.legend} data-testid="canvas-legend">
      <div class={styles.legendItem}>
        <div class={`${styles.legendSwatch} ${styles.container}`} />
        <span>Container</span>
      </div>
      <div class={styles.legendItem}>
        <div class={`${styles.legendSwatch} ${styles.control}`} />
        <span>Control</span>
      </div>
      <div class={styles.legendItem}>
        <div class={`${styles.legendSwatch} ${styles.display}`} />
        <span>Display</span>
      </div>
      <div class={styles.legendItem}>
        <div class={`${styles.legendSwatch} ${styles.custom}`} />
        <span>Custom</span>
      </div>
    </div>
  );
};
